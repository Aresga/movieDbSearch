import type { Friend } from '@/types'
import { apiClient } from './client'

/**
 * Friends API Service
 * Handles social connections, including fetching, adding, and removing friends.
 */
export const friendsApi = {
    /**
   * Retrieves the full list of friends for the currently authenticated user.
   * @returns A promise resolving to an array of Friend objects.
   */
    getFriends: async (): Promise<Friend[]> => {
        const res = await apiClient.get<Friend[]>('/friends')
        return res.data
    },

    /**
   * Sends a friend request or adds a user to the friend list.
   * @param id - The unique ID of the user to add.
   */
    addFriend: async (id: string): Promise<unknown> => {
        const res = await apiClient.post(`/friends/${id}`)
        return res.data
    },

    /**
   * Removes a user from the friend list.
   * @param id - The unique ID of the friend to remove.
   */
    removeFriend: async (id: string): Promise<unknown> => {
        const res = await apiClient.delete(`/friends/${id}`)
        return res.data
    },

    /**
   * Retrieves the friend count for a specific user.
   */
    getFriendsCount: async (id: string): Promise<number> => {
        const res = await apiClient.get<number>(`/friends/${id}/count`)
        return res.data
    },
}
