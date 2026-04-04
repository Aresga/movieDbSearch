import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { friendsApi } from '@/api/friends'
import { getApiErrorMessage } from '@/lib/apiError'

/**
 * Hook to retrieve the authenticated user's complete friends list.
 * Caches data and refetches every 5 seconds.
 */
export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: friendsApi.getFriends,
    staleTime: 5 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000,
  })
}

/**
 * Hook to send a friend request or add a user as a friend.
 */
export function useAddFriend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => friendsApi.addFriend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      toast.success('Friend request sent!')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/**
 * Hook to remove a user from the friends list.
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => friendsApi.removeFriend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      toast.success('Friend removed')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/**
 * Hook to fetch the total friend count for a specific user.
 * @param userId - The ID of the user whose friend count should be fetched.
 */
export function useFriendsCount(userId: string) {
  return useQuery({
    queryKey: ['friends-count', userId],
    queryFn: () => friendsApi.getFriendsCount(userId),
    enabled: !!userId,
  })
}
