import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Layouts & Guards
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

/**
 * LAZY LOADED PAGES
 * Split into chunks to reduce the initial bundle size.
 */
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const OAuthCallbackPage = lazy(() => import('@/pages/OAuthCallbackPage').then(m => ({ default: m.OAuthCallbackPage })))
const TwoFactorVerifyPage = lazy(() => import('@/pages/TwoFactorVerifyPage').then(m => ({ default: m.TwoFactorVerifyPage })))
const TwoFactorSetupPage = lazy(() => import('@/pages/TwoFactorSetupPage').then(m => ({ default: m.TwoFactorSetupPage })))
const MoviePage = lazy(() => import('@/pages/MoviePage').then(m => ({ default: m.MoviePage })))
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const UserPage = lazy(() => import('@/pages/UserPage').then(m => ({ default: m.UserPage })))
const FriendsPage = lazy(() => import('@/pages/FriendsPage').then(m => ({ default: m.FriendsPage })))
const WishlistPage = lazy(() => import('@/pages/WishlistPage').then(m => ({ default: m.WishlistPage })))
const WatchedListPage = lazy(() => import('@/pages/WatchedListPage').then(m => ({ default: m.WatchedListPage })))
const MyProfilePage = lazy(() => import('@/pages/MyProfilePage').then(m => ({ default: m.MyProfilePage })))
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })))
const CookiePolicyPage = lazy(() => import('@/pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })))
const ChatMenuPage = lazy(() => import('@/pages/ChatMenuPage').then(m => ({ default: m.ChatMenuPage })))
const ChatPage = lazy(() => import('@/pages/ChatPage').then(m => ({ default: m.ChatPage })))

/**
 * UTILITY COMPONENTS
 */

function RootRedirect() {
  return <Navigate to={'/home'} replace />
}

function PageFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background" role="status" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" aria-hidden="true"></div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<OAuthCallbackPage />} />
              <Route path="/2fa/verify" element={<TwoFactorVerifyPage />} />
            </Route>

            <Route element={<AppLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/movie/:id" element={<MoviePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/user/me" element={<MyProfilePage />} />
                <Route path="/user/:id" element={<UserPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/2fa/setup" element={<TwoFactorSetupPage />} />
                <Route path="/menu/rooms" element={<ChatMenuPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/watched" element={<WatchedListPage />} />
                <Route path="/rooms/:roomId" element={<ChatPage />} />
              </Route>
            </Route>

            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
