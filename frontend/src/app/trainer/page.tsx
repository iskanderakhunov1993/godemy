'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { api, type Exercise, type TrainerTopic } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import FlashcardsTab from './FlashcardsTab'
import { builtInTrainerConcepts, type BuiltInTrainerConcept } from '@/lib/trainerConcepts'

type View = 'concepts' | 'practice' | 'cards'

const viewOptions: Array<{ id: View; label: string; description: string }> = [
  { id: 'concepts', label: 'Понять', description: 'Короткая теория, синтаксис и паттерны' },
  { id: 'practice', label: 'Закрепить', description: 'Самостоятельные задачи без лишних подсказок' },
  { id: 'cards', label: 'Повторить', description: 'Быстрое повторение терминов и форм' },
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
  const concepts = allConcepts.map((topic, index) => ({
        code: 'conceptCode' in topic && typeof topic.conceptCode === 'string'
          ? topic.conceptCode
          : String(index + 1).padStart(2, '0'),
        title: topic.title,
        description: 'summary' in topic && typeof topic.summary === 'string'
          ? topic.summary
          : topic.explanation || 'Короткая теория, синтаксис, паттерн и задача для закрепления.',
        slug: topic.slug,
        category: topic.module === 'core' ? 'Go' : topic.module,
        exercises: topic.exercises?.length || 0,
        microSkills: 'microSkills' in topic && Array.isArray(topic.microSkills)
          ? topic.microSkills.slice(0, 3)
          : [],
      }))

  return (
    <main className="min-h-screen bg-[#f5f6ff]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[28px] border border-[#d9dcfb] bg-white px-6 py-7 shadow-[0_18px_60px_rgba(79,70,229,0.08)] sm:px-8">
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border-[3px] border-[#2b237c] bg-[#f7f8ff] font-mono text-3xl font-black text-[#2b237c]">
                Go
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight text-[#20184a] sm:text-5xl">Concepts</h1>
                  <span className="rounded-full border border-[#cfd4ff] bg-[#eef1ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#5850d6]">
                    Go track
                  </span>
                </div>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[#5f6283] sm:text-lg">
                  Здесь мы изучаем Go так, чтобы человек не застревал в теории. Каждая тема — это
                  короткое объяснение, паттерн, живые примеры и потом упражнение на закрепление,
                  как в хорошем concept-треке.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill>Сначала понять</Pill>
                  <Pill>Потом попробовать</Pill>
                  <Pill>И сразу закрепить</Pill>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[28px] border border-[#d9dcfb] bg-white px-6 py-7 shadow-[0_18px_60px_rgba(79,70,229,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#5f6283]">Прогресс по тренажёру</p>
                <p className="mt-1 text-3xl font-black text-[#20184a]">{completedExercises} / {exercises.length || concepts.length}</p>
              </div>
              <div className="rounded-2xl bg-[#f5f6ff] px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6f63ff]">
                Practice
              </div>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#eceffd]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6f63ff] to-[#8ab4ff] transition-all"
                style={{ width: `${(exercises.length || concepts.length) ? (completedExercises / (exercises.length || concepts.length)) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-6 space-y-3 text-sm text-[#5f6283]">
              <p>Тренажёр — это отдельная зона от курса: без перегруза, с простыми кусками теории.</p>
              <p>Идеальный сценарий: открыть тему, разобраться за 10–15 минут и сразу закрепить в quick lab.</p>
            </div>
          </aside>
        </section>

        <nav className="mt-8 grid gap-3 md:grid-cols-3">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setView(option.id)}
              className={`rounded-[24px] border px-5 py-4 text-left transition-all ${
                view === option.id
                  ? 'border-[#7467ff] bg-white shadow-[0_10px_30px_rgba(111,99,255,0.12)]'
                  : 'border-[#d9dcfb] bg-[#f7f8ff] hover:border-[#c7cbf7] hover:bg-white'
              }`}
            >
              <p className={`text-lg font-black ${view === option.id ? 'text-[#2b237c]' : 'text-[#3a3567]'}`}>{option.label}</p>
              <p className="mt-1 text-sm leading-6 text-[#666b8e]">{option.description}</p>
            </button>
          ))}
        </nav>

      {view === 'concepts' && (
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#20184a]">Concept track</h2>
              <p className="mt-2 text-sm leading-6 text-[#666b8e]">
                Идём как в Exercism: у каждой темы есть простое объяснение, кодовые паттерны и
                упражнения, которые открываются по мере движения.
              </p>
            </div>
            <span className="text-sm font-semibold text-[#666b8e]">{concepts.length} тем</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-36 animate-pulse rounded-[28px] bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                {concepts.map((concept, index) => {
                const href = `/trainer/topic/${concept.slug}`

                return (
                  <Link
                    key={`${concept.title}-${index}`}
                    href={href}
                    className="group block rounded-[28px] border border-[#d9dcfb] bg-white p-5 shadow-[0_12px_36px_rgba(79,70,229,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#8a80ff] hover:shadow-[0_18px_44px_rgba(79,70,229,0.12)]"
                  >
                    <div className="grid gap-5 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-start">
                      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[24px] border-[3px] border-[#2b237c] bg-[#f7f8ff] font-mono text-2xl font-black text-[#2b237c]">
                        {concept.code}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-2xl font-black tracking-tight text-[#20184a] transition-colors group-hover:text-[#4e46c8]">
                            {concept.title}
                          </h3>
                          <span className="rounded-full border border-[#d8dcff] bg-[#f5f6ff] px-2.5 py-1 text-[11px] font-semibold text-[#666b8e]">
                            {concept.category}
                          </span>
                          <span className="rounded-full border border-[#d8dcff] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#666b8e]">
                            {concept.exercises || 1} exercise
                          </span>
                        </div>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f6283]">{concept.description}</p>
                        {concept.microSkills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {concept.microSkills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-[#d8dcff] bg-[#f7f8ff] px-3 py-1 text-xs font-medium text-[#545a84]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-end">
                        <span className="rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-bold text-[#5a52d5]">
                          Открыть →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
                })}
              </div>

              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <SidebarCard
                  title="Как проходить темы"
                  eyebrow="Playbook"
                  body="1. Читаешь идею простым языком. 2. Смотришь паттерн. 3. Делаешь упражнение в quick lab. 4. Идёшь дальше только после маленькой победы."
                />
                <SidebarCard
                  title="Что внутри каждой темы"
                  eyebrow="Structure"
                  body="About → синтаксис → паттерн → частые ошибки → мини-практика. Мы убираем лишнее и оставляем только то, что реально помогает писать код."
                />
              </aside>
            </div>
          )}
        </section>
      )}

      {view === 'practice' && (
        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-[#20184a]">Самостоятельные задачи</h2>
            <p className="mt-2 text-sm leading-6 text-[#666b8e]">
              Здесь уже меньше объяснений и больше самостоятельности. Отлично подходит после concept track.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {exercises.map((exercise) => {
              const completed = isCompleted('exercise', exercise.id)
              return (
                <Link
                  key={exercise.id}
                  href={`/trainer/${exercise.id}`}
                  className="rounded-[28px] border border-[#d9dcfb] bg-white p-5 shadow-[0_12px_36px_rgba(79,70,229,0.08)] transition-all hover:border-[#8a80ff] hover:shadow-[0_18px_44px_rgba(79,70,229,0.12)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      completed ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f5f6ff] text-[#666b8e]'
                    }`}>
                      {completed ? 'Выполнено' : exercise.difficulty}
                    </span>
                    <span className="font-mono text-xs text-[#8b90b3]">#{exercise.order}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-black text-[#20184a]">{exercise.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#5f6283]">{exercise.description}</p>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#5a52d5]">{exercise.category} →</p>
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
      </div>
    </main>
  )
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#d8dcff] bg-[#f7f8ff] px-3 py-1.5 text-xs font-semibold text-[#5f6283]">
      {children}
    </span>
  )
}

function SidebarCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-[28px] border border-[#d9dcfb] bg-white p-5 shadow-[0_12px_36px_rgba(79,70,229,0.08)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6f63ff]">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-black text-[#20184a]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#5f6283]">{body}</p>
    </div>
  )
}
