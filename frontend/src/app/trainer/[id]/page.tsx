'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { api, type Exercise, type RunResult } from '@/lib/api'
import CodeEditor from '@/components/trainer/CodeEditor'
import OutputPanel from '@/components/trainer/OutputPanel'
import {
  buildTrainerStorageKey,
  emptyStoredTrainerProgress,
  normalizeStoredTrainerProgress,
  parseTrainerLayout,
  readStoredTrainerProgress,
  type StoredTrainerProgress,
  validateTrainerTaskAnswer,
} from '@/lib/trainerPractice'
import { useAuthStore } from '@/lib/store'

const monoClassName = 'font-mono'
const monoFontFamily = '"JetBrains Mono", "Fira Code", ui-monospace, monospace'

export default function ExercisePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const exerciseId = Number(id)
  const { token, loadProgress, getProgressEntry } = useAuthStore()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [taskProgress, setTaskProgress] = useState<StoredTrainerProgress>({
    answers: [],
    completed: [],
    statuses: [],
  })

  useEffect(() => {
    if (!Number.isFinite(exerciseId)) {
      router.push('/trainer')
      return
    }

    api
      .getExercise(exerciseId)
      .then((data) => {
        setExercise(data)
        setCode(data.starterCode)
      })
      .catch(() => router.push('/trainer'))
      .finally(() => setLoading(false))
  }, [exerciseId, router])

  useEffect(() => {
    if (!token) {
      return
    }
    loadProgress()
  }, [token, loadProgress])

  const layout = useMemo(() => (exercise ? parseTrainerLayout(exercise) : null), [exercise])
  const completedCount = useMemo(() => taskProgress.completed.filter(Boolean).length, [taskProgress.completed])
  const storageKey = useMemo(() => (exercise ? buildTrainerStorageKey(exercise.id) : ''), [exercise])

  useEffect(() => {
    if (!exercise || !layout) {
      return
    }

    const fromBackend = token ? getProgressEntry('exercise_tasks', exercise.id) : undefined
    const backendState = fromBackend?.payload
      ? readStoredTrainerProgress(fromBackend.payload, layout.tasks.length)
      : null

    const fromLocal = typeof window !== 'undefined'
      ? readStoredTrainerProgress(window.localStorage.getItem(storageKey) || undefined, layout.tasks.length)
      : emptyStoredTrainerProgress(layout.tasks.length)

    const timer = window.setTimeout(() => {
      setTaskProgress(backendState || fromLocal)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [exercise, getProgressEntry, layout, storageKey, token])

  const persistTaskProgress = async (next: StoredTrainerProgress) => {
    if (!exercise || !layout) {
      return
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    }

    if (!token) {
      return
    }

    const status = next.completed.every(Boolean) ? 'completed' : 'started'
    await api.updateProgress('exercise_tasks', exercise.id, status, JSON.stringify(next))
    await loadProgress()
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

  const handleSubmit = async () => {
    if (!exercise) {
      return
    }

    setSubmitting(true)
    setResult(null)
    try {
      const response = await api.submitExercise(code, exercise.id)
      setResult(response)
      if (token && response.passed) {
        await loadProgress()
      }
    } catch (error) {
      setResult({ output: '', error: (error as Error).message, passed: false })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (!exercise) {
      return
    }
    setCode(exercise.starterCode)
    setResult(null)
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

  const handleTaskAnswerChange = (taskIndex: number, value: string) => {
    setTaskProgress((prev) => ({
      ...prev,
      answers: prev.answers.map((answer, index) => (index === taskIndex ? value : answer)),
      statuses: prev.statuses.map((status, index) =>
        index === taskIndex && status === 'failed' ? 'idle' : status
      ),
    }))
  }

  const handleTaskCheck = async (taskIndex: number) => {
    if (!layout) {
      return
    }

    const passed = validateTrainerTaskAnswer(taskProgress.answers[taskIndex] || '', layout.tasks[taskIndex])
    const next = normalizeStoredTrainerProgress(
      {
        answers: taskProgress.answers,
        completed: taskProgress.completed.map((item, index) =>
          index === taskIndex ? passed || item : item
        ),
        statuses: taskProgress.statuses.map((status, index) =>
          index === taskIndex ? (passed ? 'passed' : 'failed') : status
        ),
      },
      layout.tasks.length
    )

    setTaskProgress(next)

    if (passed && !taskProgress.completed[taskIndex] && next.completed.every(Boolean)) {
      setShowCelebration(true)
      window.setTimeout(() => setShowCelebration(false), 4000)
    }

    await persistTaskProgress(next)
  }

  const handleClearProgress = async () => {
    if (!exercise || !layout) {
      return
    }

    const empty = emptyStoredTrainerProgress(layout.tasks.length)
    setTaskProgress(empty)
    setShowCelebration(false)

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey)
    }

    if (token) {
      await api.updateProgress('exercise_tasks', exercise.id, 'started', JSON.stringify(empty))
      await loadProgress()
    }
  }

  if (loading || !exercise || !layout) {
    return (
      <div className="min-h-screen bg-[#020617] px-4 sm:px-6 py-6">
        <div className="mx-auto max-w-[1500px] space-y-4">
          <div className="h-20 rounded-2xl bg-[#111827] animate-pulse" />
          <div className="h-[720px] rounded-2xl bg-[#111827] animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 sm:px-6 py-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <Link href="/trainer" className="hover:text-[#FFD60A] transition-colors">Тренажер</Link>
          <span>›</span>
          <span>{exercise.title}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[58%_42%] gap-5 items-start">
          <section className="space-y-5">
            <section className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{layout.title || exercise.title}</h1>
              <p className="text-sm sm:text-base text-[#FFD60A] mb-4">{layout.theme || `${exercise.category} • ${exercise.difficulty}`}</p>
              <p className="text-sm sm:text-base text-gray-300 mb-4">{layout.heroDescription || exercise.description}</p>

              {layout.firstExample ? (
                <div className="rounded-xl border border-[#1f2937] bg-[#0b1220] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">{layout.firstExample.title}</p>
                  <pre className={`rounded-xl border border-[#1f2937] bg-[#020617] p-4 text-sm text-[#FFD60A] whitespace-pre-wrap overflow-x-auto ${monoClassName}`}>
                    {layout.firstExample.code}
                  </pre>
                  <p className="text-sm text-[#FFD60A] mt-3">{layout.firstExample.result}</p>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
              <h2 className="text-lg font-semibold mb-3">Короткая теория и синтаксис</h2>
              <p className="text-sm text-gray-300 mb-3">{layout.shortTheory || 'Разбивай решение на короткие шаги и проверяй каждую функцию отдельно.'}</p>
              <pre className={`rounded-xl border border-[#1f2937] bg-[#020617] p-4 text-sm text-[#FFD60A] whitespace-pre-wrap overflow-x-auto ${monoClassName}`}>
                {layout.syntax || exercise.starterCode}
              </pre>
            </section>

            {layout.implementations?.length ? (
              <section className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
                <h2 className="text-lg font-semibold mb-3">Примеры реализации</h2>
                <div className="space-y-4">
                  {layout.implementations.map((item) => (
                    <div key={`${item.title}-${item.code}`} className="rounded-xl border border-[#1f2937] bg-[#0b1220] p-4">
                      <p className="text-sm text-white mb-2">{item.title}</p>
                      <pre className={`rounded-xl border border-[#1f2937] bg-[#020617] p-3 text-xs sm:text-sm text-[#FFD60A] whitespace-pre-wrap overflow-x-auto ${monoClassName}`}>
                        {item.code}
                      </pre>
                      {item.description ? <p className="mt-2 text-sm text-gray-400">{item.description}</p> : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
              <h2 className="text-lg font-semibold mb-3">Паттерн решения</h2>
              <pre className={`rounded-xl border border-[#1f2937] bg-[#020617] p-4 text-sm text-[#FFD60A] whitespace-pre-wrap overflow-x-auto ${monoClassName}`}>
                {layout.pattern || exercise.starterCode}
              </pre>
            </section>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-4">
            {showCelebration ? (
              <section className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-950 to-emerald-900 p-5 shadow-[0_10px_30px_rgba(16,185,129,0.3)] animate-pulse">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-[#FFD60A] mb-2">🎉 Отлично!</p>
                  <p className="text-sm sm:text-base text-[#FFD60A]">Все mini-задачи закрыты.</p>
                  <p className="text-lg font-bold text-[#FFD60A] mt-3">+1 шаг к полному решению</p>
                </div>
              </section>
            ) : null}

            <section className={`rounded-2xl border p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-all duration-300 ${
              completedCount === layout.tasks.length ? 'border-emerald-500 bg-emerald-950' : 'border-[#1f2937] bg-[#111827]'
            }`}>
              <div className="flex items-center justify-between mb-3 gap-3">
                <h2 className="text-lg font-semibold">{layout.taskSectionTitle || 'Mini-задачи'}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                    completedCount === layout.tasks.length ? 'bg-[#FFD60A] text-white' : 'bg-gray-700 text-gray-200'
                  }`}>
                    {completedCount}/{layout.tasks.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleClearProgress()}
                    className="rounded-lg border border-[#1f2937] px-2 py-1 text-xs text-gray-300 hover:border-rose-400 hover:text-rose-200 transition-colors"
                  >
                    Очистить прогресс
                  </button>
                </div>
              </div>

              {completedCount > 0 ? (
                <div className="mb-3 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      completedCount === layout.tasks.length ? 'bg-[#FFD60A]' : 'bg-[#FFD60A]'
                    }`}
                    style={{ width: `${(completedCount / layout.tasks.length) * 100}%` }}
                  />
                </div>
              ) : null}

              <div className="space-y-3">
                {layout.tasks.map((task, index) => {
                  const status = taskProgress.statuses[index] || 'idle'
                  const passed = taskProgress.completed[index]
                  return (
                    <section
                      key={`${task.title}-${index}`}
                      className={`rounded-xl border p-3 ${
                        passed
                          ? 'border-emerald-500/60 bg-emerald-950/40'
                          : status === 'failed'
                            ? 'border-rose-500/40 bg-rose-950/20'
                            : 'border-[#1f2937] bg-[#0b1220]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm text-gray-100">{index + 1}. {task.title}</p>
                          {task.description ? <p className="mt-1 text-xs text-gray-400">{task.description}</p> : null}
                        </div>
                        <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold ${
                          passed
                            ? 'bg-[#FFD60A] text-white'
                            : status === 'failed'
                              ? 'bg-rose-500/20 text-rose-200'
                              : 'bg-gray-700 text-gray-200'
                        }`}>
                          {passed ? 'Верно' : status === 'failed' ? 'Неверно' : 'Черновик'}
                        </span>
                      </div>

                      <textarea
                        value={taskProgress.answers[index] || ''}
                        onChange={(event) => handleTaskAnswerChange(index, event.target.value)}
                        placeholder={task.placeholder}
                        className={`mb-2 min-h-[130px] w-full rounded-xl border bg-[#020617] px-3 py-2 text-xs text-[#FFE44D] outline-none transition-colors ${monoClassName} ${
                          passed
                            ? 'border-emerald-500/50'
                            : status === 'failed'
                              ? 'border-rose-500/40'
                              : 'border-[#1f2937] focus:border-[#FFD60A]/60'
                        }`}
                      />

                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-xs ${
                          passed
                            ? 'text-[#FFD60A]'
                            : status === 'failed'
                              ? 'text-rose-200'
                              : 'text-gray-400'
                        }`}>
                          {passed
                            ? token
                              ? 'Ответ сохранен в профиле и на этом устройстве.'
                              : 'Ответ сохранен на этом устройстве.'
                            : status === 'failed'
                              ? 'Проверка строгая: добавь имя функции и обязательные части алгоритма.'
                              : 'Вставь функцию целиком или ключевой фрагмент с обязательными конструкциями.'}
                        </p>

                        <button
                          type="button"
                          onClick={() => void handleTaskCheck(index)}
                          className="shrink-0 rounded-xl bg-[#FFD60A] px-3 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-[#FFD60A]"
                        >
                          Проверить
                        </button>
                      </div>
                    </section>
                  )
                })}
              </div>
            </section>

            <CodeEditor
              code={code}
              onChange={setCode}
              onRun={() => void handleRun()}
              onSubmit={() => void handleSubmit()}
              onReset={handleReset}
              onToggleFullscreen={() => void toggleFullscreen()}
              running={running}
              submitting={submitting}
              fullscreen={fullscreen}
              monoClassName={monoFontFamily}
            />

            <OutputPanel result={result} monoClassName={monoClassName} />
          </aside>
        </div>
      </div>
    </div>
  )
}
