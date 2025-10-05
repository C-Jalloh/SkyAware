import os
import json
import redis
import psycopg2
from psycopg2.extras import Json
from flask import Flask, jsonify, request
from math import radians, cos, sin, asin, sqrt

app = Flask(__name__)

def get_db_connection():
    """Connect to PostgreSQL"""
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 5432)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_NAME"),
        connect_timeout=5  # 5 second timeout
    )

def get_redis_client():
    return redis.Redis(
        host=os.getenv("REDIS_HOST"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        password=os.getenv("REDIS_PASSWORD"),
        socket_connect_timeout=2,  # 2 second timeout
        socket_timeout=2
    )

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points in kilometers"""
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

@app.route('/latest-aqi', methods=['GET'])
def get_latest_aqi():
    """Get the latest AQI data, optionally filtered by location"""
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    radius = request.args.get('radius', default=50, type=float)  # Default 50km radius

    try:
        redis_client = get_redis_client()
        cache_key = f"latest_aqi_{lat}_{lon}_{radius}" if lat and lon else "latest_aqi_v2"
        # Skip cache for general queries to force database hit
        if lat and lon:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                print("Returning cached data")
                return jsonify(json.loads(cached_data))
    except Exception as e:
        print(f"Redis connection failed, falling back to database: {e}")

    # Fallback to DB
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if lat is not None and lon is not None:
            # Query for location-specific data within radius
            cursor.execute("""
                SELECT data FROM tempo_aqi
                ORDER BY timestamp DESC
            """)

            results = cursor.fetchall()
            cursor.close()
            conn.close()

            if results:
                # Find the closest location within radius across all recent data
                closest_data = None
                min_distance = float('inf')

                for result in results:
                    data_array = result[0]
                    if isinstance(data_array, list):
                        for data in data_array:
                            if 'latitude' in data and 'longitude' in data:
                                try:
                                    data_lat = float(data['latitude'])
                                    data_lon = float(data['longitude'])
                                    distance = haversine_distance(lat, lon, data_lat, data_lon)

                                    if distance <= radius and distance < min_distance:
                                        min_distance = distance
                                        closest_data = data.copy()
                                        closest_data['distance_km'] = round(min_distance, 2)
                                except (ValueError, TypeError):
                                    continue

                if closest_data:
                    # Cache the result
                    try:
                        redis_client.set(cache_key, json.dumps(closest_data), ex=1800)  # Cache for 30 minutes
                    except:
                        pass
                    return jsonify(closest_data)
                else:
                    return jsonify({"error": f"No data found within {radius}km of specified location"}), 404
            else:
                return jsonify({"error": "No location data available"}), 404
        else:
            # Return latest data (original behavior) - return first location from latest data
            print("Querying database for latest data...")
            cursor.execute("SELECT data FROM tempo_aqi ORDER BY timestamp DESC LIMIT 1")
            result = cursor.fetchone()
            cursor.close()
            conn.close()

            if result:
                data_array = result[0]
                print(f"Retrieved data_array type: {type(data_array)}, length: {len(data_array) if isinstance(data_array, list) else 'N/A'}")
                if isinstance(data_array, list) and len(data_array) > 0:
                    data = data_array[0]  # Return first location
                    print(f"Returning first location: {data.get('location')}")
                    # Cache the result
                    try:
                        redis_client.set(cache_key, json.dumps(data), ex=1800)  # Cache for 30 minutes
                    except:
                        pass
                    return jsonify(data)
                else:
                    return jsonify({"error": "No data available"}), 404
            else:
                return jsonify({"error": "No data available"}), 404

    except Exception as e:
        print(f"Database connection failed: {e}")
        return jsonify({"error": f"Database connection failed: {str(e)}"}), 500

@app.route('/aqi-locations', methods=['GET'])
def get_aqi_locations():
    """Get all available AQI locations"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT data FROM tempo_aqi
            ORDER BY timestamp DESC
            LIMIT 1
        """)
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if result:
            data_array = result[0]
            if isinstance(data_array, list):
                locations = []
                for data in data_array:
                    if 'latitude' in data and 'longitude' in data:
                        locations.append({
                            "location": data.get('location', f"Location_{data.get('latitude')}_{data.get('longitude')}"),
                            "latitude": float(data['latitude']) if data.get('latitude') else None,
                            "longitude": float(data['longitude']) if data.get('longitude') else None,
                            "last_updated": data.get('timestamp')
                        })
                return jsonify({"locations": locations})

        return jsonify({"locations": []})

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve locations"}), 500