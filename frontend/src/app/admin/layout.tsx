'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthHydrated, useAuthStore } from '@/lib/store'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { token, user, setAuth, logout } = useAuthStore()
  const hasHydrated = useAuthHydrated()
  const [sessionState, setSessionState] = useState<'idle' | 'valid' | 'invalid'>('idle')

  useEffect(() => {
    if (!hasHydrated || !token) {
      return
    }

    api.me()
      .then((me) => {
        if (me.isAdmin) {
          setAuth(token, me)
          setSessionState('valid')
          return
        }

        logout()
        setSessionState('invalid')
        router.replace(`/auth/login?next=${encodeURIComponent(pathname || '/admin')}`)
      })
      .catch(() => {
        logout()
        setSessionState('invalid')
        router.replace(`/auth/login?next=${encodeURIComponent(pathname || '/admin')}`)
      })
  }, [hasHydrated, token, logout, setAuth, router, pathname])

  const isCheckingSession = hasHydrated && Boolean(token) && sessionState === 'idle'
  const hasAdminSession = Boolean(token && user?.isAdmin && sessionState === 'valid')

  if (!hasHydrated || isCheckingSession) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Проверка доступа...</div>
  }

  if (!hasAdminSession) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 text-gray-400">
        Перенаправляем во вход по обычной форме...
      </div>
    )
  }

  const navLinks = [
    { href: '/admin/users', label: 'Пользователи' },
    { href: '/admin/structure', label: 'Редактор курса' },
    { href: '/admin/bootcamp', label: 'Редактор буткемпа' },
    { href: '/admin/course-generator', label: 'Генератор курса' },
    { href: '/admin/trainer', label: 'Тренажер' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-[#FFD60A]">Админ-панель</span>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${
              (link.href === '/admin/trainer'
                ? pathname === '/admin/trainer' || pathname.startsWith('/admin/trainer/')
                : pathname === link.href)
                ? 'text-[#FFD60A] font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button
          className="ml-auto text-sm text-gray-500 hover:text-red-400 transition-colors"
          onClick={() => {
            logout()
            setSessionState('idle')
            router.replace('/auth/login?next=%2Fadmin')
          }}
        >
          Выйти
        </button>
      </nav>
      <main className="p-6 bg-gray-950">{children}</main>
    </div>
  )
}
