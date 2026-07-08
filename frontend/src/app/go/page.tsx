import Link from 'next/link'
import { api } from '@/lib/api'

export default async function GoTrackPage() {
  const [freeProjects, juniorProjects] = await Promise.all([
    api.getProjects({ level: 'free-go' }).catch(() => []),
    api.getProjects({ level: 'go-junior' }).catch(() => []),
  ])

  return (
    <main className="page-shell">
      <section className="page-wrap py-12">
        <span className="eyebrow">Go Developer Track</span>
        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-0.05em] text-white sm:text-7xl">
          Go с нуля до Junior через проекты
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Бесплатный курс, тренажёр, Junior Bootcamp и сертификат после реального результата. Сейчас весь MVP открыт бесплатно.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/guide" className="btn-primary justify-center">Начать бесплатный курс</Link>
          <Link href="/junior" className="btn-secondary justify-center">Открыть Junior Bootcamp</Link>
        </div>
      </section>

      <section className="page-wrap pb-14">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ['Free Go Course', 'Установка Go, редактор, терминал, основы языка и 3 стартовых проекта.', '/guide'],
            ['Free Go Trainer', 'Короткие задачи по переменным, условиям, функциям, JSON, HTTP и тестам.', '/trainer'],
            ['Go Junior Bootcamp', 'HTTP, REST API, PostgreSQL, Docker, тесты, GitHub и финальный backend-проект.', '/junior'],
          ].map(([title, text, href]) => (
            <Link key={title} href={href} className="surface-card rounded-[28px] p-6 transition-colors hover:border-cyan-400/40">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-14">
        <h2 className="text-3xl font-black text-white">Проекты бесплатного курса</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {freeProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="surface-card rounded-2xl p-5 hover:border-cyan-400/40">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Project {project.order}</p>
              <h3 className="mt-2 text-xl font-bold text-white">{project.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{project.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white">Go Junior Bootcamp</h2>
            <p className="mt-2 text-slate-400">4 проекта и финальный checkpoint для сертификата.</p>
          </div>
          <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-200">
            Middle / Senior Coming Soon
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {juniorProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="surface-card rounded-2xl p-5 hover:border-violet-400/40">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">{project.kind === 'checkpoint' ? 'Checkpoint' : `Project ${project.order}`}</p>
              <h3 className="mt-2 text-lg font-bold text-white">{project.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{project.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
