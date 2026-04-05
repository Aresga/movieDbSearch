import type { AuthResponse } from '@/types'
import { apiClient } from './client'

const BASE_URL = '/api'

export interface RegisterSuccessResponse {
  message: string
  id: string
  username: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: async (data: RegisterPayload): Promise<RegisterSuccessResponse> => {
    const res = await apiClient.post<RegisterSuccessResponse>('/auth/register', data)
    return res.data
  },
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data)
    return res.data
  },
  refresh: async (): Promise<void> => {
    await apiClient.post('/auth/refresh')
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
  getGoogleUrl: () => `${BASE_URL}/auth/google`,
  getGithubUrl: () => `${BASE_URL}/auth/github`,
}
