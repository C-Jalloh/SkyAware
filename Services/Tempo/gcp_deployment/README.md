# TEMPO Pipeline GCP Deployment

This directory contains the GCP deployment configuration for the TEMPO NO2 to AQI pipeline.

## Architecture

- **Pipeline**: Runs hourly via Cloud Scheduler, downloads TEMPO data, processes AQI, stores in PostgreSQL and caches in Redis.
- **Endpoint**: Cloud Run service providing API to retrieve latest AQI data.
- **Storage**: Cloud SQL PostgreSQL for persistent storage, Memorystore Redis for caching.

## Setup Instructions

1. **Prerequisites**:
   - GCP Project "SkyAware" set up
   - Earthdata login credentials
   - gcloud CLI installed and authenticated

2. **Update deploy.sh**:
   - Replace Earthdata credentials (already done)
   - Service account is automatically created and configured

3. **Run deployment**:

   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Initialize database schema**:
   - Connect to Cloud SQL instance
   - Run the SQL in `schema.sql`

5. **Update Cloud Scheduler**:
   - Get the Cloud Run URL for the pipeline service
   - Update the scheduler job with the correct URL

## API Endpoint

- **URL**: `https://tempo-endpoint-abc123.run.app/latest-aqi`
- **Method**: GET
- **Response**: JSON with timestamp, longitude, latitude, aqi_grid

## Environment Variables

Set these in Cloud Run:

- `EARTHDATA_USERNAME`: Earthdata username
- `EARTHDATA_PASSWORD`: Earthdata password
- `CLOUD_SQL_CONNECTION_NAME`: Cloud SQL connection string
- `DB_USER`: Database user
- `DB_PASS`: Database password
- `DB_NAME`: Database name
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port (default 6379)
- `REDIS_PASSWORD`: Redis password (if set)
