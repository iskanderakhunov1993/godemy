'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api, Exercise, TrainerTopic } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import FlashcardsTab from './FlashcardsTab'
import BootcampPopup from '@/components/BootcampPopup'
import {
  getPratkorExercises,
  getPratkorProgress,
  getPratkorStatusMap,
  getStatusCount,
  type PratkorStatus,
} from '@/lib/pratkor'

type Tab = 'topics' | 'pratkor' | 'cards'
type PrakterFilter = 'all' | PratkorStatus

const difficulties = ['all', 'easy', 'medium', 'hard'] as const

const prakterStatusLabel: Record<PrakterFilter, string> = {
  all: 'Все',
  completed: 'Выполнено',
  in_progress: 'В прогрессе',
  available: 'Доступно',
  locked: 'Заблокировано',
}

const prakterStatusBadge: Record<PratkorStatus, string> = {
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  in_progress: 'border-violet-200 bg-violet-50 text-violet-700',
  available: 'border-slate-200 bg-slate-100 text-slate-700',
  locked: 'border-slate-200 bg-slate-50 text-slate-400',
}

const tabs: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'topics',  label: 'Разбор кода', icon: '📚', desc: 'Разбор примеров кода на Go' },
  { id: 'pratkor', label: 'Практер', icon: '🧩', desc: 'Трек упражнений в стиле Exercism на русском' },
  { id: 'cards',   label: 'Карточки',  icon: '🃏', desc: '20 вопросов по Go в стиле Anki' },
]

