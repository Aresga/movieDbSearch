import axios, { AxiosHeaders } from 'axios'
import { useAuthStore } from '@/store/authStore'

/**
 * Base path for API requests; utilized for manual URL construction
 */
const BASE_URL = '/api'

/**
 * Main Axios instance configured with defaults.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Default JSON for object bodies; omit Content-Type for FormData so the boundary is set correctly.
apiClient.interceptors.request.use((config) => {
  const { data } = config
  const headers = AxiosHeaders.from(config.headers)
  if (data instanceof FormData) {
    headers.delete('Content-Type')
  } else if (
    data != null &&
    typeof data === 'object' &&
    !(data instanceof Blob) &&
    !(data instanceof ArrayBuffer)
  ) {
    if (headers.get('Content-Type') == null) {
      headers.set('Content-Type', 'application/json')
    }
  }
  config.headers = headers
  return config
})

/**
 * TOKEN REFRESH STATE
 * Used to handle race conditions where multiple API calls fail at once
 * because the token expired.
 */
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

/**
 * Processes the queue of failed requests.
 * If refresh succeeded, it resolves them; otherwise, it rejects them.
 */
function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

/**
 * RESPONSE INTERCEPTOR
 * Intercepts every response. If it sees a 401 (Unauthorized),
 * it attempts to refresh the session.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh')
    const isLogoutEndpoint = originalRequest?.url?.includes('/auth/logout')

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isRefreshEndpoint &&
      !isLogoutEndpoint
    ) {
      if (!originalRequest) {
        return Promise.reject(error)
      }
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
        await apiClient.post('/auth/refresh')
        processQueue(null)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
