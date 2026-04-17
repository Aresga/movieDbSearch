import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useMovieListsMirrorStore } from '@/store/movieListsMirrorStore'

/** TMDB id from a `/wish` or `/watched` list row (`{ movie }` or flat movie fields). */
function extractTmdbIdFromListEntry(item: unknown): number | null {
  if (item == null || typeof item !== 'object' || Array.isArray(item)) return null
  const rec = item as Record<string, unknown>
  const movie = rec.movie
  const source =
    movie != null && typeof movie === 'object' && !Array.isArray(movie)
      ? (movie as Record<string, unknown>)
      : rec
  const id = source.tmdb_id ?? source.tmdbId ?? source.id
  if (typeof id === 'number' && Number.isFinite(id)) return id
  if (typeof id === 'string') {
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function tmdbIdSetFromList(data: unknown[] | undefined): Set<number> {
  const set = new Set<number>()
  if (!data) return set
  for (const item of data) {
    const id = extractTmdbIdFromListEntry(item)
    if (id != null) set.add(id)
  }
  return set
}

/** GET /wish and GET /watched return a JSON array; normalize if ever wrapped. */
function normalizeMovieListResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    for (const key of ['data', 'items', 'results']) {
      const inner = o[key]
      if (Array.isArray(inner)) return inner
    }
  }
  return []
}

/**
 * Wishlist + watched flags for one TMDB id, derived from the cached full lists.
 * Reuses `useWishlist` / `useWatchedList` (one network request each for the whole app, not per card).
 */
export function useMovieListMembership(movieId: number | string | undefined) {
  const { data: wishData } = useWishlist()
  const { data: watchedData } = useWatchedList()
  const wishIds = useMemo(() => tmdbIdSetFromList(wishData as unknown[] | undefined), [wishData])
  const watchedIds = useMemo(() => tmdbIdSetFromList(watchedData as unknown[] | undefined), [watchedData])

  const tid = movieId != null ? Number(movieId) : NaN
  const valid = Number.isFinite(tid)
  return {
    isInWishList: valid && wishIds.has(tid),
    isInWatchedList: valid && watchedIds.has(tid),
  }
}

export function useToggleWishlist(movieId: number | string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (isInWishlist: boolean) => {
      if (isInWishlist) {
        return apiClient.delete(`/wish/${movieId}`)
      } else {
        return apiClient.post(`/wish/${movieId}`)
      }
    },
    onSuccess: (_data, wasInWishlist) => {
      const uid = useAuthStore.getState().user?.id
      const tid = movieId != null ? Number(movieId) : NaN
      if (uid && Number.isFinite(tid)) {
        const m = useMovieListsMirrorStore.getState()
        if (wasInWishlist) m.removeWishlist(uid, tid)
        else m.addWishlist(uid, tid)
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

export function useToggleWatched(movieId: number | string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (isInWatchedList: boolean) => {
      if (isInWatchedList) {
        return apiClient.delete(`/watched/${movieId}`)
      } else {
        return apiClient.post(`/watched/${movieId}`)
      }
    },
    onSuccess: (_data, wasInWatchedList) => {
      const uid = useAuthStore.getState().user?.id
      const tid = movieId != null ? Number(movieId) : NaN
      if (uid && Number.isFinite(tid)) {
        const m = useMovieListsMirrorStore.getState()
        if (wasInWatchedList) m.removeWatched(uid, tid)
        else m.addWatched(uid, tid)
      }
      queryClient.invalidateQueries({ queryKey: ['watchedList'] })
    },
  })
}
export function useWishlist() {
  const user = useAuthStore((s) => s.user)
  return useQuery<unknown[]>({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/wish')
      return normalizeMovieListResponse(res.data)
    },
    enabled: !!user?.id,
    refetchOnMount: 'always',
  })
}

export function useWatchedList() {
  const user = useAuthStore((s) => s.user)
  return useQuery<unknown[]>({
    queryKey: ['watchedList', user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/watched')
      return normalizeMovieListResponse(res.data)
    },
    enabled: !!user?.id,
    refetchOnMount: 'always',
  })
}
