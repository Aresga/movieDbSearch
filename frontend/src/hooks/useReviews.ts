import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { Review } from '@/types'

/**
 * Fetches all reviews written by a specific user.
 * @param userId - The unique identifier of the user.
 */
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

/**
 * Fetches all reviews associated with a specific movie.
 * @param movieId - The ID of the movie.
 */
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

/**
 * Submits a new review for a given movie.
 * @param movieId - The ID of the movie to review.
 */
export function usePostReview(movieId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: { rating: number; comment: string }) =>
      apiClient.post(`/reviews/${movieId}`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', movieId] }),
  })
}

/**
 * Deletes an existing review.
 * @param movieId - The ID of the movie the review belongs to, used to invalidate cache.
 */
export function useDeleteReview(movieId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: number) =>
      apiClient.delete(`/reviews/${reviewId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', movieId] }),
  })
}

/**
 * Edits an existing review for a given movie.
 * @param movieId - The ID of the movie the review belongs to.
 */
export function useEditReview(movieId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: { rating: number; comment: string }) =>
      apiClient.post(`/reviews/${movieId}/edit`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', movieId] }),
  })
}