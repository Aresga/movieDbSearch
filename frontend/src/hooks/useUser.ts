import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { userApi } from '@/api/user'
import type { SetPasswordPayload, UpdateEmailPayload, UpdatePasswordPayload } from '@/api/user'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/apiError'

/**
 * Hook to fetch the currently authenticated user's profile.
 */
export function useMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: userApi.getMe,
  })
}

/**
 * Hook to partially update the authenticated user's profile info.
 */
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
      queryClient.setQueryData(['user', 'me'], data)
      updateUser(data)
      toast.success('Profile updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/**
 * Hook for a user to permanently delete their own account.
 */
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

/**
 * Hook to fetch any public user profile by their ID.
 * @param id - The unique ID of the user.
 */
export function useUserById(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  })
}

/**
 * Hook to update the user's email address.
 */
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

/**
 * Hook to change the user's password.
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordPayload) => userApi.updatePassword(data),
    onSuccess: () => {
      toast.success('Password updated successfully')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/**
 * Hook to set an initial password, commonly used for OAuth-registered users.
 */
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