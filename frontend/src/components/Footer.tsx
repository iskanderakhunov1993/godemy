import Link from 'next/link'
import { BrandLogo } from './BrandLogo'

const navLinks = [
  { label: 'Начать с нуля',       href: '/guide' },
  { label: 'Практика',            href: '/trainer' },
  { label: 'Продвинутый курс',    href: '/bootcamp' },
  { label: 'Сертификаты',    href: '/certificates' },
  { label: 'Профиль',        href: '/profile' },
]

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/8 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <BrandLogo />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-gray-500">
              Спокойная и практичная платформа для изучения Go: бесплатный курс, упражнения и следующий этап для роста в профессию.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="mailto:golangeracademy@gmail.com"
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-gray-400 hover:border-[#FFD60A]/20 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a
                href="https://t.me/golangacademy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-gray-400 hover:border-[#FFD60A]/20 hover:text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.08 13.99l-2.98-.924c-.648-.204-.66-.648.136-.961l11.647-4.49c.54-.194 1.016.131.84.96l.17-.354z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold text-white">Разделы</p>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-[#FFD60A]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold text-white">Как устроен путь</p>
            <ul className="space-y-2.5 text-sm text-gray-500 leading-relaxed">
              <li>Бесплатный курс с тремя проектами</li>
              <li>Отдельная практика для закрепления</li>
              <li>Продвинутый курс после базы</li>
              <li>Сертификаты за подтверждённые навыки</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Godemy. Все права защищены.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/guide" className="hover:text-[#FFD60A]">Курс</Link>
            <Link href="/trainer" className="hover:text-[#FFD60A]">Практика</Link>
            <Link href="/bootcamp" className="hover:text-[#FFD60A]">Продвинутый курс</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
