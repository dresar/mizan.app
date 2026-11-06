/**
 * useInfiniteList — Pillar 3: Generic Infinite Scroll Hook
 *
 * Wraps useInfiniteQuery + IntersectionObserver to create
 * zero-pagination, auto-loading lists.
 *
 * @param queryKey - TanStack Query key
 * @param fetcher  - Function that receives { pageParam } and returns { data, meta }
 * @param options  - Additional options (limit, staleTime, enabled)
 *
 * @example
 * const { items, sentinelRef, isFetchingNextPage, hasNextPage } = useInfiniteList(
 *   ['santri', 'infinite', searchQuery],
 *   ({ pageParam = 1 }) =>
 *     api.get('/admin/santri', { params: { page: pageParam, limit: 10 } }).then(r => r.data),
 * );
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';

interface PageResponse<T> {
  data: T[];
  meta?: {
    page: number;
    totalPages: number;
    total: number;
  };
}

interface UseInfiniteListOptions {
  limit?: number;
  staleTime?: number;
  enabled?: boolean;
}

export function useInfiniteList<T>(
  queryKey: readonly unknown[],
  fetcher: (context: { pageParam: number }) => Promise<PageResponse<T>>,
  options: UseInfiniteListOptions = {}
) {
  const { staleTime = 60_000, enabled = true } = options;

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetcher({ pageParam: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime,
    enabled,
  });

  // Flat list of all items across all pages
  const items: T[] = query.data?.pages.flatMap((p) => p.data) ?? [];

  // IntersectionObserver sentinel — attach to a div at the bottom of the list
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (
        entry.isIntersecting &&
        query.hasNextPage &&
        !query.isFetchingNextPage
      ) {
        query.fetchNextPage();
      }
    },
    [query]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '200px', // Start fetching 200px before the sentinel enters viewport
      threshold: 0,
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [handleIntersection]);

  return {
    items,
    sentinelRef,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error,
    refetch: query.refetch,
  };
}
