import { useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import type { ChatMessage } from '@/api/chat'
import { useChatRooms } from './useChat'
import { useNotificationStore } from './useNotificationStore'

/**
 * Global room realtime listener.
 * Joins all known rooms for the current user and listens for incoming messages.
 */
export function useRoomRealtimeListener() {
  const user = useAuthStore((s) => s.user)
  const addNotification = useNotificationStore((s) => s.add)
  const { data: rooms = [] } = useChatRooms()
  const joinedRoomsRef = useRef<Set<string>>(new Set())

  const roomIds = useMemo(() => {
    return rooms
      .map((room) => room._id)
      .filter(Boolean)
      .sort()
  }, [rooms])

  useEffect(() => {
    if (!user) return

    const socket = getSocket()

    const syncRoomSubscriptions = () => {
      const desiredRooms = new Set(roomIds)

      for (const roomId of joinedRoomsRef.current) {
        if (!desiredRooms.has(roomId)) {
          socket.emit('leaveRoom', roomId)
          joinedRoomsRef.current.delete(roomId)
        }
      }

      for (const roomId of roomIds) {
        if (!joinedRoomsRef.current.has(roomId)) {
          socket.emit('joinRoom', roomId)
          joinedRoomsRef.current.add(roomId)
        }
      }
    }

    const handleReceiveMessage = (message: ChatMessage) => {
      if (!message?.roomId) return
      if (!joinedRoomsRef.current.has(message.roomId)) return
      if (message.senderId === user.id) return

      addNotification({
        message: `New message: ${message.content}`,
        type: 'chat_message',
      })
      toast.info(`New message: ${message.content}`)
    }

    socket.on('connect', syncRoomSubscriptions)
    socket.on('receiveMessage', handleReceiveMessage)

    if (socket.connected) {
      syncRoomSubscriptions()
    }

    return () => {
      socket.off('connect', syncRoomSubscriptions)
      socket.off('receiveMessage', handleReceiveMessage)
    }
  }, [addNotification, roomIds, user])
}
