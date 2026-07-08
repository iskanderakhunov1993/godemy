'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, type Exercise, type RunResult, type TopicExample, type TrainerTopic } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { markActivityToday, saveLastVisited } from '@/lib/streak'
import {
  isBuiltInExercise,
  type ConceptSection,
  type PracticeRailItem,
} from '@/lib/trainerConcepts'
import { getGoConceptRoadmapItem, goConceptRoadmap } from '@/lib/goConceptRoadmap'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse bg-slate-950" />,
})

type WorkspaceMode = 'browser' | 'local'

const topicTitleLabels: Record<string, string> = {
  'go-program-structure': 'Как устроена первая программа',
  variables: 'Переменные: как хранить значения',
  'data-types': 'Типы данных: числа, текст и логика',
  constants: 'Постоянные значения',
  'input-output': 'Ввод и вывод',
  'string-formatting': 'Как красиво собрать текст',
  comments: 'Комментарии в коде',
  'if-else': 'Условия: если случилось одно или другое',
  switch: 'Выбор из нескольких вариантов',
  loops: 'Повторение действий',
  range: 'Перебор элементов',
  functions: 'Функции: отдельные части программы',
  parameters: 'Параметры функции',
  'return-values': 'Возврат результата',
}

const topicSummaryLabels: Record<string, string> = {
  'go-program-structure': 'В этой теме ты поймёшь, из каких частей состоит простая Go-программа и где начинается выполнение кода.',
  variables: 'Переменные помогают программе запоминать значения и использовать их в следующих шагах.',
  'data-types': 'Типы данных объясняют программе, с чем она работает: числом, текстом или логическим ответом.',
  constants: 'Константы нужны для значений, которые не должны меняться во время работы программы.',
  'input-output': 'Ввод и вывод помогают программе общаться с пользователем: принять данные и показать результат.',
  'string-formatting': 'Форматирование строк помогает собирать понятный текст из разных значений.',
  comments: 'Комментарии помогают объяснить код будущему себе и другим людям.',
}

function getTopicTitle(slug: string, fallback: string) {
  return topicTitleLabels[slug] ?? fallback
}

function getTopicSummary(slug: string, fallback: string) {
  return topicSummaryLabels[slug] ?? fallback
}

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

function buildFallbackSections(topic: TrainerTopic, syntax: string, pattern: string, examples: TopicExample[]): ConceptSection[] {
  return [
    {
      title: `Зачем нужна тема`,
      paragraphs: [
        topic.explanation || 'Этот концепт объясняет одну важную идею Go и сразу переводит её в практику.',
        'Сначала зафиксируй форму решения, а потом уже запоминай частные случаи.',
      ],
    },
    {
      title: 'Как это выглядит в коде',
      paragraphs: [
        'Синтаксис — это не то, что нужно зубрить посимвольно. Важнее заметить форму: где вход, где логика и где результат.',
      ],
      code: syntax,
    },
    ...(examples[0]
      ? [{
          title: examples[0].title,
          paragraphs: [examples[0].description || 'Разбери пример и попробуй изменить входные данные.'],
          code: examples[0].code,
        }]
      : []),
    {
      title: 'Шаблон решения',
      paragraphs: [
        'Возьми этот каркас как форму решения. Меняй входные данные и центральную проверку под свою задачу.',
      ],
      code: pattern,
    },
  ]
}

function buildFallbackRail(activeExercise: Exercise | null): PracticeRailItem[] {
  return [
    {
      title: activeExercise?.title || `Практика по теме`,
      description: activeExercise?.description || 'Начни с одного базового упражнения по теме.',
      difficulty: 'easy',
      status: 'recommended',
    },
    {
      title: 'Повторить похожую задачу',
      description: 'Повтори этот же шаблон с другими входными данными.',
      difficulty: 'easy',
      status: 'learning',
    },
    {
      title: 'Проверить сложные случаи',
      description: 'Проверь, как код ведёт себя на пустых и пограничных значениях.',
      difficulty: 'medium',
      status: 'locked',
    },
  ]
}

