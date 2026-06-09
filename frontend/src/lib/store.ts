'use client'

import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, User, Progress } from './api'

interface AuthStore {
  user: User | null
  token: string | null
  progress: Progress[]
  setAuth: (token: string, user: User) => void
  logout: () => void
  loadProgress: () => Promise<void>
  isCompleted: (entityType: string, entityId: number) => boolean
  getProgressEntry: (entityType: string, entityId: number) => Progress | undefined
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      progress: [],

      setAuth: (token, user) => {
        localStorage.setItem('token', token)
        set({ token, user })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null, progress: [] })
      },

      loadProgress: async () => {
        const { token } = get()
        if (!token) return
        try {
          const progress = await api.getProgress()
          set({ progress })
        } catch {
          // ignore
        }
      },

      isCompleted: (entityType, entityId) => {
        return get().progress.some(
          (p) =>
            p.entityType === entityType &&
            p.entityId === entityId &&
            p.status === 'completed'
        )
      },

      getProgressEntry: (entityType, entityId) => {
        return get().progress.find(
          (p) => p.entityType === entityType && p.entityId === entityId
        )
      },
    }),
    {
      name: 'golanger-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)

export function useAuthHydrated() {
  return useSyncExternalStore(
    (callback) => {
      const unsubscribeHydrate = useAuthStore.persist.onHydrate(callback)
      const unsubscribeFinish = useAuthStore.persist.onFinishHydration(callback)
      return () => {
        unsubscribeHydrate()
        unsubscribeFinish()
      }
    },
    () => useAuthStore.persist.hasHydrated(),
    () => false
  )
}
