'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
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
      router.push('/guide')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-white mb-2">Вход</h1>
        <p className="text-sm text-gray-500 mb-6">Войди, чтобы сохранять прогресс</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-cyan-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-cyan-500"
              placeholder="••••••••"
            />
            <div className="mt-1.5 text-right">
              <Link href="/auth/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
                Забыли пароль?
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 disabled:opacity-50"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300">
            Зарегистрироваться
          </Link>
        </p>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-gray-900 text-gray-500">или войди через</span>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/api/auth/yandex"
              className="w-full flex items-center justify-center gap-3 bg-[#FC3F1D] hover:bg-[#e0361a] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.341 13.56L9.506 24H6.65l5.12-11.064L7.028 0h2.905l4.408 10.63L18.76 0H21.6l-7.259 13.56z" />
              </svg>
              Войти через Яндекс
            </a>
            <a
              href="/api/auth/google"
              className="mt-3 w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-colors"
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
