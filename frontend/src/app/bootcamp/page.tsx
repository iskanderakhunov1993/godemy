import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Bootcamp Go — 5 реальных проектов за 6 недель | Godemy',
  description: 'Практический буткемп по Go: напиши 5 реальных проектов для резюме за 6 недель. Junior, Middle, Senior уровни. Авто-проверка кода, сертификаты.',
  openGraph: {
    title: 'Bootcamp Go — 5 реальных проектов за 6 недель',
    description: 'Практический буткемп по Go: напиши 5 реальных проектов для резюме за 6 недель.',
    type: 'website',
  },
}

const modules = [
  {
    level: 'Junior',
    badge: 'Открыт',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accent: 'border-cyan-500/40',
    bar: 'bg-cyan-500',
    barBg: 'from-cyan-500/10 to-transparent',
    icon: '🟢',
    number: '01',
    numberColor: 'text-cyan-500/30',
    desc: 'Практические проекты для уверенного старта в Go-разработке. Никакой воды — только реальные задачи.',
    features: ['6 спринтов с проектами', 'Авто-проверка кода', 'Задачи уровня собеседований', 'Курс + тренажёр'],
    href: '/junior',
    cta: 'Начать Junior →',
    locked: false,
  },
  {
    level: 'Middle',
    badge: 'Скоро',
    badgeColor: 'bg-gray-700 text-gray-400 border-gray-600',
    accent: 'border-gray-700',
    bar: 'bg-gray-600',
    barBg: 'from-gray-700/20 to-transparent',
    icon: '🔵',
    number: '02',
    numberColor: 'text-gray-700',
    desc: 'Микросервисы, gRPC, базы данных, оптимизация и архитектура Go-приложений.',
    features: ['Микросервисы', 'gRPC & Protobuf', 'PostgreSQL + Redis', 'Паттерны архитектуры'],
    href: '#',
    cta: '🔒 Скоро открывается',
    locked: true,
  },
  {
    level: 'Senior',
    badge: 'Скоро',
    badgeColor: 'bg-gray-700 text-gray-400 border-gray-600',
    accent: 'border-gray-700',
    bar: 'bg-gray-600',
    barBg: 'from-gray-700/20 to-transparent',
    icon: '🔴',
    number: '03',
    numberColor: 'text-gray-700',
    desc: 'Highload, Kubernetes, observability, лидерство в команде и принятие архитектурных решений.',
    features: ['Highload & оптимизация', 'Kubernetes & DevOps', 'Observability', 'Tech leadership'],
    href: '#',
    cta: '🔒 Скоро открывается',
    locked: true,
  },
]

const resumeProjects = [
  { sprint: 'Sprint 1', name: 'Todo List API', tag: 'REST, CRUD, PostgreSQL' },
  { sprint: 'Sprint 2', name: 'Blogging Platform API', tag: 'Auth, JWT, Relations' },
  { sprint: 'Sprint 3', name: 'Weather API Wrapper', tag: 'HTTP Client, Caching, Env' },
  { sprint: 'Sprint 4', name: 'Expense Tracker API', tag: 'Filters, Reports, SQL' },
  { sprint: 'Sprint 5', name: 'GitHub Activity CLI/API', tag: 'CLI, External API, Pagination' },
]

