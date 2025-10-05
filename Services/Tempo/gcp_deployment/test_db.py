#!/usr/bin/env python3
import os
import psycopg2
from psycopg2.extras import Json

def get_db_connection():
    """Connect to PostgreSQL"""
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 5432)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_NAME")
    )

def test_db_connection():
    """Test database connection and table creation"""
    print("Testing database connection...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        print("Database connection successful")

        # Create table if it doesn't exist
        print("Creating table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tempo_aqi (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP WITH TIME ZONE UNIQUE,
                data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        print("Table created successfully")

        # Check if table exists
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tempo_aqi'")
        result = cursor.fetchone()
        if result:
            print("Table 'tempo_aqi' exists in database")
        else:
            print("Table 'tempo_aqi' does not exist")

        cursor.close()
        conn.close()
        print("Database test completed successfully")
        return True

    except Exception as e:
        print(f"Database error: {e}")
        return False

if __name__ == "__main__":
    # Set environment variables for testing
    os.environ["DB_HOST"] = "34.134.159.215"
    os.environ["DB_PORT"] = "5432"
    os.environ["DB_USER"] = "tempo_user"
    os.environ["DB_PASS"] = "Tempo_P@ss2443"
    os.environ["DB_NAME"] = "tempo_aqi_db"

    test_db_connection()