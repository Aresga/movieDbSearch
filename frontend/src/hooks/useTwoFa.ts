import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { twofaApi } from '@/api/twofa'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/apiError'

export function useTwoFaSetup() {
  return useQuery({
    queryKey: ['2fa', 'setup'],
    queryFn: twofaApi.setup,
    staleTime: Infinity,
    retry: false,
  })
}

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

