import Link from 'next/link'
import { api } from '@/lib/api'

const roadmap = [
  ['01', 'Free Go Course', 'FREE', 'Установка Go, первый запуск, основы языка и 3 проекта.'],
  ['02', 'Go Trainer', 'FREE', 'Короткая практика по темам, которые чаще всего ломают новичка.'],
  ['03', 'Go Junior Bootcamp', 'MVP FREE', 'Backend-проекты, упражнения, checkpoint и сертификат за результат.'],
  ['04', 'Go Middle Bootcamp', 'COMING SOON', 'Сложные сервисы, архитектура и production-мышление.'],
  ['05', 'Go Senior Bootcamp', 'COMING SOON', 'Системный дизайн, надёжность и инженерные решения.'],
]

export default async function GoTrackPage() {
  const [freeProjects, juniorProjects] = await Promise.all([
    api.getProjects({ level: 'free-go' }).catch(() => []),
    api.getProjects({ level: 'go-junior' }).catch(() => []),
  ])

  return (
    <main className="page-shell">
      <section className="page-wrap py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="eyebrow">GO DEVELOPER TRACK</span>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.04em] text-[#17201d] sm:text-6xl">
              Go Developer Track
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#647067]">
              Начни бесплатно, установи Go, собери первые проекты и перейди к Junior Bootcamp. Сейчас весь MVP открыт бесплатно,
              но сертификат всё равно выдаётся только за выполненный результат.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/guide/atlas-first-day" className="btn-primary">Начать бесплатно</Link>
              <Link href="/trainer" className="btn-secondary">Открыть тренажёр</Link>
            </div>
          </div>

          <div className="bento-card p-5">
            <div className="terminal-panel">
              <div className="terminal-bar">
                <span className="terminal-dot bg-[#ff5f57]" />
                <span className="terminal-dot bg-[#ffbd2e]" />
                <span className="terminal-dot bg-[#28c840]" />
                <span className="ml-2 font-mono text-xs text-slate-400">go-track.sh</span>
              </div>
              <pre className="px-5 py-5 font-mono text-sm leading-7">
                <code>{`$ godemy start go
course: free
projects: 3 starter + 4 junior
certificate: go-junior
status: ready`}</code>
              </pre>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {['Free course', 'Trainer', 'Bootcamp'].map((item) => (
                <div key={item} className="rounded-2xl border border-[#dfe6dc] bg-[#f8faf4] p-4 text-center font-semibold text-[#17201d]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-16">
        <div className="space-y-3">
          {roadmap.map(([step, title, status, text]) => (
            <article key={title} className="bento-card grid gap-4 p-5 sm:grid-cols-[80px_1fr_auto] sm:items-center">
              <div className="font-mono text-3xl font-black text-[#20a865]">{step}</div>
              <div>
                <h2 className="text-xl font-black text-[#17201d]">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#647067]">{text}</p>
              </div>
              <span className="mono-chip">{status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">FREE GO PROJECTS</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17201d]">3 проекта бесплатного курса</h2>
          </div>
          <Link href="/guide" className="btn-secondary">Открыть курс</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {freeProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="bento-card p-5">
              <span className="mono-chip">PROJECT {String(project.order).padStart(2, '0')}</span>
              <h3 className="mt-4 text-xl font-black text-[#17201d]">{project.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#647067]">{project.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-20">
        <div className="bento-card p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <span className="eyebrow">GO JUNIOR BOOTCAMP</span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17201d]">Проекты и финальный checkpoint</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#647067]">
                Сертификат Go Junior открывается бесплатно после завершения уроков, упражнений, 4 Junior projects,
                final checkpoint и заполненного ФИО.
              </p>
            </div>
            <Link href="/junior" className="btn-primary">Начать Bootcamp</Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {juniorProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`} className="rounded-2xl border border-[#dfe6dc] bg-[#f8faf4] p-4 hover:border-[#20d47b]/40">
                <span className="mono-chip">{project.kind === 'checkpoint' ? 'CHECKPOINT' : `PROJECT ${String(project.order).padStart(2, '0')}`}</span>
                <h3 className="mt-4 text-base font-black text-[#17201d]">{project.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#647067]">{project.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
