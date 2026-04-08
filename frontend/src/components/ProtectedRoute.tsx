import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * ProtectedRoute Component
 * Acts as an authentication guard for private application routes.
 * If no user session is detected in Zustand, it forces a redirect to the login page.
 */
export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