export default function TrainerPage() {
  const [tab, setTab] = useState<Tab>('topics')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [topics, setTopics] = useState<TrainerTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>('all')
  const [category, setCategory] = useState('all')
  const [prakterQuery, setPrakterQuery] = useState('')
  const [prakterFilter, setPrakterFilter] = useState<PrakterFilter>('all')
  const [prakterStatusMap, setPrakterStatusMap] = useState<Record<string, PratkorStatus>>({})
  const { token, loadProgress, isCompleted } = useAuthStore()
  const pratkorExercises = useMemo(() => getPratkorExercises(), [])
  const pratkorTotal = pratkorExercises.length

  useEffect(() => {
    Promise.all([
      api.getExercises({ module: 'core' }),
      api.getTrainerTopics('core'),
    ]).then(([exs, tops]) => {
      setExercises(exs)
      setTopics(tops)
    }).finally(() => setLoading(false))
    if (token) loadProgress()
  }, [token, loadProgress])

  const completedCount = exercises.filter((e) => isCompleted('exercise', e.id)).length

  useEffect(() => {
    const syncPrakterProgress = () => {
      const progress = getPratkorProgress()
      setPrakterStatusMap(getPratkorStatusMap(pratkorExercises, progress))
    }

    syncPrakterProgress()
    window.addEventListener('storage', syncPrakterProgress)
    return () => window.removeEventListener('storage', syncPrakterProgress)
  }, [pratkorExercises])

  const categories = ['all', ...new Set(exercises.map((e) => e.category))]
  const topicFallback = categories.filter((item) => item !== 'all').map((item) => ({
    title: item,
    count: exercises.filter((exercise) => exercise.category === item).length,
    teaser: exercises.find((exercise) => exercise.category === item)?.title || 'Практика по теме',
  }))

  const filtered = exercises.filter((e) => {
    const d = difficulty === 'all' || e.difficulty === difficulty
    const c = category === 'all' || e.category === category
    return d && c
  })

  const badgeClass = (d: string) => {
    if (d === 'easy') return 'badge-easy'
    if (d === 'medium') return 'badge-medium'
    return 'badge-hard'
  }

  const prakterCounts = useMemo(() => getStatusCount(prakterStatusMap), [prakterStatusMap])
  const prakterDone = prakterCounts.completed
  const prakterPercent = pratkorTotal > 0 ? Math.round((prakterDone / pratkorTotal) * 100) : 0

  const filteredPrakterExercises = useMemo(() => {
    const query = prakterQuery.trim().toLowerCase()

    return pratkorExercises.filter((item) => {
      const matchesQuery =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)

      if (!matchesQuery) {
        return false
      }

      if (prakterFilter === 'all') {
        return true
      }

      return prakterStatusMap[item.slug] === prakterFilter
    })
  }, [prakterFilter, prakterQuery, prakterStatusMap, pratkorExercises])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <BootcampPopup />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Тренажёр Go</h1>
        <p className="text-gray-400">Два инструмента для уверенного знания Go — задачи и карточки.</p>
        {!loading && exercises.length > 0 && (
          <div className="mt-4 flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">Задач решено</span>
                <span className="text-white font-bold">{completedCount} / {exercises.length}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700"
                  style={{ width: `${exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0}%` }}
                />
              </div>
            </div>
            {completedCount === 0 && (
              <span className="text-sm text-gray-500 flex-shrink-0">Начни с первой задачи →</span>
            )}
            {completedCount > 0 && completedCount < exercises.length && (
              <span className="text-sm text-violet-300 font-medium flex-shrink-0">
                {Math.round((completedCount / exercises.length) * 100)}%
              </span>
            )}
            {completedCount === exercises.length && (
              <span className="text-sm text-emerald-400 font-semibold flex-shrink-0">✓ Всё решено!</span>
            )}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-left p-4 rounded-xl border transition-all ${
              tab === t.id
                ? 'bg-violet-500/10 border-violet-500/50 text-gray-100'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{t.icon}</span>
              <span className="font-semibold text-sm">{t.label}</span>
              {tab === t.id && <span className="ml-auto w-2 h-2 rounded-full bg-violet-400" />}
            </div>
            <p className="text-xs text-gray-500">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Topics tab */}
      {tab === 'topics' && (
        <div className="space-y-3">
          <div className="mt-8">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Сложность:</span>
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                      difficulty === d
                        ? 'bg-violet-500 text-white font-semibold'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {d === 'all' ? 'Все' : d}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-gray-700 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Категория:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c === 'all' ? 'Все' : c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((exercise) => {
                  const completed = isCompleted('exercise', exercise.id)
                  return (
                    <Link
                      key={exercise.id}
                      href={`/trainer/${exercise.id}`}
                      className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-5 py-4 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-6 h-6 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            completed
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-gray-600 group-hover:border-violet-500'
                          }`}
                        >
                          {completed && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h3 className="font-semibold text-gray-100 group-hover:text-violet-300 transition-colors">
                              #{exercise.order}. {exercise.title}
                            </h3>
                            <span className={badgeClass(exercise.difficulty)}>{exercise.difficulty}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                              {exercise.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{exercise.description}</p>
                        </div>

                        <span className="text-gray-600 group-hover:text-gray-400">→</span>
                      </div>
                    </Link>
                  )
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    Нет задач по выбранным фильтрам
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prakter tab */}
      {tab === 'pratkor' && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-[#151232] p-5 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Практер: трек упражнений Go</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Каждая карточка ниже это отдельная задача. Всего: {pratkorTotal}.
                </p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-300">Общий прогресс</span>
                  <span className="font-semibold text-violet-300">{prakterDone}/{pratkorTotal} ({prakterPercent}%)</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                    style={{ width: `${prakterPercent}%` }}
                  />
                </div>
              </div>

              <input
                value={prakterQuery}
                onChange={(event) => setPrakterQuery(event.target.value)}
                placeholder="Поиск по задачам"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500"
              />

              <div className="flex flex-wrap items-center gap-2">
                {([
                  ['all', pratkorTotal],
                  ['completed', prakterCounts.completed],
                  ['in_progress', prakterCounts.in_progress],
                  ['available', prakterCounts.available],
                  ['locked', prakterCounts.locked],
                ] as Array<[PrakterFilter, number]>).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setPrakterFilter(key)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      prakterFilter === key
                        ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                        : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {prakterStatusLabel[key]} <span className="ml-1 font-semibold">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {filteredPrakterExercises.map((exercise) => {
                const status = prakterStatusMap[exercise.slug] || 'available'
                const isLocked = status === 'locked'

                return (
                  <Link
                    key={exercise.slug}
                    href={isLocked ? '#' : `/trainer/pratkor/${exercise.slug}`}
                    onClick={(event) => {
                      if (isLocked) {
                        event.preventDefault()
                      }
                    }}
                    className={`group flex gap-4 rounded-xl border px-5 py-4 transition-colors ${
                      isLocked
                        ? 'cursor-not-allowed border-slate-700/80 bg-slate-900/40'
                        : 'border-slate-700 bg-slate-900/70 hover:border-violet-500/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                      <span className="text-3xl">{exercise.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-violet-300 transition-colors">
                          {exercise.displayName}
                        </h3>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0 ${prakterStatusBadge[status]}`}>
                          {prakterStatusLabel[status]}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2">{exercise.category}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={badgeClass(exercise.difficulty)}>{exercise.difficulty}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {filteredPrakterExercises.length === 0 && (
                <div className="sm:col-span-2 rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400">
                  По текущим фильтрам задач не найдено.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Flashcards tab */}
      {tab === 'cards' && <FlashcardsTab />}

    </div>
  )
}

