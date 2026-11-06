/**
 * usePrefetch — Pillar 1: Intent-Based Prefetching Hook
 *
 * Usage: Attach to onMouseEnter/onFocus on navigation links and action buttons.
 * Data is fetched in the background BEFORE the user clicks.
 *
 * @example
 * const prefetchSantri = usePrefetch(['santri', id], () => api.get(`/admin/santri/${id}`).then(r => r.data));
 * <Link to={`/admin/admissions/${id}`} onMouseEnter={prefetchSantri} onFocus={prefetchSantri}>
 *   Lihat Detail
 * </Link>
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

type QueryKey = readonly unknown[];

export function usePrefetch<T>(
  queryKey: QueryKey,
  fetcher: () => Promise<T>,
  /** Reuse cached data if it's less than this many ms old (default: 30s) */
  staleTime = 30_000
) {
  const queryClient = useQueryClient();

  // Track if prefetch has already been triggered to avoid hammering on rapid re-hover
  const prefetchedRef = useRef(false);

  return useCallback(() => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;

    queryClient.prefetchQuery({
      queryKey,
      queryFn: fetcher,
      staleTime,
    });

    // Allow re-prefetch after 60s (in case data goes stale)
    setTimeout(() => {
      prefetchedRef.current = false;
    }, 60_000);
  }, [queryClient, queryKey, fetcher, staleTime]);
}

/**
 * useBatchPrefetch — Prefetch an entire list from a single hover
 * Useful for nav menu items that map to list pages.
 *
 * @example
 * const prefetchSantriList = useBatchPrefetch(
 *   ['santri', 'list'],
 *   () => api.get('/admin/santri', { params: { limit: 10, page: 1 } }).then(r => r.data)
 * );
 */
export function useBatchPrefetch<T>(
  queryKey: QueryKey,
  fetcher: () => Promise<T>,
  staleTime = 60_000
) {
  return usePrefetch(queryKey, fetcher, staleTime);
}
