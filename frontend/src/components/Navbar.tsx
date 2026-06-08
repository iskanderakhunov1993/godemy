'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useState, useCallback, useEffect } from 'react'
import { SearchModal } from './SearchModal'
import { useThemeStore } from '@/lib/theme'
import { BrandLogo } from './BrandLogo'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { mode, toggleMode } = useThemeStore()

  const openSearch = useCallback(() => setSearchOpen(true), [])

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openSearch])

  const links = [
    { href: '/guide', label: 'Курс' },
    { href: '/trainer', label: 'Тренажёр' },
    { href: '/bootcamp', label: 'Bootcamp' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <BrandLogo compact />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith(l.href)
                      ? 'text-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={openSearch}
              aria-label="Поиск"
              className="flex items-center gap-2 h-8 px-3 rounded-lg bg-gray-800/60 border border-gray-700/60 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline text-xs text-gray-400">Поиск</span>
              <kbd className="hidden sm:inline text-[10px] border border-gray-700 rounded px-1 py-0.5 text-gray-500">⌘K</kbd>
            </button>

            {/* Dark / Light toggle */}
            <button
              onClick={toggleMode}
              aria-label={mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {mode === 'dark' ? (
                /* Sun icon */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                /* Moon icon */
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {user ? (
              <>
                {user.isPremium ? (
                  <span className="hidden sm:flex items-center text-sm font-medium text-gray-200 border border-gray-700/70 bg-gray-900/70 rounded-full px-3 py-1">
                    Премиум
                  </span>
                ) : (
                  <Link
                    href="/bootcamp/buy"
                    className="hidden sm:flex items-center text-sm font-medium text-gray-300 hover:text-gray-100 border border-gray-700/70 hover:border-cyan-500/40 bg-gray-900/70 rounded-full px-3 py-1 transition-colors"
                  >
                    Премиум
                  </Link>
                )}

                {/* Avatar + dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-9 h-9 rounded-full bg-gray-700 border-2 border-gray-600 hover:border-cyan-500/60 flex items-center justify-center text-white font-bold text-sm transition-colors overflow-hidden"
                  >
                    {user.username[0].toUpperCase()}
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl py-2 z-50">
                        <Link
                          href="/profile"
                          className="block px-5 py-2.5 text-sm text-gray-200 hover:text-white hover:bg-gray-800/60 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          Профиль
                        </Link>
                        {user.isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-5 py-2.5 text-sm text-cyan-300 hover:text-white hover:bg-gray-800/60 transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            Админка
                          </Link>
                        )}
                        <Link
                          href="/certificates"
                          className="block px-5 py-2.5 text-sm text-gray-200 hover:text-white hover:bg-gray-800/60 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          Сертификаты
                        </Link>
                        <Link
                          href="/feedback"
                          className="block px-5 py-2.5 text-sm text-gray-200 hover:text-white hover:bg-gray-800/60 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          Обратная связь
                        </Link>
                        {!user.isPremium && (
                          <Link
                            href="/bootcamp/buy"
                            className="block px-5 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            Купить Премиум
                          </Link>
                        )}
                        <div className="my-1.5 border-t border-gray-700/50" />
                        <button
                          onClick={() => { logout(); setMenuOpen(false) }}
                          className="w-full text-left px-5 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
                        >
                          Выйти
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Войти
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Global search modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
