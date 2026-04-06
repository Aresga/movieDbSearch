import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { userApi } from '@/api/user'
import type { SetPasswordPayload, UpdateEmailPayload, UpdatePasswordPayload } from '@/api/user'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'
import { getApiErrorMessage } from '@/lib/apiError'

export function useMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: userApi.getMe,
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: Partial<{
      username: string;
      avatarUrl: string;
      bio: string;
    }>) => userApi.updateMe(data),
    onSuccess: (data) => {
      queryClient.setQueryData<User | undefined>(['user', 'me'], (prev) =>
        prev ? { ...prev, ...data } : undefined,
      )
      updateUser(data)
      toast.success('Profile updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteMe() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()

  return useMutation({
    mutationFn: userApi.deleteMe,
    onSuccess: () => {
      clearAuth()
      navigate('/login')
      toast.success('Account deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useUserById(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  })
}

export function useUpdateEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateEmailPayload) => userApi.updateEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Email updated successfully')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordPayload) => userApi.updatePassword(data),
    onSuccess: () => {
      toast.success('Password updated successfully')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useSetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SetPasswordPayload) => userApi.setPassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Password set successfully')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}