'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { api, type Project, type ProjectSubmission } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function ProjectPage() {
  const params = useParams<{ slug: string }>()
  const { token } = useAuthStore()
  const [project, setProject] = useState<Project | null>(null)
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([])
  const [githubUrl, setGithubUrl] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    api.getProject(params.slug).then(setProject)
    if (token) {
      api.getProjectSubmissions()
        .then((items) => {
          setSubmissions(items)
          const current = items.find((item) => item.project?.slug === params.slug)
          setGithubUrl(current?.githubUrl || '')
          setNote(current?.note || '')
        })
        .catch(() => setSubmissions([]))
    }
  }, [params.slug, token])

  const submission = useMemo(
    () => submissions.find((item) => item.projectId === project?.id),
    [project?.id, submissions]
  )

  async function save(status: ProjectSubmission['status']) {
    if (!project || !token) return
    setSaving(true)
    setFlash('')
    try {
      const updated = await api.saveProjectSubmission(project.id, { status, githubUrl, note })
      setSubmissions((current) => [...current.filter((item) => item.projectId !== project.id), updated])
      setFlash(status === 'completed' ? 'Проект отмечен как выполненный.' : 'Прогресс проекта сохранён.')
    } finally {
      setSaving(false)
    }
  }

  if (!project) {
    return <main className="page-shell"><div className="page-wrap py-16 text-slate-400">Загружаем проект...</div></main>
  }

  const completed = submission?.status === 'completed'

  return (
    <main className="page-shell">
      <section className="page-wrap py-10">
        <Link href={project.level === 'go-junior' ? '/go' : '/guide'} className="text-sm text-slate-500 hover:text-slate-300">
          ← Назад к маршруту
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <article className="surface-card rounded-[30px] p-7">
            <span className="eyebrow">{project.level === 'go-junior' ? 'Go Junior' : 'Free Go'} · {project.kind === 'checkpoint' ? 'Checkpoint' : 'Project'}</span>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white">{project.title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-300">{project.description}</p>

            {[
              ['Что сделать', project.requirements],
              ['Ожидаемый результат', project.expectedResult],
              ['Чек-лист проверки', project.checklist],
              ['Эталонное направление', project.solution],
            ].map(([title, text]) => (
              <section key={title} className="mt-6 rounded-2xl border border-white/8 bg-white/[0.035] p-5">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">{text}</p>
              </section>
            ))}
          </article>

          <aside className="surface-card h-fit rounded-[30px] p-6">
            <div className={`rounded-2xl border p-4 ${completed ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-amber-400/20 bg-amber-400/10'}`}>
              <p className={`text-sm font-semibold ${completed ? 'text-emerald-300' : 'text-amber-300'}`}>
                {completed ? 'Выполнено' : 'Self-check'}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                В MVP проект подтверждается самостоятельно. Добавь GitHub-ссылку или заметку и отметь готовность.
              </p>
            </div>

            {!token ? (
              <Link href={`/auth/login?next=/projects/${project.slug}`} className="btn-primary mt-5 w-full justify-center">
                Войти, чтобы сохранить прогресс
              </Link>
            ) : (
              <div className="mt-5 space-y-3">
                <input
                  value={githubUrl}
                  onChange={(event) => setGithubUrl(event.target.value)}
                  placeholder="GitHub URL, опционально"
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Заметка: что сделал, как запускать, что проверить"
                  rows={5}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
                <button disabled={saving} onClick={() => save('started')} className="w-full rounded-xl border border-gray-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-gray-500 disabled:opacity-50">
                  Сохранить прогресс
                </button>
                <button disabled={saving} onClick={() => save('completed')} className="btn-primary w-full justify-center disabled:opacity-50">
                  Отметить как решённое
                </button>
                {flash && <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">{flash}</p>}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
