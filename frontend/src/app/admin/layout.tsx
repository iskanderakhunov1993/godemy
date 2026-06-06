'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminApi } from '@/lib/api'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [input, setInput] = useState('')
  const [checking, setChecking] = useState(false)
  const pathname = usePathname()
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret')
    if (saved) {
      setSecret(saved)
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (!authed || !secret) return
    setChecking(true)
    setError('')
    adminApi.getLessons(secret)
      .then(() => undefined)
      .catch((e) => {
        const msg = e.message || 'Ошибка'
        if (msg.toLowerCase().includes('401') || msg.toLowerCase().includes('unauthorized')) {
          setAuthed(false)
          setSecret('')
          sessionStorage.removeItem('admin_secret')
          setError('Неверный пароль администратора')
        } else {
          setError(msg)
        }
      })
      .finally(() => setChecking(false))
  }, [authed, secret])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    sessionStorage.setItem('admin_secret', input)
    setSecret(input)
    setAuthed(true)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white">Вход в админку</h1>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <input
            type="password"
            placeholder="Admin Secret"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-cyan-500"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
          >
            Войти
          </button>
        </form>
      </div>
    )
  }

  const navLinks = [
    { href: '/admin/structure', label: 'Редактор курса' },
    { href: '/admin/bootcamp', label: 'Редактор буткемпа' },
    { href: '/admin/trainer', label: 'Тренажер' },
  ]
  if (checking) return <div className="text-gray-400 p-8">Проверка доступа...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-cyan-400">Админ-панель</span>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${
              (link.href === '/admin/trainer'
                ? pathname === '/admin/trainer' || pathname.startsWith('/admin/trainer/')
                : pathname === link.href)
                ? 'text-cyan-400 font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button
          className="ml-auto text-sm text-gray-500 hover:text-red-400 transition-colors"
          onClick={() => {
            sessionStorage.removeItem('admin_secret')
            setAuthed(false)
            setSecret('')
            setInput('')
          }}
        >
          Выйти
        </button>
      </nav>
      <main className="p-6 bg-gray-950">{children}</main>
    </div>
  )
}
