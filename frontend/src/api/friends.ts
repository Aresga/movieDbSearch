import type { Friend } from '@/types'
import { apiClient } from './client'


export const friendsApi = {
  getFriends: async (): Promise<Friend[]> => {
    const res = await apiClient.get<Friend[]>('/friends')
    return res.data
  },
  addFriend: async (id: string): Promise<unknown> => {
    const res = await apiClient.post(`/friends/${id}`)
    return res.data
  },
  removeFriend: async (id: string): Promise<unknown> => {
    const res = await apiClient.delete(`/friends/${id}`)
    return res.data
  },

  getFriendsCount: async (id: string): Promise<number> => {
    const res = await apiClient.get(`/friends/${id}`)
    return res.data
  },
}
