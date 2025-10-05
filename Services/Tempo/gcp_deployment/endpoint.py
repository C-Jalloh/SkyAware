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
    limit = request.args.get('limit', default=100, type=int)  # Limit results

    # Try Redis cache first (much faster!)
    try:
        redis_client = get_redis_client()
        cached_data = redis_client.get('latest_aqi_data')
        
        if cached_data:
            print("✅ Serving from Redis cache (FAST)")
            cache_obj = json.loads(cached_data)
            data_points = cache_obj['data_points']
            
            # Filter by location if requested
            if lat is not None and lon is not None:
                filtered_points = []
                for point in data_points:
                    if 'latitude' in point and 'longitude' in point:
                        dist = haversine_distance(lat, lon, point['latitude'], point['longitude'])
                        if dist <= radius:
                            point['distance_km'] = round(dist, 2)
                            filtered_points.append(point)
                
                filtered_points.sort(key=lambda x: x.get('distance_km', float('inf')))
                data_points = filtered_points[:limit]
            else:
                data_points = data_points[:limit]
            
            return jsonify({
                'source': 'redis_cache',
                'timestamp': cache_obj['timestamp'],
                'total_available': cache_obj['total_points'],
                'returned': len(data_points),
                'data': data_points
            })
    except Exception as e:
        print(f"⚠️  Redis cache miss or error: {e}")

    # Fallback to DB (slower)
    print("⚠️  Falling back to database (SLOW)")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if lat is not None and lon is not None:
            # Query for location-specific data within radius
            cursor.execute("""
                SELECT data FROM tempo_aqi
                ORDER BY timestamp DESC
                LIMIT 1
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
                    return jsonify({
                        'source': 'database',
                        'data': closest_data
                    })
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
                    return jsonify({
                        'source': 'database',
                        'total': len(data_array),
                        'returned': min(limit, len(data_array)),
                        'data': data_array[:limit]
                    })
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