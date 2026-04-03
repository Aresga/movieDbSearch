import type { AuthResponse } from '@/types'
import { apiClient } from './client'

/** 
 * Base path for API requests; utilized for manual URL construction 
 * like OAuth redirects.
 */
const BASE_URL = '/api'

/**
 * Payload required for creating a new user account
 */
export interface RegisterPayload {
  username: string
  email: string
  password: string
}

/**
 * Payload required for standard email/password authentication
 */
export interface LoginPayload {
  email: string
  password: string
}

/**
 * Authentication API Service
 * Handles user registration, login, token refreshing, and OAuth flows.
 */
export const authApi = {
  /**
   * Registers a new user.
   * @param data - The registration payload (username, email, password).
   * @returns A promise resolving to the AuthResponse.
   */
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data)
    return res.data
  },

  /**
   * Logs an existing user in.
   * @param data - The login payload (email, password).
   * @returns A promise resolving to the AuthResponse.
   */
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  /**
   * Refreshes the HTTP-only access token cookie using the refresh token cookie.
   */
  refresh: async (): Promise<void> => {
    await apiClient.post('/auth/refresh')
  },

  /**
   * Logs the current user out, clearing backend cookies.
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
  /**
   * Retrieves the URL for Google OAuth backend redirection.
   * Use this to redirect the window (window.location.href).
   */
  getGoogleUrl: () => `${BASE_URL}/auth/google`,

  /**
   * Retrieves the URL for GitHub OAuth backend redirection.
   * Use this to redirect the window (window.location.href).
   */
  getGithubUrl: () => `${BASE_URL}/auth/github`,
}
