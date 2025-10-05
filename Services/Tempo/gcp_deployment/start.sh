#!/bin/bash
# Start the Flask app with gunicorn
set -e

# Set Earthdata credentials
if [ -f "/app/earthdata_username.txt" ]; then
    EARTHDATA_USERNAME=$(cat /app/earthdata_username.txt)
    export EARTHDATA_USERNAME
    echo "Set EARTHDATA_USERNAME from file"
fi

if [ -f "/app/earthdata_password.txt" ]; then
    EARTHDATA_PASSWORD=$(cat /app/earthdata_password.txt)
    export EARTHDATA_PASSWORD
    echo "Set EARTHDATA_PASSWORD from file"
fi

# Get PORT with default
PORT=${PORT:-4040}
echo "Using PORT: $PORT"

# Change to app directory
cd /app
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

# Test Python import
echo "Testing Python import..."
python3 -c "import endpoint; print('endpoint module imported successfully'); print('app object:', hasattr(endpoint, 'app'))"

# Check if this is a pipeline job or API service
if [ "$RUN_PIPELINE" = "true" ]; then
    echo "Running TEMPO data processing pipeline..."
    python3 main.py
else
    # Start gunicorn for API service
    echo "Starting gunicorn with command: gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 0 endpoint:app"
    exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 0 endpoint:app
fi