'use client'

import { useMemo, useState } from 'react'
import {
  clearAdminPratkorExercises,
  getPratkorExercises,
  saveAdminPratkorExercises,
  type PratkorDifficulty,
  type PratkorExercise,
} from '@/lib/pratkor'

const ICON_OPTIONS = [
  '⚙️', '🔀', '🔁', '📝', '📦', '🏗️', '⚠️', '🔌', '⚡', '🏢',
  '🚀', '💎', '🎯', '🔧', '🎨', '📊', '🌟', '⚡', '🎪', '🎭'
]

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

interface PrakterExerciseForm {
  id: number
  slug: string
  title: string
  summary: string
  displayName: string
  icon: string
  difficulty: PratkorDifficulty
  category: string
  instructions: string
  starterCode: string
  requiredPatterns: string
}

function formFromExercise(exercise: PratkorExercise): PrakterExerciseForm {
  return {
    id: exercise.id,
    slug: exercise.slug,
    title: exercise.title,
    summary: exercise.summary,
    displayName: exercise.displayName,
    icon: exercise.icon,
    difficulty: exercise.difficulty,
    category: exercise.category,
    instructions: exercise.instructions.join('\n'),
    starterCode: exercise.starterCode,
    requiredPatterns: exercise.requiredPatterns.join('\n'),
  }
}

function buildDefaultForm(id: number): PrakterExerciseForm {
  return {
    id,
    slug: `pratkor-custom-${String(id).padStart(3, '0')}`,
    title: `Пользовательская задача ${id}`,
    summary: 'Новая задача практера',
    displayName: `Custom ${id}`,
    icon: '⚙️',
    difficulty: 'easy',
    category: 'functions',
    instructions: 'Опиши шаги выполнения задачи, каждый шаг с новой строки.',
    starterCode: 'package main\n\nfunc main() {\n\t// Write your solution here\n}\n',
    requiredPatterns: 'func\\s+main\\s*\\(',
  }
}

