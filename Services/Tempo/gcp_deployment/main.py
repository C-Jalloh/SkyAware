import os
import datetime as dt
import json
import redis
import psycopg2
from psycopg2.extras import Json
import numpy as np
import xarray as xr
from harmony import BBox, Client, Collection, Request
from harmony.config import Environment

def get_db_connection():
    """Connect to PostgreSQL"""
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 5432)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_NAME")
    )

def get_redis_client():
    """Connect to Redis"""
    return redis.Redis(
        host=os.getenv("REDIS_HOST"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        password=os.getenv("REDIS_PASSWORD")
    )

def download_tempo_data():
    """Download latest TEMPO data from NASA Harmony API"""
    print("Downloading latest TEMPO data from NASA...")

    # Get Earthdata credentials from environment
    username = os.getenv("EARTHDATA_USERNAME")
    password = os.getenv("EARTHDATA_PASSWORD")

    if not username or not password:
        raise ValueError("EARTHDATA_USERNAME and EARTHDATA_PASSWORD environment variables required")

    print(f"Using Earthdata credentials for user: {username}")

    # Initialize Harmony client
    harmony_client = Client(env=Environment.PROD, auth=(username, password))

    # Request latest TEMPO NO2 data - get the most recent available
    # For now, we'll use a recent known good granule. In production, you'd query for the latest.
    request = Request(
        collection=Collection(id="C3685896708-LARC_CLOUD"),
        granule_name=["TEMPO_NO2_L3_V04_20251003T193122Z_S010.nc"],
    )

    if not request.is_valid():
        raise ValueError("Invalid Harmony request")

    print("Submitting Harmony request...")
    job_id = harmony_client.submit(request)
    print(f"Harmony job submitted: {job_id}")

    print("Waiting for processing to complete...")
    harmony_client.wait_for_processing(job_id, show_progress=True)

    # Download results
    results = list(harmony_client.download_all(job_id, directory="/tmp"))
    print(f"Downloaded {len(results)} files")

    if not results:
        raise ValueError("No files downloaded from Harmony")

    return results[0].result()  # Return path to downloaded file

def extract_key_tempo_data(datatree):
    """Extract only the data important for SkyAware AQI processing"""
    no2_concentration = datatree["product/vertical_column_troposphere"].isel(time=0)
    quality_flag = datatree["product/main_data_quality_flag"].isel(time=0)
    longitude = datatree.longitude
    latitude = datatree.latitude
    uncertainty = datatree["product/vertical_column_troposphere_uncertainty"].isel(time=0)
    timestamp = datatree.time.values[0]
    surface_pressure = datatree["support_data/surface_pressure"].isel(time=0)
    terrain_height = datatree["support_data/terrain_height"].isel(time=0)
    pbl_height = datatree["support_data/pbl_height"].isel(time=0)

    return {
        'no2_concentration': no2_concentration,
        'quality_flag': quality_flag,
        'longitude': longitude,
        'latitude': latitude,
        'uncertainty': uncertainty,
        'timestamp': timestamp,
        'surface_pressure': surface_pressure,
        'terrain_height': terrain_height,
        'pbl_height': pbl_height
    }

def calculate_aqi_from_tempo(key_data):
    """Convert TEMPO NO2 data to EPA AQI - Memory optimized version"""
    print("Converting TEMPO NO2 to EPA AQI (memory optimized)...")

    no2_data = key_data['no2_concentration']  # molecules/cm²
    quality_flag = key_data['quality_flag']

    # EPA breakpoints for NO2 (ppb to AQI)
    breakpoints = [
        (0, 53, 0, 50),           # Good
        (54, 100, 51, 100),       # Moderate
        (101, 360, 101, 150),     # Unhealthy for Sensitive
        (361, 649, 151, 200),     # Unhealthy
        (650, 1249, 201, 300),    # Very Unhealthy
        (1250, 1649, 301, 400),   # Hazardous
        (1650, 2049, 401, 500),   # Hazardous
    ]

    # Constants for conversion
    AVOGADRO = 6.022e23
    atmospheric_factor = 1e12  # Conservative factor for molecules/cm² to ppb

    # Get valid data mask
    valid_mask = (~np.isnan(no2_data.values)) & (quality_flag.values == 0)
    print(f"Valid data points: {valid_mask.sum():,}")

    # Use vectorized operations instead of nested loops for better memory efficiency
    no2_values = no2_data.values

    # Initialize AQI grid
    aqi_grid = np.full_like(no2_values, np.nan, dtype=np.float32)  # Use float32 to save memory

    # Handle negative/zero values first
    negative_mask = (no2_values <= 0) & valid_mask
    aqi_grid[negative_mask] = 0

    # Process positive values using vectorized operations
    positive_mask = (no2_values > 0) & valid_mask

    if positive_mask.sum() > 0:
        print(f"Processing {positive_mask.sum():,} positive NO2 values...")

        # Convert to ppb using vectorized operations
        molecules_cm2 = no2_values[positive_mask]
        mol_cm2 = molecules_cm2 / AVOGADRO
        ppb_values = mol_cm2 * atmospheric_factor

        # Convert to integer concentrations for AQI calculation
        conc_values = np.clip(ppb_values.astype(int), 0, 2050)

        # Vectorized AQI calculation using numpy operations
        aqi_values = np.zeros_like(conc_values, dtype=float)

        # Apply EPA breakpoints using vectorized conditions
        for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
            mask = (conc_values >= bp_lo) & (conc_values <= bp_hi)
            if mask.sum() > 0:
                aqi_values[mask] = ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (conc_values[mask] - bp_lo) + aqi_lo

        # Handle values above maximum breakpoint
        high_mask = conc_values > 2049
        aqi_values[high_mask] = 500

        # Round and clip to valid range
        aqi_values = np.round(np.clip(aqi_values, 0, 500))

        # Assign back to grid
        aqi_grid[positive_mask] = aqi_values

    # Count results
    valid_aqi = aqi_grid[~np.isnan(aqi_grid)]
    if len(valid_aqi) > 0:
        print(f"✅ AQI calculation complete!")
        print(f"   Valid AQI points: {len(valid_aqi):,}")
        print(f"   AQI range: {valid_aqi.min():.0f} - {valid_aqi.max():.0f}")
        print(f"   Mean AQI: {valid_aqi.mean():.1f}")

    return aqi_grid

def get_aqi_category(aqi_value):
    """Get AQI category and color"""
    if aqi_value <= 50:
        return "Good", "#00E400"
    elif aqi_value <= 100:
        return "Moderate", "#FFFF00"
    elif aqi_value <= 150:
        return "Unhealthy for Sensitive Groups", "#FF7E00"
    elif aqi_value <= 200:
        return "Unhealthy", "#FF0000"
    elif aqi_value <= 300:
        return "Very Unhealthy", "#8F3F97"
    else:
        return "Hazardous", "#7E0023"

def extract_data_points(key_data, aqi_grid, chunk_size=5000):
    """Extract data points from TEMPO arrays - Memory efficient chunked processing"""
    print("Extracting data points from TEMPO arrays (chunked processing)...")

    lat_data = key_data['latitude']
    lon_data = key_data['longitude']
    no2_data = key_data['no2_concentration']
    quality_flag = key_data['quality_flag']

    # Create valid data mask
    valid_mask = (~np.isnan(aqi_grid)) & (quality_flag.values == 0) & (~np.isnan(no2_data.values))
    total_valid = valid_mask.sum()
    print(f"Extracting {total_valid:,} valid data points...")

    # Initialize data collection
    processed_data = []
    timestamp = dt.datetime.now(dt.timezone.utc).isoformat()

    # Create coordinate grids - TEMPO has 1D lat/lon arrays that need meshgrid
    # meshgrid(lon, lat) creates proper 2D grids
    lon_grid, lat_grid = np.meshgrid(lon_data.values, lat_data.values)

    # Flatten arrays for easier processing
    lat_flat = lat_grid.flatten()
    lon_flat = lon_grid.flatten()
    aqi_flat = aqi_grid.flatten()
    no2_flat = no2_data.values.flatten()
    valid_flat = valid_mask.flatten()

    # Process only valid points in chunks
    valid_indices = np.where(valid_flat)[0]

    for start_idx in range(0, len(valid_indices), chunk_size):
        end_idx = min(start_idx + chunk_size, len(valid_indices))
        chunk_indices = valid_indices[start_idx:end_idx]

        for idx in chunk_indices:
            lat = float(lat_flat[idx])
            lon = float(lon_flat[idx])
            aqi = float(aqi_flat[idx])
            no2_conc = float(no2_flat[idx])

            location = f"TEMPO_{lat:.4f}_{lon:.4f}"
            category = get_aqi_category(aqi)

            data_point = {
                'timestamp': timestamp,
                'location': location,
                'latitude': lat,
                'longitude': lon,
                'aqi': aqi,
                'no2_concentration': no2_conc,
                'category': category
            }

            processed_data.append(data_point)

    print(f"✅ Data extraction complete! Processed {len(processed_data):,} points")
    return processed_data

def create_geojson_from_tempo(key_data, aqi_grid, chunk_size=1000):
    """Create GeoJSON from TEMPO data - Memory optimized with chunking"""
    print("Creating GeoJSON from TEMPO data (chunked processing)...")

    lat_data = key_data['latitude']
    lon_data = key_data['longitude']
    quality_flag = key_data['quality_flag']

    # Create valid data mask
    valid_mask = (~np.isnan(aqi_grid)) & (quality_flag.values == 0)
    total_valid = valid_mask.sum()
    print(f"Creating GeoJSON for {total_valid:,} valid data points...")

    # Initialize GeoJSON structure
    geojson = {
        "type": "FeatureCollection",
        "features": [],
        "properties": {
            "source": "NASA TEMPO Satellite",
            "parameter": "NO2 Air Quality Index",
            "units": "AQI",
            "timestamp": dt.datetime.now().isoformat(),
            "total_points": int(total_valid)
        }
    }

    # Process in chunks to avoid memory issues
    features_added = 0
    chunk_count = 0

    # Create coordinate grids - TEMPO has 1D lat/lon arrays that need meshgrid
    # meshgrid(lon, lat) creates proper 2D grids
    lon_grid, lat_grid = np.meshgrid(lon_data.values, lat_data.values)

    # Flatten coordinates and data for easier chunking
    lat_flat = lat_grid.flatten()
    lon_flat = lon_grid.flatten()
    aqi_flat = aqi_grid.flatten()
    valid_flat = valid_mask.flatten()

    # Process only valid points
    valid_indices = np.where(valid_flat)[0]

    for start_idx in range(0, len(valid_indices), chunk_size):
        chunk_count += 1
        end_idx = min(start_idx + chunk_size, len(valid_indices))
        chunk_indices = valid_indices[start_idx:end_idx]

        print(f"Processing chunk {chunk_count}: points {start_idx}-{end_idx-1} of {len(valid_indices)}")

        # Process chunk
        for idx in chunk_indices:
            lat = float(lat_flat[idx])
            lon = float(lon_flat[idx])
            aqi = float(aqi_flat[idx])

            # Create GeoJSON feature
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "aqi": aqi,
                    "category": get_aqi_category(aqi)
                }
            }

            geojson["features"].append(feature)
            features_added += 1

    print(f"✅ GeoJSON creation complete!")
    print(f"   Features created: {features_added:,}")
    print(f"   Chunks processed: {chunk_count}")

    return geojson

