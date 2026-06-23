'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import CodeEditor from '@/components/trainer/CodeEditor'
import OutputPanel from '@/components/trainer/OutputPanel'
import { api, type RunResult } from '@/lib/api'
import {
  getPratkorExerciseBySlug,
  getPratkorExercises,
  getPratkorProgress,
  type PratkorProgress,
  getPratkorStatusMap,
  savePratkorProgress,
  validatePratkorSolution,
} from '@/lib/pratkor'

const monoClassName = 'font-mono'
const monoFontFamily = '"JetBrains Mono", "Fira Code", ui-monospace, monospace'

export default function PratkorExercisePage() {
  const { slug } = useParams<{ slug: string }>()

  const exercises = useMemo(() => getPratkorExercises(), [])
  const exercise = useMemo(() => getPratkorExerciseBySlug(slug), [slug])
  const [progress, setProgress] = useState<PratkorProgress>(() => getPratkorProgress())
  const statusMap = useMemo(() => getPratkorStatusMap(exercises, progress), [exercises, progress])
  const currentStatus = exercise ? statusMap[exercise.slug] : 'locked'
  const isLocked = currentStatus === 'locked'

  const [code, setCode] = useState(() => {
    if (!exercise) {
      return ''
    }

    return progress.drafts[exercise.slug] || exercise.starterCode
  })
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [checking, setChecking] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const isCompleted = currentStatus === 'completed'

  const handleCodeChange = (value: string) => {
    if (!exercise || isLocked) {
      setCode(value)
      return
    }

    const next = {
      ...progress,
      drafts: {
        ...progress.drafts,
        [exercise.slug]: value,
      },
    }

    setCode(value)
    setProgress(next)
    savePratkorProgress(next)
  }

  const handleRun = async () => {
    setRunning(true)
    setResult(null)
    try {
      const response = await api.runCode(code)
      setResult(response)
    } catch (error) {
      setResult({ output: '', error: (error as Error).message, passed: false })
    } finally {
      setRunning(false)
    }
  }

  const handleCheck = async () => {
    if (!exercise) {
      return
    }

    setChecking(true)
    const passed = validatePratkorSolution(code, exercise)

    if (passed) {
      const completedSet = new Set(progress.completedSlugs)
      completedSet.add(exercise.slug)

      const next = {
        completedSlugs: Array.from(completedSet),
        drafts: {
          ...progress.drafts,
          [exercise.slug]: code,
        },
      }

      setProgress(next)
      savePratkorProgress(next)
      setStatusMessage('Отлично! Минимальные требования выполнены, задание засчитано.')
    } else {
      setStatusMessage('Пока не хватает обязательных частей решения. Сверься с чеклистом справа.')
    }

    setChecking(false)
  }

  const handleReset = () => {
    if (!exercise) {
      return
    }
    setCode(exercise.starterCode)
    setResult(null)
    setStatusMessage('Код сброшен к стартовому шаблону.')
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setFullscreen(true)
      return
    }

    await document.exitFullscreen()
    setFullscreen(false)
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-[#f2f4fa] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#d9dff0] bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#1f2a5a]">Задание не найдено</h1>
          <p className="mt-2 text-[#5e6992]">Возможно, ссылка устарела или упражнение было перемещено.</p>
          <Link
            href="/trainer/pratkor"
            className="mt-5 inline-flex rounded-xl border border-[#bcccff] bg-[#eef2ff] px-4 py-2 text-[#2c4088] hover:bg-[#e5ecff]"
          >
            Вернуться к треку
          </Link>
        </div>
      </div>
    )
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#f2f4fa] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#d9dff0] bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#1f2a5a]">Задание пока заблокировано</h1>
          <p className="mt-2 text-[#5e6992]">Заверши предыдущие упражнения, чтобы открыть этот уровень.</p>
          <Link
            href="/trainer/pratkor"
            className="mt-5 inline-flex rounded-xl border border-[#bcccff] bg-[#eef2ff] px-4 py-2 text-[#2c4088] hover:bg-[#e5ecff]"
          >
            Вернуться к треку
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eef2fb] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#54608b]">
          <Link href="/trainer" className="hover:text-[#2f448c]">Trainer</Link>
          <span>›</span>
          <Link href="/trainer/pratkor" className="hover:text-[#2f448c]">Prakter</Link>
          <span>›</span>
          <span className="text-[#2a376e]">{exercise.title}</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[48%_52%]">
          <section className="rounded-3xl border border-[#d8def0] bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-xs font-semibold text-[#334b96]">
                #{exercise.id}
              </span>
              <span className="rounded-full border border-[#d8def0] px-2.5 py-1 text-xs text-[#5f6a94]">
                {exercise.category}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  exercise.difficulty === 'easy'
                    ? 'border-[#FFD60A] bg-[#FFF8DC] text-[#997A00]'
                    : exercise.difficulty === 'medium'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {exercise.difficulty}
              </span>
              {isCompleted ? (
                <span className="rounded-full border border-[#FFD60A] bg-[#FFF8DC] px-2.5 py-1 text-xs font-semibold text-[#997A00]">
                  completed
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[#1e2a58] sm:text-3xl">{exercise.title}</h1>
            <p className="mt-3 text-sm leading-6 text-[#5d6891] sm:text-base">{exercise.summary}</p>

            <div className="mt-5 rounded-2xl border border-[#d8def0] bg-[#f8faff] p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5b6791]">Что нужно выполнить</h2>
              <ol className="mt-3 space-y-2 text-sm text-[#2f3b67]">
                {exercise.instructions.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8eeff] text-xs font-semibold text-[#334b96]">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 rounded-2xl border border-[#d8def0] bg-[#f8faff] p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5b6791]">Критерии автопроверки</h3>
              <ul className="mt-2 space-y-1 text-sm text-[#3a4775]">
                {exercise.requiredPatterns.map((pattern) => (
                  <li key={pattern}>• содержит шаблон: <span className={`font-mono text-xs ${monoClassName}`}>{pattern}</span></li>
                ))}
              </ul>
            </div>

            {statusMessage ? (
              <p className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
                isCompleted
                  ? 'border-[#FFD60A] bg-[#FFF8DC] text-[#997A00]'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}>
                {statusMessage}
              </p>
            ) : null}
          </section>

          <section className="space-y-4">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              onRun={() => void handleRun()}
              onSubmit={() => void handleCheck()}
              onReset={handleReset}
              onToggleFullscreen={() => void toggleFullscreen()}
              running={running}
              submitting={checking}
              fullscreen={fullscreen}
              monoClassName={monoFontFamily}
            />

            <OutputPanel result={result} monoClassName={monoClassName} />

            <div className="rounded-2xl border border-[#d8def0] bg-white p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleCheck()}
                  disabled={checking}
                  className="rounded-xl bg-[#2d4ecf] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2644b7] disabled:opacity-70"
                >
                  {checking ? 'Проверяем...' : 'Проверить требования'}
                </button>
                <Link
                  href="/trainer/pratkor"
                  className="rounded-xl border border-[#ccd5f0] bg-[#f8faff] px-4 py-2 text-sm text-[#41508a] hover:bg-[#eef3ff]"
                >
                  К списку упражнений
                </Link>
              </div>
              <p className="mt-2 text-xs text-[#7a86ad]">
                Run запускает код в песочнице. Проверка оценивает структуру решения по обязательным критериям этого задания.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
