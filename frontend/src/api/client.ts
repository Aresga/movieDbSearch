import axios, { AxiosHeaders } from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = '/api'

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


// flag for preventing infinit refresh 
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

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


apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh')
    const isLogoutEndpoint = originalRequest?.url?.includes('/auth/logout')

    // so here it 401 and not already retrying and not on refresh or logout 
    if (
      error.response?.status === 401 &&
      !originalRequest._retry && 
      !isRefreshEndpoint && 
      !isLogoutEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject } )
        })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // refresh token cookie sent to backend auto via withcreds
        // backend respond with a new access_token cookie 
        await apiClient.post('/auth/refresh')
        processQueue(null)
        return apiClient(originalRequest) // retry 

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






// apiClient.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().token
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const isLogout = (error.config?.url as string | undefined)?.includes('/auth/logout')
//     if (error.response?.status === 401 && !isLogout) {
//       useAuthStore.getState().clearAuth()
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   },
// )
