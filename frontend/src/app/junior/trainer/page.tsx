'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, Exercise } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  JUNIOR_SPRINTS,
  TASKS_PER_SPRINT,
  buildSprintMap,
  canValidateCapstone,
  getNextUnlockedExerciseId,
} from '@/lib/juniorSprint'

const difficulties = ['all', 'easy', 'medium', 'hard'] as const

export default function JuniorTrainerPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>('all')
  const [category, setCategory] = useState('all')
  const { token, loadProgress, isCompleted, user } = useAuthStore()
  const [, setCapstoneVersion] = useState(0)

  useEffect(() => {
    api.getExercises({ module: 'bootcamp' }).then(setExercises).finally(() => setLoading(false))
    if (token) loadProgress()
  }, [token, loadProgress])

  const capstoneValidated =
    !!user &&
    typeof window !== 'undefined' &&
    (() => {
      const key = `junior-capstone-${user.id}`
      return localStorage.getItem(key) === 'passed'
    })()

  const nextUnlockedExerciseId = getNextUnlockedExerciseId(exercises, isCompleted)
  const visibleExercises = exercises.filter((exercise) => {
    return isCompleted('exercise', exercise.id) || exercise.id === nextUnlockedExerciseId
  })

  const categories = ['all', ...new Set(visibleExercises.map((e) => e.category))]

  const filtered = visibleExercises.filter((e) => {
    const d = difficulty === 'all' || e.difficulty === difficulty
    const c = category === 'all' || e.category === category
    return d && c
  })

  const sprintMap = buildSprintMap(filtered, isCompleted)
  const totalCount = filtered.length
  const totalCompleted = filtered.filter((e) => isCompleted('exercise', e.id)).length
  const canRunCapstone = canValidateCapstone(sprintMap)

  const handleValidateCapstone = () => {
    if (!user || !canRunCapstone) return
    const key = `junior-capstone-${user.id}`
    localStorage.setItem(key, 'passed')
    setCapstoneVersion((prev) => prev + 1)
  }

  const badgeClass = (d: string) => {
    if (d === 'easy') return 'badge-easy'
    if (d === 'medium') return 'badge-medium'
    return 'badge-hard'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20 mb-3">
          3 модуль
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Junior Trainer</h1>
        <p className="text-gray-400">Практика задач уровня junior.</p>
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Общий прогресс</span>
            <span className="text-[#FFD60A] font-semibold">{totalCompleted}/{totalCount}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFD60A]"
              style={{ width: `${totalCount > 0 ? (totalCompleted / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Сложность:</span>
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${difficulty === d ? 'bg-[#FFD60A] text-gray-950 font-semibold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
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
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-[#FFD60A]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'Все' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {!token && (
        <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Сначала войди, чтобы сохранять прогресс и открывать следующую задачу.
          <Link href="/auth/login" className="ml-2 font-semibold text-amber-300 hover:text-white transition-colors">
            Войти
          </Link>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.length === 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 text-sm text-gray-400">
              По текущим фильтрам пока нет доступных задач.
            </div>
          )}

          {JUNIOR_SPRINTS.map((sprint) => {
            const block = sprintMap[sprint]
            if (!block || block.items.length === 0) return null
            const progressValue = block.total > 0 ? (block.completed / block.total) * 100 : 0

            return (
              <section key={sprint} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Sprint {sprint}</h3>
                    <p className="text-xs text-gray-500">Проект + 5 примеров + 2 задачи закрепления</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    Прогресс: <span className="text-[#FFD60A] font-semibold">{block.completed}/{block.total || TASKS_PER_SPRINT}</span>
                  </div>
                </div>

                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-[#FFD60A]" style={{ width: `${progressValue}%` }} />
                </div>

                <div className="space-y-3">
                  {block.items.map((exercise) => {
                    const completed = isCompleted('exercise', exercise.id)
                    const isCurrentStep = nextUnlockedExerciseId === exercise.id && !completed

                    const content = (
                      <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${completed ? 'bg-[#FFD60A] border-[#FFD60A]' : 'border-gray-600'}`}>
                          {completed && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h4 className="font-semibold text-white">
                              #{exercise.order}. {exercise.title}
                            </h4>
                            <span className={badgeClass(exercise.difficulty)}>{exercise.difficulty}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                              {exercise.category}
                            </span>
                            {isCurrentStep && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20">
                                Открыта сейчас
                              </span>
                            )}
                            {completed && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20">
                                Пройдено
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{exercise.description}</p>
                        </div>

                        <span className="text-gray-600">→</span>
                      </div>
                    )

                    return (
                      <Link
                        key={exercise.id}
                        href={`/junior/trainer/${exercise.id}`}
                        className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-5 py-4 transition-colors group"
                      >
                        {content}
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}

          <section className="card border-[#FFD60A]/20">
            <h3 className="text-xl font-semibold text-white mb-2">Capstone Validation</h3>
            <p className="text-sm text-gray-400 mb-3">
              Новая практическая задача открывается только после успешного прохождения предыдущей. Финальная валидация откроется после завершения всей цепочки.
            </p>

            <div className="grid sm:grid-cols-2 gap-2 text-sm mb-4">
              {JUNIOR_SPRINTS.map((s) => {
                const block = sprintMap[s]
                const done = !!block && block.total > 0 && block.completed === block.total
                return (
                  <div
                    key={s}
                    className={`rounded-lg px-3 py-2 border ${done ? 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/20' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                  >
                    Sprint {s}: {done ? 'готов' : 'не завершён'}
                  </div>
                )
              })}
            </div>

            {capstoneValidated ? (
              <div className="text-sm bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20 rounded-lg px-3 py-2">
                Capstone validation пройдена. Junior-модуль завершен.
              </div>
            ) : (
              <button
                onClick={handleValidateCapstone}
                disabled={!canRunCapstone || !user}
                className="btn-primary disabled:opacity-50"
              >
                Валидировать финальный проект
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
