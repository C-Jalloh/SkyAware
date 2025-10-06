import axios from 'axios';

import type { AirQualityResponse, AQIFilters } from '@/types/map';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sky-aware.org/api';

if (!BASE_URL) {
  throw new Error('API URL is not defined');
}

export const getMapGeocoding = async (
  searchQuery: string,
  accessToken: string,
) => {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery,
      )}.json?access_token=${accessToken}&limit=3`,
    );

    return await res.json();
  } catch (error: any) {
    console.error('Error fetching geocoding data:', JSON.stringify(error));
    throw Error('Failed to fetch geocoding data ', error.message);
  }
};

export const getCurrentAqi = async (
  filters: AQIFilters = {},
): Promise<AirQualityResponse> => {
  try {
    const res = await axios.get(`${BASE_URL}/current_aqi`, {
      params: filters,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await res.data;
  } catch (error: any) {
    console.error('Error fetching geocoding data:', error.message);
    throw Error('Failed to fetch geocoding data ', error.message);
  }
};
