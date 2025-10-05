import axios from 'axios';

import type { CategoriesResponse } from '@/types/category';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sky-aware.org/api';

if (!BASE_URL) {
  throw new Error('API URL is not defined');
}

export const getCategories = async (): Promise<CategoriesResponse> => {
  try {
    const res = await axios.get(`${BASE_URL}/current_aqi/categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Categories response status:', res?.data.categories);

    return res.data;
  } catch (error: any) {
    console.error('Error fetching geocoding data:', JSON.stringify(error));
    throw Error('Failed to fetch geocoding data ', error.message);
  }
};
