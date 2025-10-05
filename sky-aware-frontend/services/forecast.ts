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

export const getForecast = async (params?: ForecastRequest): Promise<ForecastResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.lat) queryParams.append('lat', params.lat.toString());
    if (params?.lon) queryParams.append('lon', params.lon.toString());
    if (params?.no2_value) queryParams.append('no2_value', params.no2_value.toString());

    const url = `${BASE_URL}/forecast${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const res = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.data;
  } catch (error: any) {
    console.error('Error fetching forecast data:', error);
    throw new Error('Failed to fetch forecast data: ' + error.message);
  }
};