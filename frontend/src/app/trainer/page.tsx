'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { api, type Exercise, type TrainerTopic } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import FlashcardsTab from './FlashcardsTab'
import { builtInTrainerConcepts, type BuiltInTrainerConcept } from '@/lib/trainerConcepts'

type View = 'concepts' | 'practice' | 'cards'

type ConceptNode = {
  code: string
  title: string
  description: string
  slug: string
  category: string
  exercisesCount: number
  microSkills: string[]
  completed: boolean
  unlocked: boolean
  current: boolean
}

type MapRow = {
  items: ConceptNode[]
}

const viewOptions: Array<{ id: View; label: string; description: string }> = [
  { id: 'concepts', label: 'Маршрут', description: 'Проходи темы как связанный concept track' },
  { id: 'practice', label: 'Практика', description: 'Отдельные задачи для самостоятельного закрепления' },
  { id: 'cards', label: 'Повторение', description: 'Быстрые карточки для терминов и форм' },
]

const rowPattern = [1, 4, 2, 4, 3, 4]
const rowHeight = 148

export default function TrainerPage() {
  const [view, setView] = useState<View>('concepts')
  const [topics, setTopics] = useState<TrainerTopic[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [localConceptProgress, setLocalConceptProgress] = useState<Record<string, boolean>>({})
  const { token, loadProgress, isCompleted } = useAuthStore()

  useEffect(() => {
    Promise.all([
      api.getTrainerTopics('core'),
      api.getExercises({ module: 'core' }),
    ])
      .then(([topicItems, exerciseItems]) => {
        setTopics([...topicItems].sort((a, b) => a.order - b.order))
        setExercises([...exerciseItems].sort((a, b) => a.order - b.order))
      })
      .finally(() => setLoading(false))

    if (token) loadProgress()
  }, [token, loadProgress])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const nextProgress = Object.fromEntries(
      builtInTrainerConcepts.map((concept) => [
        concept.slug,
        window.localStorage.getItem(`trainer-concept-${concept.slug}`) === 'completed',
      ])
    )

    setLocalConceptProgress(nextProgress)
  }, [])

  const allConcepts: Array<TrainerTopic | BuiltInTrainerConcept> = topics.length > 0
    ? topics
    : builtInTrainerConcepts

  const conceptNodes = useMemo<ConceptNode[]>(() => {
    return allConcepts.map((topic, index) => {
      const builtInCompleted = localConceptProgress[topic.slug] ?? false
      const topicExercises = topic.exercises ?? []
      const remoteCompleted =
        topicExercises.length > 0 && topicExercises.every((exercise) => isCompleted('exercise', exercise.id))

      const completed = remoteCompleted || builtInCompleted
      const unlocked = index === 0 || allConcepts.slice(0, index).every((prevTopic) => {
        const prevExercises = prevTopic.exercises ?? []
        const prevBuiltIn = localConceptProgress[prevTopic.slug] ?? false
        const prevRemote =
          prevExercises.length > 0 && prevExercises.every((exercise) => isCompleted('exercise', exercise.id))

        return prevRemote || prevBuiltIn
      })

      return {
        code: 'conceptCode' in topic && typeof topic.conceptCode === 'string'
          ? topic.conceptCode
          : String(index + 1).padStart(2, '0'),
        title: topic.title,
        description: 'summary' in topic && typeof topic.summary === 'string'
          ? topic.summary
          : topic.explanation || 'Короткая теория, синтаксис, паттерн и задача для закрепления.',
        slug: topic.slug,
        category: topic.module === 'core' ? 'Go' : topic.module,
        exercisesCount: topic.exercises?.length || 1,
        microSkills: 'microSkills' in topic && Array.isArray(topic.microSkills)
          ? topic.microSkills.slice(0, 3)
          : [],
        completed,
        unlocked,
        current: unlocked && !completed,
      }
    })
  }, [allConcepts, isCompleted, localConceptProgress])

  const completedConcepts = conceptNodes.filter((concept) => concept.completed).length
  const currentConcept = conceptNodes.find((concept) => concept.current) ?? conceptNodes[0]
  const unlockedConcepts = conceptNodes.filter((concept) => concept.unlocked).length
  const completionPercent = conceptNodes.length
    ? Math.round((completedConcepts / conceptNodes.length) * 100)
    : 0

  const conceptRows = useMemo(() => buildRows(conceptNodes), [conceptNodes])
  const mapPoints = useMemo(() => buildMapPoints(conceptRows), [conceptRows])
  const conceptMapHeight = Math.max(520, conceptRows.length * rowHeight + 64)

  return (
    <main className="page-shell">
      <div className="page-wrap py-8 sm:py-10">
        <section className="section-frame rounded-[34px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div>
              <div className="flex flex-wrap items-start gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-violet-400/25 bg-white/[0.04] font-mono text-3xl font-black text-white shadow-[0_18px_40px_rgba(91,33,182,0.18)]">
                  Go
                </div>
                <div className="min-w-0 flex-1">
                  <span className="eyebrow">Trainer Journey</span>
                  <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
                    Твой маршрут по темам Go
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                    Мы перестраиваем тренажёр как живую карту пути: каждая тема открывает следующую,
                    теория связана с практикой, а человек визуально понимает, где он сейчас и что идёт дальше.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <SoftPill>Concept-first</SoftPill>
                    <SoftPill>Маленькие победы</SoftPill>
                    <SoftPill>Связанный прогресс</SoftPill>
                  </div>
                </div>
              </div>
            </div>

            <aside className="surface-card rounded-[30px] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-300">Прогресс по concept track</p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {completedConcepts} / {conceptNodes.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-200">
                  {completionPercent}%
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="mt-6 space-y-3 text-sm leading-6 text-slate-400">
                <p>Открыто тем: <span className="font-semibold text-slate-200">{unlockedConcepts}</span></p>
                <p>
                  Сейчас лучше всего идти в тему{' '}
                  <span className="font-semibold text-white">{currentConcept?.title ?? 'Basics'}</span>,
                  а потом закреплять её в quick lab.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <nav className="mt-8 grid gap-3 md:grid-cols-3">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setView(option.id)}
              className={`rounded-[24px] border px-5 py-4 text-left transition-all ${
                view === option.id
                  ? 'border-violet-400/30 bg-white/[0.08] shadow-[0_18px_40px_rgba(91,33,182,0.14)]'
                  : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]'
              }`}
            >
              <p className={`text-lg font-bold ${view === option.id ? 'text-white' : 'text-slate-200'}`}>{option.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">{option.description}</p>
            </button>
          ))}
        </nav>

        {view === 'concepts' && (
          <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="surface-card overflow-hidden rounded-[34px] p-5 sm:p-6">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="eyebrow">Learn Map</span>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">Concept graph</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                    Как в хороших concept-треках: темы ложатся друг на друга, открываются по мере прохождения
                    и визуально показывают зависимости, а не просто висят списком.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">
                  {conceptNodes.length} тем в маршруте
                </span>
              </div>

              {loading ? (
                <div className="h-[560px] animate-pulse rounded-[28px] bg-white/[0.04]" />
              ) : (
                <div
                  className="relative overflow-x-auto rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.08),_transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.76),rgba(2,6,23,0.9))] p-6"
                  style={{ minHeight: conceptMapHeight }}
                >
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox={`0 0 100 ${conceptRows.length * 18 + 16}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {mapPoints.map((point, index) => {
                      const next = mapPoints[index + 1]
                      if (!next) return null

                      const bend = (next.y - point.y) / 2
                      const path = [
                        `M ${point.x} ${point.y}`,
                        `C ${point.x} ${point.y + bend}`,
                        `${next.x} ${next.y - bend}`,
                        `${next.x} ${next.y}`,
                      ].join(' ')

                      return (
                        <path
                          key={`${point.slug}-${next.slug}`}
                          d={path}
                          fill="none"
                          stroke={next.unlocked ? 'rgba(103, 232, 249, 0.30)' : 'rgba(148, 163, 184, 0.16)'}
                          strokeDasharray="4 4"
                          strokeWidth="0.35"
                          strokeLinecap="round"
                        />
                      )
                    })}
                  </svg>

                  <div className="relative z-10 space-y-7">
                    {conceptRows.map((row, rowIndex) => (
                      <div
                        key={`row-${rowIndex}`}
                        className={`grid gap-4 ${
                          row.items.length === 1
                            ? 'mx-auto max-w-[280px] grid-cols-1'
                            : row.items.length === 2
                            ? 'grid-cols-1 md:grid-cols-2'
                            : row.items.length === 3
                            ? 'grid-cols-1 md:grid-cols-3'
                            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
                        }`}
                      >
                        {row.items.map((concept) => (
                          <ConceptMapNode key={concept.slug} concept={concept} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <SidebarCard
                title="Как проходить темы"
                eyebrow="Playbook"
                body="1. Открываешь текущую тему. 2. Читаешь короткую теорию и паттерн. 3. Делаешь quick lab. 4. Только потом карта раскрывает следующий шаг."
              />
              <SidebarCard
                title="Что значит locked"
                eyebrow="Progress Rules"
                body="Заблокированные темы не отвлекают раньше времени. Пользователь видит ближайший логичный шаг, а не весь лес материалов сразу."
              />
              {currentConcept && (
                <SidebarCard
                  title={`Сейчас лучше идти в ${currentConcept.title}`}
                  eyebrow="Current Focus"
                  body={currentConcept.description}
                  ctaHref={`/trainer/topic/${currentConcept.slug}`}
                  ctaLabel="Открыть тему"
                />
              )}
            </aside>
          </section>
        )}

        {view === 'practice' && (
          <section className="mt-10">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-white">Самостоятельные задачи</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Здесь уже меньше подсказок и больше самостоятельности. Хорошо заходить сюда после нескольких concept-тем.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {exercises.map((exercise) => {
                const completed = isCompleted('exercise', exercise.id)
                return (
                  <Link
                    key={exercise.id}
                    href={`/trainer/${exercise.id}`}
                    className="surface-card rounded-[28px] p-5 transition-all hover:-translate-y-0.5 hover:border-violet-400/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        completed
                          ? 'bg-emerald-400/12 text-emerald-200'
                          : 'bg-white/[0.04] text-slate-300'
                      }`}>
                        {completed ? 'Выполнено' : exercise.difficulty}
                      </span>
                      <span className="font-mono text-xs text-slate-500">#{exercise.order}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-white">{exercise.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-400">{exercise.description}</p>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">{exercise.category} →</p>
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

function buildRows(concepts: ConceptNode[]): MapRow[] {
  const rows: MapRow[] = []
  let cursor = 0
  let patternIndex = 0

  while (cursor < concepts.length) {
    const size = rowPattern[patternIndex % rowPattern.length]
    rows.push({ items: concepts.slice(cursor, cursor + size) })
    cursor += size
    patternIndex += 1
  }

  return rows
}

function buildMapPoints(rows: MapRow[]) {
  const points: Array<{ slug: string; x: number; y: number; unlocked: boolean }> = []

  rows.forEach((row, rowIndex) => {
    const total = row.items.length
    row.items.forEach((item, itemIndex) => {
      const x = total === 1 ? 50 : ((itemIndex + 0.5) / total) * 100
      const y = 12 + rowIndex * 18
      points.push({ slug: item.slug, x, y, unlocked: item.unlocked })
    })
  })

  return points
}

function ConceptMapNode({ concept }: { concept: ConceptNode }) {
  const state = concept.completed
    ? 'completed'
    : concept.unlocked
    ? 'unlocked'
    : 'locked'

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border font-mono text-sm font-black ${
          state === 'completed'
            ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100'
            : state === 'unlocked'
            ? 'border-violet-300/35 bg-violet-400/14 text-white'
            : 'border-white/10 bg-white/[0.03] text-slate-400'
        }`}>
          {concept.code}
        </div>

        <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
          state === 'completed'
            ? 'border-emerald-300/35 bg-emerald-400/12 text-emerald-200'
            : state === 'unlocked'
            ? 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200'
            : 'border-white/8 bg-white/[0.04] text-slate-500'
        }`}>
          {state === 'completed' ? '✓' : state === 'unlocked' ? '→' : '🔒'}
        </div>
      </div>

      <h3 className={`mt-4 text-lg font-bold ${
        state === 'locked' ? 'text-slate-300' : 'text-white'
      }`}>
        {concept.title}
      </h3>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
          {concept.category}
        </span>
        <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-400">
          {concept.exercisesCount} lab
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400 line-clamp-3">
        {concept.description}
      </p>

      {concept.microSkills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {concept.microSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </>
  )

  if (concept.unlocked) {
    return (
      <Link
        href={`/trainer/topic/${concept.slug}`}
        className={`group block rounded-[26px] border p-4 transition-all ${
          state === 'completed'
            ? 'border-emerald-400/20 bg-emerald-400/[0.07] hover:border-emerald-300/30'
            : 'border-white/10 bg-white/[0.05] hover:-translate-y-0.5 hover:border-violet-300/30 hover:bg-white/[0.07]'
        }`}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="rounded-[26px] border border-white/8 bg-white/[0.025] p-4 opacity-80">
      {content}
    </div>
  )
}

function SoftPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">
      {children}
    </span>
  )
}

function SidebarCard({
  eyebrow,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  eyebrow: string
  title: string
  body: string
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <div className="surface-card rounded-[28px] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{body}</p>
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} className="btn-secondary mt-5 inline-flex text-sm">
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
