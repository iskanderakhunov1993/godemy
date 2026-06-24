'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await api.register(email, password)
      setSuccess(res.message)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Новый аккаунт</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">Начать обучение</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Создай аккаунт по email, чтобы сохранять прогресс и входить с любого устройства.
        </p>

        {success ? (
          <div className="mt-8 rounded-3xl border border-[#FFD60A]/20 bg-[#FFD60A]/10 p-5">
            <p className="text-lg font-semibold text-white">Аккаунт создан</p>
            <p className="mt-2 text-sm leading-6 text-[#FFE44D]">{success}</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Используй этот email и пароль на странице входа.
            </p>
            <Link href="/auth/login" className="btn-primary mt-5 inline-flex justify-center text-sm">
              Перейти ко входу
            </Link>
          </div>
        ) : (
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
                minLength={6}
                className="app-input"
                placeholder="минимум 6 символов"
              />
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
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        {error && success && (
          <div className="app-alert mt-4">
            {error}
          </div>
        )}

        {!success && (
          <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-sm leading-6 text-slate-400">
            Email будет твоим логином. Данные аккаунта и прогресс сохраняются в базе после регистрации.
          </div>
        )}

        {!success && (
          <p className="mt-6 text-sm text-slate-400">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="font-medium text-[#FFD60A] transition hover:text-white">
              Войти
            </Link>
          </p>
        )}

      </div>
    </div>
  )
}
