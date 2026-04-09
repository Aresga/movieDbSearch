import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { twofaApi } from '@/api/twofa'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/apiError'

/**
 * Hook to retrieve the 2FA setup configuration (secret and QR code).
 */
export function useTwoFaSetup() {
  return useQuery({
    queryKey: ['2fa', 'setup'],
    queryFn: twofaApi.setup,
    staleTime: Infinity,
    retry: false,
  })
}

/**
 * Hook to activate 2FA for the user after they scan the QR code.
 */
export function useActivateTwoFa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => twofaApi.activate(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('2FA enabled successfully! Your account is now more secure.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/**
 * Hook to verify the 2FA code during the login authentication flow.
 */
export function useVerifyTwoFa() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (code: string) => twofaApi.verify(code),
    onSuccess: (data) => {
      setAuth(data.user)
      navigate('/home')
      toast.success('Welcome back!')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/**
 * Hook to disable and remove 2FA from the authenticated user's account.
 */
export function useDisable2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => twofaApi.disable(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('2FA disabled')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
