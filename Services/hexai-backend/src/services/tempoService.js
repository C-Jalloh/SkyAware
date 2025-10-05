import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPO_DATA_PATH = path.join(__dirname, '../data/skyaware_aqi_20251005_120028.geojson');

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/**
 * Determine AQI category from AQI value
 */
function getAqiCategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

/**
 * Find the closest single Tempo data point
 */
export const getTempoData = async (lat, lon) => {
  try {
    const data = fs.readFileSync(TEMPO_DATA_PATH, 'utf8');
    const geoData = JSON.parse(data);

    if (!geoData.features || geoData.features.length === 0) {
      return {
        success: false,
        message: "No Tempo data available."
      };
    }

    let closestFeature = null;
    let minDistance = Infinity;

    for (const feature of geoData.features) {
      if (feature.geometry && feature.geometry.coordinates) {
        const [featureLon, featureLat] = feature.geometry.coordinates;
        const distance = calculateDistance(lat, lon, featureLat, featureLon);

        if (distance < minDistance) {
          minDistance = distance;
          closestFeature = feature;
        }
      }
    }

    if (!closestFeature) {
      return {
        success: false,
        message: "No Tempo data found for this location."
      };
    }

    const properties = closestFeature.properties;
    const [featureLon, featureLat] = closestFeature.geometry.coordinates;

    return {
      success: true,
      coordinates: {
        latitude: featureLat,
        longitude: featureLon
      },
      aqi: properties.aqi,
      category: properties.category,
      color: properties.color,
      source: "NASA TEMPO NO2 Satellite Data",
      distance_km: minDistance.toFixed(2),
      timestamp: geoData.metadata?.timestamp || null
    };

  } catch (error) {
    console.error("Tempo data error:", error.message);
    return {
      success: false,
      message: "Failed to fetch Tempo data.",
      error: error.message
    };
  }
};

/**
 * Get all Tempo data points within a radius (for area search)
 */
export const getTempoDataArea = async (lat, lon, radiusKm = 25) => {
  try {
    const data = fs.readFileSync(TEMPO_DATA_PATH, 'utf8');
    const geoData = JSON.parse(data);

    if (!geoData.features || geoData.features.length === 0) {
      return {
        success: false,
        message: "No Tempo data available."
      };
    }

    const pointsInArea = [];

    for (const feature of geoData.features) {
      if (feature.geometry && feature.geometry.coordinates) {
        const [featureLon, featureLat] = feature.geometry.coordinates;
        const distance = calculateDistance(lat, lon, featureLat, featureLon);

        if (distance <= radiusKm) {
          pointsInArea.push({
            coordinates: {
              latitude: featureLat,
              longitude: featureLon
            },
            aqi: feature.properties.aqi,
            category: feature.properties.category,
            color: feature.properties.color,
            distance_km: distance.toFixed(2)
          });
        }
      }
    }

    if (pointsInArea.length === 0) {
      return {
        success: false,
        message: `No Tempo data found within ${radiusKm}km of this location.`
      };
    }

    // Calculate area statistics
    const aqiValues = pointsInArea.map(p => p.aqi);
    const avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
    const minAqi = Math.min(...aqiValues);
    const maxAqi = Math.max(...aqiValues);

    return {
      success: true,
      area_summary: {
        center_coordinates: { latitude: lat, longitude: lon },
        radius_km: radiusKm,
        total_points: pointsInArea.length,
        avg_aqi: avgAqi,
        min_aqi: minAqi,
        max_aqi: maxAqi,
        category: getAqiCategory(avgAqi)
      },
      data_points: pointsInArea.slice(0, 50), // Limit to 50 points for performance
      source: "NASA TEMPO NO2 Satellite Data",
      timestamp: geoData.metadata?.timestamp || null
    };

  } catch (error) {
    console.error("Tempo area data error:", error.message);
    return {
      success: false,
      message: "Failed to fetch Tempo area data.",
      error: error.message
    };
  }
};