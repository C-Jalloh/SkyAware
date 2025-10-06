/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sky-aware.org/api';

export interface ForecastDay {
  date: string;
  day: string;
  aqi: number;
  category: string;
  color: string;
}

export interface ForecastResponse {
  success: boolean;
  error?: string;
  location: {
    lat: number;
    lon: number;
  };
  forecast: ForecastDay[];
  generated_at: string;
  model_version: any;
  user: {
    authenticated: boolean;
    name?: string;
  };
}

export interface ForecastRequest {
  lat?: number;
  lon?: number;
  no2_value?: number;
}

// Helper function to get AQI category from AQI value
const getAQICategoryFromValue = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

// Helper function to get AQI color from AQI value
const getAQIColorFromValue = (aqi: number): string => {
  if (aqi <= 50) return '#00E400';
  if (aqi <= 100) return '#FFFF00';
  if (aqi <= 150) return '#FF7E00';
  if (aqi <= 200) return '#FF0000';
  if (aqi <= 300) return '#8F3F97';
  return '#7E0023';
};

// Helper function to get day name from date
const getDayNameFromDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
};

export const getForecast = async (
  params?: ForecastRequest,
): Promise<ForecastResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.lat) queryParams.append('lat', params.lat.toString());
    if (params?.lon) queryParams.append('lon', params.lon.toString());
    if (params?.no2_value)
      queryParams.append('no2_value', params.no2_value.toString());

    const url = `${BASE_URL}/forecast${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response:', res.data);
    const apiData = res.data;
    const transformedForecast: ForecastDay[] =
      apiData.forecast_days?.map((day: any) => ({
        date: day.date,
        day: getDayNameFromDate(day.date),
        aqi: day.aqi_max,
        category: getAQICategoryFromValue(day.aqi_max),
        color: getAQIColorFromValue(day.aqi_max),
      })) || [];

    return {
      success: true,
      location: params
        ? { lat: params.lat || 0, lon: params.lon || 0 }
        : { lat: 0, lon: 0 },
      forecast: transformedForecast,
      generated_at: apiData.generated_at,
      model_version: apiData.model_version,
      user: {
        authenticated: false,
      },
    };
  } catch (error: any) {
    console.error('Error fetching forecast data:', error);

    // Return error response that matches expected format
    return {
      success: false,
      error: `Failed to fetch forecast data: ${error.message}`,
      location: { lat: 0, lon: 0 },
      forecast: [],
      generated_at: new Date().toISOString(),
      model_version: null,
      user: {
        authenticated: false,
      },
    };
  }
};
