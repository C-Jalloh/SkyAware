# SkyAware

SkyAware is an open-source project from the NASA Space Apps Hackathon in Banjul, designed to empower communities with actionable air quality data by combining satellite and ground-based measurements. The platform provides real-time air quality information, forecasts, and health advice driven by AI.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Repository Structure](#repository-structure)
- [Data Sources](#data-sources)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Citations & Standards](#citations--standards)
- [About](#about)

---

## Overview

SkyAware integrates datasets from:
- **NASA TEMPO Mission** (Tropospheric Emissions: Monitoring of Pollution)
- **EPA AirNow Network**
- **OpenWeatherMap API**

The system delivers:
- Real-time Air Quality Index (AQI) mapping
- AI-powered air quality forecasts
- Personalized health advice based on individual context
- Actionable recommendations for outdoor activities and protection

---

## Features

- **Live AQI Map:** Visualizes current air quality using satellite and ground sensor data.
- **Forecasts:** AI-driven air quality predictions for any location.
- **Health Advice:** Personalized recommendations for outdoor activities and protective measures, including guidance for sensitive groups.
- **RESTful API:** Endpoints for AQI and forecast data integration.

---

## Repository Structure

- `.github/` — GitHub workflows and configuration.
- `Services/`
  - [`Tempo`](https://github.com/C-Jalloh/SkyAware/tree/main/Services/Tempo): NASA TEMPO data pipeline, GCP deployment scripts.
  - [`hexai-backend`](https://github.com/C-Jalloh/SkyAware/tree/main/Services/hexai-backend): Backend microservices for health/forecast AI.
- `docs/` — Project documentation.
- `images/` — Project images and visual assets.
- `memory-bank/` — Data storage or caching utilities.
- `sky-aware-frontend/` — Main frontend (React/Next.js) web application
  - `.vscode/`, `.gitignore`, `.hintrc`, `.prettierignore`, `.prettierrc`: Editor/config files.
  - `README.md`: Frontend-specific documentation.
  - `app/`: Next.js application pages and layouts.
  - `components/`: React UI components for maps, modals, health advice, etc.
  - `constants/`, `lib/`, `services/`, `types/`, `utils/`: Shared code and utilities.
  - `public/`: Static assets.
  - `package.json`, `tsconfig.json`, `yarn.lock`: Package and build configuration.
- `skyaware_aqi_*.geojson` — Example AQI data outputs.

---

## Data Sources

- **NASA TEMPO Mission:** Hourly satellite measurements of NO₂ and other pollutants.
- **EPA AirNow Network:** Ground-based AQI data for calibration and validation.
- **OpenWeatherMap:** Supplementary weather and atmospheric data.

---

## Architecture

- **Frontend:** React/Next.js web app for interactive AQI maps, forecasts, and health advice.
- **Backend Services:**
  - *TEMPO Pipeline:* Ingests NASA data hourly, computes AQI, stores in PostgreSQL, caches in Redis.
  - *API Endpoint:* Google Cloud Run service provides `/latest-aqi` and other endpoints.
  - *hexai-backend:* AI models for personalized health recommendations and forecasts.
- **Deployment:** Infrastructure as code via GCP scripts; secrets managed via GCP Secret Manager.

---

## Getting Started

### Prerequisites

- GCP project ("SkyAware") with billing enabled
- `gcloud` CLI installed and authenticated

### Setup & Deployment

See [`Services/Tempo/gcp_deployment/README.md`](https://github.com/C-Jalloh/SkyAware/blob/main/Services/Tempo/gcp_deployment/README.md) for step-by-step instructions:
```bash
cd Services/Tempo/gcp_deployment
chmod +x deploy.sh
./deploy.sh
```
- Prompts for Earthdata and database credentials (stored securely in Secret Manager)
- Sets up all GCP resources, database schema, and deploys pipeline and endpoints

---

## API Endpoints

- **Get latest AQI:**  
  `GET https://tempo-endpoint-abc123.run.app/latest-aqi`  
  _Returns: JSON with timestamp, longitude, latitude, aqi_grid_

- **Forecast:**  
  `GET /forecast`  
  _Returns: AI-powered AQI predictions for user location_

- **Health Advice:**  
  `POST /health/advice`  
  _Returns: Personalized health and activity recommendations based on AQI and user profile_

### Environment Variables (for deployment)

- `EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`
- `CLOUD_SQL_CONNECTION_NAME`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

---

## Citations & Standards

- WHO Air Quality Guidelines
- EPA AQI Standards
- NASA Earth Science Division

---

## About

SkyAware was built by the SkyAware Team for the NASA Space Apps Challenge 2025.
Our mission: **Empowering communities with actionable air quality data and AI-driven health recommendations.**

For more, see service-specific docs in the [`Services/`](https://github.com/C-Jalloh/SkyAware/tree/main/Services) directory and [`sky-aware-frontend/`](https://github.com/C-Jalloh/SkyAware/tree/main/sky-aware-frontend) documentation.

---