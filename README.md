# SkyAware 🌍💨

**Real-Time Air Quality Intelligence Powered by NASA TEMPO Satellite Data**

SkyAware is an innovative air quality monitoring and forecasting platform that combines NASA's TEMPO (Tropospheric Emissions: Monitoring of Pollution) satellite data with EPA ground station measurements to provide actionable air quality insights for communities across North America.

---

## 📖 Project Overview

SkyAware transforms complex satellite data into accessible, real-time air quality information that helps people make informed decisions about their health and outdoor activities. By leveraging NASA's revolutionary TEMPO mission—the first space-based instrument to monitor air quality over North America hourly during daylight—we deliver:

- **Real-Time AQI Mapping**: Interactive visualization of current air quality from both satellite and ground stations
- **TEMPO Satellite Layer**: High-resolution NO₂ concentration data processed into EPA AQI standards
- **3-Day Forecasting**: AI/ML-powered predictions of air quality trends
- **Health Recommendations**: Personalized advice based on AQI levels
- **Educational Content**: Learn about air pollutants, their health impacts, and the science behind TEMPO

### 🎯 Problem We're Solving

Air pollution causes over 7 million premature deaths globally each year. Traditional ground-based monitoring stations provide limited geographic coverage, leaving many communities without access to timely air quality information. NASA's TEMPO satellite fills this gap by providing comprehensive, hourly pollution measurements across the entire continent.

### 💡 Our Solution

SkyAware bridges the gap between cutting-edge satellite technology and everyday users by:
1. Processing raw TEMPO satellite data into user-friendly AQI values
2. Combining satellite observations with ground station data for validation
3. Using machine learning to forecast air quality trends
4. Delivering actionable health advice through an intuitive mobile-first interface

---

## 🏗️ Architecture

### Tech Stack

#### **Frontend**
- **Framework**: Next.js (React)
- **Mapping**: Mapbox GL JS
- **Styling**: Responsive, mobile-first design
- **Deployment**: Vercel/GCP Cloud Run

#### **Backend**
- **API Server**: Node.js with Express
- **Runtime**: GCP Cloud Run (containerized)
- **Caching**: In-memory cache for API optimization
- **Database**: MongoDB (User data, Location preferences)

#### **Data Pipeline**
- **TEMPO Processing**: Python with xarray, netCDF4, NumPy
- **Data Ingestion**: NASA Harmony API, EPA AirNow API
- **Storage**: GCP Cloud Storage (GeoJSON, processed data)
- **Orchestration**: GCP Cloud Functions + Cloud Scheduler (hourly updates)
- **Database**: PostgreSQL (TEMPO AQI historical data)
- **Cache Layer**: Redis (for sub-50ms API responses)

#### **AI/ML Services**
- **Forecasting**: XGBoost/scikit-learn models
- **Health Advice**: Google Gemini AI integration
- **Training Data**: 30-60 days historical AQI + weather data

#### **Cloud Infrastructure (GCP)**
- Cloud Run (API & Services)
- Cloud Functions (TEMPO data processing)
- Cloud Storage (Processed satellite data)
- Cloud Scheduler (Automated pipeline triggers)
- Cloud SQL (PostgreSQL)
- Memorystore (Redis)

### Repository Structure

