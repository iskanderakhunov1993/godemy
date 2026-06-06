'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore()

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('light', mode === 'light')
    ;(['accent-cyan', 'accent-blue', 'accent-violet', 'accent-green', 'accent-orange'] as const).forEach(
      (c) => html.classList.remove(c)
    )
    html.classList.add('accent-violet')
  }, [mode])

  return <>{children}</>
}
