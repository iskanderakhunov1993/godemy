'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await api.login(email, password)
      setAuth(token, user)
      const nextUrl = searchParams.get('next')
      if (nextUrl?.startsWith('/')) {
        router.push(nextUrl)
      } else if (user.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/guide')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Возвращение к курсу</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">Вход</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Войди, чтобы продолжить обучение с того же места и не потерять прогресс.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="app-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="app-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="app-label">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="app-input"
              placeholder="••••••••"
            />
            <div className="mt-1.5 text-right">
              <Link href="/auth/forgot-password" className="text-xs text-violet-300 transition hover:text-white">
                Забыли пароль?
              </Link>
            </div>
          </div>

          {error && (
            <div className="app-alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="font-medium text-violet-300 transition hover:text-white">
            Зарегистрироваться
          </Link>
        </p>

        <div className="mt-8">
          <div className="auth-divider">
            <span>или войди через</span>
          </div>
          <div className="mt-4">
            <a
              href="/api/auth/yandex"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FC3F1D] px-4 py-3 font-medium text-white transition hover:bg-[#e0361a]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.341 13.56L9.506 24H6.65l5.12-11.064L7.028 0h2.905l4.408 10.63L18.76 0H21.6l-7.259 13.56z" />
              </svg>
              Войти через Яндекс
            </a>
            <a
              href="/api/auth/google"
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.92h5.57c-.24 1.24-1.47 3.64-5.57 3.64A6.53 6.53 0 0 1 5.5 11a6.53 6.53 0 0 1 6.5-6.76 5.93 5.93 0 0 1 4.16 1.6l2.84-2.73A9.64 9.64 0 0 0 12 1C6.48 1 2 5.48 2 11s4.48 10 10 10c5.76 0 9.59-4.05 9.59-9.76 0-.66-.07-1.16-.16-1.67H12z" />
                <path fill="#4285F4" d="M22.54 10.59H12v3.92h5.99a5.12 5.12 0 0 1-2.15 2.89l3.48 2.7c2.04-1.89 3.22-4.7 3.22-8.13 0-.91-.08-1.43-.1-1.38z" />
                <path fill="#FBBC05" d="M5.5 14.24a5.99 5.99 0 0 1 0-4.48L2.05 7.08a10 10 0 0 0 0 9.84l3.45-2.68z" />
                <path fill="#34A853" d="M12 20c2.7 0 4.98-.89 6.64-2.42l-3.48-2.7c-.96.65-2.19 1.1-3.16 1.1-4.1 0-5.33-2.4-5.57-3.64H2.05A10 10 0 0 0 12 20z" />
              </svg>
              Войти через Google
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
