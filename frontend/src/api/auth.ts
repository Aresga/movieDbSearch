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
 * Handles user lifecycle, session management, and OAuth routing.
 */
export const authApi = {
    /**
   * Create a new account and receive user data + tokens
   */
    register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data)
    return res.data
  },

  /**
   * Authenticate existing user and start a session
   */
    login: async (data: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  /**
   * Extends the user's session by rotating the refresh token/cookie
   */
    refresh: async (): Promise<void> => {
    await apiClient.post('/auth/refresh')
  },

  /**
   * Invalidates the current session and clears authentication cookies/tokens
   */
    logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
  /**
   * Returns the absolute URL for Google OAuth initiation.
   * Use this to redirect the window (window.location.href).
   */
    getGoogleUrl: () => `${BASE_URL}/auth/google`,

    /**
   * Returns the absolute URL for GitHub OAuth initiation.
   * Use this to redirect the window (window.location.href).
   */
    getGithubUrl: () => `${BASE_URL}/auth/github`,
}
