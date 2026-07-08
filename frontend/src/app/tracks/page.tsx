import Link from 'next/link'

const tracks = [
  {
    label: 'GO TRACK',
    title: 'Go Developer Track',
    href: '/go',
    status: 'OPEN',
    description: 'Бесплатный путь от первого запуска Go до Junior Bootcamp, проектов и сертификата.',
    meta: ['Free course', 'Trainer', 'Projects', 'Certificate'],
  },
  {
    label: 'DATA TRACK',
    title: 'SQL & Data',
    href: '#',
    status: 'COMING SOON',
    description: 'Запросы, проектирование данных и практические задачи для backend-разработчиков.',
    meta: ['SQL', 'PostgreSQL', 'Schemas'],
  },
  {
    label: 'QA TRACK',
    title: 'QA Engineer',
    href: '#',
    status: 'COMING SOON',
    description: 'Тест-дизайн, чек-листы, API-проверки и работа с багами в продуктовой команде.',
    meta: ['API', 'Bugs', 'Checklists'],
  },
]

export default function TracksPage() {
  return (
    <main className="page-shell">
      <section className="page-wrap py-12 sm:py-16">
        <span className="eyebrow">TRACK CATALOG</span>
        <div className="mt-5 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#17201d] sm:text-6xl">Каталог GoDemy</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#647067]">
              Направления выглядят как developer roadmap: понятный старт, практические проекты и следующий уровень.
            </p>
          </div>
          <div className="terminal-panel">
            <div className="terminal-bar">
              <span className="terminal-dot bg-[#ff5f57]" />
              <span className="terminal-dot bg-[#ffbd2e]" />
              <span className="terminal-dot bg-[#28c840]" />
              <span className="ml-2 font-mono text-xs text-slate-400">tracks.json</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-7">
              <code>{`active_track: go-developer
free_projects: 3
middle: coming_soon
senior: coming_soon`}</code>
            </pre>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {tracks.map((track, index) => {
            const isOpen = track.href !== '#'
            return (
              <article key={track.title} className={`bento-card p-6 ${index === 0 ? 'md:col-span-2' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="mono-chip">{track.label}</span>
                  <span className="mono-chip">{track.status}</span>
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-[-0.03em] text-[#17201d]">{track.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#647067]">{track.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {track.meta.map((item) => (
                    <span key={item} className="rounded-full bg-[#f1f6ef] px-3 py-1 text-xs font-semibold text-[#3d4a44]">
                      {item}
                    </span>
                  ))}
                </div>
                {isOpen ? (
                  <Link href={track.href} className="btn-primary mt-6">
                    Открыть направление
                  </Link>
                ) : (
                  <button disabled className="mt-6 rounded-2xl border border-[#dfe6dc] bg-[#f6f8f3] px-5 py-3 text-sm font-bold text-[#93a096]">
                    Скоро
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
