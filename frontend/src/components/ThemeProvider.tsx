'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore()

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('light', mode === 'light')
  }, [mode])

  return <>{children}</>
}
