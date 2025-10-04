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

# Expose port for endpoint
EXPOSE 8080

# Default command runs the pipeline
CMD ["python", "main.py"]