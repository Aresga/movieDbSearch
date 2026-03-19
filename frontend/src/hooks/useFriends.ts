import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { friendsApi } from '@/api/friends'
import { getApiErrorMessage } from '@/lib/apiError'

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: friendsApi.getFriends,
    staleTime: 5 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000,
  })
}



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


export function useFriendsCount(userId: string) {
  return useQuery({
    queryKey: ['friends-count', userId],
    queryFn: () => friendsApi.getFriendsCount(userId),
    enabled: !!userId,
  })
}

