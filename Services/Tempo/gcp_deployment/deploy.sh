#!/bin/bash

# GCP Project ID
PROJECT_ID="skyaware"
REGION="us-central1"

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Create service account for Cloud Scheduler
gcloud iam service-accounts create tempo-scheduler-sa \
    --description="Service account for TEMPO pipeline scheduler" \
    --display-name="TEMPO Scheduler SA"

# Grant Cloud Run invoker role to service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:tempo-scheduler-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.invoker"

# Create secrets in Secret Manager (you'll need to provide actual values)
echo "Creating secrets in GCP Secret Manager..."
echo "Please enter your Earthdata username:"
read -s EARTHDATA_USER
echo -n "$EARTHDATA_USER" | gcloud secrets create earthdata-username --data-file=-

echo "Please enter your Earthdata password:"
read -s EARTHDATA_PASS
echo -n "$EARTHDATA_PASS" | gcloud secrets create earthdata-password --data-file=-

echo "Please enter the database password:"
read -s DB_PASS
echo -n "$DB_PASS" | gcloud secrets create db-password --data-file=-

# Grant access to Cloud Build service account
CLOUDBUILD_SA="$PROJECT_ID@cloudbuild.gserviceaccount.com"
gcloud secrets add-iam-policy-binding earthdata-username \
    --member="serviceAccount:$CLOUDBUILD_SA" \
    --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding earthdata-password \
    --member="serviceAccount:$CLOUDBUILD_SA" \
    --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding db-password \
    --member="serviceAccount:$CLOUDBUILD_SA" \
    --role="roles/secretmanager.secretAccessor"

# Create Cloud SQL PostgreSQL instance
gcloud sql instances create tempo-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION

# Create database
gcloud sql databases create tempo_aqi_db --instance=tempo-db

# Create user (password will be retrieved from Secret Manager)
gcloud sql users create tempo_user --instance=tempo-db \
    --password="$(gcloud secrets versions access latest --secret=db-password)"

# Create Memorystore Redis instance
gcloud redis instances create tempo-redis \
    --size=1 \
    --region=$REGION \
    --redis-version=redis_6_x

# Get IPs
DB_IP=$(gcloud sql instances describe tempo-db --format="value(ipAddresses[0].ipAddress)")
REDIS_IP=$(gcloud redis instances describe tempo-redis --region=$REGION --format="value(host)")

# Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml \
    --substitutions _DB_HOST="$DB_IP",_DB_PORT="5432",_DB_USER="tempo_user",_DB_NAME="tempo_aqi_db",_REDIS_HOST="$REDIS_IP",_REDIS_PORT="6379"

echo "Deployment complete!"
echo "Cloud Run URLs will be displayed above."
echo "Update the Cloud Scheduler job with the pipeline service URL:"
echo "gcloud scheduler jobs update http tempo-pipeline-hourly --uri='YOUR_PIPELINE_URL'"

# Optional: Set up Cloud Scheduler (uncomment and update URL)
# gcloud scheduler jobs create http tempo-pipeline-hourly \
#     --schedule="0 * * *" \
#     --uri="https://YOUR_PIPELINE_URL" \
#     --http-method=POST \
#     --oidc-service-account-email="tempo-scheduler-sa@$PROJECT_ID.iam.gserviceaccount.com"