```
SkyAware/
├── Services/
│   ├── Tempo/                    # TEMPO Data Pipeline (Python)
│   │   └── gcp_deployment/       # Cloud deployment configurations
│   │       ├── main.py           # TEMPO data processing & AQI conversion
│   │       ├── endpoint.py       # REST API for AQI data
│   │       ├── cloudbuild.yaml   # GCP build configuration
│   │       ├── Dockerfile        # Container configuration
│   │       ├── test_tempo_data.py
│   │       ├── test_redis_cache.py
│   │       └── *.md              # Comprehensive documentation
│   │
│   └── hexai-backend/            # Backend API Service (Node.js)
│       ├── src/
│       │   ├── routes/           # API endpoints
│       │   │   ├── currentAqiRoute.js
│       │   │   ├── forecastRoute.js
│       │   │   ├── tempoGridRoute.js
│       │   │   ├── weatherRoute.js
│       │   │   ├── alertsRoute.js
│       │   │   └── auth.js
│       │   ├── services/         # Business logic
│       │   │   ├── airnowService.js      # EPA data integration
│       │   │   ├── tempoService.js       # TEMPO data integration
│       │   │   ├── weatherService.js     # Weather data
│       │   │   ├── forecastService.js    # ML forecasting
│       │   │   └── gemini/ai.js          # AI health advice
│       │   ├── middleware/       # Auth, logging, error handling
│       │   ├── data/             # Database models (User, Location)
│       │   └── utils/            # Helpers, schemas, HTTP client
│       ├── docker-compose.yml
│       ├── Dockerfile
│       └── nginx.conf
│
├── docs/                         # Project documentation
│   └── Requirements/             # Design docs, API specs, guides
├── memory-bank/                  # Project context & decisions
└── README.md                     # This file
```

---

## 🚀 Key Features

### 1. **Interactive Air Quality Map**
- Real-time AQI display for 5-10 major cities across North America
- Color-coded markers (Green → Yellow → Orange → Red → Purple → Maroon)
- TEMPO satellite overlay showing NO₂ concentrations
- Ground station validation markers

### 2. **TEMPO Satellite Integration**
- Hourly updates from NASA's TEMPO mission
- Processing of Level 2/3 NO₂ vertical column data
- Conversion to EPA AQI standard (0-500 scale)
- Geographic filtering for North America (24-50°N, -125 to -65°W)
- Progressive storage: 85,000+ data points per update

### 3. **3-Day Forecast**
- Machine learning predictions based on:
  - Historical AQI trends
  - Weather patterns (temperature, wind, humidity)
  - Seasonal factors
- Confidence intervals for predictions

### 4. **Health Recommendations**
- AI-powered personalized advice using Google Gemini
- AQI-based guidelines:
  - **0-50 (Good)**: Air quality is satisfactory
  - **51-100 (Moderate)**: Acceptable for most people
  - **101-150 (Unhealthy for Sensitive Groups)**: Sensitive groups should limit outdoor exertion
  - **151-200 (Unhealthy)**: Everyone may experience health effects
  - **201-300 (Very Unhealthy)**: Health alert for all
  - **301-500 (Hazardous)**: Emergency conditions

### 5. **Educational Mode**
- What is TEMPO and how does it work?
- Understanding NO₂ and Ozone pollutants
- Health impacts of air pollution
- How to protect yourself on high AQI days

### 6. **Push Notifications & Alerts**
- Location-based air quality alerts
- Forecast warnings for sensitive groups
- Real-time updates when AQI changes significantly

---

## 📊 Data Sources

### Primary Data
- **NASA TEMPO Mission**: Hourly NO₂ measurements (Earthdata/Harmony API)
- **EPA AirNow**: Real-time ground station AQI data
- **OpenWeatherMap**: Meteorological data for forecasting

### Data Attribution
*Data provided by NASA TEMPO Mission and EPA AirNow*

---

## 👥 Team

### **Ebrima S. Jallow** - Team Lead / Support & Content
- Project coordination and roadmap management
- Content strategy and scientific accuracy
- Pitch development and presentation
- Citation and compliance management

### **Saul Zayn** - Senior Frontend Developer
- Next.js application architecture
- Mapbox GL JS integration
- Interactive map and TEMPO layer visualization
- Responsive UI/UX implementation

### **Sawaneh** - Senior Backend Developer (Hassan Sawaney)
- GCP infrastructure architecture
- Node.js API development and deployment
- Cloud Run, Cloud Functions, and Cloud Storage management
- API contract enforcement and data flow orchestration

### **Hassan** - Full Stack Developer
- EPA AirNow and OpenWeatherMap API integration
- Historical data collection for ML training
- Frontend-backend data bridging
- Data validation and error handling

### **Omar** - AI/ML Engineer (Omar S. Camara)
- TEMPO data processing pipeline (Python)
- NetCDF/HDF to GeoJSON/AQI conversion
- XGBoost forecasting model development
- Cloud Function deployment and automation

