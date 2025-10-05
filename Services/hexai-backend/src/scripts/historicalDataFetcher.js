import fs from "fs";
import axios from "axios";
import { createObjectCsvWriter as createCsvWriter } from "csv-writer";
import dotenv from "dotenv";

dotenv.config();

const AIRNOW_API_KEY = process.env.AIRNOW_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

console.log("open weather key>>>>> ", OPENWEATHER_API_KEY);
console.log("air now key>>>>> ", AIRNOW_API_KEY);

if (!AIRNOW_API_KEY || !OPENWEATHER_API_KEY) {
  throw new Error("API keys for AirNow or OpenWeatherMap are missing!");
}

// List of target cities
const targetCities = [
  { name: "Banjul", lat: 13.4549, lon: -16.579 },
  { name: "Dakar", lat: 14.6928, lon: -17.4467 },
];

// Number of days to fetch
const DAYS_TO_FETCH = 30;

// Helper to get past dates in YYYY-MM-DD
function getPastDates(days) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(new Date(d)); // store Date object
  }
  return dates;
}

// Fetch historical AQI from AirNow
async function fetchHistoricalAQI(lat, lon, date) {
  try {
    const dateStr = date.toISOString().split("T")[0];
    const url = "https://www.airnowapi.org/aq/observation/latLong/historical/";
    const response = await axios.get(url, {
      params: {
        format: "application/json",
        latitude: lat,
        longitude: lon,
        date: dateStr,
        distance: 25,
        API_KEY: AIRNOW_API_KEY,
      },
    });
    const data = response.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0].AQI;
    }
    return null;
  } catch (error) {
    console.error("AirNow historical error:", error.message);
    return null;
  }
}

// Fetch historical weather from OpenWeatherMap
async function fetchHistoricalWeather(lat, lon, date) {
  try {
    const timestamp = Math.floor(date.getTime() / 1000);
    const url = "https://api.openweathermap.org/data/2.5/onecall/timemachine";
    const response = await axios.get(url, {
      params: {
        lat,
        lon,
        dt: timestamp,
        units: "metric",
        appid: OPENWEATHER_API_KEY,
      },
    });
    const hourlyData = response.data.hourly;
    // Take average for the day
    const tempAvg =
      hourlyData.reduce((sum, h) => sum + h.temp, 0) / hourlyData.length;
    const humidityAvg =
      hourlyData.reduce((sum, h) => sum + h.humidity, 0) / hourlyData.length;
    const windAvg =
      hourlyData.reduce((sum, h) => sum + h.wind_speed, 0) / hourlyData.length;

    return {
      temperature: Number(tempAvg.toFixed(2)),
      humidity: Number(humidityAvg.toFixed(2)),
      windSpeed: Number(windAvg.toFixed(2)),
    };
  } catch (error) {
    console.error("OpenWeatherMap historical error:", error.message);
    return { temperature: null, humidity: null, windSpeed: null };
  }
}

// Main function
async function fetchHistoricalData() {
  const dates = getPastDates(DAYS_TO_FETCH);
  const allData = [];

  for (const city of targetCities) {
    console.log(`Fetching data for ${city.name}...`);
    for (const date of dates) {
      const aqi = await fetchHistoricalAQI(city.lat, city.lon, date);
      const weather = await fetchHistoricalWeather(city.lat, city.lon, date);

      allData.push({
        date: date.toISOString().split("T")[0],
        city: city.name,
        aqi,
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
      });

      // small delay to avoid hitting API limits
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Save JSON
  fs.writeFileSync("historicalData.json", JSON.stringify(allData, null, 2));
  console.log("Saved historicalData.json");

  // Save CSV
  const csvWriter = createCsvWriter({
    path: "historicalData.csv",
    header: [
      { id: "date", title: "DATE" },
      { id: "city", title: "CITY" },
      { id: "aqi", title: "AQI" },
      { id: "temperature", title: "TEMP" },
      { id: "humidity", title: "HUMIDITY" },
      { id: "windSpeed", title: "WIND_SPEED" },
    ],
  });
  await csvWriter.writeRecords(allData);
  console.log("Saved historicalData.csv");
}

// Run
fetchHistoricalData()
  .then(() => console.log("Historical data fetch complete."))
  .catch((err) => console.error("Error fetching historical data:", err));
