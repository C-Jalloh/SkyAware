'use client';

import { useQuery } from '@tanstack/react-query';

import { getCurrentAqi } from '@/services/map';
import type { AQIFilters } from '@/types/map';

export const useFetchCurrentAqi = (filters: AQIFilters = {}) => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['aqis', filters],
    queryFn: async () => {
      const res = await getCurrentAqi(filters);

      return res;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    enabled: true,
  });

  return { data, isFetching, error, refetch };
};
