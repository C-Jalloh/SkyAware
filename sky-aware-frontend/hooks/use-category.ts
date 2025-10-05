'use client';

import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/services/category';

export const useFetchCategories = () => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories();

      return res.categories;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    enabled: true,
  });

  return { data, isFetching, error, refetch };
};
