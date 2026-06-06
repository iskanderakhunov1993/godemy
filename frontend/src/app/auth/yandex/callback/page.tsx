'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

function YandexCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setError('Код авторизации не получен')
      return
    }

    api.yandexExchange(code)
      .then(({ token, user }) => {
        setAuth(token, user)
        router.replace('/guide')
      })
      .catch((err) => {
        setError((err as Error).message || 'Ошибка авторизации')
      })
  }, [searchParams, setAuth, router])

  if (error) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/auth/login" className="text-cyan-400 hover:text-cyan-300 text-sm">
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
        <p className="text-gray-400 text-sm">Входим через Яндекс...</p>
      </div>
    </div>
  )
}

export default function YandexCallbackPage() {
  return (
    <Suspense>
      <YandexCallbackContent />
    </Suspense>
  )
}
