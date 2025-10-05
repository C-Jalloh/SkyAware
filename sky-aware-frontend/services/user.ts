import axios from 'axios';

import type { AuthResponse } from '@/types/user';

interface ChangePasswordValues {
  oldPassword: string;
  newPassword: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sky-aware.org/api';

if (!BASE_URL) {
  throw new Error('API URL is not defined');
}

export const changePasswordService = async ({
  oldPassword,
  newPassword,
}: ChangePasswordValues) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/change-password`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // or however you store it
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });
    return res;
  } catch (error: any) {
    console.error('Error fetching geocoding data:', JSON.stringify(error));
    throw Error('Failed to fetch geocoding data ', error.message);
  }
};

interface CreateAccountValues {
  name: string;
  email: string;
  password: string;
}

export const createAccountService = async ({
  name,
  email,
  password,
}: CreateAccountValues): Promise<AuthResponse> => {
  try {
    const res = await axios.post<AuthResponse>(`${BASE_URL}/auth/register`, {
      name,
      email,
      password,
    });

    return res.data;
  } catch (error: any) {
    console.error('Error fetching geocoding data:', JSON.stringify(error));
    throw Error('Failed to fetch geocoding data ', error.message);
  }
};
