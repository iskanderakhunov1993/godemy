'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import type { Exercise, RunResult, TopicExample, TrainerTopic } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { markActivityToday, saveLastVisited } from '@/lib/streak'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0b1220] animate-pulse" />,
})

const monoClassName = 'font-mono'
const monoFontFamily = '"JetBrains Mono", "Fira Code", ui-monospace, monospace'

type TestStatus = 'idle' | 'passed' | 'failed'

type TestCase = {
  title: string
  input: string
  expected: string
  status: TestStatus
}

const defaultTests: TestCase[] = [
  { title: 'Тест 1', input: 'Abs(-5)', expected: '5', status: 'idle' },
  { title: 'Тест 2', input: 'Abs(7)', expected: '7', status: 'idle' },
  { title: 'Тест 3', input: 'Abs(0)', expected: '0', status: 'idle' },
]

const starterTemplate = `package main

import "fmt"

func main() {
    // напиши код здесь
    fmt.Println(Abs(-5))
}

func Abs(n int) int {
    // TODO
    return 0
}
`

const fallbackExamples: TopicExample[] = [
  {
    title: 'Без параметров',
    code: 'func Hello() string {\n    return "Hello, Go!"\n}',
    description: 'Функция возвращает готовое значение.',
  },
  {
    title: 'С параметрами',
    code: 'func Add(a int, b int) int {\n    return a + b\n}',
    description: 'Возвращаем сумму двух аргументов.',
  },
  {
    title: 'С логикой (if)',
    code: 'func Max(a int, b int) int {\n    if a > b {\n        return a\n    }\n    return b\n}',
    description: 'Функция выбирает большее значение.',
  },
]

