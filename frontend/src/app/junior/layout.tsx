'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function JuniorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!user) {
      router.replace('/auth/login?next=/junior')
      return
    }
    if (!user.isPremium && !user.isAdmin) {
      router.replace('/bootcamp/buy')
    }
  }, [ready, router, user])

  if (!ready || !user || (!user.isPremium && !user.isAdmin)) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center px-4 text-center">
        <div>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-violet-400" />
          <p className="mt-4 text-sm text-gray-500">Проверяем доступ к Bootcamp…</p>
        </div>
      </div>
    )
  }

  return children
}
