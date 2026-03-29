import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage'
import { TwoFactorVerifyPage } from '@/pages/TwoFactorVerifyPage'
import { TwoFactorSetupPage } from '@/pages/TwoFactorSetupPage'
import { MoviePage } from '@/pages/MoviePage'
import { HomePage } from '@/pages/HomePage'
// import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { UserPage } from '@/pages/UserPage'
import { FriendsPage } from '@/pages/FriendsPage'
import { useAuthStore } from '@/store/authStore'
import { MyProfilePage } from './pages/MyProfilePage'
import { ChatMenuPage } from './pages/ChatMenuPage'

function RootRedirect() {
  return <Navigate to={'/home'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Auth (public) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* OAuth callbacks */}
        {/* <Route path="/auth/google/callback" element={<OAuthCallbackPage />} /> */}
        {/* <Route path="/auth/github/callback" element={<OAuthCallbackPage />} /> */}
        <Route path='/auth/callback' element={<OAuthCallbackPage />} />

        {/* 2FA verify needs tempToken, not full auth */}
        <Route path="/2fa/verify" element={<TwoFactorVerifyPage />} />

        {/* Protected */}
        <Route element={<AppLayout />}>

          <Route path="/home" element={<HomePage />} />
          <Route path="/movie/:id" element={<MoviePage />} />

          <Route element={<ProtectedRoute />}>

            <Route path="/user/me" element={<MyProfilePage />} />
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/2fa/setup" element={<TwoFactorSetupPage />} />
            <Route path="/menu/rooms" element={<ChatMenuPage token={useAuthStore().token} userId={useAuthStore().userId} />} />
          </Route>
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
