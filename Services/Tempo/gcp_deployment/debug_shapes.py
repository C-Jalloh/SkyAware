import numpy as np

# Simulate the issue
lat_1d = np.arange(2950)  # 1D array of length 2950
lon_1d = np.arange(2378)  # 1D array of length 2378

# Current (wrong) code - uses lat twice
lon_grid_wrong, lat_grid_wrong = np.meshgrid(lon_1d, lat_1d)
print(f"WRONG meshgrid(lon, lat):")
print(f"  lon_grid shape: {lon_grid_wrong.shape}")
print(f"  lat_grid shape: {lat_grid_wrong.shape}")
print(f"  Flattened size: {lon_grid_wrong.flatten().shape[0]}")
print()

# Correct code
lon_grid_correct, lat_grid_correct = np.meshgrid(lon_1d, lat_1d)
print(f"CORRECT meshgrid(lon, lat):")
print(f"  lon_grid shape: {lon_grid_correct.shape}")
print(f"  lat_grid shape: {lat_grid_correct.shape}")
print(f"  Flattened size: {lon_grid_correct.flatten().shape[0]}")
print()

# Expected data size
expected_size = 2950 * 2378
print(f"Expected data size (2950 x 2378): {expected_size:,}")
