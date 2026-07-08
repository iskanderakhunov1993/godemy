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
    return <main className="page-shell"><div className="page-wrap py-16 text-[#647067]">Загружаем проект...</div></main>
  }

  const completed = submission?.status === 'completed'

  return (
    <main className="page-shell">
      <section className="page-wrap py-10">
        <Link href={project.level === 'go-junior' ? '/go' : '/guide'} className="text-sm font-semibold text-[#647067] hover:text-[#17201d]">
          ← Назад к маршруту
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <article className="surface-card rounded-[28px] p-6 sm:p-8">
            <span className="eyebrow">{project.level === 'go-junior' ? 'Go Junior' : 'Free Go'} · {project.kind === 'checkpoint' ? 'Checkpoint' : 'Project'}</span>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#17201d]">{project.title}</h1>
            <p className="mt-4 text-lg leading-8 text-[#647067]">{project.description}</p>

            <div className="mt-6 terminal-panel">
              <div className="terminal-bar">
                <span className="terminal-dot bg-[#ff5f57]" />
                <span className="terminal-dot bg-[#ffbd2e]" />
                <span className="terminal-dot bg-[#28c840]" />
                <span className="ml-2 font-mono text-xs text-slate-400">project-brief.md</span>
              </div>
              <pre className="px-5 py-4 font-mono text-sm leading-7">
                <code>{`$ go mod init godemy/${project.slug}
$ go run .
status: self-check required`}</code>
              </pre>
            </div>

            {[
              ['Что сделать', project.requirements],
              ['Ожидаемый результат', project.expectedResult],
              ['Чек-лист проверки', project.checklist],
              ['Эталонное направление', project.solution],
            ].map(([title, text]) => (
              <section key={title} className="mt-5 rounded-2xl border border-[#dfe6dc] bg-[#f8faf4] p-5">
                <h2 className="text-lg font-black text-[#17201d]">{title}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#647067]">{text}</p>
              </section>
            ))}
          </article>

          <aside className="surface-card h-fit rounded-[28px] p-6">
            <div className={`rounded-2xl border p-4 ${completed ? 'border-emerald-300 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <p className={`font-mono text-xs font-bold uppercase tracking-[0.14em] ${completed ? 'text-emerald-700' : 'text-amber-700'}`}>
                {completed ? 'Выполнено' : 'Self-check'}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#647067]">
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
                  className="w-full rounded-xl border border-[#dfe6dc] bg-white px-4 py-3 text-sm text-[#17201d] outline-none focus:border-[#20d47b]"
                />
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Заметка: что сделал, как запускать, что проверить"
                  rows={5}
                  className="w-full rounded-xl border border-[#dfe6dc] bg-white px-4 py-3 text-sm text-[#17201d] outline-none focus:border-[#20d47b]"
                />
                <button disabled={saving} onClick={() => save('started')} className="w-full rounded-xl border border-[#dfe6dc] bg-white px-4 py-3 text-sm font-semibold text-[#3d4a44] hover:border-[#20d47b]/40 disabled:opacity-50">
                  Сохранить прогресс
                </button>
                <button disabled={saving} onClick={() => save('completed')} className="btn-primary w-full justify-center disabled:opacity-50">
                  Отметить как решённое
                </button>
                {flash && <p className="rounded-xl border border-[#b9d7c7] bg-[#effbf3] px-4 py-3 text-sm text-[#087a43]">{flash}</p>}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
