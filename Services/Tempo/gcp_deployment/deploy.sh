#!/bin/bash

# GCP Project ID
PROJECT_ID="SkyAware"
REGION="us-central1"

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com

# Create Cloud SQL PostgreSQL instance
gcloud sql instances create tempo-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION

# Create database
gcloud sql databases create tempo_aqi_db --instance=tempo-db

# Create user (you'll need to set password)
gcloud sql users create tempo_user --instance=tempo-db --password=tempo_pass123

# Create Memorystore Redis instance
gcloud redis instances create tempo-redis \
    --size=1 \
    --region=$REGION \
    --redis-version=redis_6_x

# Get Cloud SQL IP
DB_IP=$(gcloud sql instances describe tempo-db --format="value(ipAddresses[0].ipAddress)")

# Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml \
    --substitutions _EARTHDATA_USERNAME="your_username",_EARTHDATA_PASSWORD="your_password",_DB_HOST="$DB_IP",_DB_PORT="5432",_DB_USER="tempo_user",_DB_PASS="tempo_pass123",_DB_NAME="tempo_aqi_db",_REDIS_HOST="$REDIS_IP",_REDIS_PORT="6379",_REDIS_PASSWORD=""

# Set up Cloud Scheduler for hourly runs
gcloud scheduler jobs create http tempo-pipeline-hourly \
    --schedule="0 * * * *" \
    --uri="https://tempo-pipeline-abc123.run.app" \  # Replace with actual URL
    --http-method=POST \
    --oidc-service-account-email="your-service-account@SkyAware.iam.gserviceaccount.com"

echo "Deployment complete. Update the Cloud Scheduler URL with the actual Cloud Run URL."