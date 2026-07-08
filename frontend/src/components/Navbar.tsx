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
    { href: '/tracks', label: 'Курсы' },
    { href: '/trainer', label: 'Тренажёр' },
    { href: '/junior', label: 'Bootcamp' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[#dfe6dc] bg-[#fbfcf8]/82 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <BrandLogo compact />
            </Link>
            <div className="hidden md:flex items-center gap-2 rounded-full border border-[#dfe6dc] bg-white/80 p-1 shadow-sm">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    pathname.startsWith(l.href)
                      ? 'bg-[#17201d] text-white shadow-sm'
                      : 'text-[#647067] hover:text-[#17201d]'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <Link
              href="/go"
              className="hidden font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#647067] transition-colors hover:text-[#087a43] lg:inline"
            >
              Go Track
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search button */}
            <button
              onClick={openSearch}
              aria-label="Поиск"
              className="hidden h-10 items-center gap-2 rounded-full border border-[#dfe6dc] bg-white/75 px-3.5 text-[#647067] hover:border-[#b9d7c7] hover:text-[#17201d] sm:flex"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline text-xs text-[#647067]">Поиск</span>
              <kbd className="hidden rounded border border-[#dfe6dc] px-1 py-0.5 text-[10px] text-[#647067] sm:inline">⌘K</kbd>
            </button>

            {user ? (
              <>
                <Link
                  href="/junior"
                  className="hidden items-center font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#647067] hover:text-[#087a43] lg:flex"
                >
                  Junior Bootcamp
                </Link>

                {/* Avatar + dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#b9d7c7] bg-[#dffbea] text-sm font-bold text-[#087a43] hover:border-[#20d47b]"
                  >
                    {user.username[0].toUpperCase()}
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 z-50 mt-2 w-56 rounded-3xl border border-[#dfe6dc] bg-white/95 py-2 shadow-[0_24px_80px_rgba(17,24,39,0.14)] backdrop-blur-xl">
                        <Link
                          href="/profile"
                          className="block px-5 py-2.5 text-sm text-[#3d4a44] hover:bg-[#f3f7f0] hover:text-[#17201d]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Профиль
                        </Link>
                        {user.isAdmin && (
                          <Link
                            href="/admin"
                            className="block px-5 py-2.5 text-sm text-[#087a43] hover:bg-[#f3f7f0] hover:text-[#17201d]"
                            onClick={() => setMenuOpen(false)}
                          >
                            Админка
                          </Link>
                        )}
                        <Link
                          href="/certificates"
                          className="block px-5 py-2.5 text-sm text-[#3d4a44] hover:bg-[#f3f7f0] hover:text-[#17201d]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Сертификаты
                        </Link>
                        <Link
                          href="/feedback"
                          className="block px-5 py-2.5 text-sm text-[#3d4a44] hover:bg-[#f3f7f0] hover:text-[#17201d]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Обратная связь
                        </Link>
                        <Link
                          href="/junior"
                          className="block px-5 py-2.5 text-sm text-[#3d4a44] hover:bg-[#f3f7f0] hover:text-[#17201d]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Junior Bootcamp
                        </Link>
                        <div className="my-1.5 border-t border-[#dfe6dc]" />
                        <button
                          onClick={() => { logout(); setMenuOpen(false) }}
                          className="w-full px-5 py-2.5 text-left text-sm text-[#647067] hover:bg-[#f3f7f0] hover:text-[#17201d]"
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
                <Link href="/auth/login" className="hidden text-sm font-semibold text-[#647067] hover:text-[#17201d] sm:inline">
                  Войти
                </Link>
                <Link href={firstLessonHref} className="btn-primary text-sm px-4 py-2.5">
                  Начать бесплатно
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={mobileNavOpen ? 'Закрыть меню' : 'Открыть меню'}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe6dc] bg-white/75 text-[#3d4a44] hover:border-[#b9d7c7] hover:text-[#17201d] md:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-[#dfe6dc] bg-[#fbfcf8]/96 px-4 py-4 backdrop-blur-xl md:hidden">
            <div className="grid gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    pathname.startsWith(l.href)
                      ? 'bg-white text-slate-950'
                      : 'bg-white text-[#3d4a44]'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  openSearch()
                  setMobileNavOpen(false)
                }}
                className="rounded-2xl border border-[#dfe6dc] bg-white px-4 py-3 text-sm font-semibold text-[#3d4a44]"
              >
                Поиск
              </button>
              <Link
                href="/go"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-2xl border border-[#dfe6dc] bg-white px-4 py-3 text-center text-sm font-semibold text-[#3d4a44]"
              >
                Go Track
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Global search modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
