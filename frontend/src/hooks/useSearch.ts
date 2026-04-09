import { useInfiniteQuery } from '@tanstack/react-query'
import type { SearchResponse } from '@/types'
import { searchApi } from '@/api/search'

export function useSearch(query: string, size = 10) {
  return useInfiniteQuery({
    queryKey: ['search', query, size],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      searchApi.search(query, pageParam, size),
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
  return useInfiniteQuery({
    queryKey: ['trending', size],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      searchApi.trending(pageParam, size),
    initialPageParam: 1,
    staleTime: 1000 * 60 * 10,
    getNextPageParam: (lastPage: SearchResponse) => {
      const nextPage = (lastPage.page ?? 1) + 1
      return lastPage.results.length === size ? nextPage : undefined
    },
  })
}
