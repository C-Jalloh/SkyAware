'use client';

import { useQuery } from '@tanstack/react-query';

import { getForecast, type ForecastRequest } from '@/services/forecast';

export const useFetchForecast = (params: ForecastRequest = {}) => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['forecast', params],
    queryFn: () => getForecast(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: true,
  });

  return { data, isFetching, error, refetch };
};
