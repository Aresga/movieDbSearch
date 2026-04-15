import { useInfiniteQuery } from '@tanstack/react-query'
import type { SearchResponse } from '@/types'
import { searchApi } from '@/api/search'

export function useSearch(query: string, size = 10) {
  return useInfiniteQuery<SearchResponse>({
    queryKey: ['search', query, size],
    queryFn: ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1
      return searchApi.search(query, page, size)
    },
    enabled: !!query,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    getNextPageParam: (lastPage: SearchResponse) => {
      const nextPage = (lastPage.page ?? 1) + 1
      return lastPage.results.length === size ? nextPage : undefined
    },
  })
}

export function useTrending(size = 20) {
  return useInfiniteQuery<SearchResponse>({
    queryKey: ['trending', size],
    queryFn: ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1
      return searchApi.trending(page, size)
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 10,
    getNextPageParam: (lastPage: SearchResponse) => {
      const nextPage = (lastPage.page ?? 1) + 1
      return lastPage.results.length === size ? nextPage : undefined
    },
  })
}

export function useRecommendations(size = 20, enabled = true) {
  return useInfiniteQuery<SearchResponse>({
    queryKey: ['recommendations', size],
    queryFn: () => searchApi.recommendations(size),
    enabled,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    getNextPageParam: () => undefined,
  })
}
