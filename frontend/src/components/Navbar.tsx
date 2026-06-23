'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useState, useCallback, useEffect } from 'react'
import { SearchModal } from './SearchModal'
import { BrandLogo } from './BrandLogo'
import { Menu, X } from 'lucide-react'

const firstLessonHref = '/guide/atlas-first-day'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const openSearch = useCallback(() => setSearchOpen(true), [])

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
    { href: '/guide', label: 'Начать с нуля' },
    { href: '/trainer', label: 'Практика' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#0a0a0a]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <BrandLogo compact />
            </Link>
            <div className="hidden md:flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.04] p-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    pathname.startsWith(l.href)
                      ? 'bg-[#FFD60A] text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <Link
              href="/bootcamp"
              className="hidden text-xs font-medium text-gray-500 transition-colors hover:text-[#FFD60A] lg:inline"
            >
              Продвинутый курс
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openSearch}
              aria-label="Поиск"
              className="hidden h-10 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3.5 text-gray-400 hover:border-[#FFD60A]/20 hover:text-white sm:flex"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline text-xs text-gray-400">Поиск</span>
              <kbd className="hidden sm:inline text-[10px] border border-gray-700 rounded px-1 py-0.5 text-gray-500">⌘K</kbd>
            </button>

            {user ? (
              <>
                {user.isPremium ? (
                  <span className="hidden lg:flex items-center rounded-lg border border-[#FFD60A]/15 bg-[#FFD60A]/5 px-3 py-2 text-xs font-medium text-[#FFD60A]/80">
                    Pro
                  </span>
                ) : (
                  <Link
                    href="/bootcamp/buy"
                    className="hidden lg:flex items-center text-xs font-medium text-gray-500 hover:text-[#FFD60A]"
                  >
                    Продвинутый курс
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.07] text-sm font-bold text-white hover:border-[#FFD60A]/30"
                  >
                    {user.username[0].toUpperCase()}
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#141414]/95 py-2 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                        <Link href="/profile" className="block px-5 py-2.5 text-sm text-gray-200 hover:bg-white/[0.06] hover:text-white" onClick={() => setMenuOpen(false)}>
                          Профиль
                        </Link>
                        {user.isAdmin && (
                          <Link href="/admin" className="block px-5 py-2.5 text-sm text-[#FFD60A] hover:bg-white/[0.06] hover:text-white" onClick={() => setMenuOpen(false)}>
                            Админка
                          </Link>
                        )}
                        <Link href="/certificates" className="block px-5 py-2.5 text-sm text-gray-200 hover:bg-white/[0.06] hover:text-white" onClick={() => setMenuOpen(false)}>
                          Сертификаты
                        </Link>
                        <Link href="/feedback" className="block px-5 py-2.5 text-sm text-gray-200 hover:bg-white/[0.06] hover:text-white" onClick={() => setMenuOpen(false)}>
                          Обратная связь
                        </Link>
                        {!user.isPremium && (
                          <Link href="/bootcamp/buy" className="block px-5 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white" onClick={() => setMenuOpen(false)}>
                            Открыть продвинутый курс
                          </Link>
                        )}
                        <div className="my-1.5 border-t border-white/8" />
                        <button
                          onClick={() => { logout(); setMenuOpen(false) }}
                          className="w-full px-5 py-2.5 text-left text-sm text-gray-400 hover:bg-white/[0.06] hover:text-white"
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
                <Link href="/auth/login" className="hidden text-sm text-gray-400 hover:text-white sm:inline">
                  Войти
                </Link>
                <Link href={firstLessonHref} className="btn-primary text-sm px-4 py-2.5">
                  Начать урок
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={mobileNavOpen ? 'Закрыть меню' : 'Открыть меню'}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04] text-gray-300 hover:border-white/16 hover:text-white md:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-white/8 bg-[#0a0a0a]/96 px-4 py-4 backdrop-blur-xl md:hidden">
            <div className="grid gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    pathname.startsWith(l.href)
                      ? 'bg-[#FFD60A] text-black'
                      : 'bg-white/[0.04] text-gray-300'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { openSearch(); setMobileNavOpen(false) }}
                className="rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-gray-300"
              >
                Поиск
              </button>
              <Link
                href="/bootcamp"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center text-sm font-semibold text-gray-400"
              >
                Продвинутый курс
              </Link>
            </div>
          </div>
        )}
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
