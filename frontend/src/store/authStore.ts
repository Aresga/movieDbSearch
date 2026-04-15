import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

// zustang store for auth state (user info + token management)
// 

interface AuthState {
  token: string | null
  tempToken: string | null // used in 2fa only 
  user: User | null
  hasUnreadMessages?: boolean
  setUnreadMessages?: (hasUnread: boolean) => void
  setAuth: (user: User) => void
  setTempToken: (tempToken: string) => void
  updateUser: (user: Partial<User>) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      tempToken: null,
      user: null,
      hasUnreadMessages: false,
      setAuth: (user) => set({ user, tempToken: null }),
      setTempToken: (tempToken) => set({ tempToken }),
      setUnreadMessages: (hasUnread) => set({ hasUnreadMessages: hasUnread }),
      updateUser: (partial) => {
        const current = get().user
        if (current) set({ user: { ...current, ...partial } })
      },
      clearAuth: () => set({ user: null, tempToken: null }),
    }),
    { name: 'moviedb-auth' },
  ),
)
