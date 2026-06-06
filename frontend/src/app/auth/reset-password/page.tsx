'use client'

import { FormEvent, useState } from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Токен сброса отсутствует в ссылке')
      return
    }

    if (newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setLoading(true)
    try {
      const res = await api.resetPassword(token, newPassword)
      setSuccess(res.message)
      setTimeout(() => router.push('/auth/login'), 1200)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-white mb-2">Новый пароль</h1>
        <p className="text-sm text-gray-500 mb-6">Установи новый пароль для входа в аккаунт</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-cyan-500"
              placeholder="минимум 6 символов"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Повтори пароль</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-cyan-500"
              placeholder="повтори пароль"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 disabled:opacity-50"
          >
            {loading ? 'Сохраняем...' : 'Сменить пароль'}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-500">
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
            Вернуться ко входу
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
