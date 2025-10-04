import os
import json
import redis
import psycopg2
from psycopg2.extras import Json
from flask import Flask, jsonifyos
import json
import redis
import psycopg2
from psycopg2.extras import Json
from cloud_sql_python_connector import Connector
from flask import Flask, jsonify

app = Flask(__name__)

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
    return redis.Redis(
        host=os.getenv("REDIS_HOST"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        password=os.getenv("REDIS_PASSWORD")
    )

@app.route('/latest-aqi', methods=['GET'])
def get_latest_aqi():
    """Get the latest AQI data"""
    redis_client = get_redis_client()
    cached_data = redis_client.get('latest_aqi')
    if cached_data:
        return jsonify(json.loads(cached_data))

    # Fallback to DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM tempo_aqi ORDER BY timestamp DESC LIMIT 1")
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    if result:
        return jsonify(result[0])
    else:
        return jsonify({"error": "No data available"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))