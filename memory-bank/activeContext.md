# Active Context

## Current Goals

- Found and fixing the meshgrid bug: Both functions were using np.meshgrid(lon_data, lon_data) instead of np.meshgrid(lon_data, lat_data). This caused coordinate arrays to be 1D (size 2950) instead of 2D (size 7M+), leading to IndexError. Fix applied, rebuilding now.

## Current Blockers

- None yet