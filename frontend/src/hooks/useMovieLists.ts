import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useMovieListsMirrorStore } from '@/store/movieListsMirrorStore'

/** Backend returns a bare boolean; normalize for consumers. */
function parseWishlistStatus(data: unknown): { isInWishList: boolean } {
  if (typeof data === 'boolean') return { isInWishList: data }
  if (data && typeof data === 'object' && 'isInWishList' in data) {
    return { isInWishList: Boolean((data as { isInWishList: unknown }).isInWishList) }
  }
  return { isInWishList: false }
}

function parseWatchedStatus(data: unknown): { isInWatchedList: boolean } {
  if (typeof data === 'boolean') return { isInWatchedList: data }
  if (data && typeof data === 'object' && 'isInWatchedList' in data) {
    return { isInWatchedList: Boolean((data as { isInWatchedList: unknown }).isInWatchedList) }
  }
  return { isInWatchedList: false }
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

export function useWishlistStatus(movieId: number | string | undefined) {
  const user = useAuthStore((s) => s.user)
  return useQuery<{ isInWishList: boolean }>({
    queryKey: ['wishlistStatus', movieId, user?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/wish/status/${movieId}`)
      return parseWishlistStatus(res.data)
    },
    enabled: !!movieId && !!user,
  })
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
      queryClient.invalidateQueries({ queryKey: ['wishlistStatus', movieId] })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

export function useWatchedStatus(movieId: number | string | undefined) {
  const user = useAuthStore((s) => s.user)
  return useQuery<{ isInWatchedList: boolean }>({
    queryKey: ['watchedStatus', movieId, user?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/watched/status/${movieId}`)
      return parseWatchedStatus(res.data)
    },
    enabled: !!movieId && !!user,
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
      queryClient.invalidateQueries({ queryKey: ['watchedStatus', movieId] })
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
