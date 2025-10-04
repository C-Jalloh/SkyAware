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

def calculate_aqi(no2_molecules_cm2):
    """Convert NO2 molecules/cm² to AQI"""
    if np.isnan(no2_molecules_cm2) or no2_molecules_cm2 <= 0:
        return 0

    AVOGADRO = 6.022e23
    mol_cm2 = no2_molecules_cm2 / AVOGADRO
    ppb = mol_cm2 * 1e12  # Conservative factor

    breakpoints = [
        (0, 53, 0, 50),
        (54, 100, 51, 100),
        (101, 360, 101, 150),
        (361, 649, 151, 200),
        (650, 1249, 201, 300),
        (1250, 1649, 301, 400),
        (1650, 2049, 401, 500),
    ]

    conc = int(ppb)
    for bp_lo, bp_hi, aqi_lo, aqi_hi in breakpoints:
        if bp_lo <= conc <= bp_hi:
            aqi = ((aqi_hi - aqi_lo) / (bp_hi - bp_lo)) * (conc - bp_lo) + aqi_lo
            return round(aqi)
    return 500

def process_tempo_data():
    """Main pipeline function"""
    username = os.getenv("EARTHDATA_USERNAME")
    password = os.getenv("EARTHDATA_PASSWORD")

    harmony_client = Client(env=Environment.PROD, auth=(username, password))

    # Request latest TEMPO NO2 data (adjust collection as needed)
    request = Request(
        collection=Collection(id="C3685896708-LARC_CLOUD"),
        # For latest data, you might need to adjust this
        granule_name=["TEMPO_NO2_L3_V04_20251003T193122Z_S010.nc"],  # Placeholder, need to get latest
    )

    job_id = harmony_client.submit(request)
    harmony_client.wait_for_processing(job_id)

    results = harmony_client.download_all(job_id, directory="/tmp")
    all_results_stored = [f.result() for f in results]

    datatree = xr.open_datatree(all_results_stored[0])
    key_data = extract_key_tempo_data(datatree)

    # Calculate AQI grid
    no2_values = key_data['no2_concentration'].values
    quality_values = key_data['quality_flag'].values
    aqi_grid = np.full_like(no2_values, np.nan, dtype=float)

    for i in range(no2_values.shape[0]):
        for j in range(no2_values.shape[1]):
            if quality_values[i, j] == 0:
                aqi_grid[i, j] = calculate_aqi(no2_values[i, j])

    # Prepare data for storage
    timestamp = str(key_data['timestamp'])
    longitude = key_data['longitude'].values.tolist()
    latitude = key_data['latitude'].values.tolist()
    aqi_data = aqi_grid.tolist()

    data_record = {
        'timestamp': timestamp,
        'longitude': longitude,
        'latitude': latitude,
        'aqi_grid': aqi_data
    }

    # Store in PostgreSQL
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO tempo_aqi (timestamp, data)
        VALUES (%s, %s)
        ON CONFLICT (timestamp) DO UPDATE SET data = EXCLUDED.data
    """, (timestamp, Json(data_record)))
    conn.commit()
    cursor.close()
    conn.close()

    # Cache in Redis
    redis_client = get_redis_client()
    redis_client.set('latest_aqi', json.dumps(data_record))
    redis_client.expire('latest_aqi', 3600)  # Expire in 1 hour

    print(f"Processed and stored AQI data for {timestamp}")

if __name__ == "__main__":
    process_tempo_data()