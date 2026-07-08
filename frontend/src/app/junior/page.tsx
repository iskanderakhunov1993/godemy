import Link from 'next/link'

const projects = ['URL Shortener', 'Task Tracker API', 'Auth Service', 'Final Backend Project']
const topics = ['HTTP', 'REST API', 'PostgreSQL', 'Docker', 'Тесты', 'GitHub', 'Архитектура проекта', 'Конфиги', 'Логирование']
const sprints = [
  'Sprint 0: IT контекст, Agile, роли и карьера Go специалиста',
  'Sprint 1: Todo List API',
  'Sprint 2: Blogging Platform API',
  'Sprint 3: Weather API Wrapper Service',
  'Sprint 4: Expense Tracker API',
  'Sprint 5: GitHub User Activity CLI/API',
]

export default function JuniorModulePage() {
  return (
    <main className="page-shell">
      <section className="page-wrap py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="eyebrow">JUNIOR BOOTCAMP</span>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-[#17201d] sm:text-6xl">Go Junior Bootcamp</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#647067]">
              Прокачайся от базового Go до уровня Junior Backend Developer через реальные backend-проекты.
              В MVP bootcamp открыт бесплатно, а сертификат зависит от результата.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/junior/guide" className="btn-primary">Начать Bootcamp</Link>
              <Link href="/certificates" className="btn-secondary">Проверить сертификат</Link>
            </div>
          </div>
          <div className="terminal-panel">
            <div className="terminal-bar">
              <span className="terminal-dot bg-[#ff5f57]" />
              <span className="terminal-dot bg-[#ffbd2e]" />
              <span className="terminal-dot bg-[#28c840]" />
              <span className="ml-2 font-mono text-xs text-slate-400">junior-checkpoint.log</span>
            </div>
            <pre className="px-5 py-5 font-mono text-sm leading-7">
              <code>{`lessons: required
exercises: required
projects: 4 required
final_checkpoint: required
certificate: go-junior`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-16">
        <div className="grid gap-4 md:grid-cols-4">
          {projects.map((project, index) => (
            <article key={project} className="bento-card p-5">
              <span className="mono-chip">PROJECT {String(index + 1).padStart(2, '0')}</span>
              <h2 className="mt-4 text-xl font-black text-[#17201d]">{project}</h2>
              <p className="mt-3 text-sm leading-6 text-[#647067]">
                Рабочий backend-brief с требованиями, командами запуска и self-check готовности.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-16">
        <div className="bento-card p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">PROGRAM</span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17201d]">Спринты Junior уровня</h2>
            </div>
            <Link href="/junior/trainer" className="btn-secondary">Открыть тренажёр Junior</Link>
          </div>
          <div className="mt-6 space-y-3">
            {sprints.map((sprint, index) => (
              <div key={sprint} className="grid gap-3 rounded-2xl border border-[#dfe6dc] bg-[#f8faf4] p-4 sm:grid-cols-[56px_1fr_auto] sm:items-center">
                <span className="font-mono text-xl font-black text-[#20a865]">{String(index).padStart(2, '0')}</span>
                <p className="font-semibold text-[#17201d]">{sprint}</p>
                <span className="mono-chip">OPEN</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap pb-20">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="eyebrow">STACK</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17201d]">Темы bootcamp</h2>
            <p className="mt-3 text-sm leading-7 text-[#647067]">
              Фокус на практику backend-разработчика: API, хранение данных, окружение и проверка результата.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span key={topic} className="mono-chip">{topic}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
