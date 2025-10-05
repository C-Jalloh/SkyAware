'use client';

import { useQuery } from '@tanstack/react-query';
import { getForecast, ForecastRequest } from '@/services/forecast';

export const useFetchForecast = (params?: ForecastRequest, enabled: boolean = false) => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['forecast', params?.lat, params?.lon, params?.no2_value],
    queryFn: () => getForecast(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
  });

  return { data, isFetching, error, refetch };
};