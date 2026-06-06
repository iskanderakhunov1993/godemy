import Link from 'next/link'
import { BrandLogo } from './BrandLogo'

const navLinks = [
  { label: 'Курс по Go',     href: '/guide' },
  { label: 'Тренажёр задач', href: '/trainer' },
  { label: 'Bootcamp Junior',href: '/bootcamp' },
  { label: 'Сертификаты',    href: '/certificates' },
  { label: 'Профиль',        href: '/profile' },
]

const premiumLinks = [
  { label: 'Купить Премиум',  href: '/bootcamp/buy' },
  { label: 'Что входит',      href: '/bootcamp/buy' },
  { label: 'Сертификат PDF',  href: '/certificates' },
]

const communityLinks = [
  { label: 'Обратная связь', href: '/feedback' },
  { label: 'Сообщить об ошибке', href: '/feedback#bug' },
  { label: 'Идеи для платформы', href: '/feedback#ideas' },
  { label: 'Поддержать проект', href: '/feedback#donate' },
]

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950/90 mt-8">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1 — Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <BrandLogo />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Интерактивная платформа для изучения Go с нуля. Практика, тренажёр, реальные проекты.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              <a
                href="mailto:golangeracademy@gmail.com"
                aria-label="Email"
                className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
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
                className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
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
                className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <p className="text-white font-bold text-sm mb-4">Навигация</p>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Premium */}
          <div>
            <p className="text-white font-bold text-sm mb-4">Премиум</p>
            <ul className="space-y-2.5">
              {premiumLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-gray-900/70 border border-gray-700 rounded-full px-3 py-1">
              Bootcamp Junior — 4 990 ₽
            </div>
          </div>

          {/* Col 4 — Community */}
          <div>
            <p className="text-white font-bold text-sm mb-4">Сообщество</p>
            <ul className="space-y-2.5">
              {communityLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Godemy. Все права защищены.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/feedback" className="hover:text-gray-400 transition-colors">Обратная связь</Link>
            <Link href="/bootcamp/buy" className="hover:text-gray-400 transition-colors">Купить Премиум</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