export default function AdminPrakterPage() {
  const [exercises, setExercises] = useState<PratkorExercise[]>(() => getPratkorExercises())
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => getPratkorExercises()[0]?.slug || null)
  const [isCreating, setIsCreating] = useState(false)
  const [query, setQuery] = useState('')
  const [showIconPicker, setShowIconPicker] = useState(false)

  const selectedExercise = useMemo(
    () => exercises.find((item) => item.slug === selectedSlug),
    [exercises, selectedSlug]
  )

  const nextId = useMemo(
    () => Math.max(0, ...exercises.map((item) => item.id)) + 1,
    [exercises]
  )

  const [formData, setFormData] = useState<PrakterExerciseForm>(() =>
    selectedExercise ? formFromExercise(selectedExercise) : buildDefaultForm(1)
  )

  const [testCode, setTestCode] = useState(formData.starterCode)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFormChange = (key: keyof PrakterExerciseForm, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))

    if (key === 'starterCode') {
      setTestCode(value)
    }
  }

  const syncFormWithExercise = (exercise: PratkorExercise) => {
    const next = formFromExercise(exercise)
    setFormData(next)
    setTestCode(next.starterCode)
    setTestResult(null)
  }

  const filteredExercises = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return exercises
    }

    return exercises.filter((item) =>
      item.displayName.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q)
    )
  }, [exercises, query])

  const persistExercises = (next: PratkorExercise[]) => {
    setExercises(next)
    saveAdminPratkorExercises(next)
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    setSelectedSlug(null)
    setShowIconPicker(false)
    setTestResult(null)
    const draft = buildDefaultForm(nextId)
    setFormData(draft)
    setTestCode(draft.starterCode)
  }

  const handleSelectExercise = (exercise: PratkorExercise) => {
    setIsCreating(false)
    setSelectedSlug(exercise.slug)
    setShowIconPicker(false)
    syncFormWithExercise(exercise)
  }

  const handleSave = () => {
    if (!formData.displayName.trim() || !formData.instructions.trim() || !formData.slug.trim()) {
      alert('Заполните все обязательные поля')
      return
    }

    const duplicateSlug = exercises.some(
      (item) => item.slug === formData.slug.trim() && item.id !== formData.id
    )
    if (duplicateSlug) {
      alert('Slug уже используется, укажите уникальный slug')
      return
    }

    const nextExercise: PratkorExercise = {
      id: formData.id,
      slug: formData.slug.trim(),
      title: formData.title.trim() || `Задача ${formData.id}`,
      summary: formData.summary.trim() || 'Новая задача практера',
      instructions: formData.instructions
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      category: formData.category.trim() || 'general',
      difficulty: formData.difficulty,
      starterCode: formData.starterCode,
      requiredPatterns: formData.requiredPatterns
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      displayName: formData.displayName.trim(),
      icon: formData.icon,
    }

    let nextList: PratkorExercise[]
    if (isCreating) {
      nextList = [...exercises, nextExercise].sort((a, b) => a.id - b.id)
      alert('✅ Новая задача создана')
    } else {
      nextList = exercises.map((item) => (item.id === nextExercise.id ? nextExercise : item))
      alert('✅ Задача обновлена')
    }

    persistExercises(nextList)
    setIsCreating(false)
    setSelectedSlug(nextExercise.slug)
  }

  const handleDelete = () => {
    if (isCreating || !selectedExercise) {
      return
    }

    if (!confirm(`Удалить задачу ${selectedExercise.displayName}?`)) {
      return
    }

    const next = exercises.filter((item) => item.id !== selectedExercise.id)
    persistExercises(next)

    if (next.length > 0) {
      const fallback = next[0]
      setSelectedSlug(fallback.slug)
      syncFormWithExercise(fallback)
    } else {
      handleCreateNew()
    }
  }

  const handleResetDefaults = () => {
    if (!confirm('Сбросить все изменения практера к стандартным 100 задачам?')) {
      return
    }

    clearAdminPratkorExercises()
    const defaults = getPratkorExercises()
    setExercises(defaults)

    if (defaults[0]) {
      setIsCreating(false)
      setSelectedSlug(defaults[0].slug)
      syncFormWithExercise(defaults[0])
    }
  }

  const handleTestCode = () => {
    const patterns = formData.requiredPatterns
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (patterns.length === 0) {
      setTestResult({ success: true, message: '✅ Нет обязательных паттернов, проверка пройдена.' })
      return
    }

    const missing = patterns.find((pattern) => {
      try {
        return !new RegExp(pattern, 'im').test(testCode)
      } catch {
        return !testCode.includes(pattern)
      }
    })

    setTestResult({
      success: !missing,
      message: missing
        ? `❌ Код не прошёл проверку. Не найден паттерн: ${missing}`
        : '✅ Код прошёл проверку по всем паттернам!',
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Админка Практера</h1>
            <p className="text-slate-400 text-sm mt-1">{exercises.length} задач · создавай, редактируй, удаляй</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateNew}
              className="rounded-lg bg-[#B8960A] hover:bg-[#B8960A] px-4 py-2 text-sm font-semibold transition-colors"
            >
              ➕ Новая задача
            </button>
            <button
              onClick={handleResetDefaults}
              className="rounded-lg border border-slate-700 hover:border-slate-500 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors"
            >
              ↺ Сбросить к стандартным
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="flex-1 overflow-hidden border-r border-slate-800">
          <div className="grid h-full grid-cols-[340px_1fr]">
            <aside className="border-r border-slate-800 p-4 overflow-y-auto">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по задачам"
                className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-[#FFD60A] focus:outline-none"
              />
              <div className="space-y-2">
                {filteredExercises.map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => handleSelectExercise(item)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                      selectedSlug === item.slug && !isCreating
                        ? 'border-[#FFD60A]/70 bg-[#FFD60A]/10'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-sm font-semibold text-slate-100 truncate">#{item.id} {item.displayName}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 truncate">{item.slug}</p>
                  </button>
                ))}
                {filteredExercises.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-6">Ничего не найдено</p>
                )}
              </div>
            </aside>

            <div className="overflow-y-auto px-8 py-6">
              <div className="max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-100">
                    {isCreating ? 'Создание новой задачи' : `Редактирование #${formData.id}`}
                  </h2>
                  <button
                    onClick={handleDelete}
                    disabled={isCreating || !selectedExercise}
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 enabled:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    🗑️ Удалить
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-200">ID</label>
                    <input
                      value={formData.id}
                      readOnly
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-200">Slug *</label>
                    <input
                      value={formData.slug}
                      onChange={(e) => handleFormChange('slug', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-[#FFD60A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">Отображаемое название *</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleFormChange('displayName', e.target.value)}
                    placeholder="Например: Echo, Raindrops, Leap..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-[#FFD60A] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">Внутренний title</label>
                  <input
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-[#FFD60A] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-200">Краткое описание</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleFormChange('summary', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-[#FFD60A] focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-200">Иконка</label>
                    <button
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3 text-2xl hover:border-[#FFD60A]/60 transition-colors"
                    >
                      {formData.icon}
                    </button>
                    {showIconPicker && (
                      <div className="grid grid-cols-5 gap-2 mt-2 p-3 bg-slate-900 border border-slate-700 rounded-lg">
                        {ICON_OPTIONS.map(icon => (
                          <button
                            key={icon}
                            onClick={() => {
                              handleFormChange('icon', icon)
                              setShowIconPicker(false)
                            }}
                            className="aspect-square text-2xl rounded hover:bg-slate-800 transition-colors"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-200">Сложность</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleFormChange('difficulty', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-100 focus:border-[#FFD60A] focus:outline-none"
                    >
                      {DIFFICULTIES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-200">Категория</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    placeholder="functions, loops, strings..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-[#FFD60A] focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-200">Инструкции * (каждая строка = шаг)</label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => handleFormChange('instructions', e.target.value)}
                    rows={8}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-[#FFD60A] focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-200">Паттерны проверки (по одному на строку)</label>
                  <textarea
                    value={formData.requiredPatterns}
                    onChange={(e) => handleFormChange('requiredPatterns', e.target.value)}
                    rows={4}
                    placeholder="func\\s+main\\s*\\("
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-[#FFD60A] focus:outline-none font-mono text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 rounded-lg bg-[#B8960A] hover:bg-[#B8960A] px-6 py-3 font-semibold transition-colors"
                  >
                    💾 {isCreating ? 'Создать задачу' : 'Сохранить изменения'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[35%] flex flex-col border-l border-slate-800 bg-slate-900/30">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-slate-100">Тестирование решения</h2>
            <p className="text-slate-400 text-xs mt-1">Напишите и проверьте решение</p>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-3">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Стартовый код</label>
              <textarea
                value={formData.starterCode}
                onChange={(e) => handleFormChange('starterCode', e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 text-xs font-mono resize-none focus:border-[#FFD60A] focus:outline-none"
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="block text-xs font-semibold text-slate-300">Решение</label>
              <div className="flex-1 rounded-lg border border-slate-700 bg-slate-900/70 overflow-hidden">
                <textarea
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  className="w-full h-full px-3 py-2 text-slate-100 text-xs font-mono bg-transparent resize-none focus:outline-none"
                  spellCheck="false"
                />
              </div>
            </div>

            <button
              onClick={handleTestCode}
              className="w-full rounded-lg bg-green-600 hover:bg-[#997A00] px-4 py-2 font-semibold text-sm transition-colors"
            >
              ▶️ Проверить по паттернам
            </button>

            {testResult && (
              <div className={`rounded-lg border px-4 py-3 text-sm ${
                testResult.success
                  ? 'border-[#FFD60A]/60 bg-[#FFD60A]/10 text-[#FFE44D]'
                  : 'border-red-500/60 bg-red-500/10 text-red-200'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
