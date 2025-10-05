#!/usr/bin/env python3
"""
Test script to verify if we're getting real data from NASA TEMPO
"""
import os
import psycopg2
import json
from datetime import datetime

def test_database_connection():
    """Test if we can connect to the database and retrieve TEMPO data"""
    print("=" * 80)
    print("TESTING NASA TEMPO DATA PIPELINE")
    print("=" * 80)
    
    # Database connection parameters
    db_config = {
        'host': os.getenv('DB_HOST', '34.134.159.215'),
        'port': int(os.getenv('DB_PORT', 5432)),
        'user': os.getenv('DB_USER', 'tempo_user'),
        'password': os.getenv('DB_PASS', 'Tempo_P@ss2443'),
        'database': os.getenv('DB_NAME', 'tempo_aqi_db')
    }
    
    print(f"\n1. Testing Database Connection...")
    print(f"   Host: {db_config['host']}")
    print(f"   Database: {db_config['database']}")
    
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        print("   ✓ Database connection successful!")
        
        # Check if table exists
        print("\n2. Checking if 'tempo_aqi' table exists...")
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'tempo_aqi'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        if table_exists:
            print("   ✓ Table 'tempo_aqi' exists!")
        else:
            print("   ✗ Table 'tempo_aqi' does NOT exist!")
            return
        
        # Count rows
        print("\n3. Counting rows in tempo_aqi table...")
        cursor.execute("SELECT COUNT(*) FROM tempo_aqi;")
        row_count = cursor.fetchone()[0]
        print(f"   Total rows: {row_count}")
        
        if row_count == 0:
            print("   ✗ No data in the table yet!")
            print("\n   This means the pipeline hasn't successfully stored data yet.")
            print("   Check if the Cloud Run job is still running or if it failed.")
            return
        
        # Get latest entry
        print("\n4. Retrieving latest entry...")
        cursor.execute("""
            SELECT id, timestamp, data 
            FROM tempo_aqi 
            ORDER BY timestamp DESC 
            LIMIT 1;
        """)
        result = cursor.fetchone()
        
        if result:
            entry_id, timestamp, data_array = result
            print(f"   Entry ID: {entry_id}")
            print(f"   Timestamp: {timestamp}")
            print(f"   Data Type: {type(data_array)}")
            
            if isinstance(data_array, list):
                print(f"   Number of data points: {len(data_array)}")
                
                if len(data_array) > 0:
                    print("\n5. Analyzing first data point...")
                    first_point = data_array[0]
                    print(f"   Sample Data Point:")
                    for key, value in first_point.items():
                        print(f"      {key}: {value}")
                    
                    # Check if this is real TEMPO data
                    print("\n6. Verification - Is this real TEMPO data?")
                    
                    checks = {
                        "Has latitude": "latitude" in first_point,
                        "Has longitude": "longitude" in first_point,
                        "Has NO2 concentration": "no2_concentration" in first_point,
                        "Has AQI value": "aqi" in first_point,
                        "Has timestamp": "timestamp" in first_point,
                        "NO2 is not dummy value (50)": first_point.get('no2_concentration') != 50.0,
                        "AQI is not dummy value (42)": first_point.get('aqi') != 42.0,
                    }
                    
                    all_good = True
                    for check_name, check_result in checks.items():
                        status = "✓" if check_result else "✗"
                        print(f"   {status} {check_name}")
                        if not check_result:
                            all_good = False
                    
                    if all_good:
                        print("\n" + "=" * 80)
                        print("✓✓✓ SUCCESS: We are getting REAL NASA TEMPO data! ✓✓✓")
                        print("=" * 80)
                    else:
                        print("\n" + "=" * 80)
                        print("✗✗✗ WARNING: This might still be dummy/test data ✗✗✗")
                        print("=" * 80)
                    
                    # Show some statistics
                    print("\n7. Data Statistics (first 100 points):")
                    sample_points = data_array[:100]
                    no2_values = [p.get('no2_concentration') for p in sample_points if p.get('no2_concentration') is not None]
                    aqi_values = [p.get('aqi') for p in sample_points if p.get('aqi') is not None]
                    
                    if no2_values:
                        print(f"   NO2 Concentration:")
                        print(f"      Min: {min(no2_values):.2f} ppb")
                        print(f"      Max: {max(no2_values):.2f} ppb")
                        print(f"      Avg: {sum(no2_values)/len(no2_values):.2f} ppb")
                    
                    if aqi_values:
                        print(f"   AQI Values:")
                        print(f"      Min: {min(aqi_values):.2f}")
                        print(f"      Max: {max(aqi_values):.2f}")
                        print(f"      Avg: {sum(aqi_values)/len(aqi_values):.2f}")
                    
                else:
                    print("   ✗ Data array is empty!")
            else:
                print(f"   ✗ Data is not in expected format (expected list, got {type(data_array)})")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"   ✗ Database error: {e}")
    except Exception as e:
        print(f"   ✗ Unexpected error: {e}")

if __name__ == "__main__":
    test_database_connection()
