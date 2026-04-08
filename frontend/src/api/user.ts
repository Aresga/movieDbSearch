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
  /**
   * Retrieves the currently authenticated user's profile.
   * @returns A promise resolving to the User object.
   */
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/user/me')
    return res.data
  },

  /**
   * Updates the authenticated user's public profile data.
   * @param data - The profile fields to update (username, avatarUrl, bio).
   * @returns A promise resolving to the updated User object.
   */
  updateMe: async (data: UpdateUserPayload): Promise<User> => {
    const res = await apiClient.patch<User>('/user/me', data)
    return res.data
  },

  /**
   * Deletes the currently authenticated user's account entirely.
   */
  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/user/me')
  },

  /**
   * Retrieves the public profile of a specific user by their ID.
   * @param id - The unique identifier of the user to fetch.
   * @returns A promise resolving to the fetched User object.
   */
  getUserById: async (id: string): Promise<User> => {
    const res = await apiClient.get<User>(`/user/${id}`)
    return res.data
  },

  /**
   * Updates the authenticated user's email address.
   * @param data - The new email address payload.
   * @returns A promise confirming successful update.
   */
  updateEmail: async (data: UpdateEmailPayload): Promise<{ message: string }> => {
    const res = await apiClient.patch<{ message: string }>('/user/me/email', data)
    return res.data
  },

  /**
   * Changes the authenticated user's password.
   * @param data - Payload containing both the current and new passwords.
   * @returns A promise confirming successful update.
   */
  updatePassword: async (data: UpdatePasswordPayload): Promise<{ message: string }> => {
    const res = await apiClient.patch<{ message: string }>('/user/me/password', data)
    return res.data
  },

  /**
   * Sets a password for a user who signed up via OAuth and now wants a manual login option.
   * @param data - The payload containing the new password.
   * @returns A promise confirming successful setup.
   */
  setPassword: async (data: SetPasswordPayload): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/user/me/password', data)
    return res.data
  },

  /**
   * Requests a GDPR-compliant export of all user data associated with the authenticated account.
   * @returns A promise resolving to the raw exported data payload.
   */
  exportMe: async (): Promise<unknown> => {
    const res = await apiClient.get('/user/me/export')
    return res.data
  },
}
