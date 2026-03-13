import { useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/apiError'

export function useLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.requiresTwoFactor) {
        navigate('/2fa/verify')
      } else {
        setAuth(data.user)
        navigate('/home')
        toast.success('Welcome back !')
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user)
      navigate('/login')
      toast.success('Account created successfuly! Welcome to moviesearchDb')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()

  const logout = useCallback(async () => {
    try {
      await authApi.logout() // backend please clear cookies  / server side 
    } catch {
      // we clear locally regardless 
    }
    clearAuth()
    navigate('/login')
    toast.success('Logged out successfully')
  }, [clearAuth, navigate])

  return { logout }
}