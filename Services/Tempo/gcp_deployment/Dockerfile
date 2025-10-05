# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for cartopy
RUN apt-get update && apt-get install -y \
    libproj-dev \
    proj-data \
    proj-bin \
    libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .
COPY endpoint.py .
COPY start.sh .
COPY earthdata_username.txt .
COPY earthdata_password.txt .

# Make startup script executable
RUN chmod +x start.sh

# Expose port for endpoint
EXPOSE 4040

# Default command runs the Flask API with gunicorn
CMD ["./start.sh"]