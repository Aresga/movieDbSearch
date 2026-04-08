import { useInfiniteQuery } from '@tanstack/react-query'
import { searchApi } from '@/api/search'
import type { SearchResponse } from '@/types'

export function useSearch(query: string, size = 10) {
  return useInfiniteQuery<SearchResponse>({
    queryKey: ['search', query, size],
    queryFn: ({ pageParam = 1 }) => searchApi.search(query, pageParam, size),
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage.page ?? 1) + 1
      return lastPage.results.length === size ? nextPage : undefined
    },
  })
}

export function useTrending(size = 20) {
  return useInfiniteQuery<SearchResponse>({
    queryKey: ['trending', size],
    queryFn: ({ pageParam = 1 }) => searchApi.trending(pageParam, size),
    staleTime: 1000 * 60 * 10, // cache for 10min, its enough since it doesnt change that much or never for our backend 
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage.page ?? 1) + 1
      return lastPage.results.length === size ? nextPage : undefined
    },
  })
}
