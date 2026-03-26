import { create } from 'zustand'

export interface AppNotification {
  id: string
  message: string
  type: 'friend_request' | 'friend_online'
  read: boolean
  createdAt: Date
}

interface NotificationStore {
  notifications: AppNotification[]
  add: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void
  markAllRead: () => void
  clear: () => void
}

const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)


export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  add: (n) => set((s) => ({
    notifications: [
      { ...n, id: uuid(), read: false, createdAt: new Date() },
      ...s.notifications,
    ]
  })),
  markAllRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true }))
  })),
  clear: () => set({ notifications: [] }),
}))
