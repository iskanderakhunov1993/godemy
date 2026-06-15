'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Check,
  ChevronRight,
  CircleDot,
  Dumbbell,
  Layers3,
  LockKeyhole,
  Play,
} from 'lucide-react'
import { api, type Exercise } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import FlashcardsTab from './FlashcardsTab'
import type { BuiltInTrainerConcept } from '@/lib/trainerConcepts'
import { getGoConceptCategory, goConceptRoadmap } from '@/lib/goConceptRoadmap'

type View = 'concepts' | 'practice' | 'cards'

type ConceptNode = {
  code: string
  title: string
  description: string
  slug: string
  category: string
  microSkills: string[]
  completed: boolean
  unlocked: boolean
  current: boolean
}

type ConceptGroup = {
  category: string
  concepts: ConceptNode[]
  completedCount: number
  unlockedCount: number
}

const viewOptions: Array<{ id: View; label: string; description: string }> = [
  { id: 'concepts', label: 'Концепции', description: 'Рабочий маршрут по трём проектам' },
  { id: 'practice', label: 'Практика', description: 'Самостоятельные backend-задачи' },
  { id: 'cards', label: 'Повторение', description: 'Быстрые карточки для закрепления' },
]

const categoryMeta: Record<string, { ticket: string; mission: string }> = {
  Foundations: { ticket: 'ZERO-FOUND', mission: 'Подготовить основу Project 1' },
  Logic: { ticket: 'ZERO-LOGIC', mission: 'Реализовать бизнес-решения' },
  Functions: { ticket: 'ZERO-FUNC', mission: 'Разделить код на рабочие блоки' },
  'Working With Data': { ticket: 'ZERO-DATA', mission: 'Описать данные продукта' },
  'Packages & Project Organization': { ticket: 'ZERO-ORG', mission: 'Собрать командный Go-проект' },
  'Error Handling': { ticket: 'ZERO-ERR', mission: 'Сделать ошибки управляемыми' },
  'Files & Data Storage': { ticket: 'ZERO-FILE', mission: 'Сохранить данные локально' },
  'HTTP & APIs': { ticket: 'ZERO-HTTP', mission: 'Понять контракт API' },
  Environment: { ticket: 'ZERO-ENV', mission: 'Вынести настройки из кода' },
  'Backend Development': { ticket: 'ZERO-BACK', mission: 'Собрать HTTP-сервис' },
  Database: { ticket: 'ZERO-DB', mission: 'Подключить PostgreSQL' },
  'Testing & Debugging': { ticket: 'ZERO-QA', mission: 'Найти и доказать ошибки' },
  Docker: { ticket: 'ZERO-DOCKER', mission: 'Упаковать сервис' },
  'Career / Real Work': { ticket: 'ZERO-TEAM', mission: 'Передать работу команде' },
}

