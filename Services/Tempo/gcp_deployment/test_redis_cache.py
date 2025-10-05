#!/usr/bin/env python3
"""
Test Redis caching performance for SkyAware TEMPO API
"""
import requests
import time
import json

API_URL = "https://tempo-api-336045066613.us-central1.run.app"

def test_cache_performance():
    """Test API response time with and without cache"""
    
    print("=" * 80)
    print("TESTING REDIS CACHE PERFORMANCE")
    print("=" * 80)
    
    # Test 1: General query (no location filter)
    print("\n1. Testing general AQI query...")
    start = time.time()
    response = requests.get(f"{API_URL}/latest-aqi?limit=50")
    elapsed = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        source = data.get('source', 'unknown')
        returned = data.get('returned', len(data.get('data', [])))
        print(f"   ✓ Response time: {elapsed:.3f} seconds")
        print(f"   ✓ Data source: {source}")
        print(f"   ✓ Points returned: {returned}")
        
        if source == 'redis_cache':
            print(f"   🚀 FAST! Using Redis cache (expected < 0.1s)")
        else:
            print(f"   🐌 SLOW! Using database (cache not populated yet)")
    else:
        print(f"   ✗ Error: {response.status_code}")
        print(f"   Response: {response.text}")
    
    # Test 2: Location-based query (use coordinates that exist in data)
    print("\n2. Testing location-based query (Southern California/Mexico border)...")
    print("   Note: Using lat=24.3, lon=-118.0 (actual data coverage area)")
    start = time.time()
    response = requests.get(f"{API_URL}/latest-aqi?lat=24.3&lon=-118.0&radius=100&limit=20")
    elapsed = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        source = data.get('source', 'unknown')
        returned = data.get('returned', len(data.get('data', [])))
        print(f"   ✓ Response time: {elapsed:.3f} seconds")
        print(f"   ✓ Data source: {source}")
        print(f"   ✓ Points returned: {returned}")
        
        if returned > 0 and 'data' in data:
            first_point = data['data'][0]
            if 'distance_km' in first_point:
                print(f"   ✓ Nearest point: {first_point['distance_km']}km away, AQI: {first_point.get('aqi', 'N/A')}")
    else:
        print(f"   ✗ Error: {response.status_code}")
        print(f"   Response: {response.text}")
    
    # Test 3: Repeat query to verify cache hit
    print("\n3. Testing cache hit rate (repeat same query)...")
    times = []
    for i in range(3):
        start = time.time()
        response = requests.get(f"{API_URL}/latest-aqi?limit=10")
        elapsed = time.time() - start
        times.append(elapsed)
        
        if response.status_code == 200:
            data = response.json()
            source = data.get('source', 'unknown')
            print(f"   Query {i+1}: {elapsed:.3f}s - Source: {source}")
    
    avg_time = sum(times) / len(times)
    print(f"\n   Average response time: {avg_time:.3f} seconds")
    
    if avg_time < 0.5:
        print(f"   🎉 EXCELLENT! Cache is working perfectly!")
    elif avg_time < 2.0:
        print(f"   ✓ GOOD! Acceptable performance")
    else:
        print(f"   ⚠️  SLOW! Cache may not be populated or Redis unavailable")
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    test_cache_performance()
