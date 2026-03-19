import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { Review } from '@/types'

// export interface Review {
//   id: number
//   rating: number
//   comment: string
//   movieId: number
//   userId: string
//   createdAt: string
//   user: { username: string; avatarUrl?: string }
// }

export function useUserReviews(userId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ['reviews', userId],
    queryFn: async () => {
      const res = await apiClient.get(`/reviews/user/${userId}`)
      return res.data
    },
    enabled: !!userId,
  })
}


export function useReviews(movieId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ['reviews', movieId],
    queryFn: async () => {
      const res = await apiClient.get(`/reviews/${movieId}`)
      return res.data
    },
    enabled: !!movieId,
  })
}

export function usePostReview(movieId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: { rating: number; comment: string }) =>
      apiClient.post(`/reviews/${movieId}`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', movieId] }),
  })
}

export function useDeleteReview(movieId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: number) =>
      apiClient.delete(`/reviews/${reviewId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', movieId] }),
  })
}

export function useEditReview(movieId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: { rating: number; comment: string }) =>
      apiClient.post(`/reviews/${movieId}/edit`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', movieId] }),
  })
}