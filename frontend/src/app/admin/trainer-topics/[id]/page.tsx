'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { adminApi, AdminTrainerTopic, AdminExercise } from '@/lib/api'

interface TopicExample {
  title: string
  code: string
  description: string
}

const emptyTopic: Omit<AdminTrainerTopic, 'id' | 'createdAt' | 'updatedAt'> = {
  module: 'core',
  title: '',
  slug: '',
  syntax: '',
  explanation: '',
  examples: JSON.stringify([
    { title: '', code: '', description: '' },
    { title: '', code: '', description: '' },
    { title: '', code: '', description: '' },
  ], null, 2),
  patterns: '',
  order: 0,
}

const tabs = ['Основное', 'Синтаксис', 'Объяснение', 'Примеры', 'Паттерны', 'Задания'] as const
type Tab = (typeof tabs)[number]

const inputCls = 'w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-cyan-500'
const labelCls = 'block text-sm text-gray-400 mb-1'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

export default function TrainerTopicEditorPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'
  const id = isNew ? null : Number(params.id)

  const [form, setForm] = useState<Omit<AdminTrainerTopic, 'id' | 'createdAt' | 'updatedAt'>>(emptyTopic)
  const [examples, setExamples] = useState<TopicExample[]>([
    { title: '', code: '', description: '' },
    { title: '', code: '', description: '' },
    { title: '', code: '', description: '' },
  ])
  const [linkedExercises, setLinkedExercises] = useState<AdminExercise[]>([])
  const [allExercises, setAllExercises] = useState<AdminExercise[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('Основное')

  const secret = typeof window !== 'undefined' ? sessionStorage.getItem('admin_secret') || '' : ''

  // Auto-generate slug from title
  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-+|-+$/g, '')

  useEffect(() => {
    adminApi.getExercises(secret).then(setAllExercises).catch(() => {})

    if (isNew) return
    adminApi
      .getTrainerTopic(secret, id!)
      .then(data => {
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = data
        setForm(rest)
        try {
          const parsed = JSON.parse(data.examples)
          if (Array.isArray(parsed)) setExamples(parsed)
        } catch { /* keep default */ }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [isNew, id, secret])

  // Load exercises linked to this topic
  useEffect(() => {
    if (isNew || !id) return
    adminApi.getExercises(secret).then(exs => {
      setLinkedExercises(exs.filter(e => e.trainerTopicId === id))
    }).catch(() => {})
  }, [isNew, id, secret])

  function handleChange(field: keyof typeof form, value: string | number) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && isNew) {
        next.slug = autoSlug(value as string)
      }
      return next
    })
  }

  function updateExample(index: number, field: keyof TopicExample, value: string) {
    setExamples(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function addExample() {
    setExamples(prev => [...prev, { title: '', code: '', description: '' }])
  }

  function removeExample(index: number) {
    setExamples(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Укажите название'); return }
    if (!form.slug.trim()) { setError('Укажите slug'); return }

    setSaving(true)
    setError('')
    const payload = { ...form, examples: JSON.stringify(examples) }

    try {
      if (isNew) {
        const created = await adminApi.createTrainerTopic(secret, payload)
        router.push(`/admin/trainer-topics/${created.id}`)
      } else {
        await adminApi.updateTrainerTopic(secret, id!, payload)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function linkExercise(exerciseId: number) {
    try {
      await adminApi.updateExercise(secret, exerciseId, { trainerTopicId: id! })
      setLinkedExercises(prev => {
        const ex = allExercises.find(e => e.id === exerciseId)
        return ex ? [...prev, { ...ex, trainerTopicId: id! }] : prev
      })
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  async function unlinkExercise(exerciseId: number) {
    try {
      await adminApi.updateExercise(secret, exerciseId, { trainerTopicId: undefined })
      setLinkedExercises(prev => prev.filter(e => e.id !== exerciseId))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  if (loading) return <div className="text-gray-400">Загрузка...</div>

  const unlinked = allExercises.filter(e => !linkedExercises.some(l => l.id === e.id) && !e.trainerTopicId)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/trainer-topics')}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Назад
        </button>
        <h1 className="text-2xl font-bold flex-1">
          {isNew ? 'Новая тема тренажёра' : `Тема: ${form.title || '…'}`}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Основное */}
      {activeTab === 'Основное' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Название темы *">
              <input
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                className={inputCls}
                placeholder="Срезы (slices)"
              />
            </Field>
          </div>
          <Field label="Slug (URL) *">
            <input
              value={form.slug}
              onChange={e => handleChange('slug', e.target.value)}
              className={`${inputCls} font-mono`}
              placeholder="slices"
            />
          </Field>
          <Field label="Модуль">
            <input
              value={form.module}
              onChange={e => handleChange('module', e.target.value)}
              className={inputCls}
              placeholder="core"
            />
          </Field>
          <Field label="Порядок">
            <input
              type="number"
              value={form.order}
              onChange={e => handleChange('order', Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>
      )}

      {/* Tab: Синтаксис */}
      {activeTab === 'Синтаксис' && (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">Краткий блок синтаксиса — отображается в начале темы моноширинным шрифтом.</p>
          <Field label="Синтаксис">
            <textarea
              value={form.syntax}
              onChange={e => handleChange('syntax', e.target.value)}
              rows={12}
              className={`${inputCls} font-mono resize-y`}
              placeholder={`// Объявление среза\nvar s []T\ns := []T{}\ns := make([]T, len)\ns := make([]T, len, cap)\n\n// Операции\nlen(s), cap(s)\ns = append(s, x)\ns[i:j]`}
            />
          </Field>
        </div>
      )}

      {/* Tab: Объяснение */}
      {activeTab === 'Объяснение' && (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">Простое объяснение темы — обычным языком, без сложных терминов.</p>
          <Field label="Объяснение">
            <textarea
              value={form.explanation}
              onChange={e => handleChange('explanation', e.target.value)}
              rows={12}
              className={`${inputCls} resize-y`}
              placeholder="Срез — это удобный способ работать с частью массива. Представь, что у тебя есть коробка с ячейками. Срез — это окошко, которое показывает часть этих ячеек..."
            />
          </Field>
        </div>
      )}

      {/* Tab: Примеры */}
      {activeTab === 'Примеры' && (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">3 практических примера с кодом и описанием. Советуем: базовый → типичный → продвинутый.</p>
          {examples.map((ex, i) => (
            <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Пример {i + 1}</span>
                {examples.length > 1 && (
                  <button onClick={() => removeExample(i)} className="text-xs text-red-400 hover:text-red-300">✕ Удалить</button>
                )}
              </div>
              <Field label="Заголовок примера">
                <input
                  value={ex.title}
                  onChange={e => updateExample(i, 'title', e.target.value)}
                  className={inputCls}
                  placeholder="Создание и добавление элементов"
                />
              </Field>
              <Field label="Код (Go)">
                <textarea
                  value={ex.code}
                  onChange={e => updateExample(i, 'code', e.target.value)}
                  rows={8}
                  className={`${inputCls} font-mono resize-y`}
                  placeholder={'package main\n\nimport "fmt"\n\nfunc main() {\n    s := []int{1, 2, 3}\n    s = append(s, 4)\n    fmt.Println(s) // [1 2 3 4]\n}'}
                />
              </Field>
              <Field label="Описание (что демонстрирует пример)">
                <input
                  value={ex.description}
                  onChange={e => updateExample(i, 'description', e.target.value)}
                  className={inputCls}
                  placeholder="Создаём срез из 3 чисел и добавляем 4-е через append"
                />
              </Field>
            </div>
          ))}
          <button
            onClick={addExample}
            className="px-4 py-2 border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded-lg text-sm transition-colors"
          >
            + Добавить пример
          </button>
        </div>
      )}

      {/* Tab: Паттерны */}
      {activeTab === 'Паттерны' && (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">Типичные паттерны использования — идиоматичные способы применения данной конструкции.</p>
          <Field label="Паттерны">
            <textarea
              value={form.patterns}
              onChange={e => handleChange('patterns', e.target.value)}
              rows={14}
              className={`${inputCls} resize-y`}
              placeholder={`Паттерн 1 — Фильтрация среза:\nresult := s[:0]\nfor _, v := range s {\n    if condition(v) {\n        result = append(result, v)\n    }\n}\n\nПаттерн 2 — Копирование:\ndst := make([]T, len(src))\ncopy(dst, src)`}
            />
          </Field>
        </div>
      )}

      {/* Tab: Задания */}
      {activeTab === 'Задания' && (
        <div className="space-y-6">
          {isNew ? (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-4 py-3 text-yellow-300 text-sm">
              Сначала сохраните тему, затем привяжите задания.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">Привяжите 5–10 упражнений для закрепления темы.</p>
                <span className="text-sm text-gray-400">{linkedExercises.length} привязано</span>
              </div>

              {/* Linked */}
              {linkedExercises.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">Привязанные задания</h3>
                  {linkedExercises.map(ex => (
                    <div key={ex.id} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5">
                      <span className={`text-xs font-medium w-12 ${
                        ex.difficulty === 'easy' ? 'text-green-400' : ex.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                      }`}>{ex.difficulty}</span>
                      <span className="flex-1 text-sm text-white">{ex.title}</span>
                      <span className="text-xs text-gray-500">{ex.category}</span>
                      <button
                        onClick={() => unlinkExercise(ex.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Отвязать
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Available to link */}
              {unlinked.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400">Доступные упражнения (без темы)</h3>
                  {unlinked.slice(0, 30).map(ex => (
                    <div key={ex.id} className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2.5 hover:border-gray-700 transition-colors">
                      <span className={`text-xs font-medium w-12 ${
                        ex.difficulty === 'easy' ? 'text-green-400' : ex.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                      }`}>{ex.difficulty}</span>
                      <span className="flex-1 text-sm text-gray-300">{ex.title}</span>
                      <span className="text-xs text-gray-500">{ex.category}</span>
                      <button
                        onClick={() => linkExercise(ex.id)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        + Привязать
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Footer save */}
      <div className="pt-4 border-t border-gray-800 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? 'Сохранение...' : 'Сохранить тему'}
        </button>
      </div>
    </div>
  )
}
