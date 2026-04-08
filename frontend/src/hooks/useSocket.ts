import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { getSocket, disconnectSocket } from '@/lib/socket'
import type { Friend } from '@/types'
import { useNotificationStore } from './useNotificationStore'

export interface FriendStatusEvent {
  userId: string
  username: string
  isOnline: boolean
}

/**
 * Custom hook to initialize and manage the global WebSocket connection.
 * Connects automatically if a user is logged in, and sets up listeners for:
 * - Realtime friend online/offline status updates
 * - Incoming friend requests (Kinda)
 */
export function useSocket() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.add)

  useEffect(() => {
    if (!user) return  // guests don't connect

    const socket = getSocket()
    socket.connect()

    socket.on('connect', () => {
      console.log('[socket] connected', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected', reason)
    })

    socket.on('connect_error', (err) => {
      console.error('[socket] connection error', err.message)
    })

    socket.on('friendStatus', ({ userId, username, isOnline }: FriendStatusEvent) => {
      queryClient.cancelQueries({ queryKey: ['friends'] })
      queryClient.setQueryData<Friend[]>(['friends'], (old) => {
        if (!old) return old
        return old.map((f) =>
          f.id === userId ? { ...f, isOnline } : f
        )
      })


      // Toast 
      if (isOnline) {
        addNotification({ message: `${username} is now online`, type: 'friend_online' })
        toast.info(`${username} is now online`, { duration: 3000 })
      }
    })

    socket.on('friendRequest', (data) => {
      addNotification({ message: `${data.from} added you as a friend!`, type: 'friend_request' })
      toast.info(`${data.from} added you as a friend!`)
    })

    socket.on('receiveMessageNotification', (data) => {
      const senderId = data.senderId
      if (!senderId || senderId === user.id) return

      const isInChatPage = location.pathname.startsWith('/rooms/')
      if (isInChatPage) return

      const senderLabel = data.senderUsername ?? senderId
      addNotification({
        message: `New message from ${senderLabel}`,
        type: 'chat_message',
      })
      toast.info(`New message from ${senderLabel}`)
    })


    return () => {
      // Cleanup listeners but keep socket alive while user is logged
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('friendStatus')
      socket.off('friendRequest')
      socket.off('receiveMessageNotification')

    }
  }, [user, queryClient, addNotification, location.pathname])

  // Disconnect on logout 
  useEffect(() => {
    if (!user) {
      disconnectSocket()
    }
  }, [user])
}
