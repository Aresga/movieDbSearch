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
const MyProfilePage = lazy(() => import('@/pages/MyProfilePage').then(m => ({ default: m.MyProfilePage })))
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })))
const CookiePolicyPage = lazy(() => import('@/pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })))

/**
 * UTILITY COMPONENTS
*/

// Simple redirect to home
function RootRedirect() {
  return <Navigate to={'/home'} replace />
}

// Fallback shown while the specific page code is downloading
function PageFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      {/* ErrorBoundary catches chunk loading failures from React.lazy */}
      <ErrorBoundary>
        {/* Suspense handles the "waiting" state while lazy components load */}
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Index Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* AUTHENTICATION FLOW (Public/Guest Only) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* AUTH CALLBACKS & 2FA VERIFICATION 
                Note: 2FA verify usually requires a temporary session token, not a full login 
            */}
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            <Route path="/2fa/verify" element={<TwoFactorVerifyPage />} />

            {/* MAIN APPLICATION AREA (Shared Navigation/Footer) */}
            <Route element={<AppLayout />}>
              {/* PUBLIC CONTENT: Accessible to everyone */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/movie/:id" element={<MoviePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />

              {/* PRIVATE CONTENT: Require authentication via ProtectedRoute wrapper */}
              <Route element={<ProtectedRoute />}>
                <Route path="/user/me" element={<MyProfilePage />} />
                <Route path="/user/:id" element={<UserPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/2fa/setup" element={<TwoFactorSetupPage />} />
              </Route>

            </Route>
            {/* 404 / CATCH-ALL */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
