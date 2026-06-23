'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await api.forgotPassword(email)
      setSuccess(res.message)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-white mb-2">Восстановление пароля</h1>
        <p className="text-sm text-gray-500 mb-6">Укажи email, и мы отправим ссылку для сброса</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-[#FFD60A]"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-[#FFD60A] bg-[#FFD60A]/10 border border-[#FFD60A]/20 rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 disabled:opacity-50"
          >
            {loading ? 'Отправляем...' : 'Отправить ссылку'}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500">
          Вспомнил пароль?{' '}
          <Link href="/auth/login" className="text-[#FFD60A] hover:text-[#FFD60A]">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