def process_tempo_data():
    """Main pipeline function - downloads and processes real TEMPO data"""
    print("Starting TEMPO data processing pipeline...")

    try:
        # Download latest TEMPO data
        tempo_file = download_tempo_data()
        print(f"Downloaded TEMPO data: {tempo_file}")

        # Load and process the data
        datatree = xr.open_datatree(tempo_file)
        key_data = extract_key_tempo_data(datatree)

        # Convert to AQI
        aqi_data = calculate_aqi_from_tempo(key_data)

        # Create GeoJSON
        geojson_data = create_geojson_from_tempo(key_data, aqi_data)

        # Extract data points for database storage (memory efficient)
        processed_data = extract_data_points(key_data, aqi_data)

        if not processed_data:
            raise ValueError("No valid data points could be processed from TEMPO data")

        print(f"Successfully processed {len(processed_data):,} data points from TEMPO")

        # Get timestamp for database storage
        timestamp = dt.datetime.now(dt.timezone.utc).isoformat()

        # Store in database
        print("Storing data in PostgreSQL...")
        conn = get_db_connection()
        cursor = conn.cursor()

        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tempo_aqi (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP WITH TIME ZONE UNIQUE,
                data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Insert data
        cursor.execute("""
            INSERT INTO tempo_aqi (timestamp, data)
            VALUES (%s, %s)
            ON CONFLICT (timestamp) DO UPDATE SET
                data = EXCLUDED.data
        """, (timestamp, Json(processed_data)))

        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Successfully stored {len(processed_data):,} data points in PostgreSQL")

        # Cache latest data in Redis
        print("Caching latest data in Redis...")
        redis_client = get_redis_client()

        # Cache individual locations for location-based queries
        for data_point in processed_data:
            location_key = f"aqi_{data_point['latitude']:.4f}_{data_point['longitude']:.4f}"
            redis_client.set(location_key, json.dumps(data_point), ex=3600)  # 1 hour expiry

        # Cache the full dataset as latest
        redis_client.set("latest_aqi_data", json.dumps({
            "timestamp": timestamp,
            "data": processed_data
        }), ex=3600)

        print("✅ Successfully cached data in Redis")

        # Clean up downloaded file
        os.remove(tempo_file)
        print("🧹 Cleaned up temporary files")

        print("🎉 TEMPO data processing pipeline completed successfully!")
        return True

    except Exception as e:
        print(f"❌ Pipeline error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    process_tempo_data()