'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import type { Exercise, RunResult } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  buildSprintMap,
  getSprintNumber,
  isExerciseUnlocked,
  sortByOrder,
} from '@/lib/juniorSprint'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0b1220] animate-pulse" />,
})

const monoClassName = 'font-mono'
const monoFontFamily = '"JetBrains Mono", "Fira Code", ui-monospace, monospace'

type TestStatus = 'idle' | 'passed' | 'failed'
type TestCase = { title: string; input: string; expected: string; status: TestStatus }

const initialTests: TestCase[] = [
  { title: 'Тест 1', input: 'Happy path', expected: 'ok', status: 'idle' },
  { title: 'Тест 2', input: 'Boundary', expected: 'ok', status: 'idle' },
  { title: 'Тест 3', input: 'Edge case', expected: 'ok', status: 'idle' },
]

export default function JuniorExercisePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [tests, setTests] = useState<TestCase[]>(initialTests)
  const [fullscreen, setFullscreen] = useState(false)
  const [hintsOpen, setHintsOpen] = useState<number[]>([1, 2])
  const { token, loadProgress, isCompleted } = useAuthStore()

  useEffect(() => {
    Promise.all([api.getExercise(Number(id)), api.getExercises({ module: 'bootcamp' })])
      .then(([data, all]) => {
        if (data.module !== 'bootcamp') {
          router.push('/junior/trainer')
          return
        }
        setAllExercises(all)
        setExercise(data)
        setCode(data.starterCode)
      })
      .catch(() => router.push('/junior/trainer'))
      .finally(() => setLoading(false))

    if (token) loadProgress()
  }, [id, router, token, loadProgress])

  useEffect(() => {
    if (!exercise) return
    const unlocked = isExerciseUnlocked(exercise.id, allExercises, isCompleted)
    if (!unlocked) router.push('/junior/trainer')
  }, [exercise, allExercises, isCompleted, router])

  const hints = useMemo(() => {
    if (!exercise?.hints) return ['Начни с простого случая.', 'Проверь входные ограничения.']
    try {
      const parsed = JSON.parse(exercise.hints) as string[]
      return parsed.length ? parsed : ['Начни с простого случая.', 'Проверь входные ограничения.']
    } catch {
      return ['Начни с простого случая.', 'Проверь входные ограничения.']
    }
  }, [exercise])

  const sprint = exercise ? getSprintNumber(exercise.category) : 1
  const sprintMap = useMemo(() => buildSprintMap(allExercises, isCompleted), [allExercises, isCompleted])
  const sprintBlock = sprintMap[sprint]

  const ordered = sortByOrder(allExercises)
  const currentIdx = ordered.findIndex((e) => e.id === exercise?.id)
  const nextExercise = currentIdx >= 0 ? ordered[currentIdx + 1] : null
  const nextExerciseUnlocked = nextExercise ? isExerciseUnlocked(nextExercise.id, allExercises, isCompleted) : false

  const handleRun = async () => {
    setRunning(true)
    setResult(null)
    try {
      const res = await api.runCode(code)
      setResult(res)
    } catch (e) {
      setResult({ output: '', error: (e as Error).message, passed: false })
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!exercise) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await api.submitExercise(code, exercise.id)
      setResult(res)
      setTests((prev) =>
        prev.map((t, i) => ({
          ...t,
          status: res.passed ? 'passed' : i === 0 ? 'failed' : 'idle',
        }))
      )
      if (token && res.passed) await loadProgress()
    } catch (e) {
      setResult({ output: '', error: (e as Error).message, passed: false })
      setTests((prev) => prev.map((t, i) => ({ ...t, status: i === 0 ? 'failed' : 'idle' })))
    } finally {
      setSubmitting(false)
    }
  }

  const resetCode = () => {
    if (!exercise) return
    setCode(exercise.starterCode)
    setResult(null)
    setTests(initialTests)
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setFullscreen(true)
    } else {
      await document.exitFullscreen()
      setFullscreen(false)
    }
  }

  if (loading || !exercise) {
    return (
      <div className="godemy-light min-h-screen px-6 py-6">
        <div className="mx-auto max-w-[1500px] space-y-4">
          <div className="h-14 rounded-2xl bg-[#111827] animate-pulse" />
          <div className="h-[760px] rounded-2xl bg-[#111827] animate-pulse" />
        </div>
      </div>
    )
  }

  const completed = isCompleted('exercise', exercise.id)

  return (
    <div className="godemy-light min-h-screen px-6 py-5">
      <div className="mx-auto max-w-[1500px] min-w-[1200px]">
        <div className="grid grid-cols-[55%_45%] gap-4 items-start">
          <section className="space-y-4">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    <Link href="/junior/trainer" className="hover:text-cyan-300 transition-colors">Junior тренажёр</Link>
                    <span className="mx-2">›</span>
                    <span>{exercise.category}</span>
                  </div>
                  <h1 className="text-3xl font-bold leading-tight">{exercise.title}</h1>
                  <p className="text-gray-300 mt-2">Спринт {sprint}. Практика с проверкой тестами.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold">sprint {sprint}</span>
                  {completed && <span className="px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">пройдено</span>}
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Прогресс спринта: {sprintBlock?.completed ?? 0}/{sprintBlock?.total ?? 0}
              </div>
            </Card>

            <Card title="Задача">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{exercise.description}</p>
            </Card>

            <Card title="Ключевые моменты">
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• решай по шагам</li>
                <li>• проверяй края диапазона</li>
                <li>• оптимизируй после корректности</li>
              </ul>
            </Card>

            {nextExercise && nextExerciseUnlocked && (
              <Card>
                <Link href={`/junior/trainer/${nextExercise.id}`} className="inline-flex px-4 py-2 rounded-xl border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10 transition-colors">
                  Следующая задача →
                </Link>
              </Card>
            )}

            {!token && (
              <Card className="border-amber-500/30 bg-amber-500/10">
                <p className="text-sm text-amber-100">Войди, чтобы сохранять прогресс и открывать следующие задачи.</p>
                <Link href="/auth/login" className="inline-block mt-2 text-sm text-amber-200 hover:text-white">Войти →</Link>
              </Card>
            )}
          </section>

          <section className="space-y-4 sticky top-4">
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937] bg-[#0b1220]">
                <div className="px-3 py-1.5 rounded-lg border border-[#1f2937] text-xs text-gray-200">Go 1.21</div>
                <div className="flex items-center gap-2">
                  <button onClick={resetCode} className="px-3 py-1.5 rounded-lg text-xs border border-[#1f2937] text-gray-300 hover:border-cyan-400 hover:text-white transition-colors">Сбросить код</button>
                  <button onClick={toggleFullscreen} className="px-3 py-1.5 rounded-lg text-xs border border-[#1f2937] text-gray-300 hover:border-cyan-400 hover:text-white transition-colors">{fullscreen ? 'Exit' : 'Fullscreen'}</button>
                </div>
              </div>

              <div className="h-[450px] border-b border-[#1f2937]">
                <MonacoEditor
                  height="100%"
                  language="go"
                  theme="vs-dark"
                  value={code}
                  onChange={(v) => setCode(v ?? '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                    fontFamily: monoFontFamily,
                    padding: { top: 12 },
                  }}
                />
              </div>

              <div className="px-4 py-3 flex items-center gap-2 bg-[#0b1220] border-b border-[#1f2937]">
                <button onClick={resetCode} className="px-4 py-2 rounded-xl border border-[#1f2937] text-sm text-gray-300 hover:border-cyan-400 hover:text-white transition-colors">Сбросить</button>
                <button onClick={handleRun} disabled={running} className="px-4 py-2 rounded-xl border border-cyan-400/40 text-sm text-cyan-300 hover:bg-cyan-500/10 transition-colors disabled:opacity-60">{running ? 'Run...' : 'Run'}</button>
                <button onClick={handleSubmit} disabled={submitting || !token} className="px-4 py-2 rounded-xl bg-[#22d3ee] text-slate-900 text-sm font-semibold hover:bg-cyan-300 transition-colors disabled:opacity-60">{submitting ? 'Submit...' : 'Submit'}</button>
              </div>

              <div className="p-4 bg-[#0a1020]">
                <div className="text-sm font-semibold mb-2">Вывод</div>
                <div className={`rounded-2xl border p-3 min-h-[110px] text-sm whitespace-pre-wrap ${monoClassName} ${
                  result?.error
                    ? 'border-red-500/40 bg-red-950/20 text-red-200'
                    : result?.passed
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-[#1f2937] bg-[#020617] text-gray-300'
                }`}>
                  {result ? (result.error || result.output || (result.passed ? 'Тесты пройдены.' : 'Нет вывода')) : 'Нажми Run для запуска кода...'}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card title="Тесты">
                <div className="space-y-2">
                  {tests.map((test) => (
                    <div key={test.title} className="rounded-xl border border-[#1f2937] bg-[#0b1220] p-3">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span>{test.title}: {test.input}</span>
                        <span className={`text-xs font-semibold ${test.status === 'passed' ? 'text-emerald-400' : test.status === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                          {test.status === 'passed' ? 'пройден' : test.status === 'failed' ? 'ошибка' : 'ожидает'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Ожидаемый вывод: {test.expected}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Подсказки">
                <div className="space-y-2 text-sm">
                  {[1, 2].map((level, idx) => (
                    <button
                      key={level}
                      onClick={() => setHintsOpen((prev) => (prev.includes(level) ? prev.filter((x) => x !== level) : [...prev, level]))}
                      className="w-full text-left rounded-xl border border-[#1f2937] bg-[#0b1220] p-3 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-200">{level}. Уровень {level}</span>
                        <span className="text-xs text-gray-500">{hintsOpen.includes(level) ? 'Скрыть' : 'Показать'}</span>
                      </div>
                      {hintsOpen.includes(level) && <p className="mt-2 text-xs text-gray-400">{hints[idx] || 'Подсказка недоступна.'}</p>}
                    </button>
                  ))}
                  <div className="rounded-xl border border-[#1f2937] bg-[#0b1220] p-3 opacity-70">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">3. Показать решение</span>
                      <span className="text-xs text-gray-500">🔒 заблокировано</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition-all hover:shadow-[0_16px_45px_rgba(2,6,23,0.55)] ${className}`}>
      {title ? <h2 className="text-lg font-semibold mb-3">{title}</h2> : null}
      {children}
    </div>
  )
}
