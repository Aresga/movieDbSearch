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
  withCredentials: true, // sends cookies, ON every request
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


let isRefreshing = false // Prevents multiple calls to /auth/refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = [] // Holds pending requests until the token is refreshed

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
    // Helper flags to avoid infinite loops
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh')
    const isLogoutEndpoint = originalRequest?.url?.includes('/auth/logout')
    const isLoginEndpoint = originalRequest?.url?.includes('/auth/login')

    /**
     * Logic for handling 401 Unauthorized errors
     */
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&   // Don't retry more than once per request
      !isLoginEndpoint &&           // Let login failures surface to the form handler
      !isRefreshEndpoint &&         // Don't try to refresh if the refresh call itself failed
      !isLogoutEndpoint             // Don't try to refresh if the user is logging out
    ) {
      // Mark this request immediately so we don't loop indefinitely on retries
      if (!originalRequest) {
        return Promise.reject(error)
      }
      originalRequest._retry = true

      // If a refresh is already in progress, add this request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => apiClient(originalRequest)) // Retry after success
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
        /**
         * ATTEMPT SILENT REFRESH
         * Note: Backend should be using HttpOnly cookies for this to be secure.
         */
        await apiClient.post('/auth/refresh')
        // Refresh succeeded! Process all other requests waiting in the queue.
        processQueue(null)
        // Retry the original request that failed initially
        return apiClient(originalRequest) // retry 

      } catch (refreshError) {
        // Refresh failed (e.g., refresh token also expired)
        processQueue(refreshError)
        // Wipe local auth state and force a login
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    // If it's a different error (404, 500, etc.), just pass it through
    return Promise.reject(error)
  }
)