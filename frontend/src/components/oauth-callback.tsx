'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import type { User } from '@/lib/api'

type OAuthExchange = (code: string) => Promise<{ token: string; user: User }>

interface OAuthCallbackProps {
  providerLabel: string
  exchange: OAuthExchange
  successRedirect?: string
  loginHref?: string
}

function OAuthCallbackContent({ providerLabel, exchange, successRedirect = '/guide', loginHref = '/auth/login' }: OAuthCallbackProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      const timer = window.setTimeout(() => setError('Код авторизации не получен'), 0)
      return () => window.clearTimeout(timer)
    }

    exchange(code)
      .then(({ token, user }) => {
        setAuth(token, user)
        router.replace(successRedirect)
      })
      .catch((err) => {
        setError((err as Error).message || 'Ошибка авторизации')
      })
  }, [exchange, router, searchParams, setAuth, successRedirect])

  if (error) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href={loginHref} className="text-cyan-400 hover:text-cyan-300 text-sm">
            Вернуться ко входу
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Входим через {providerLabel}...</p>
      </div>
    </div>
  )
}

export function OAuthCallbackPage(props: OAuthCallbackProps) {
  return (
    <Suspense>
      <OAuthCallbackContent {...props} />
    </Suspense>
  )
}