export default function TrainerPage() {
  const [view, setView] = useState<View>('concepts')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [localConceptProgress] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}

    return Object.fromEntries(
      goConceptRoadmap.map((concept) => [
        concept.slug,
        window.localStorage.getItem(`trainer-concept-${concept.slug}`) === 'completed',
      ])
    )
  })
  const { token, loadProgress, isCompleted } = useAuthStore()

  useEffect(() => {
    api.getExercises({ module: 'core' })
      .then((exerciseItems) => setExercises([...exerciseItems].sort((a, b) => a.order - b.order)))
      .catch(() => setExercises([]))
      .finally(() => setLoading(false))

    if (token) loadProgress()
  }, [token, loadProgress])

  const allConcepts: BuiltInTrainerConcept[] = goConceptRoadmap

  const conceptNodes = useMemo<ConceptNode[]>(() => {
    return allConcepts.map((topic, index) => {
      const builtInCompleted = localConceptProgress[topic.slug] ?? false
      const topicExercises = topic.exercises ?? []
      const remoteCompleted =
        topicExercises.length > 0 && topicExercises.every((exercise) => isCompleted('exercise', exercise.id))
      const completed = remoteCompleted || builtInCompleted
      const unlocked = index === 0 || allConcepts.slice(0, index).every((previous) => {
        const previousExercises = previous.exercises ?? []
        const previousRemote =
          previousExercises.length > 0
          && previousExercises.every((exercise) => isCompleted('exercise', exercise.id))

        return previousRemote || (localConceptProgress[previous.slug] ?? false)
      })

      return {
        code: topic.conceptCode || String(index + 1).padStart(2, '0'),
        title: topic.title,
        description: topic.summary || topic.explanation,
        slug: topic.slug,
        category: getGoConceptCategory(topic.slug),
        microSkills: topic.microSkills.slice(0, 3),
        completed,
        unlocked,
        current: unlocked && !completed,
      }
    })
  }, [allConcepts, isCompleted, localConceptProgress])

  const conceptGroups = useMemo<ConceptGroup[]>(() => {
    const groups = new Map<string, ConceptNode[]>()
    for (const concept of conceptNodes) {
      const items = groups.get(concept.category) ?? []
      items.push(concept)
      groups.set(concept.category, items)
    }

    return Array.from(groups, ([category, concepts]) => ({
      category,
      concepts,
      completedCount: concepts.filter((concept) => concept.completed).length,
      unlockedCount: concepts.filter((concept) => concept.unlocked).length,
    }))
  }, [conceptNodes])

  const completedConcepts = conceptNodes.filter((concept) => concept.completed).length
  const currentConcept = conceptNodes.find((concept) => concept.current) ?? conceptNodes[0]
  const currentGroupIndex = Math.max(
    0,
    conceptGroups.findIndex((group) => group.category === currentConcept?.category)
  )
  const completionPercent = conceptNodes.length
    ? Math.round((completedConcepts / conceptNodes.length) * 100)
    : 0

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.13),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(139,92,246,0.14),transparent_30%),#0a1020]">
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <div className="border-b border-white/8 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                Project ZERO · Knowledge Base
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 font-mono text-lg font-black text-cyan-200">
                  Go
                </div>
                <div>
                  <p className="text-xs text-gray-500">Инженерная база стажёра</p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Концепции Go</h1>
                </div>
              </div>
              <p className="mt-5 max-w-md text-sm leading-6 text-gray-400">
                Только знания, которые нужны, чтобы выпустить три проекта. Без академического обхода языка по кругу.
              </p>

              <div className="mt-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Готовность базы</p>
                    <p className="mt-1 text-2xl font-semibold">{completionPercent}%</p>
                  </div>
                  <p className="text-right text-xs leading-5 text-gray-500">
                    {completedConcepts} из {conceptNodes.length} закрыто
                    <br />
                    раздел {currentGroupIndex + 1} из {conceptGroups.length}
                  </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 transition-all duration-700"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-violet-400/12 px-2.5 py-1 font-mono text-xs text-violet-300">
                    {categoryMeta[currentConcept?.category]?.ticket ?? 'ZERO-GO'}
                  </span>
                  <span className="text-xs text-gray-500">{currentConcept?.category}</span>
                </div>
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-medium text-amber-200">
                  Текущая задача
                </span>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="text-xs font-medium text-cyan-300">
                    {categoryMeta[currentConcept?.category]?.mission ?? 'Продолжить инженерный маршрут'}
                  </p>
                  <h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight sm:text-3xl">
                    {currentConcept?.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                    {currentConcept?.description}
                  </p>
                </div>
                {currentConcept && (
                  <Link
                    href={`/trainer/topic/${currentConcept.slug}`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 text-sm font-bold text-slate-950 shadow-[0_12px_35px_rgba(34,211,238,0.18)] hover:-translate-y-0.5 hover:bg-cyan-200"
                  >
                    Открыть задачу
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="mt-7 grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-3">
                {currentConcept?.microSkills.map((skill, index) => (
                  <div key={skill} className="flex items-start gap-2 text-xs leading-5 text-gray-400">
                    <span className="mt-1 font-mono text-[10px] text-cyan-300">0{index + 1}</span>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <nav className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-white/8 bg-white/[0.025] p-1.5">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              className={`flex min-w-max flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left ${
                view === option.id
                  ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                  : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
              }`}
            >
              {option.id === 'concepts' && <BookOpen className="h-5 w-5" />}
              {option.id === 'practice' && <Dumbbell className="h-5 w-5" />}
              {option.id === 'cards' && <Layers3 className="h-5 w-5" />}
              <span>
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 hidden text-[11px] text-gray-500 md:block">{option.description}</span>
              </span>
            </button>
          ))}
        </nav>

        {view === 'concepts' && (
          <section className="mt-9">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">Рабочий backlog</p>
                <h2 className="mt-2 text-2xl font-semibold">14 разделов инженерной базы</h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-gray-500">
                Каждый раздел закрывает конкретную потребность проекта. Иди по порядку и открывай следующую задачу после проверки текущей.
              </p>
            </div>

            {loading ? (
              <div className="mt-6 h-[520px] animate-pulse rounded-3xl border border-white/8 bg-white/[0.025]" />
            ) : (
              <div className="mt-6 space-y-4">
                {conceptGroups.map((group, groupIndex) => (
                  <ConceptSection
                    key={group.category}
                    group={group}
                    index={groupIndex}
                    active={groupIndex === currentGroupIndex}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {view === 'practice' && (
          <section className="mt-9">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">Practice Queue</p>
                <h2 className="mt-2 text-2xl font-semibold">Самостоятельные задачи</h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-gray-500">
                Здесь меньше подсказок: бери задачу после concept card и проверяй, можешь ли применить форму решения самостоятельно.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {exercises.map((exercise) => {
                const completed = isCompleted('exercise', exercise.id)
                return (
                  <Link
                    key={exercise.id}
                    href={`/trainer/${exercise.id}`}
                    className="group rounded-3xl border border-white/8 bg-white/[0.025] p-5 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        completed
                          ? 'bg-emerald-400/10 text-emerald-300'
                          : 'bg-violet-400/10 text-violet-300'
                      }`}>
                        {completed ? 'Готово' : exercise.difficulty}
                      </span>
                      <span className="font-mono text-xs text-gray-600">TASK-{String(exercise.order).padStart(2, '0')}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{exercise.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{exercise.description}</p>
                    <p className="mt-5 flex items-center gap-1 text-xs font-semibold text-cyan-300">
                      Взять задачу <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {view === 'cards' && (
          <section className="mt-9">
            <FlashcardsTab />
          </section>
        )}
      </div>
    </main>
  )
}

function ConceptSection({
  group,
  index,
  active,
}: {
  group: ConceptGroup
  index: number
  active: boolean
}) {
  const complete = group.completedCount === group.concepts.length
  const locked = group.unlockedCount === 0
  const meta = categoryMeta[group.category]

  return (
    <article className={`overflow-hidden rounded-3xl border ${
      active
        ? 'border-cyan-300/30 bg-cyan-300/[0.035] shadow-[0_18px_60px_rgba(34,211,238,0.06)]'
        : complete
          ? 'border-emerald-400/20 bg-emerald-400/[0.025]'
          : 'border-white/8 bg-white/[0.02]'
    }`}>
      <div className="grid gap-4 border-b border-white/8 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border font-mono text-xs font-bold ${
          active
            ? 'border-cyan-300/30 bg-cyan-300 text-slate-950'
            : complete
              ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
              : 'border-white/10 bg-white/5 text-gray-500'
        }`}>
          {complete ? <Check className="h-5 w-5" /> : String(index + 1).padStart(2, '0')}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-300">{meta?.ticket}</span>
            {active && <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">Сейчас</span>}
          </div>
          <h3 className="mt-1 text-lg font-semibold">{group.category}</h3>
          <p className="mt-1 text-sm text-gray-500">{meta?.mission}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-medium text-gray-300">{group.completedCount}/{group.concepts.length} задач</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8 sm:w-28">
            <div
              className={`h-full rounded-full ${complete ? 'bg-emerald-400' : 'bg-cyan-300'}`}
              style={{ width: `${(group.completedCount / group.concepts.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
        {group.concepts.map((concept) => (
          <ConceptTaskCard key={concept.slug} concept={concept} sectionLocked={locked} />
        ))}
      </div>
    </article>
  )
}

function ConceptTaskCard({
  concept,
  sectionLocked,
}: {
  concept: ConceptNode
  sectionLocked: boolean
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={`font-mono text-[11px] font-bold ${
          concept.completed ? 'text-emerald-300' : concept.unlocked ? 'text-cyan-300' : 'text-gray-600'
        }`}>
          GO-{concept.code}
        </span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${
          concept.completed
            ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
            : concept.current
              ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-200'
              : 'border-white/8 bg-white/[0.03] text-gray-600'
        }`}>
          {concept.completed ? (
            <Check className="h-3.5 w-3.5" />
          ) : concept.current ? (
            <CircleDot className="h-3.5 w-3.5" />
          ) : (
            <LockKeyhole className="h-3.5 w-3.5" />
          )}
        </span>
      </div>
      <h4 className={`mt-4 min-h-12 text-sm font-semibold leading-6 ${
        concept.unlocked ? 'text-white' : 'text-gray-500'
      }`}>
        {concept.title}
      </h4>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-600">{concept.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-3">
        <span className="text-[10px] uppercase tracking-[0.14em] text-gray-600">
          {concept.completed ? 'Закрыто' : concept.current ? 'В работе' : 'В очереди'}
        </span>
        {concept.unlocked && <Play className="h-3.5 w-3.5 fill-current text-cyan-300" />}
      </div>
    </>
  )

  if (concept.unlocked) {
    return (
      <Link
        href={`/trainer/topic/${concept.slug}`}
        className="group rounded-2xl border border-white/10 bg-[#0b1222] p-4 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-[#0d1729]"
      >
        {content}
      </Link>
    )
  }

  return (
    <div
      title={sectionLocked ? 'Сначала закрой предыдущий раздел' : 'Сначала закрой предыдущую задачу'}
      className="rounded-2xl border border-white/[0.055] bg-black/10 p-4 opacity-75"
    >
      {content}
    </div>
  )
}