### **Hawa Cham** - Support / Content & QA
- Quality assurance testing
- Educational content creation
- Documentation management
- User experience validation

---

## 🔧 API Endpoints

### Current AQI
```
GET /api/current_aqi
Returns: Real-time AQI for supported cities (EPA + TEMPO)
```

### TEMPO Grid Layer
```
GET /api/tempo_grid
Returns: URL to latest processed TEMPO GeoJSON/Raster in Cloud Storage
```

### Forecast
```
GET /api/forecast?location={lat,lon}
Returns: 3-day AQI forecast with confidence intervals
```

### Weather Data
```
GET /api/weather?location={lat,lon}
Returns: Current weather conditions
```

### Alerts
```
GET /api/alerts?location={lat,lon}
Returns: Active air quality alerts for location
```

**Full API Documentation**: See `Services/Tempo/gcp_deployment/API_USAGE_GUIDE.md`

---

## 📈 Performance

### Current Status
- **API Response Time**: 3-5 seconds (database mode)
- **Data Processing**: 85,000+ points per TEMPO update
- **Update Frequency**: Hourly (during daylight hours)
- **Geographic Coverage**: Currently 24-24.6°N (expanding to full 24-50°N)

### Optimization Features
- Intelligent database sampling (5,000 points max)
- Redis caching infrastructure (ready for VPC integration)
- Progressive storage for large datasets
- Geographic filtering for North America focus

**Performance Details**: See `Services/Tempo/gcp_deployment/PERFORMANCE_STATUS.md`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Python 3.11+
- GCP Account with billing enabled
- NASA Earthdata credentials
- API Keys: EPA AirNow, OpenWeatherMap, Mapbox

### Environment Variables
```bash
# Backend (hexai-backend)
DB_HOST=your-mongodb-host
DB_PORT=27017
AIRNOW_API_KEY=your-airnow-key
WEATHER_API_KEY=your-openweather-key
GEMINI_API_KEY=your-gemini-key

# TEMPO Pipeline
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USER=tempo_user
DB_PASS=your-password
DB_NAME=tempo_aqi_db
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

### Installation & Deployment

#### TEMPO Data Pipeline
```bash
cd Services/Tempo/gcp_deployment
pip install -r requirements.txt

# Deploy to GCP Cloud Run
gcloud builds submit --config cloudbuild.yaml
```

#### Backend API
```bash
cd Services/hexai-backend
yarn install

# Run locally
yarn start

# Deploy with Docker
docker-compose up
```

---

## 📚 Documentation

- **API Usage Guide**: `Services/Tempo/gcp_deployment/API_USAGE_GUIDE.md`
- **Performance Status**: `Services/Tempo/gcp_deployment/PERFORMANCE_STATUS.md`
- **Redis Caching**: `Services/Tempo/gcp_deployment/REDIS_CACHING_OPTIMIZATION.md`
- **Project Requirements**: `docs/Requirements/`
- **Developer Guides**: `docs/Requirements/Developer Guides.pdf`

---

## 🏆 NASA Space Apps Challenge 2024

**Challenge**: Leveraging Earth Observation Data for Informed Agricultural Decision-Making

**Location**: Banjul, The Gambia

**Submission**: SkyAware - Making satellite air quality data accessible to everyone

---

## 📄 License

This project was developed for the NASA Space Apps Challenge 2024.

Data sources are subject to their respective licenses:
- NASA TEMPO data: Public domain
- EPA AirNow data: Public domain
- Weather data: OpenWeatherMap API terms

---

## 🙏 Acknowledgments

- **NASA TEMPO Mission Team** for providing revolutionary air quality data
- **EPA AirNow** for ground station validation data
- **Google Cloud Platform** for infrastructure support
- **NASA Space Apps Challenge** organizers in Banjul, The Gambia

---

## 📞 Contact

For questions about this project, please contact the team lead:
**Ebrima S. Jallow** - Team Lead, SkyAware Project

---

**Built with ❤️ in The Gambia for NASA Space Apps Challenge 2024**
