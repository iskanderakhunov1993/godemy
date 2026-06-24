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
      const message = (err as Error).message
      setError(message === 'Email is not verified'
        ? 'Подтверди email по ссылке из письма. После этого вход станет доступен.'
        : message)
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
              <Link href="/auth/forgot-password" className="text-xs text-[#FFD60A] transition hover:text-white">
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
          <Link href="/auth/register" className="font-medium text-[#FFD60A] transition hover:text-white">
            Зарегистрироваться
          </Link>
        </p>

      </div>
    </div>
  )
}
