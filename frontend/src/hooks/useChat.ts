import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { chatApi } from '@/api/chat'
import { getApiErrorMessage } from '@/lib/apiError'

/**
 * Hook to retrieve the authenticated user's chat rooms.
 */
export function useChatRooms() {
  return useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: chatApi.getMenuRooms,
  })
}

/**
 * Hook to fetch room metadata (participants, etc.).
 */
export function useChatRoomInfo(roomId: string) {
  return useQuery({
    queryKey: ['chat', 'room', roomId, 'info'],
    queryFn: () => chatApi.getRoomInfo(roomId),
    enabled: !!roomId,
  })
}

/**
 * Hook to fetch messages for a room.
 */
export function useChatRoomMessages(roomId: string) {
  return useQuery({
    queryKey: ['chat', 'room', roomId, 'messages'],
    queryFn: () => chatApi.getRoomMessages(roomId),
    enabled: !!roomId,
  })
}

/**
 * Hook to create (or load) a room with a friend.
 */
export function useCreateChatRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (friendId: string) => chatApi.createRoom(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      toast.success('Chat ready')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/**
 * Hook to mark a room as read for the current user.
 */
export function useMarkRoomAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => chatApi.markRoomAsRead(roomId),
    onSuccess: (_data, roomId) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'room', roomId, 'messages'] })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
