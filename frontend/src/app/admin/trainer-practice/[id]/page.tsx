'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminApi, type AdminExercise } from '@/lib/api'
import {
  buildDefaultTrainerLayout,
  parseTrainerLayout,
  type TrainerPracticeLayout,
} from '@/lib/trainerPractice'

function toEditorValue(layout: TrainerPracticeLayout): TrainerPracticeLayout {
  return {
    title: layout.title || '',
    theme: layout.theme || '',
    heroDescription: layout.heroDescription || '',
    firstExample: layout.firstExample || { title: '', code: '', result: '' },
    shortTheory: layout.shortTheory || '',
    syntax: layout.syntax || '',
    implementations: layout.implementations || [],
    pattern: layout.pattern || '',
    taskSectionTitle: layout.taskSectionTitle || '',
    tasks: layout.tasks || [],
  }
}

export default function TrainerPracticeEditorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)
  const secret = ''

  const [exercise, setExercise] = useState<AdminExercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [layout, setLayout] = useState<TrainerPracticeLayout>({ tasks: [] })

  useEffect(() => {
    adminApi
      .getExercise(secret, id)
      .then((data) => {
        setExercise(data)
        setLayout(toEditorValue(parseTrainerLayout(data)))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, secret])

  const previewJson = useMemo(() => JSON.stringify(layout, null, 2), [layout])

  const updateTask = (index: number, field: 'title' | 'description' | 'placeholder', value: string) => {
    setLayout((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task, taskIndex) =>
        taskIndex === index ? { ...task, [field]: value } : task
      ),
    }))
  }

  const updateTaskPatterns = (
    index: number,
    field: 'requiredPatterns' | 'forbiddenPatterns',
    value: string
  ) => {
    const patterns = value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    setLayout((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task, taskIndex) =>
        taskIndex === index ? { ...task, [field]: patterns } : task
      ),
    }))
  }

  const addTask = () => {
    setLayout((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          title: 'Новая mini-задача',
          description: '',
          placeholder: 'func Solve() {}',
          requiredPatterns: [],
          forbiddenPatterns: [],
        },
      ],
    }))
  }

  const removeTask = (index: number) => {
    setLayout((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, taskIndex) => taskIndex !== index),
    }))
  }

  const handleSave = async () => {
    if (!exercise) {
      return
    }

    setSaving(true)
    setError('')

    try {
      await adminApi.updateExercise(secret, exercise.id, {
        trainerLayout: JSON.stringify(layout),
      })
      router.push('/admin/trainer-practice')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = () => {
    if (!exercise) {
      return
    }
    setLayout(toEditorValue(buildDefaultTrainerLayout(exercise)))
  }

  if (loading) return <div className="text-gray-400">Загрузка...</div>
  if (!exercise) return <div className="text-red-400">Упражнение не найдено</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/trainer-practice')}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Назад
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Практика: {exercise.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            Здесь редактируется отдельный формат страницы `/trainer/[id]` с теорией, примерами, строгими mini-проверками и хранением прогресса.
          </p>
        </div>
        <button
          onClick={resetToDefault}
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
        >
          Сбросить к шаблону
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {error ? (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <section className="space-y-4 rounded-xl border border-gray-700 bg-gray-900 p-5">
          <Field label="Заголовок страницы">
            <input
              value={layout.title || ''}
              onChange={(e) => setLayout((prev) => ({ ...prev, title: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Подзаголовок / тема">
            <input
              value={layout.theme || ''}
              onChange={(e) => setLayout((prev) => ({ ...prev, theme: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Hero описание">
            <textarea
              value={layout.heroDescription || ''}
              onChange={(e) => setLayout((prev) => ({ ...prev, heroDescription: e.target.value }))}
              rows={4}
              className={`${inputCls} resize-y`}
            />
          </Field>
          <Field label="Короткая теория">
            <textarea
              value={layout.shortTheory || ''}
              onChange={(e) => setLayout((prev) => ({ ...prev, shortTheory: e.target.value }))}
              rows={5}
              className={`${inputCls} resize-y`}
            />
          </Field>
          <Field label="Синтаксис (код)">
            <textarea
              value={layout.syntax || ''}
              onChange={(e) => setLayout((prev) => ({ ...prev, syntax: e.target.value }))}
              rows={10}
              className={`${inputCls} font-mono resize-y`}
            />
          </Field>
          <Field label="Паттерн решения">
            <textarea
              value={layout.pattern || ''}
              onChange={(e) => setLayout((prev) => ({ ...prev, pattern: e.target.value }))}
              rows={8}
              className={`${inputCls} font-mono resize-y`}
            />
          </Field>

          <div className="rounded-xl border border-gray-700 bg-gray-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Mini-задачи</h2>
              <button onClick={addTask} className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm transition-colors">
                + Добавить
              </button>
            </div>
            {layout.tasks.map((task, index) => (
              <div key={`${task.title}-${index}`} className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium text-white">Задача {index + 1}</h3>
                  <button
                    onClick={() => removeTask(index)}
                    className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Удалить
                  </button>
                </div>
                <Field label="Заголовок">
                  <input value={task.title} onChange={(e) => updateTask(index, 'title', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Описание">
                  <textarea value={task.description || ''} onChange={(e) => updateTask(index, 'description', e.target.value)} rows={3} className={`${inputCls} resize-y`} />
                </Field>
                <Field label="Placeholder / шаблон">
                  <textarea value={task.placeholder} onChange={(e) => updateTask(index, 'placeholder', e.target.value)} rows={8} className={`${inputCls} font-mono resize-y`} />
                </Field>
                <Field label="Обязательные regex-паттерны, по одному в строке">
                  <textarea
                    value={task.requiredPatterns.join('\n')}
                    onChange={(e) => updateTaskPatterns(index, 'requiredPatterns', e.target.value)}
                    rows={5}
                    className={`${inputCls} font-mono resize-y`}
                  />
                </Field>
                <Field label="Запрещенные regex-паттерны, по одному в строке">
                  <textarea
                    value={(task.forbiddenPatterns || []).join('\n')}
                    onChange={(e) => updateTaskPatterns(index, 'forbiddenPatterns', e.target.value)}
                    rows={4}
                    className={`${inputCls} font-mono resize-y`}
                  />
                </Field>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-700 bg-gray-900 p-5">
          <h2 className="text-lg font-semibold mb-3">JSON preview</h2>
          <textarea value={previewJson} readOnly rows={34} className={`${inputCls} font-mono resize-y`} />
        </section>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-violet-500 text-sm'
