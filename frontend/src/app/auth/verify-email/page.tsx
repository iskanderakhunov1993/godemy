'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function verify() {
      setLoading(true)
      setError('')
      setMessage('')

      if (!token) {
        setError('В ссылке нет токена подтверждения.')
        setLoading(false)
        return
      }

      try {
        const res = await api.verifyEmail(token)
        if (!cancelled) setMessage(res.message)
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Подтверждение email</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
          {loading ? 'Проверяем ссылку' : error ? 'Ссылка не сработала' : 'Email подтверждён'}
        </h1>

        {loading && (
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Это займёт пару секунд.
          </p>
        )}

        {message && (
          <div className="mt-6 rounded-3xl border border-[#FFD60A]/20 bg-[#FFD60A]/10 p-5 text-sm leading-6 text-[#FFE44D]">
            {message}
          </div>
        )}

        {error && (
          <div className="app-alert mt-6">
            {error}
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/auth/login" className="btn-primary justify-center text-sm">
            Войти
          </Link>
          <Link href="/auth/register" className="btn-secondary justify-center text-sm">
            Отправить письмо ещё раз
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
