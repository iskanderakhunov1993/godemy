'use client'

import { useEffect, useState } from 'react'
import { adminApi, type AdminProject } from '@/lib/api'

const emptyProject: Omit<AdminProject, 'id' | 'createdAt' | 'updatedAt'> = {
  kind: 'free_project',
  level: 'free-go',
  slug: '',
  title: '',
  description: '',
  requirements: '',
  expectedResult: '',
  checklist: '',
  solution: '',
  order: 0,
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [selected, setSelected] = useState<AdminProject | null>(null)
  const [form, setForm] = useState(emptyProject)
  const [saving, setSaving] = useState(false)

  async function load() {
    setProjects(await adminApi.getProjects(''))
  }

  useEffect(() => {
    adminApi.getProjects('').then(setProjects)
  }, [])

  function edit(project: AdminProject) {
    setSelected(project)
    setForm({
      kind: project.kind,
      level: project.level,
      slug: project.slug,
      title: project.title,
      description: project.description,
      requirements: project.requirements,
      expectedResult: project.expectedResult,
      checklist: project.checklist,
      solution: project.solution,
      order: project.order,
    })
  }

  async function save() {
    setSaving(true)
    try {
      if (selected) {
        await adminApi.updateProject('', selected.id, form)
      } else {
        await adminApi.createProject('', form)
      }
      setSelected(null)
      setForm(emptyProject)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    await adminApi.deleteProject('', id)
    await load()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <section>
        <h1 className="text-2xl font-bold text-white">Проекты</h1>
        <p className="mt-2 text-sm text-gray-500">Self-check проекты для бесплатного курса, Bootcamp и checkpoint.</p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Название</th>
                <th className="px-4 py-3 text-left">Level</th>
                <th className="px-4 py-3 text-left">Kind</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {projects.map((project) => (
                <tr key={project.id} className="bg-gray-950">
                  <td className="px-4 py-3 text-white">{project.title}</td>
                  <td className="px-4 py-3 text-gray-400">{project.level}</td>
                  <td className="px-4 py-3 text-gray-400">{project.kind}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => edit(project)} className="text-cyan-300 hover:text-cyan-200">Редактировать</button>
                    <button onClick={() => remove(project.id)} className="ml-4 text-red-300 hover:text-red-200">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-lg font-bold text-white">{selected ? 'Редактировать проект' : 'Новый проект'}</h2>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as AdminProject['level'] })} className="rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white">
              <option value="free-go">free-go</option>
              <option value="go-junior">go-junior</option>
            </select>
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as AdminProject['kind'] })} className="rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white">
              <option value="free_project">free_project</option>
              <option value="bootcamp_project">bootcamp_project</option>
              <option value="checkpoint">checkpoint</option>
            </select>
          </div>
          {(['title', 'slug', 'description', 'requirements', 'expectedResult', 'checklist', 'solution'] as const).map((field) => (
            <textarea
              key={field}
              value={String(form[field] || '')}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              rows={field === 'title' || field === 'slug' ? 1 : 3}
              placeholder={field}
              className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
            />
          ))}
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
          />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.title || !form.slug} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50">
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
            <button onClick={() => { setSelected(null); setForm(emptyProject) }} className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300">
              Сбросить
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
