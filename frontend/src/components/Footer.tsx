import Link from 'next/link'
import { BrandLogo } from './BrandLogo'

const navLinks = [
  { label: 'Курс по Go',     href: '/guide' },
  { label: 'Тренажёр задач', href: '/trainer' },
  { label: 'Bootcamp',       href: '/bootcamp' },
  { label: 'Сертификаты',    href: '/certificates' },
  { label: 'Профиль',        href: '/profile' },
]

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/8 bg-black/10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <BrandLogo />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-gray-500">
              Спокойная и практичная платформа для изучения Go: бесплатный курс, тренажёр задач и bootcamp для роста в профессию.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="mailto:golangeracademy@gmail.com"
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-gray-400 hover:border-violet-400/20 hover:text-white"
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
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-gray-400 hover:border-violet-400/20 hover:text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.08 13.99l-2.98-.924c-.648-.204-.66-.648.136-.961l11.647-4.49c.54-.194 1.016.131.84.96l.17-.354z"/>
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-gray-400 hover:border-violet-400/20 hover:text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold text-white">Разделы</p>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-300">
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
              <li>Отдельный тренажёр для практики</li>
              <li>Bootcamp: Junior → Middle → Senior</li>
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
            <Link href="/guide" className="hover:text-gray-400">Курс</Link>
            <Link href="/trainer" className="hover:text-gray-400">Тренажёр</Link>
            <Link href="/bootcamp" className="hover:text-gray-400">Bootcamp</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