export default function TrainerTopicPage() {
  const { slug } = useParams<{ slug: string }>()
  return <TrainerTopicContent key={slug} slug={slug} />
}

function TrainerTopicContent({ slug }: { slug: string }) {
  const router = useRouter()
  const { token, loadProgress, isCompleted } = useAuthStore()
  const builtInTopic = getGoConceptRoadmapItem(slug)
  const builtInExercise = builtInTopic?.exercises?.[0] || null
  const [topic, setTopic] = useState<TrainerTopic | null>(builtInTopic || null)
  const [allTopics, setAllTopics] = useState<TrainerTopic[]>(builtInTopic ? goConceptRoadmap : [])
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(builtInExercise)
  const [code, setCode] = useState(builtInExercise?.starterCode || builtInTopic?.syntax || fallbackCode)
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
      <main className="godemy-light mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-16 animate-pulse rounded-3xl bg-gray-900" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[720px] animate-pulse rounded-3xl bg-gray-900" />
          <div className="h-[520px] animate-pulse rounded-3xl bg-gray-900" />
        </div>
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

  const conceptCode =
    'conceptCode' in topic && typeof topic.conceptCode === 'string'
      ? topic.conceptCode
      : topic.title.slice(0, 2)
  const summary =
    'summary' in topic && typeof topic.summary === 'string'
      ? topic.summary
      : topic.explanation || 'Короткая теория по теме, чтобы перейти к практике без перегруза.'
  const builtInMicroSkills =
    'microSkills' in topic && Array.isArray(topic.microSkills) ? topic.microSkills : []
  const builtInCommonMistakes =
    'commonMistakes' in topic && Array.isArray(topic.commonMistakes) ? topic.commonMistakes : []
  const builtInRelatedSprint =
    'relatedSprint' in topic && typeof topic.relatedSprint === 'string' ? topic.relatedSprint : ''
  const conceptSections: ConceptSection[] =
    'sections' in topic && Array.isArray(topic.sections) && topic.sections.length > 0
      ? topic.sections
      : buildFallbackSections(topic, syntax, pattern, examples)
  const practiceRail: PracticeRailItem[] =
    'practiceRail' in topic && Array.isArray(topic.practiceRail) && topic.practiceRail.length > 0
      ? topic.practiceRail
      : buildFallbackRail(activeExercise)

  const scrollToLab = () => {
    document.getElementById('quick-lab')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const displayTitle = getTopicTitle(slug, topic.title)
  const displaySummary = getTopicSummary(slug, summary)

  return (
    <main className="godemy-light mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-[34px] border border-[#d6ddfb] bg-[#eef2ff] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/trainer" className="transition-colors hover:text-slate-950">Практика</Link>
          <span>→</span>
          <span className="text-slate-700">{displayTitle}</span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            <header className="flex flex-wrap items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border-4 border-[#2a266d] bg-white text-3xl font-black tracking-tight text-[#201a61]">
                {conceptCode}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-4xl font-black tracking-tight text-[#201a61] sm:text-5xl">{displayTitle}</h1>
                  <span className="text-lg text-slate-500">на Go</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#2a266d]">↔</span>
                    {practiceRail.length} упражнения
                  </span>
                  {completed && (
                    <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Тема пройдена
                    </span>
                  )}
                  {builtInRelatedSprint && (
                    <span className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                      {builtInRelatedSprint}
                    </span>
                  )}
                </div>
              </div>
            </header>

            <div className="mt-6 rounded-[28px] border border-[#d9def4] bg-white p-6 sm:p-8">
              <SectionTitle title="Зачем нужна эта тема" />
              <p className="mt-4 text-[17px] leading-8 text-slate-700">{displaySummary}</p>

              {conceptSections.map((section) => (
                <div key={section.title} className="mt-8">
                  <SectionTitle title={section.title} />
                  <div className="mt-4 space-y-4 text-[16px] leading-8 text-slate-700">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.code && <LightCodeBlock code={section.code} />}
                </div>
              ))}

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-700">Обрати внимание</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                  {(builtInCommonMistakes.length > 0 ? builtInCommonMistakes : [
                    'не смешивай вывод в консоль и вычисление результата',
                    'сначала собери простую рабочую версию, потом улучшай',
                    'сверяйся с ожидаемым выводом перед рефакторингом',
                  ]).map((mistake) => (
                    <li key={mistake} className="flex gap-3">
                      <span className="mt-1 text-amber-600">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-[28px] border border-[#d9def4] bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2a266d]">
                <span>⌘</span>
                <span>Пройти тему</span>
              </div>

              <button
                onClick={scrollToLab}
                className="mt-5 block w-full rounded-[22px] border border-[#7667ff] bg-white p-4 text-left shadow-[0_8px_24px_rgba(118,103,255,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(118,103,255,0.18)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#dff6ff] text-2xl">🧪</div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-[#1e1b5f]">{activeExercise?.title || 'Практика по теме'}</p>
                      <span className="rounded-full border border-[#d8cffd] bg-[#f5f1ff] px-2.5 py-1 text-[11px] font-semibold text-[#5a4bd6]">
                        Рекомендуем
                      </span>
                      <span className="rounded-full border border-[#d8cffd] bg-[#f7f8ff] px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        Учебное упражнение
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {activeExercise?.description || 'Открой практику и закрепи тему на одном компактном упражнении.'}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="rounded-[28px] border border-[#d9def4] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#2a266d]">
                  <span>↔</span>
                  <span>Ещё {Math.max(practiceRail.length - 1, 0)} упражнения для закрепления</span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {practiceRail.slice(1).map((item) => (
                  <PracticeCard key={item.title} item={item} />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#d9def4] bg-white p-5">
              <p className="text-sm font-bold text-[#2a266d]">Что ты потренируешь</p>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                {(builtInMicroSkills.length > 0 ? builtInMicroSkills : [
                  'понять форму решения',
                  'закрепить один reusable pattern',
                  'не бояться маленькой практики сразу после теории',
                ]).map((skill) => (
                  <li key={skill} className="flex gap-3">
                    <span className="mt-1 text-[#5a4bd6]">•</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <section id="quick-lab" className="mt-10 rounded-[32px] border border-gray-800 bg-gradient-to-br from-slate-950 to-slate-900 shadow-2xl">
        <div className="border-b border-gray-800 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-300">Практика</p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{activeExercise?.title || 'Практика по концепту'}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
                Сначала попробуй сам, потом запусти код и только после этого отправь решение на проверку.
              </p>
            </div>
            {nextTopic && (
              <Link
                href={`/trainer/topic/${nextTopic.slug}`}
                className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-400/50 hover:bg-violet-500/15"
              >
                Следующая тема →
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="mb-4 flex border border-gray-800 bg-slate-950 p-1.5 rounded-2xl">
              <button
                onClick={() => setWorkspaceMode('browser')}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  workspaceMode === 'browser' ? 'bg-violet-500 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                В браузере
              </button>
              <button
                onClick={() => setWorkspaceMode('local')}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  workspaceMode === 'local' ? 'bg-violet-500 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                На компьютере
              </button>
            </div>

            {workspaceMode === 'browser' ? (
              <div className="overflow-hidden rounded-[28px] border border-gray-800 bg-slate-950">
                <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-white">main.go</p>
                    <p className="text-[11px] text-gray-600">Запусти код, посмотри результат и отправь решение</p>
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

                <div className="h-[480px]">
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

                <div className="flex flex-wrap items-center gap-2 border-t border-gray-800 bg-slate-950 px-4 py-3">
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
                      : 'bg-slate-950 text-gray-500'
                }`}>
                  <p className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-gray-600">Результат</p>
                  {result ? result.error || result.output || (result.passed ? 'Все тесты пройдены ✓' : 'Нет вывода') : 'Нажми «Запустить», чтобы увидеть результат.'}
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-gray-800 bg-slate-950 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-300">Работа локально</p>
                <h3 className="mt-3 text-2xl font-black text-white">Повтори упражнение у себя на компьютере</h3>
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
                  className="mt-7 w-full rounded-xl border border-gray-700 bg-slate-900 px-4 py-3 text-sm font-bold text-gray-300 transition-colors hover:border-violet-500/50 hover:text-white"
                >
                  {copied ? 'Команда скопирована ✓' : 'Скопировать стартовую команду'}
                </button>
                <p className="mt-4 text-xs leading-5 text-gray-600">
                  После проверки на компьютере вернись во вкладку “В браузере” и отправь решение, если хочешь зафиксировать прогресс.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <InfoPanel title="Что сделать прямо сейчас">
              <ol className="space-y-2 text-sm leading-6 text-gray-300">
                <li>1. Прочитай теорию и один пример слева.</li>
                <li>2. Открой quick lab и измени код под задачу.</li>
                <li>3. Запусти и сверься с ожидаемым выводом.</li>
              </ol>
            </InfoPanel>

            {builtInTopic?.expectedOutput && (
              <InfoPanel title="Ожидаемый результат">
                <code className="block rounded-xl border border-gray-800 bg-slate-950 px-3 py-3 font-mono text-sm text-cyan-200">
                  {builtInTopic.expectedOutput}
                </code>
              </InfoPanel>
            )}

            {hints.length > 0 && (
              <InfoPanel title="Подсказки">
                <ul className="space-y-2 text-sm leading-6 text-gray-300">
                  {hints.slice(0, 3).map((hint) => (
                    <li key={hint} className="flex gap-3">
                      <span className="mt-1 text-cyan-300">•</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </InfoPanel>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-2xl font-black tracking-tight text-[#201a61]">{title}</h2>
}

function LightCodeBlock({ code }: { code: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-2xl border border-[#d8def7] bg-[#fafbff] p-4 text-sm leading-7 text-[#3a356e] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <code>{code}</code>
    </pre>
  )
}

function PracticeCard({ item }: { item: PracticeRailItem }) {
  const statusTone = {
    recommended: 'border-[#7667ff] bg-white shadow-[0_8px_24px_rgba(118,103,255,0.10)]',
    learning: 'border-[#d8def7] bg-white',
    locked: 'border-[#e7eaf8] bg-[#fbfcff] opacity-90',
  }[item.status]

  const badgeTone = {
    recommended: 'bg-[#f5f1ff] text-[#5a4bd6] border-[#d8cffd]',
    learning: 'bg-[#eff6ff] text-[#3452b3] border-[#d6e4ff]',
    locked: 'bg-[#f8f8ff] text-slate-500 border-[#e5e7f5]',
  }[item.status]

  const difficultyTone = item.difficulty === 'easy'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div className={`rounded-[22px] border p-4 transition ${statusTone}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#dff6ff] text-2xl">
          {item.status === 'locked' ? '🔒' : item.status === 'learning' ? '🧠' : '🧩'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-[#1e1b5f]">{item.title}</p>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeTone}`}>
              {item.status === 'locked' ? 'Locked' : item.status === 'learning' ? 'Learning exercise' : 'Recommended'}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${difficultyTone}`}>
              {item.difficulty}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
        </div>
      </div>
    </div>
  )
}

function InfoPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[24px] border border-gray-800 bg-slate-950 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-gray-500">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function LocalStep({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-300">
        {number}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <div className="mt-2 overflow-x-auto rounded-xl bg-slate-900 px-3 py-2 font-mono text-xs text-cyan-200">
          {children}
        </div>
      </div>
    </li>
  )
}