export default function BootcampPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">Буткемп Godemy</p>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-100 mb-4 leading-tight">
          За 6 недель напишешь<br />
          <span className="text-cyan-400">5 реальных Go-проектов</span><br />
          для резюме
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Никакой теории без практики. Каждый спринт — конкретный проект с понятным ТЗ, автопроверкой кода и демо для портфолио.
        </p>
      </div>

      {/* Resume projects */}
      <div className="mb-10 bg-gray-900 border border-gray-800 rounded-2xl px-6 py-6">
        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Что пойдёт в твоё резюме</p>
        <div className="space-y-3">
          {resumeProjects.map((p, i) => (
            <div key={p.name} className="flex items-center gap-4">
              <span className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-gray-100 font-semibold text-sm">{p.name}</span>
                <span className="ml-2 text-xs text-gray-500">{p.sprint}</span>
              </div>
              <span className="hidden sm:block text-xs text-gray-600 font-mono">{p.tag}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">+ Sprint 0: IT-контекст, Agile, роли в команде — бесплатно для всех</p>
      </div>

      {/* Pricing / what's free */}
      <div className="mb-8 grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4 text-center">
          <p className="text-emerald-400 text-xl font-bold mb-1">Бесплатно</p>
          <p className="text-gray-100 text-sm font-semibold mb-0.5">Курс Go</p>
          <p className="text-gray-500 text-xs">Все уроки и материалы</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4 text-center">
          <p className="text-emerald-400 text-xl font-bold mb-1">Бесплатно</p>
          <p className="text-gray-100 text-sm font-semibold mb-0.5">Тренажёры</p>
          <p className="text-gray-500 text-xs">Все практические задачи</p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-4 text-center">
          <p className="text-amber-400 text-xl font-bold mb-1">Premium</p>
          <p className="text-gray-100 text-sm font-semibold mb-0.5">Bootcamp + Сертификаты</p>
          <p className="text-gray-500 text-xs">Проекты, проверка кода, PDF</p>
        </div>
      </div>

      {/* Junior Resume Preview */}
      <div className="mb-8 rounded-2xl border border-cyan-500/20 bg-gray-900 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">После Junior модуля — твоё резюме будет выглядеть так</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-0">
          {/* Gopher + title */}
          <div className="sm:w-48 bg-gradient-to-b from-cyan-500/5 to-transparent flex flex-col items-center justify-center px-6 py-8 border-b sm:border-b-0 sm:border-r border-gray-800 flex-shrink-0">
            {/* Go Gopher SVG inline */}
            <svg viewBox="0 0 400 450" className="w-28 h-28 mb-3" xmlns="http://www.w3.org/2000/svg">
              {/* Body */}
              <ellipse cx="200" cy="280" rx="100" ry="120" fill="#6ad7e5"/>
              {/* Head */}
              <ellipse cx="200" cy="155" rx="85" ry="80" fill="#6ad7e5"/>
              {/* Eyes white */}
              <ellipse cx="172" cy="140" rx="22" ry="24" fill="white"/>
              <ellipse cx="228" cy="140" rx="22" ry="24" fill="white"/>
              {/* Eyes pupils */}
              <circle cx="176" cy="143" r="12" fill="#333"/>
              <circle cx="232" cy="143" r="12" fill="#333"/>
              {/* Eye shine */}
              <circle cx="181" cy="138" r="4" fill="white"/>
              <circle cx="237" cy="138" r="4" fill="white"/>
              {/* Nose */}
              <ellipse cx="200" cy="170" rx="18" ry="10" fill="#4db8c8"/>
              <circle cx="193" cy="170" r="5" fill="#222"/>
              <circle cx="207" cy="170" r="5" fill="#222"/>
              {/* Ears */}
              <ellipse cx="135" cy="110" rx="20" ry="28" fill="#6ad7e5"/>
              <ellipse cx="265" cy="110" rx="20" ry="28" fill="#6ad7e5"/>
              {/* Arms */}
              <ellipse cx="112" cy="290" rx="28" ry="18" fill="#6ad7e5" transform="rotate(-20 112 290)"/>
              <ellipse cx="288" cy="290" rx="28" ry="18" fill="#6ad7e5" transform="rotate(20 288 290)"/>
              {/* Belly */}
              <ellipse cx="200" cy="295" rx="65" ry="75" fill="#c8eef4"/>
              {/* Legs */}
              <ellipse cx="168" cy="390" rx="30" ry="22" fill="#6ad7e5" transform="rotate(10 168 390)"/>
              <ellipse cx="232" cy="390" rx="30" ry="22" fill="#6ad7e5" transform="rotate(-10 232 390)"/>
            </svg>
            <p className="text-gray-100 font-bold text-sm text-center">Go-разработчик</p>
            <p className="text-gray-500 text-xs text-center mt-1">Junior Backend</p>
          </div>

          {/* Resume content */}
          <div className="flex-1 px-6 py-6 space-y-5">
            {/* Desired salary */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-100 text-sm font-bold">Go‑разработчик</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">от 120 000 ₽</span>
              <span className="text-xs text-gray-500">офис / удалённо</span>
            </div>

            {/* Skills */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Навыки</p>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5 text-xs">▸</span>Разрабатываю REST API на Go (net/http, Gin)</li>
                <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5 text-xs">▸</span>Работаю с JSON, реализую JWT-аутентификацию</li>
                <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5 text-xs">▸</span>Использую PostgreSQL / SQLite, пишу SQL-запросы</li>
                <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5 text-xs">▸</span>Интегрирую внешние HTTP API, реализую кэширование</li>
                <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5 text-xs">▸</span>Пишу тесты (unit, integration), покрытие &gt; 70%</li>
              </ul>
            </div>

            {/* Projects */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">5 проектов в портфолио</p>
              <div className="space-y-1.5">
                {[
                  { name: 'Todo List API', desc: 'CRUD, REST, обработка ошибок' },
                  { name: 'Blogging Platform API', desc: 'JWT-авторизация, черновики, публикация' },
                  { name: 'Weather API Wrapper', desc: 'Интеграция внешнего API, кэш, таймауты' },
                  { name: 'Expense Tracker API', desc: 'Фильтры, агрегаты по периодам, SQL' },
                  { name: 'GitHub Activity CLI/API', desc: 'CLI, GitHub API, rate-limit, пагинация' },
                ].map((p, i) => (
                  <div key={p.name} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-gray-100 text-sm font-semibold">{p.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{p.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Инструменты</p>
              <div className="flex flex-wrap gap-2">
                {['Go', 'SQL', 'Git', 'GitHub', 'Postman', 'REST API', 'JWT', 'Docker (основы)'].map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300 font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-5">
        {modules.map((mod) => (
          <div
            key={mod.level}
            className={`relative rounded-2xl border bg-gray-900 overflow-hidden transition-all ${mod.accent} ${mod.locked ? 'opacity-70' : 'hover:border-cyan-500/60'}`}
          >
            {/* Background gradient accent */}
            <div className={`absolute inset-0 bg-gradient-to-r ${mod.barBg} pointer-events-none`} />

            {/* Top color bar */}
            <div className={`h-1 w-full ${mod.bar}`} />

            <div className="px-7 py-6 relative">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  {/* Big number */}
                  <div className={`hidden sm:block text-7xl font-black leading-none select-none mt-1 ${mod.numberColor}`}>
                    {mod.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-2xl font-bold text-gray-100">{mod.level}</h2>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 max-w-xl">{mod.desc}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {mod.features.map((f) => (
                        <span
                          key={f}
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            mod.locked
                              ? 'bg-gray-800 text-gray-500 border-gray-700'
                              : 'bg-cyan-500/5 text-cyan-300/80 border-cyan-500/20'
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex-shrink-0 self-center">
                  {mod.locked ? (
                    <button
                      disabled
                      className="text-sm font-semibold text-gray-500 bg-gray-800 border border-gray-700 px-5 py-2.5 rounded-xl cursor-not-allowed whitespace-nowrap"
                    >
                      {mod.cta}
                    </button>
                  ) : (
                    <Link
                      href={mod.href}
                      className="text-sm font-bold text-black bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap inline-block"
                    >
                      {mod.cta}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom info */}
      <div className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl px-6 py-6 flex items-start gap-4">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-gray-100 font-semibold mb-1">Как это устроено</p>
          <p className="text-gray-400 text-sm">
            Каждый модуль состоит из спринтов. Спринт = реальный проект с конкретным ТЗ. Ты пишешь код, система проверяет результат. Никаких лекций по 4 часа — только практика и короткие объяснения по делу.
          </p>
        </div>
      </div>
    </div>
  )
}
