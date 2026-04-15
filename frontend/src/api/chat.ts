import type { User } from '@/types'
import { apiClient } from './client'

export type ChatMessage = {
  _id: string
  roomId: string
  senderId: string
  content: string
  createdAt: string
  read: boolean
}

export type ChatRoom = {
  _id: string
  participants: User[]
  lastMessage?: ChatMessage | null
  updatedAt?: string
}

export type ChatRoomInfo = {
  participants: User[]
}

/**
 * Chat API Service
 * Handles chat room creation, room listing, and message retrieval.
 */
export const chatApi = {
  /**
   * Retrieves the current user's chat rooms (menu list).
   */
  getMenuRooms: async (): Promise<ChatRoom[]> => {
    const res = await apiClient.get<ChatRoom[]>('/message/menu/rooms')
    return res.data
  },

  /**
   * Fetches metadata about a specific room, including participants.
   */
  getRoomInfo: async (roomId: string): Promise<ChatRoomInfo> => {
    const res = await apiClient.get<ChatRoomInfo>(`/message/rooms/${roomId}/info`)
    return res.data
  },

  /**
   * Retrieves the most recent messages for a room.
   */
  getRoomMessages: async (roomId: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get<ChatMessage[]>(`/message/rooms/${roomId}/messages`)
    return res.data
  },

  /**
   * Creates (or returns) a chat room with a friend.
   */
  createRoom: async (friendId: string): Promise<ChatRoom> => {
    const res = await apiClient.post<ChatRoom>(`/message/rooms/create/${friendId}`)
    return res.data
  },

  /**
   * Marks all messages in a room as read for the current user.
   */
  markRoomAsRead: async (roomId: string): Promise<unknown> => {
    const res = await apiClient.post(`/message/rooms/${roomId}/messages`)
    return res.data
  },
}
