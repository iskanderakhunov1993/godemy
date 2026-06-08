'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { api, type Exercise, type RunResult, type TopicExample, type TrainerTopic } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { markActivityToday, saveLastVisited } from '@/lib/streak'
import {
  builtInTrainerConcepts,
  getBuiltInTrainerConcept,
  isBuiltInExercise,
} from '@/lib/trainerConcepts'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse bg-gray-950" />,
})

type WorkspaceMode = 'browser' | 'local'

const fallbackCode = `package main

import "fmt"

func main() {
	fmt.Println("Hello, Go!")
}
`

function parseExamples(raw: string): TopicExample[] {
  if (!raw) return []
  try {
    return JSON.parse(raw) as TopicExample[]
  } catch {
    return []
  }
}

function parseHints(raw?: string): string[] {
  if (!raw) return []
  try {
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export default function TrainerTopicPage() {
  const { slug } = useParams<{ slug: string }>()

  return <TrainerTopicContent key={slug} slug={slug} />
}

function TrainerTopicContent({ slug }: { slug: string }) {
  const router = useRouter()
  const { token, loadProgress, isCompleted } = useAuthStore()
  const builtInTopic = getBuiltInTrainerConcept(slug)
  const builtInExercise = builtInTopic?.exercises?.[0] || null
  const [topic, setTopic] = useState<TrainerTopic | null>(builtInTopic || null)
  const [allTopics, setAllTopics] = useState<TrainerTopic[]>(
    builtInTopic ? builtInTrainerConcepts : []
  )
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(builtInExercise)
  const [code, setCode] = useState(
    builtInExercise?.starterCode || builtInTopic?.syntax || fallbackCode
  )
  const [result, setResult] = useState<RunResult | null>(null)
  const [loading, setLoading] = useState(!builtInTopic)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('browser')
  const [copied, setCopied] = useState(false)
  const [localCompleted, setLocalCompleted] = useState(
    () => typeof window !== 'undefined'
      && window.localStorage.getItem(`trainer-concept-${slug}`) === 'completed'
  )

  useEffect(() => {
    if (builtInTopic) {
      saveLastVisited({ href: `/trainer/topic/${slug}`, title: builtInTopic.title, type: 'lesson' })
      markActivityToday()
      return
    }

    Promise.all([api.getTrainerTopic(slug), api.getTrainerTopics('core')])
      .then(([topicData, topicItems]) => {
        setTopic(topicData)
        setAllTopics([...topicItems].sort((a, b) => a.order - b.order))
        const firstExercise = topicData.exercises?.[0] || null
        setActiveExercise(firstExercise)
        setCode(firstExercise?.starterCode || topicData.syntax || fallbackCode)
        saveLastVisited({ href: `/trainer/topic/${slug}`, title: topicData.title, type: 'lesson' })
        markActivityToday()
      })
      .catch(() => router.push('/trainer'))
      .finally(() => setLoading(false))
  }, [slug, router, builtInTopic])

  const examples = useMemo(() => parseExamples(topic?.examples || ''), [topic])
  const hints = useMemo(() => parseHints(activeExercise?.hints), [activeExercise])
  const currentIndex = allTopics.findIndex((item) => item.slug === slug)
  const nextTopic = currentIndex >= 0 ? allTopics[currentIndex + 1] : undefined
  const completed = activeExercise
    ? isBuiltInExercise(activeExercise.id)
      ? localCompleted
      : isCompleted('exercise', activeExercise.id)
    : false

  const selectExercise = (exercise: Exercise) => {
    setActiveExercise(exercise)
    setCode(exercise.starterCode || fallbackCode)
    setResult(null)
  }

  const runCode = async () => {
    setRunning(true)
    setResult(null)
    try {
      setResult(await api.runCode(code))
    } catch (error) {
      setResult({ output: '', error: (error as Error).message, passed: false })
    } finally {
      setRunning(false)
    }
  }

  const submitCode = async () => {
    if (!activeExercise) return
    setSubmitting(true)
    setResult(null)
    try {
      if (isBuiltInExercise(activeExercise.id)) {
        const response = await api.runCode(code)
        const expectedOutput = builtInTopic?.expectedOutput.trim()
        const actualOutput = response.output.trim()
        const passed = !response.error && (!expectedOutput || actualOutput === expectedOutput)
        setResult({
          ...response,
          passed,
          error: passed
            ? response.error
            : response.error || `Ожидаемый вывод: ${expectedOutput || 'корректный результат'}`,
        })
        if (passed) {
          window.localStorage.setItem(`trainer-concept-${slug}`, 'completed')
          setLocalCompleted(true)
        }
        return
      }

      const response = await api.submitExercise(code, activeExercise.id)
      setResult(response)
      if (token && response.passed) await loadProgress()
    } catch (error) {
      setResult({ output: '', error: (error as Error).message, passed: false })
    } finally {
      setSubmitting(false)
    }
  }

  const copyLocalCommand = async () => {
    await navigator.clipboard.writeText('mkdir godemy-practice && cd godemy-practice && go mod init practice && touch main.go')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  if (loading || !topic) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="h-12 w-64 animate-pulse rounded-xl bg-gray-900" />
        <div className="mt-6 h-[680px] animate-pulse rounded-3xl bg-gray-900" />
      </main>
    )
  }

  const syntax = topic.syntax?.trim() || activeExercise?.starterCode || fallbackCode
  const pattern = topic.patterns?.trim() || `func Solve(input string) string {
	// 1. проверь входные данные
	// 2. выполни основную логику
	// 3. верни результат
	return ""
}`

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link href="/trainer" className="transition-colors hover:text-white">Тренажёр</Link>
        <span>/</span>
        <span className="text-gray-300">{topic.title}</span>
      </div>

      <header className="mt-6 border-b border-gray-800 pb-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
                Концепт {Math.max(currentIndex + 1, 1)}
              </span>
              <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs text-gray-500">
                10–15 минут
              </span>
              {completed && (
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  Выполнено
                </span>
              )}
            </div>
            <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl">{topic.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-400">
              {topic.explanation || activeExercise?.description || 'Разбери концепт и сразу примени его в коротком упражнении.'}
            </p>
          </div>
          <Link href="/trainer" className="text-sm font-semibold text-violet-300 hover:text-violet-200">
            Все концепты →
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)] lg:items-start">
        <article className="space-y-6">
          <LessonSection number="01" title="Идея">
            <p className="text-base leading-7 text-gray-300">
              {topic.explanation || 'В Go простые конструкции специально выглядят предсказуемо. Сначала пойми форму кода, затем меняй данные и поведение.'}
            </p>
            {hints.length > 0 && (
              <ul className="mt-5 space-y-3">
                {hints.slice(0, 3).map((hint) => (
                  <li key={hint} className="flex gap-3 text-sm leading-6 text-gray-400">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[10px] text-violet-300">✓</span>
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </LessonSection>

          <LessonSection number="02" title="Синтаксис">
            <CodeBlock code={syntax} />
            <p className="mt-4 text-sm leading-6 text-gray-500">
              Не запоминай код целиком. Обрати внимание на ключевые слова, типы и место, где возвращается результат.
            </p>
          </LessonSection>

          {examples.length > 0 && (
            <LessonSection number="03" title="Пример">
              <div className="space-y-4">
                {examples.slice(0, 2).map((example) => (
                  <div key={example.title} className="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-bold text-white">{example.title}</h3>
                      <button
                        onClick={() => {
                          setCode(example.code)
                          setResult(null)
                          setWorkspaceMode('browser')
                        }}
                        className="text-xs font-semibold text-violet-300 hover:text-violet-200"
                      >
                        Открыть в песочнице
                      </button>
                    </div>
                    <CodeBlock code={example.code} />
                    {example.description && <p className="mt-3 text-sm text-gray-500">{example.description}</p>}
                  </div>
                ))}
              </div>
            </LessonSection>
          )}

          <LessonSection number={examples.length > 0 ? '04' : '03'} title="Паттерн">
            <p className="mb-4 text-sm leading-6 text-gray-400">
              Паттерн — это форма решения, которую можно переиспользовать. Замени входные данные и основную логику под свою задачу.
            </p>
            <CodeBlock code={pattern} />
          </LessonSection>

          <LessonSection number={examples.length > 0 ? '05' : '04'} title="Задание">
            {topic.exercises?.length ? (
              <>
                {topic.exercises.length > 1 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {topic.exercises.map((exercise, index) => (
                      <button
                        key={exercise.id}
                        onClick={() => selectExercise(exercise)}
                        className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                          activeExercise?.id === exercise.id
                            ? 'border-violet-500/50 bg-violet-500/10 text-violet-200'
                            : 'border-gray-800 bg-gray-950 text-gray-500 hover:border-gray-700'
                        }`}
                      >
                        {index + 1}. {exercise.title}
                      </button>
                    ))}
                  </div>
                )}
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Практика</p>
                  <h3 className="mt-3 text-xl font-bold text-white">{activeExercise?.title}</h3>
                  <p className="mt-3 leading-7 text-gray-300">{activeExercise?.description}</p>
                  {builtInTopic?.expectedOutput && (
                    <div className="mt-5 rounded-xl border border-gray-800 bg-gray-950 px-4 py-3">
                      <p className="text-xs uppercase tracking-widest text-gray-600">Ожидаемый вывод</p>
                      <code className="mt-2 block text-sm text-cyan-200">{builtInTopic.expectedOutput}</code>
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-gray-900 px-3 py-1.5 text-gray-400">{activeExercise?.difficulty}</span>
                    <span className="rounded-full bg-gray-900 px-3 py-1.5 text-gray-400">{activeExercise?.category}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400">Практическое задание для этого концепта готовится.</p>
            )}
          </LessonSection>

          {nextTopic && (
            <Link
              href={`/trainer/topic/${nextTopic.slug}`}
              className="flex items-center justify-between rounded-2xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-violet-500/40"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-600">Следующий концепт</p>
                <p className="mt-2 font-bold text-white">{nextTopic.title}</p>
              </div>
              <span className="text-2xl text-violet-300">→</span>
            </Link>
          )}
        </article>

        <aside className="lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-3xl border border-gray-700 bg-gray-900 shadow-2xl">
            <div className="flex border-b border-gray-800 bg-gray-950 p-2">
              <button
                onClick={() => setWorkspaceMode('browser')}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  workspaceMode === 'browser' ? 'bg-violet-500 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                Песочница
              </button>
              <button
                onClick={() => setWorkspaceMode('local')}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  workspaceMode === 'local' ? 'bg-violet-500 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                Локально
              </button>
            </div>

            {workspaceMode === 'browser' ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-white">main.go</p>
                    <p className="text-[11px] text-gray-600">Код запускается на сервере Godemy</p>
                  </div>
                  <button
                    onClick={() => {
                      setCode(activeExercise?.starterCode || syntax)
                      setResult(null)
                    }}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    Сбросить
                  </button>
                </div>
                <div className="h-[460px]">
                  <MonacoEditor
                    height="100%"
                    language="go"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      tabSize: 4,
                      padding: { top: 16 },
                    }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-gray-800 bg-gray-950 px-4 py-3">
                  <button
                    onClick={() => void runCode()}
                    disabled={running}
                    className="rounded-xl border border-violet-500/40 px-4 py-2 text-sm font-bold text-violet-300 transition-colors hover:bg-violet-500/10 disabled:opacity-50"
                  >
                    {running ? 'Запуск…' : '▶ Запустить'}
                  </button>
                  {activeExercise && (
                    <button
                      onClick={() => void submitCode()}
                      disabled={submitting}
                      className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-gray-950 transition-colors hover:bg-cyan-300 disabled:opacity-50"
                    >
                      {submitting ? 'Проверяем…' : 'Проверить решение'}
                    </button>
                  )}
                </div>
                <div className={`min-h-28 border-t border-gray-800 p-4 font-mono text-sm ${
                  result?.error
                    ? 'bg-red-950/20 text-red-200'
                    : result?.passed
                      ? 'bg-emerald-950/20 text-emerald-200'
                      : 'bg-gray-950 text-gray-500'
                }`}>
                  <p className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-gray-600">Результат</p>
                  {result ? result.error || result.output || (result.passed ? 'Все тесты пройдены ✓' : 'Нет вывода') : 'Нажми «Запустить», чтобы увидеть результат.'}
                </div>
              </>
            ) : (
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-300">Работа на компьютере</p>
                <h2 className="mt-3 text-2xl font-black text-white">Повтори упражнение локально</h2>
                <ol className="mt-6 space-y-5">
                  <LocalStep number="1" title="Создай папку проекта">
                    <code>mkdir godemy-practice && cd godemy-practice</code>
                  </LocalStep>
                  <LocalStep number="2" title="Инициализируй Go-модуль">
                    <code>go mod init practice</code>
                  </LocalStep>
                  <LocalStep number="3" title="Создай файл и вставь код">
                    <code>touch main.go</code>
                  </LocalStep>
                  <LocalStep number="4" title="Запусти программу">
                    <code>go run .</code>
                  </LocalStep>
                </ol>
                <button
                  onClick={() => void copyLocalCommand()}
                  className="mt-7 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm font-bold text-gray-300 transition-colors hover:border-violet-500/50 hover:text-white"
                >
                  {copied ? 'Команда скопирована ✓' : 'Скопировать стартовую команду'}
                </button>
                <p className="mt-4 text-xs leading-5 text-gray-600">
                  После локальной проверки вернись в песочницу и отправь решение, чтобы сохранить прогресс.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}

function LessonSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="font-mono text-xs font-black text-violet-400">{number}</span>
        <h2 className="text-xl font-black text-white">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-950 p-4 text-sm leading-7 text-cyan-100">
      <code>{code}</code>
    </pre>
  )
}

function LocalStep({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-300">
        {number}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <div className="mt-2 overflow-x-auto rounded-xl bg-gray-950 px-3 py-2 font-mono text-xs text-cyan-200">
          {children}
        </div>
      </div>
    </li>
  )
}
