'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthHydrated, useAuthStore } from '@/lib/store'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { token, user, setAuth, logout } = useAuthStore()
  const hasHydrated = useAuthHydrated()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sessionState, setSessionState] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [error, setError] = useState('')

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
        setError('У этого аккаунта нет доступа к админке. Войдите под админским логином.')
      })
      .catch(() => {
        logout()
        setSessionState('invalid')
        setError('Сессия невалидна. Войдите снова под админским аккаунтом.')
      })
  }, [hasHydrated, token, logout, setAuth])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setSessionState('idle')
    setError('')

    try {
      const trimmedEmail = email.trim().toLowerCase()
      const { token: nextToken, user: nextUser } = await api.login(trimmedEmail, password)
      if (!nextUser.isAdmin) {
        logout()
        setSessionState('invalid')
        setError('Этот аккаунт не является админским.')
        return
      }
      setAuth(nextToken, nextUser)
      setSessionState('valid')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка входа'
      setError(message)
      setSessionState('invalid')
    }
  }

  const isCheckingSession = hasHydrated && Boolean(token) && sessionState === 'idle'
  const hasAdminSession = Boolean(token && user?.isAdmin && sessionState === 'valid')

  if (!hasHydrated || isCheckingSession) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Проверка доступа...</div>
  }

  if (!hasAdminSession) {
    const currentUserLabel = user?.email ? `Текущая сессия: ${user.email}` : ''

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white">Вход в админку</h1>
          <p className="text-sm text-gray-400">
            Войти можно только под админским аккаунтом.
          </p>
          {currentUserLabel && <div className="text-xs text-gray-500">{currentUserLabel}</div>}
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <input
            type="email"
            placeholder="Админ email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-cyan-500"
            autoComplete="email"
            autoFocus
          />
          <input
            type="password"
            placeholder="Пароль администратора"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-cyan-500"
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
          >
            Войти
          </button>
          {token && !user?.isAdmin && (
            <button
              type="button"
              onClick={() => logout()}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-medium transition-colors"
            >
              Выйти из текущего аккаунта
            </button>
          )}
        </form>
      </div>
    )
  }

  const navLinks = [
    { href: '/admin/structure', label: 'Редактор курса' },
    { href: '/admin/bootcamp', label: 'Редактор буткемпа' },
    { href: '/admin/trainer', label: 'Тренажер' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-cyan-400">Админ-панель</span>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${
              (link.href === '/admin/trainer'
                ? pathname === '/admin/trainer' || pathname.startsWith('/admin/trainer/')
                : pathname === link.href)
                ? 'text-cyan-400 font-semibold'
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
            setEmail('')
            setPassword('')
          }}
        >
          Выйти
        </button>
      </nav>
      <main className="p-6 bg-gray-950">{children}</main>
    </div>
  )
}
