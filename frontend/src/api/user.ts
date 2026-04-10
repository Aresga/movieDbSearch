import type { User } from '@/types'
import { apiClient } from './client'

/**
 * Payload for updating general user profile information.
 */
export interface UpdateUserPayload {
  username?: string
  avatarUrl?: string
  bio?: string
}

/**
 * Payload for updating the user's email address.
 */
export interface UpdateEmailPayload {
  email: string
}

/**
 * Payload for changing a user's password (requires old password).
 */
export interface UpdatePasswordPayload {
  currentPassword: string
  newPassword: string
}

/**
 * Payload for setting an initial password (e.g., for OAuth accounts).
 */
export interface SetPasswordPayload {
  newPassword: string
}

/**
 * User API Service
 * Handles fetching and updating user profiles, account settings, and data exports.
 */
export const userApi = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/user/me')
    return res.data
  },

  updateMe: async (data: UpdateUserPayload): Promise<User> => {
    const res = await apiClient.patch<User>('/user/me', data)
    return res.data
  },

  uploadAvatar: async (file: File): Promise<{ publicUrl: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post<{ publicUrl: string }>('/user/me/avatar', formData)
    return res.data
  },

  /**
   * Deletes the currently authenticated user's account entirely.
   */
  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/user/me')
  },

  getUserById: async (id: string): Promise<User> => {
    const res = await apiClient.get<User>(`/user/${id}`)
    return res.data
  },

  updateEmail: async (data: UpdateEmailPayload): Promise<{ message: string }> => {
    const res = await apiClient.patch<{ message: string }>('/user/me/email', data)
    return res.data
  },

  updatePassword: async (data: UpdatePasswordPayload): Promise<{ message: string }> => {
    const res = await apiClient.patch<{ message: string }>('/user/me/password', data)
    return res.data
  },

  setPassword: async (data: SetPasswordPayload): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/user/me/password', data)
    return res.data
  },

  exportMe: async (): Promise<unknown> => {
    const res = await apiClient.get('/user/me/export')
    return res.data
  },
}
