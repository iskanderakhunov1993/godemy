'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await api.register(email, username, password)
      setAuth(token, user)
      router.push('/guide?welcome=1')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-white mb-2">Регистрация</h1>
        <p className="text-sm text-gray-500 mb-6">Создай аккаунт для сохранения прогресса</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-cyan-500"
              placeholder="gopher_dev"
            />
          </div>

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
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-cyan-500"
              placeholder="минимум 6 символов"
            />
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
            {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
            Войти
          </Link>
        </p>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-gray-900 text-gray-500">или зарегистрируйся через</span>
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
              Зарегистрироваться через Яндекс
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
