import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const AIRNOW_API_KEY = process.env.AIRNOW_API_KEY;
const AIRNOW_BASE_URL =
  "https://www.airnowapi.org/aq/observation/latLong/current/";
/**
 * Fetch current AQI data from AirNow API for a given lat/lon.
 * @param lat Latitude of the location
 * @param lon Longitude of the location
 * @returns AQI data object
 */

export const getAirNowData = async (lat, lon) => {
  if (!AIRNOW_API_KEY) {
    throw new Error("AirNow API key is not set in environment variables.");
  }
  try {
    console.log(AIRNOW_BASE_URL);
    console.log(AIRNOW_API_KEY);
    const response = await axios.get(AIRNOW_BASE_URL, {
      params: {
        format: "application/json",
        latitude: lat,
        longitude: lon,
        distance: 25, // miles radius (adjust as needed)
        API_KEY: AIRNOW_API_KEY,
      },
    });

    const data = response.data;
    console.log(data);

    if (!Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        message: "No AQI data available for this location.",
      };
    }

    // Clean & format output (pick the first record if multiple)
    const aqiInfo = data[0];

    return {
      success: true,
      city: aqiInfo.ReportingArea,
      state: aqiInfo.StateCode,
      aqi: aqiInfo.AQI,
      category: aqiInfo.Category.Name,
      pollutant: aqiInfo.ParameterName,
      timestamp: aqiInfo.DateObserved,
    };
  } catch (error) {
    console.error("AirNow API error:", error.response?.data || error.message);

    return {
      success: false,
      message: "Failed to fetch AirNow data.",
      error: error.response?.data || error.message,
    };
  }
};
