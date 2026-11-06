import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
const isDev = import.meta.env.DEV;
const STALE_TIME_PROD = 1000 * 60 * 60; 
const STALE_TIME_DEV = 1000 * 60 * 5;
export function usePublicData<T>(
  key: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      try {
        const { data } = await api.get(endpoint);
        return data;
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
      }
    },
    staleTime: isDev ? STALE_TIME_DEV : STALE_TIME_PROD,
    gcTime: 1000 * 60 * 60 * 24, 
    retry: 3, 
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    networkMode: 'offlineFirst', 
    ...options,
  });
}
export function useLastUpdate() {
  return useQuery({
    queryKey: ['last-update'],
    queryFn: async () => {
      const { data } = await api.get('/core/last-updates');
      return data;
    },
    refetchInterval: isDev ? false : 1000 * 60 * 60, 
    staleTime: 0,
  });
}
