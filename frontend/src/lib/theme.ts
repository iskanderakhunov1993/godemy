'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light'
export type AccentColor = 'cyan' | 'blue' | 'violet' | 'green' | 'orange'

export const ACCENT_OPTIONS: { value: AccentColor; label: string; bg: string; border: string }[] = [
  { value: 'cyan',   label: 'Голубой',  bg: 'bg-cyan-400',   border: 'border-cyan-400' },
  { value: 'blue',   label: 'Синий',    bg: 'bg-blue-500',   border: 'border-blue-500' },
  { value: 'violet', label: 'Фиолет.',  bg: 'bg-violet-500', border: 'border-violet-500' },
  { value: 'green',  label: 'Зелёный',  bg: 'bg-emerald-500',border: 'border-emerald-500' },
  { value: 'orange', label: 'Оранж.',   bg: 'bg-orange-400', border: 'border-orange-400' },
]

interface ThemeStore {
  mode: ThemeMode
  accent: AccentColor
  toggleMode: () => void
  setAccent: (accent: AccentColor) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'dark',
      accent: 'cyan',
      toggleMode: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
      setAccent: (accent) => set({ accent }),
    }),
    { name: 'golanger-theme' }
  )
)
