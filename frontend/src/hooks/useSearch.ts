import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/api/search'

/**
 * Hook to perform a search query with React Query caching.
 * @param query - The string to search for against the database.
 */
export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to fetch the currently trending movies from the backend.
 * Caches aggressively since trending data does not change very often.
 * @param limit - The maximum number of trending movies to fetch (default 20).
 */
export function useTrending(limit = 20) {
  return useQuery({
    queryKey: ['trending', limit],
    queryFn: () => searchApi.trending(limit),
    staleTime: 1000 * 60 * 10, // cache for 10min, its enough since it doesnt change that much or never for our backend 
  })
}
