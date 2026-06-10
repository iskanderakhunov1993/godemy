'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Check,
  Dumbbell,
  Layers3,
  LockKeyhole,
  Map as MapIcon,
  Play,
  Sparkles,
} from 'lucide-react'
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

type MapRow = { items: ConceptNode[] }
type MapPoint = ConceptNode & { x: number; y: number; width: number }
type MapEdge = { from: MapPoint; to: MapPoint }

const viewOptions: Array<{ id: View; label: string; description: string }> = [
  { id: 'concepts', label: 'Маршрут', description: 'Проходи темы как связанный concept track' },
  { id: 'practice', label: 'Практика', description: 'Отдельные задачи для самостоятельного закрепления' },
  { id: 'cards', label: 'Повторение', description: 'Быстрые карточки для терминов и форм' },
]

const rowPattern = [1, 4, 2, 4, 3, 4]
const mapWidth = 960
const mapRowGap = 132

export default function TrainerPage() {
  const [view, setView] = useState<View>('concepts')
  const [topics, setTopics] = useState<TrainerTopic[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [localConceptProgress] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {}

    return Object.fromEntries(
      builtInTrainerConcepts.map((concept) => [
        concept.slug,
        window.localStorage.getItem(`trainer-concept-${concept.slug}`) === 'completed',
      ])
    )
  })
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
      .catch(() => {
        setTopics([])
        setExercises([])
      })
      .finally(() => setLoading(false))

    if (token) loadProgress()
  }, [token, loadProgress])

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
  const mapEdges = useMemo(() => buildMapEdges(conceptRows, mapPoints), [conceptRows, mapPoints])
  const conceptMapHeight = Math.max(500, 96 + conceptRows.length * mapRowGap)

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#1d2143]">
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12">
        <section className="flex flex-col gap-8 border-b border-[#e2e5f0] pb-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#dfe3f1] bg-white shadow-[0_12px_30px_rgba(50,45,120,0.10)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5b4fd6] font-mono text-xl font-black text-white">
                Go
              </div>
              <Sparkles className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-[#eaf8dc] p-1 text-[#4c9c21]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#625b92]">Go learning track</p>
              <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Твой путь через Go</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666b86] sm:text-base">
                Изучай концепции по порядку, закрепляй их практикой и открывай следующие темы.
              </p>
            </div>
          </div>

          <div className="w-full rounded-lg border border-[#e1e3ee] bg-white p-4 shadow-[0_8px_24px_rgba(50,45,120,0.06)] lg:w-[310px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-[#777c98]">Прогресс маршрута</p>
                <p className="mt-1 text-xl font-extrabold">{completedConcepts} из {conceptNodes.length} тем</p>
              </div>
              <span className="text-lg font-extrabold text-[#5b4fd6]">{completionPercent}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eceefa]">
              <div
                className="h-full rounded-full bg-[#5b4fd6] transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-[#777c98]">
              Открыто: {unlockedConcepts}. Текущая тема: {currentConcept?.title ?? 'Basics'}.
            </p>
          </div>
        </section>

        <nav className="mt-7 flex gap-1 overflow-x-auto border-b border-[#e2e5f0]">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setView(option.id)}
              className={`flex min-w-max items-center gap-3 border-b-2 px-4 py-4 text-left ${
                view === option.id
                  ? 'border-[#5b4fd6] text-[#5b4fd6]'
                  : 'border-transparent text-[#6d7190] hover:text-[#343858]'
              }`}
            >
              {option.id === 'concepts' && <MapIcon className="h-5 w-5" />}
              {option.id === 'practice' && <Dumbbell className="h-5 w-5" />}
              {option.id === 'cards' && <Layers3 className="h-5 w-5" />}
              <span className="font-bold">{option.label}</span>
            </button>
          ))}
        </nav>

        {view === 'concepts' && (
          <section className="mt-10">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-[#777c98]">Карта обучения</p>
                <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Концепции Go</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d7190]">
                  Связи показывают рекомендуемый порядок. Заверши текущую тему, чтобы открыть следующий уровень.
                </p>
              </div>
              {currentConcept && (
                <Link
                  href={`/trainer/topic/${currentConcept.slug}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#5b4fd6] px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(91,79,214,0.24)] hover:bg-[#4f43c8]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Продолжить
                </Link>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-[#dfe2ee] bg-white shadow-[0_16px_45px_rgba(50,45,120,0.07)]">
              <div className="flex items-center justify-between border-b border-[#e8eaf2] px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-[#343858]">Маршрут изучения</p>
                  <p className="mt-0.5 text-xs text-[#8589a1]">{conceptNodes.length} тем, {unlockedConcepts} доступны сейчас</p>
                </div>
                <BookOpen className="h-5 w-5 text-[#8b8fa8]" />
              </div>

              {loading ? (
                <div className="h-[520px] animate-pulse bg-[#f4f5fa]" />
              ) : (
                <>
                  <div className="space-y-3 bg-[#fbfcff] p-4 md:hidden">
                    {conceptNodes.map((concept, index) => (
                      <ConceptListNode
                        key={concept.slug}
                        concept={concept}
                        isLast={index === conceptNodes.length - 1}
                      />
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto bg-[#fbfcff] md:block">
                  <div
                    className="relative mx-auto"
                    style={{ width: mapWidth, height: conceptMapHeight }}
                  >
                    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                      {mapEdges.map(({ from, to }) => {
                        const fromY = from.y + 46
                        const toY = to.y
                        const bend = Math.max(42, (toY - fromY) * 0.58)
                        return (
                        <path
                          key={`${from.slug}-${to.slug}`}
                          d={`M ${from.x} ${fromY} C ${from.x} ${fromY + bend}, ${to.x} ${toY - bend}, ${to.x} ${toY}`}
                          fill="none"
                          stroke={to.unlocked ? '#aaa4ec' : '#ccd4ed'}
                          strokeDasharray="6 6"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        )
                      })}
                    </svg>

                    {mapPoints.map((concept) => (
                      <ConceptMapNode
                        key={concept.slug}
                        concept={concept}
                        style={{
                          left: concept.x - concept.width / 2,
                          top: concept.y,
                          width: concept.width,
                        }}
                      />
                    ))}
                  </div>
                </div>
                </>
              )}
            </div>
          </section>
        )}

        {view === 'practice' && (
          <section className="mt-10">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-[#1d2143]">Самостоятельные задачи</h2>
              <p className="mt-2 text-sm leading-6 text-[#6d7190]">
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
                    className="rounded-lg border border-[#dfe2ee] bg-white p-5 shadow-[0_8px_24px_rgba(50,45,120,0.05)] hover:-translate-y-0.5 hover:border-[#b8b2ef]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        completed
                          ? 'bg-[#e7f7dd] text-[#3f7e20]'
                          : 'bg-[#eeedf9] text-[#625b92]'
                      }`}>
                        {completed ? 'Выполнено' : exercise.difficulty}
                      </span>
                      <span className="font-mono text-xs text-[#8b8fa8]">#{exercise.order}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-[#272b50]">{exercise.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#6d7190]">{exercise.description}</p>
                    <p className="mt-5 text-xs font-bold uppercase text-[#5b4fd6]">{exercise.category} →</p>
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

function buildMapPoints(rows: MapRow[]): MapPoint[] {
  const points: MapPoint[] = []

  rows.forEach((row, rowIndex) => {
    const total = row.items.length
    row.items.forEach((item, itemIndex) => {
      const width = total === 1 ? 190 : total === 2 ? 210 : 180
      const sidePadding = total === 4 ? 120 : total === 3 ? 170 : total === 2 ? 250 : mapWidth / 2
      const usableWidth = mapWidth - sidePadding * 2
      const x = total === 1
        ? mapWidth / 2
        : sidePadding + (usableWidth * itemIndex) / (total - 1)
      const y = 58 + rowIndex * mapRowGap
      points.push({ ...item, x, y, width })
    })
  })

  return points
}

function buildMapEdges(rows: MapRow[], points: MapPoint[]): MapEdge[] {
  const pointBySlug = new Map(points.map((point) => [point.slug, point]))
  const edges: MapEdge[] = []

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const previous = rows[rowIndex - 1].items
    const current = rows[rowIndex].items

    current.forEach((item, itemIndex) => {
      const to = pointBySlug.get(item.slug)
      if (!to) return

      const parentIndex = Math.min(
        previous.length - 1,
        Math.floor((itemIndex * previous.length) / Math.max(1, current.length))
      )
      const parent = pointBySlug.get(previous[parentIndex].slug)
      if (parent) edges.push({ from: parent, to })

      if (previous.length > 1 && current.length <= 2) {
        const secondParentIndex = Math.min(previous.length - 1, parentIndex + 1)
        const secondParent = pointBySlug.get(previous[secondParentIndex].slug)
        if (secondParent && secondParent.slug !== parent?.slug) {
          edges.push({ from: secondParent, to })
        }
      }
    })
  }

  return edges
}

function ConceptMapNode({
  concept,
  style,
}: {
  concept: ConceptNode
  style: CSSProperties
}) {
  const state = concept.completed
    ? 'completed'
    : concept.unlocked
    ? 'unlocked'
    : 'locked'

  const content = (
    <>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-[11px] font-bold ${
          state === 'completed'
            ? 'border-[#70a852] bg-[#e9f7e1] text-[#3f7e20]'
            : state === 'unlocked'
            ? 'border-[#5b4fd6] bg-white text-[#312b79]'
            : 'border-[#b8bdd1] bg-[#f8f9fd] text-[#737894]'
        }`}>
          {concept.code}
        </div>

      <div className="min-w-0 flex-1">
        <h3 className={`truncate text-sm font-bold ${
          state === 'locked' ? 'text-[#686d89]' : 'text-[#343858]'
        }`}>
          {concept.title}
        </h3>
        <p className="mt-0.5 text-[11px] text-[#8b8fa8]">
          {concept.exercisesCount} {concept.exercisesCount === 1 ? 'упражнение' : 'упражнения'}
        </p>
      </div>

      <div className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border ${
          state === 'completed'
            ? 'border-[#b9d9a8] bg-[#e9f7e1] text-[#3f7e20]'
            : state === 'unlocked'
            ? 'border-[#cac6f3] bg-[#eeecff] text-[#5b4fd6]'
            : 'border-[#d9dce8] bg-[#e9ebf3] text-[#777c98]'
        }`}>
        {state === 'completed' ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : state === 'unlocked' ? (
          <Play className="h-3 w-3 fill-current" />
        ) : (
          <LockKeyhole className="h-3 w-3" />
        )}
      </div>
    </>
  )

  if (concept.unlocked) {
    return (
      <Link
        href={`/trainer/topic/${concept.slug}`}
        style={style}
        title={concept.description}
        className={`group absolute z-10 flex min-h-[64px] items-center gap-3 rounded-md border px-3 py-2.5 shadow-[0_6px_16px_rgba(54,50,110,0.08)] ${
          state === 'completed'
            ? 'border-[#cde3c0] bg-[#f4fbf0] hover:border-[#91bd78]'
            : 'border-[#d9d8ec] bg-[#efeff8] hover:-translate-y-0.5 hover:border-[#8e86e4] hover:bg-white'
        }`}
      >
        {content}
      </Link>
    )
  }

  return (
    <div
      style={style}
      title={concept.description}
      className="absolute z-10 flex min-h-[64px] items-center gap-3 rounded-md border border-[#e0e2ec] bg-[#f1f2f7] px-3 py-2.5 opacity-90"
    >
      {content}
    </div>
  )
}

function ConceptListNode({
  concept,
  isLast,
}: {
  concept: ConceptNode
  isLast: boolean
}) {
  const state = concept.completed
    ? 'completed'
    : concept.unlocked
    ? 'unlocked'
    : 'locked'

  const row = (
    <div className="relative flex items-center gap-3">
      {!isLast && (
        <span className="absolute left-[15px] top-10 h-8 border-l border-dashed border-[#cbd2e8]" />
      )}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-[11px] font-bold ${
        state === 'completed'
          ? 'border-[#70a852] bg-[#e9f7e1] text-[#3f7e20]'
          : state === 'unlocked'
          ? 'border-[#5b4fd6] bg-white text-[#312b79]'
          : 'border-[#c7cad8] bg-[#f1f2f7] text-[#777c98]'
      }`}>
        {concept.code}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-bold ${state === 'locked' ? 'text-[#777c98]' : 'text-[#343858]'}`}>
          {concept.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#8b8fa8]">{concept.description}</p>
      </div>
      {state === 'completed' ? (
        <Check className="h-4 w-4 text-[#4c8b2c]" />
      ) : state === 'unlocked' ? (
        <Play className="h-4 w-4 fill-current text-[#5b4fd6]" />
      ) : (
        <LockKeyhole className="h-4 w-4 text-[#9a9eb1]" />
      )}
    </div>
  )

  if (concept.unlocked) {
    return (
      <Link
        href={`/trainer/topic/${concept.slug}`}
        className="block rounded-md border border-[#dddfea] bg-white p-3 shadow-[0_4px_14px_rgba(50,45,120,0.05)]"
      >
        {row}
      </Link>
    )
  }

  return <div className="rounded-md border border-[#e3e5ed] bg-[#f5f6fa] p-3">{row}</div>
}