export default function TrainerTopicPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { token, loadProgress } = useAuthStore()

  const [topic, setTopic] = useState<TrainerTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [code, setCode] = useState(starterTemplate)
  const [result, setResult] = useState<RunResult | null>(null)
  const [tests, setTests] = useState<TestCase[]>(defaultTests)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [hintsOpen, setHintsOpen] = useState<number[]>([1, 2])

  useEffect(() => {
    api.getTrainerTopic(slug)
      .then((data) => {
        setTopic(data)
        saveLastVisited({ href: `/trainer/topic/${slug}`, title: data.title, type: 'lesson' })
        markActivityToday()
        if (data.exercises?.length) {
          setActiveExercise(data.exercises[0])
          setCode(data.exercises[0].starterCode || starterTemplate)
        }
      })
      .catch(() => router.push('/trainer'))
      .finally(() => setLoading(false))
  }, [slug, router])

  const examples = useMemo<TopicExample[]>(() => {
    if (!topic?.examples) return fallbackExamples
    try {
      const parsed = JSON.parse(topic.examples) as TopicExample[]
      return parsed.length ? parsed : fallbackExamples
    } catch {
      return fallbackExamples
    }
  }, [topic?.examples])

  const syntaxValue = useMemo(() => {
    if (topic?.syntax?.trim()) return topic.syntax
    return 'func name(param type) returnType {\n    return value\n}'
  }, [topic?.syntax])

  const patternValue = useMemo(() => {
    if (topic?.patterns?.trim()) return topic.patterns
    return 'func Abs(n int) int {\n    // logic\n    return result\n}'
  }, [topic?.patterns])

  const activeHints = useMemo(() => {
    const fromExercise = activeExercise?.hints
    if (!fromExercise) {
      return [
        'Если число >= 0 — верни его.',
        'Если число < 0 — умножь его на -1 и верни результат.',
      ]
    }
    try {
      const parsed = JSON.parse(fromExercise) as string[]
      return parsed.length ? parsed : ['Если число >= 0 — верни его.', 'Если число < 0 — умножь его на -1.']
    } catch {
      return ['Если число >= 0 — верни его.', 'Если число < 0 — умножь его на -1.']
    }
  }, [activeExercise?.hints])

  const handleSelectExercise = (exercise: Exercise) => {
    setActiveExercise(exercise)
    setCode(exercise.starterCode || starterTemplate)
    setResult(null)
    setTests(defaultTests)
  }

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
    setSubmitting(true)
    setResult(null)
    try {
      if (activeExercise) {
        const res = await api.submitExercise(code, activeExercise.id)
        setResult(res)
        setTests((prev) =>
          prev.map((t, i) => ({
            ...t,
            status: res.passed ? 'passed' : i === 0 ? 'failed' : 'idle',
          }))
        )
        if (token && res.passed) await loadProgress()
      } else {
        const runRes = await api.runCode(code)
        setResult(runRes)
        setTests((prev) =>
          prev.map((t) => ({ ...t, status: runRes.error ? 'failed' : 'passed' }))
        )
      }
    } catch (e) {
      setResult({ output: '', error: (e as Error).message, passed: false })
      setTests((prev) => prev.map((t, i) => ({ ...t, status: i === 0 ? 'failed' : 'idle' })))
    } finally {
      setSubmitting(false)
    }
  }

  const resetCode = () => {
    setCode(activeExercise?.starterCode || starterTemplate)
    setResult(null)
    setTests(defaultTests)
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

  const copySyntax = async () => {
    try {
      await navigator.clipboard.writeText(syntaxValue)
    } catch {
      // noop
    }
  }

  if (loading || !topic) {
    return (
      <div className="min-h-screen bg-[#020617] px-6 py-6">
        <div className="mx-auto max-w-[1500px] space-y-4">
          <div className="h-14 rounded-2xl bg-[#111827] animate-pulse" />
          <div className="h-[720px] rounded-2xl bg-[#111827] animate-pulse" />
        </div>
      </div>
    )
  }

  const leftTitle = topic.title || 'Функции с возвратом значения'

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-5">
      <div className="mx-auto max-w-[1500px] min-w-[1200px] space-y-4">
        <header className="rounded-2xl border border-[#1f2937] bg-[#0b1220]/90 backdrop-blur px-5 py-3 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-6">
            <Link href="/trainer" className="text-[#22d3ee] font-semibold tracking-wide">{`{ codetrain }`}</Link>
            <nav className="flex items-center gap-5 text-sm text-gray-400">
              <span className="hover:text-white transition-colors cursor-pointer">Главная</span>
              <span className="hover:text-white transition-colors cursor-pointer">Курс</span>
              <span className="text-[#22d3ee]">Тренажёр</span>
              <span className="hover:text-white transition-colors cursor-pointer">Задачи</span>
              <span className="hover:text-white transition-colors cursor-pointer">Сообщество</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-[#111827] border border-[#1f2937] text-sm text-gray-400 min-w-[220px]">Поиск...</div>
            <button className="text-sm text-gray-300 hover:text-white transition-colors">Войти</button>
            <button className="px-4 py-2 rounded-xl bg-[#22d3ee] text-slate-900 text-sm font-semibold hover:bg-cyan-300 transition-colors">Регистрация</button>
          </div>
        </header>

        <div className="grid grid-cols-[55%_45%] gap-4 items-start">
          <section className="space-y-4">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Тренажёр / Функции в Go</div>
                  <h1 className="text-3xl font-bold leading-tight">{leftTitle}</h1>
                  <p className="text-gray-300 mt-2 max-w-2xl">Функции могут возвращать результат обратно в место вызова с помощью `return`.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">easy</span>
              </div>
            </Card>

            <Card title="Простой пример">
              <div className="grid grid-cols-[1fr_220px] gap-3">
                <CodeBlock code={'func Add(a int, b int) int {\n    return a + b\n}'} />
                <div className="rounded-2xl border border-[#1f2937] bg-[#0b1220] p-4 text-sm">
                  <div className="text-gray-400 mb-2">Результат:</div>
                  <div className="text-white font-medium">Add(2,3) → <span className="text-[#22d3ee]">5</span></div>
                </div>
              </div>
            </Card>

            <Card title="Объяснение">
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• `a`, `b` — параметры</li>
                <li>• `int` — тип возврата</li>
                <li>• `return` возвращает результат</li>
              </ul>
            </Card>

            <Card title="Синтаксис" action={<button onClick={copySyntax} className="px-3 py-1.5 rounded-lg border border-[#1f2937] text-xs text-gray-300 hover:border-cyan-400 hover:text-white transition-colors">Копировать</button>}>
              <CodeBlock code={syntaxValue} />
            </Card>

            <Card title="Ключевые моменты">
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• `return` завершает функцию</li>
                <li>• тип возврата обязателен</li>
                <li>• функция возвращает значение</li>
              </ul>
            </Card>

            <Card title="Flow (как работает)">
              <div className="grid grid-cols-4 gap-2">
                {[
                  'вызываем функцию',
                  'передаём значения',
                  'выполняется код',
                  'возвращается результат',
                ].map((label, idx) => (
                  <div key={label} className="relative rounded-xl border border-[#1f2937] bg-[#0b1220] p-3 text-center">
                    <div className="mx-auto mb-2 w-8 h-8 rounded-full bg-cyan-500/15 text-[#22d3ee] border border-cyan-500/40 flex items-center justify-center font-semibold text-sm">{idx + 1}</div>
                    <p className="text-xs text-gray-300">{label}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Паттерн">
              <CodeBlock code={patternValue} />
            </Card>

            <Card title="Частая ошибка" className="border-red-500/40 bg-red-950/20">
              <CodeBlock
                code={'func Add(a int, b int) int {\n    a + b // ошибка (нет return)\n}'}
                className="border-red-500/40 bg-[#1a1114] text-red-200"
              />
            </Card>

            <Card title="Примеры">
              <div className="grid grid-cols-3 gap-3">
                {examples.slice(0, 3).map((ex, i) => (
                  <div key={ex.title + i} className="rounded-2xl border border-[#1f2937] bg-[#0b1220] p-3 space-y-3 hover:border-cyan-500/40 transition-colors">
                    <div className="text-sm font-medium">{i + 1}. {ex.title}</div>
                    <CodeBlock code={ex.code} className="text-xs" />
                    <button
                      onClick={() => {
                        setCode(`package main\n\nimport "fmt"\n\n${ex.code}\n\nfunc main() {\n    fmt.Println("Run")\n}`)
                        setResult(null)
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#1f2937] text-xs text-gray-300 hover:border-cyan-400 hover:text-white transition-colors"
                    >
                      Run
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Задача">
              <p className="text-sm text-gray-200 mb-3">Напиши функцию <span className="font-semibold text-[#22d3ee]">Abs(n int) int</span></p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• если `n &gt;= 0` → вернуть `n`</li>
                <li>• если `n &lt; 0` → вернуть `-n`</li>
              </ul>
              {topic.exercises?.length ? (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {topic.exercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => handleSelectExercise(exercise)}
                      className={`text-left px-3 py-2 rounded-xl border transition-colors ${
                        activeExercise?.id === exercise.id
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-[#1f2937] bg-[#0b1220] hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="text-sm font-medium">{exercise.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{exercise.difficulty}</div>
                    </button>
                  ))}
                </div>
              ) : null}
            </Card>
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

              <div className="h-[460px] border-b border-[#1f2937]">
                <MonacoEditor
                  height="100%"
                  language="go"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value ?? '')}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    tabSize: 4,
                    fontFamily: monoFontFamily,
                    padding: { top: 12 },
                  }}
                />
              </div>

              <div className="px-4 py-3 flex items-center gap-2 bg-[#0b1220] border-b border-[#1f2937]">
                <button onClick={resetCode} className="px-4 py-2 rounded-xl border border-[#1f2937] text-sm text-gray-300 hover:border-cyan-400 hover:text-white transition-colors">Сбросить</button>
                <button onClick={handleRun} disabled={running} className="px-4 py-2 rounded-xl border border-cyan-400/40 text-sm text-cyan-300 hover:bg-cyan-500/10 transition-colors disabled:opacity-60">{running ? 'Run...' : 'Run'}</button>
                <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 rounded-xl bg-[#22d3ee] text-slate-900 text-sm font-semibold hover:bg-cyan-300 transition-colors disabled:opacity-60">{submitting ? 'Submit...' : 'Submit'}</button>
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
                        <span>{test.title}: {test.input} → {test.expected}</span>
                        <span className={`text-xs font-semibold ${
                          test.status === 'passed'
                            ? 'text-emerald-400'
                            : test.status === 'failed'
                            ? 'text-red-400'
                            : 'text-gray-500'
                        }`}>
                          {test.status === 'passed' ? 'пройден' : test.status === 'failed' ? 'ошибка' : 'ожидает'}
                        </span>
                      </div>
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
                      {hintsOpen.includes(level) && (
                        <p className="mt-2 text-xs text-gray-400">{activeHints[idx] || 'Подсказка пока недоступна.'}</p>
                      )}
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

function Card({
  title,
  children,
  action,
  className = '',
}: {
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition-all hover:shadow-[0_16px_45px_rgba(2,6,23,0.55)] ${className}`}>
      {title ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  )
}

function CodeBlock({ code, className = '' }: { code: string; className?: string }) {
  return (
    <pre className={`rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-sm text-cyan-200 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed ${className}`}>
      {code}
    </pre>
  )
}
