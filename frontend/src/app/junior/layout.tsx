'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthHydrated, useAuthStore } from '@/lib/store'

export default function JuniorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthHydrated()

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      router.replace('/auth/login?next=/junior')
      return
    }
  }, [hasHydrated, router, user])

  if (!hasHydrated || !user) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center px-4 text-center">
        <div>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-violet-400" />
          <p className="mt-4 text-sm text-gray-500">Проверяем вход для сохранения прогресса…</p>
        </div>
      </div>
    )
  }

  return children
}
