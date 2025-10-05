import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

/**
 * Fetch current weather data for a given latitude and longitude
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>}
 */
export async function getWeatherData(lat, lon) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("OpenWeatherMap API key is missing! Check your .env file.");
  }

  try {
    console.log(OPENWEATHER_BASE_URL);
    console.log(OPENWEATHER_API_KEY);
    const response = await axios.get(OPENWEATHER_BASE_URL, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: "metric", // Celsius
      },
    });

    const data = response.data;

    console.log(data);

    return {
      success: true,
      city: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      weatherDescription: data.weather[0].description,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("OpenWeatherMap API error:", error.message);
    throw new Error("Failed to fetch weather data.");
  }
}
