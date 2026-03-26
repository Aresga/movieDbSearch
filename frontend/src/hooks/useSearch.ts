import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/api/search'

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
  })
}

export function useTrending(limit = 20) {
  return useQuery({
    queryKey: ['trending', limit],
    queryFn: () => searchApi.trending(limit),
    staleTime: 1000 * 60 * 10, // cache for 10min, its enough since it doesnt change that much or never for our backend 
  })
}
