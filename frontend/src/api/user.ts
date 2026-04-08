import type { User } from '@/types'
import { apiClient } from './client'

export interface UpdateUserPayload {
  username?: string
  avatarUrl?: string
  bio?: string
}

export interface UpdateEmailPayload {
  email: string
}

export interface UpdatePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface SetPasswordPayload {
  newPassword: string
}

export const userApi = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/user/me')
    return res.data
  },
  updateMe: async (data: UpdateUserPayload): Promise<User> => {
    const res = await apiClient.patch<User>('/user/me', data)
    return res.data
  },
  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/user/me')
  },
  getUserById: async (id: string): Promise<User> => {
    const res = await apiClient.get<User>(`/user/${id}`)
    return res.data
  },
  updateEmail: async (data: UpdateEmailPayload): Promise<{ message: string }> => {
    const res = await apiClient.patch('/user/me/email', data)
    return res.data
  },
  updatePassword: async (data: UpdatePasswordPayload): Promise<{ message: string }> => {
    const res = await apiClient.patch('/user/me/password', data)
    return res.data
  },
  setPassword: async (data: SetPasswordPayload): Promise<{ message: string }> => {
    const res = await apiClient.post('/user/me/password', data)
    return res.data
  },
  exportMe: async (): Promise<unknown> => {
    const res = await apiClient.get('/user/me/export')
    return res.data
  },
}
