'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api, type Exercise, type TrainerTopic } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import FlashcardsTab from './FlashcardsTab'
import { builtInTrainerConcepts, type BuiltInTrainerConcept } from '@/lib/trainerConcepts'

type View = 'concepts' | 'practice' | 'cards'

const viewOptions: Array<{ id: View; label: string; description: string }> = [
  { id: 'concepts', label: 'Концепты', description: 'Теория и практика по шагам' },
  { id: 'practice', label: 'Задачи', description: 'Закрепление без подсказок' },
  { id: 'cards', label: 'Карточки', description: 'Быстрое повторение' },
]

export default function TrainerPage() {
  const [view, setView] = useState<View>('concepts')
  const [topics, setTopics] = useState<TrainerTopic[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const { token, loadProgress, isCompleted } = useAuthStore()

  useEffect(() => {
    Promise.all([
      api.getTrainerTopics('core'),
      api.getExercises({ module: 'core' }),
    ]).then(([topicItems, exerciseItems]) => {
      setTopics([...topicItems].sort((a, b) => a.order - b.order))
      setExercises([...exerciseItems].sort((a, b) => a.order - b.order))
    }).finally(() => setLoading(false))

    if (token) loadProgress()
  }, [token, loadProgress])

  const completedExercises = useMemo(
    () => exercises.filter((exercise) => isCompleted('exercise', exercise.id)).length,
    [exercises, isCompleted]
  )

  const allConcepts: Array<TrainerTopic | BuiltInTrainerConcept> = topics.length > 0
    ? topics
    : builtInTrainerConcepts
  const concepts = allConcepts.map((topic) => ({
        title: topic.title,
        description: 'summary' in topic && typeof topic.summary === 'string'
          ? topic.summary
          : topic.explanation || 'Короткая теория, синтаксис, паттерн и задача для закрепления.',
        slug: topic.slug,
        category: topic.module === 'core' ? 'Go' : topic.module,
        exercises: topic.exercises?.length || 0,
      }))

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <section className="grid gap-8 border-b border-gray-800 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-300">
            Учись через практику
          </div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">Тренажёр Go</h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-400">
            Это отдельная рабочая зона от курса: здесь нет сюжетных спринтов, только короткая теория,
            паттерны, советы и практика по темам. Можно работать в песочнице на странице или повторять локально.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-400">
            <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1">Курс = путь и проекты</span>
            <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1">Тренажёр = темы и drills</span>
            <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1">Bootcamp = подписка и уровни</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 px-5 py-4">
          <div className="flex items-center justify-between gap-8 text-sm">
            <span className="text-gray-500">Задач решено</span>
            <span className="font-bold text-white">{completedExercises} / {exercises.length}</span>
          </div>
          <div className="mt-3 h-2 w-56 max-w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-violet-400 transition-all"
              style={{ width: `${exercises.length ? (completedExercises / exercises.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </section>

      <nav className="mt-8 grid gap-3 sm:grid-cols-3">
        {viewOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setView(option.id)}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              view === option.id
                ? 'border-violet-500/50 bg-violet-500/10'
                : 'border-gray-800 bg-gray-900 hover:border-gray-700'
            }`}
          >
            <p className={`font-bold ${view === option.id ? 'text-violet-300' : 'text-white'}`}>{option.label}</p>
            <p className="mt-1 text-xs text-gray-500">{option.description}</p>
          </button>
        ))}
      </nav>

      {view === 'concepts' && (
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Трек концептов</h2>
              <p className="mt-2 text-sm text-gray-500">Проходи сверху вниз: каждый урок опирается на предыдущий.</p>
            </div>
            <span className="text-sm text-gray-500">{concepts.length} тем</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-gray-900" />)}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
              {concepts.map((concept, index) => {
                const href = `/trainer/topic/${concept.slug}`

                return (
                  <Link
                    key={`${concept.title}-${index}`}
                    href={href}
                    className="group grid gap-4 border-b border-gray-800 p-5 transition-colors last:border-b-0 hover:bg-gray-800/70 sm:grid-cols-[48px_1fr_auto] sm:items-center"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-700 bg-gray-950 font-mono text-sm font-black text-violet-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-white transition-colors group-hover:text-violet-300">{concept.title}</h3>
                        <span className="rounded-full bg-gray-800 px-2.5 py-1 text-[11px] text-gray-500">{concept.category}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">{concept.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{concept.exercises || 1} практика</span>
                      <span className="text-lg text-gray-600 transition-colors group-hover:text-violet-300">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      )}

      {view === 'practice' && (
        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white">Самостоятельные задачи</h2>
            <p className="mt-2 text-sm text-gray-500">Используй после концептов, когда хочешь проверить себя без подробной теории.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {exercises.map((exercise) => {
              const completed = isCompleted('exercise', exercise.id)
              return (
                <Link
                  key={exercise.id}
                  href={`/trainer/${exercise.id}`}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-violet-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      completed ? 'bg-emerald-500/10 text-emerald-300' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {completed ? 'Выполнено' : exercise.difficulty}
                    </span>
                    <span className="font-mono text-xs text-gray-600">#{exercise.order}</span>
                  </div>
                  <h3 className="mt-5 font-bold text-white">{exercise.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">{exercise.description}</p>
                  <p className="mt-5 text-xs text-violet-300">{exercise.category} →</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {view === 'cards' && (
        <section className="mt-10">
          <FlashcardsTab />
        </section>
      )}
    </main>
  )
}
