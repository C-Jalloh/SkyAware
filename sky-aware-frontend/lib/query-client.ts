'use client';

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error: any) => {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        if (error?.response?.status === 401) {
          console.log('Authentication error in mutation');
        }
      },
    },
  },
});

queryClient.setQueryDefaults(
  ['allKeys.all'],

  { staleTime: 1000 * 60 },
);
