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
  loading: () => <div className="h-full animate-pulse bg-neutral-900" />,
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
  try { return JSON.parse(raw) as TopicExample[] } catch { return [] }
}

function parseHints(raw?: string): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) as string[] } catch { return [] }
}

function buildFallbackSections(topic: TrainerTopic, syntax: string, pattern: string, examples: TopicExample[]): ConceptSection[] {
  return [
    {
      title: 'Зачем нужна тема',
      paragraphs: [
        topic.explanation || 'Этот концепт объясняет одну важную идею Go и сразу переводит её в практику.',
        'Сначала зафиксируй форму решения, а потом уже запоминай частные случаи.',
      ],
    },
    {
      title: 'Как это выглядит в коде',
      paragraphs: ['Синтаксис — это не то, что нужно зубрить. Важнее заметить форму: где вход, где логика и где результат.'],
      code: syntax,
    },
    ...(examples[0]
      ? [{ title: examples[0].title, paragraphs: [examples[0].description || 'Разбери пример и попробуй изменить входные данные.'], code: examples[0].code }]
      : []),
    {
      title: 'Шаблон решения',
      paragraphs: ['Возьми этот каркас как форму решения. Меняй входные данные и центральную проверку под свою задачу.'],
      code: pattern,
    },
  ]
}

function buildFallbackRail(activeExercise: Exercise | null): PracticeRailItem[] {
  return [
    { title: activeExercise?.title || 'Практика по теме', description: activeExercise?.description || 'Начни с одного базового упражнения.', difficulty: 'easy', status: 'recommended' },
    { title: 'Повторить похожую задачу', description: 'Повтори шаблон с другими входными данными.', difficulty: 'easy', status: 'learning' },
    { title: 'Проверить сложные случаи', description: 'Проверь поведение на пустых и пограничных значениях.', difficulty: 'medium', status: 'locked' },
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
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : undefined
  const completed = activeExercise
    ? isBuiltInExercise(activeExercise.id)
      ? localCompleted
      : isCompleted('exercise', activeExercise.id)
    : false

  const runCode = async () => {
    setRunning(true)
    setResult(null)
    try { setResult(await api.runCode(code)) }
    catch (error) { setResult({ output: '', error: (error as Error).message, passed: false }) }
    finally { setRunning(false) }
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
        setResult({ ...response, passed, error: passed ? response.error : response.error || `Ожидаемый вывод: ${expectedOutput || 'корректный результат'}` })
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
    } finally { setSubmitting(false) }
  }

  const copyLocalCommand = async () => {
    await navigator.clipboard.writeText('mkdir godemy-practice && cd godemy-practice && go mod init practice && touch main.go')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  if (loading || !topic) {
    return (
      <main className="page-wrap py-10">
        <div className="h-12 animate-pulse rounded-2xl bg-neutral-800" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="h-[600px] animate-pulse rounded-2xl bg-neutral-800" />
          <div className="h-[400px] animate-pulse rounded-2xl bg-neutral-800" />
        </div>
      </main>
    )
  }

  const syntax = topic.syntax?.trim() || activeExercise?.starterCode || fallbackCode
  const pattern = topic.patterns?.trim() || `func Solve(input string) string {\n\t// 1. проверь входные данные\n\t// 2. выполни логику\n\treturn ""\n}`
  const conceptCode = 'conceptCode' in topic && typeof topic.conceptCode === 'string' ? topic.conceptCode : topic.title.slice(0, 2)
  const summary = 'summary' in topic && typeof topic.summary === 'string' ? topic.summary : topic.explanation || ''
  const builtInMicroSkills = 'microSkills' in topic && Array.isArray(topic.microSkills) ? topic.microSkills : []
  const builtInCommonMistakes = 'commonMistakes' in topic && Array.isArray(topic.commonMistakes) ? topic.commonMistakes : []
  const builtInRelatedSprint = 'relatedSprint' in topic && typeof topic.relatedSprint === 'string' ? topic.relatedSprint : ''
  const conceptSections: ConceptSection[] = 'sections' in topic && Array.isArray(topic.sections) && topic.sections.length > 0
    ? topic.sections
    : buildFallbackSections(topic, syntax, pattern, examples)
  const practiceRail: PracticeRailItem[] = 'practiceRail' in topic && Array.isArray(topic.practiceRail) && topic.practiceRail.length > 0
    ? topic.practiceRail
    : buildFallbackRail(activeExercise)

  const displayTitle = getTopicTitle(slug, topic.title)
  const displaySummary = getTopicSummary(slug, summary)

  return (
    <main className="page-wrap py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/trainer" className="hover:text-white transition-colors">Тренажёр</Link>
        <span className="text-neutral-600">/</span>
        <span className="text-neutral-300">{displayTitle}</span>
        {completed && (
          <span className="ml-2 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-400">
            Пройдено
          </span>
        )}
      </div>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--app-yellow)]/20 bg-[var(--app-yellow)]/10 font-mono text-lg font-black text-[var(--app-yellow)]">
          {conceptCode}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{displayTitle}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <span>{practiceRail.length} упражнений</span>
            {builtInRelatedSprint && <span className="text-[var(--app-yellow)]">{builtInRelatedSprint}</span>}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Theory column */}
        <div className="min-w-0 space-y-6">
          {/* Summary */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-bold text-white">Зачем нужна эта тема</h2>
            <p className="mt-3 text-base leading-relaxed text-neutral-400">{displaySummary}</p>
          </section>

          {/* Sections */}
          {conceptSections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
              <div className="mt-3 space-y-3 text-base leading-relaxed text-neutral-400">
                {section.paragraphs.map((p) => <p key={p}>{p}</p>)}
              </div>
              {section.code && (
                <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#0d1117] p-4 font-mono text-sm leading-7 text-neutral-200">
                  <code>{section.code}</code>
                </pre>
              )}
            </section>
          ))}

          {/* Common mistakes */}
          <section className="rounded-2xl border border-[var(--app-yellow)]/20 bg-[var(--app-yellow)]/[0.05] p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--app-yellow)]">Обрати внимание</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-300">
              {(builtInCommonMistakes.length > 0 ? builtInCommonMistakes : [
                'не смешивай вывод в консоль и вычисление результата',
                'сначала собери простую рабочую версию, потом улучшай',
                'сверяйся с ожидаемым выводом перед рефакторингом',
              ]).map((m) => (
                <li key={m} className="flex gap-2">
                  <span className="text-[var(--app-yellow)]">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {/* Main exercise CTA */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-bold text-[var(--app-yellow)]">Практика</h3>
            <button
              onClick={() => document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-3 w-full rounded-xl border border-[var(--app-yellow)]/30 bg-[var(--app-yellow)]/[0.08] p-4 text-left transition hover:bg-[var(--app-yellow)]/[0.12]"
            >
              <p className="font-bold text-white">{activeExercise?.title || 'Практика по теме'}</p>
              <p className="mt-1 text-sm text-neutral-400">{activeExercise?.description || 'Закрепи тему на упражнении.'}</p>
              <p className="mt-3 text-xs font-semibold text-[var(--app-yellow)]">Перейти к коду ↓</p>
            </button>
          </div>

          {/* Practice rail */}
          {practiceRail.length > 1 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-bold text-neutral-400">Ещё упражнения</h3>
              <div className="mt-3 space-y-2">
                {practiceRail.slice(1).map((item) => (
                  <div key={item.title} className={`rounded-xl border p-3 ${
                    item.status === 'locked'
                      ? 'border-white/5 bg-white/[0.02] opacity-60'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.difficulty === 'easy'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-[var(--app-yellow)]/10 text-[var(--app-yellow)]'
                      }`}>{item.difficulty}</span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Micro skills */}
          {builtInMicroSkills.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-bold text-neutral-400">Что ты потренируешь</h3>
              <ul className="mt-3 space-y-2">
                {builtInMicroSkills.map((skill) => (
                  <li key={skill} className="flex gap-2 text-sm text-neutral-300">
                    <span className="text-[var(--app-yellow)]">•</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* ── Code Lab ── */}
      <section id="lab" className="mt-10 rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 px-6 py-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-yellow)]">Практика</span>
            <h2 className="mt-1 text-2xl font-black text-white">{activeExercise?.title || 'Практика по теме'}</h2>
          </div>
          <div className="flex gap-2">
            {prevTopic && (
              <Link href={`/trainer/topic/${prevTopic.slug}`} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors">
                ← Назад
              </Link>
            )}
            {nextTopic && (
              <Link href={`/trainer/topic/${nextTopic.slug}`} className="rounded-xl border border-[var(--app-yellow)]/30 bg-[var(--app-yellow)]/10 px-3 py-2 text-sm font-semibold text-[var(--app-yellow)] hover:bg-[var(--app-yellow)]/15 transition-colors">
                Дальше →
              </Link>
            )}
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-white/8">
          <button
            onClick={() => setWorkspaceMode('browser')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              workspaceMode === 'browser' ? 'bg-white/[0.06] text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            В браузере
          </button>
          <button
            onClick={() => setWorkspaceMode('local')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              workspaceMode === 'local' ? 'bg-white/[0.06] text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            На компьютере
          </button>
        </div>

        {workspaceMode === 'browser' ? (
          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            {/* Editor */}
            <div className="min-w-0">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
                <span className="text-xs font-semibold text-neutral-400">main.go</span>
                <button
                  onClick={() => { setCode(activeExercise?.starterCode || syntax); setResult(null) }}
                  className="text-xs text-neutral-600 hover:text-white transition-colors"
                >
                  Сбросить
                </button>
              </div>
              <div className="h-[420px]">
                <MonacoEditor
                  height="100%"
                  language="go"
                  theme="vs-dark"
                  value={code}
                  onChange={(v) => setCode(v || '')}
                  options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, scrollBeyondLastLine: false, tabSize: 4, padding: { top: 16 } }}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t border-white/8 px-4 py-3">
                <button
                  onClick={() => void runCode()}
                  disabled={running}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
                >
                  {running ? 'Запуск…' : '▶ Запустить'}
                </button>
                {activeExercise && (
                  <button
                    onClick={() => void submitCode()}
                    disabled={submitting}
                    className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Проверяем…' : 'Проверить решение'}
                  </button>
                )}
              </div>

              {/* Output */}
              <div className={`min-h-24 border-t border-white/8 p-4 font-mono text-sm ${
                result?.error ? 'bg-red-500/5 text-red-300'
                  : result?.passed ? 'bg-green-500/5 text-green-300'
                  : 'text-neutral-500'
              }`}>
                <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-neutral-600">Результат</p>
                {result
                  ? result.error || result.output || (result.passed ? 'Все тесты пройдены ✓' : 'Нет вывода')
                  : 'Нажми «Запустить», чтобы увидеть результат.'}
              </div>
            </div>

            {/* Right panel */}
            <div className="border-l border-white/8 p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Что сделать</p>
                <ol className="mt-3 space-y-2 text-sm text-neutral-400">
                  <li>1. Прочитай теорию выше.</li>
                  <li>2. Измени код под задачу.</li>
                  <li>3. Запусти и проверь результат.</li>
                </ol>
              </div>

              {builtInTopic?.expectedOutput && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Ожидаемый вывод</p>
                  <pre className="mt-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-[var(--app-yellow)]">
                    {builtInTopic.expectedOutput}
                  </pre>
                </div>
              )}

              {hints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Подсказки</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-neutral-400">
                    {hints.slice(0, 3).map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="text-[var(--app-yellow)]">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-xl font-bold text-white">Повтори упражнение локально</h3>
            <ol className="mt-5 space-y-4">
              {[
                ['Создай папку', 'mkdir godemy-practice && cd godemy-practice'],
                ['Инициализируй модуль', 'go mod init practice'],
                ['Создай файл', 'touch main.go'],
                ['Запусти', 'go run .'],
              ].map(([title, cmd], i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--app-yellow)]/10 text-xs font-bold text-[var(--app-yellow)]">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <code className="mt-1 block rounded-lg bg-black/30 px-3 py-1.5 font-mono text-xs text-[var(--app-yellow)]">{cmd}</code>
                  </div>
                </li>
              ))}
            </ol>
            <button
              onClick={() => void copyLocalCommand()}
              className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-neutral-300 hover:bg-white/[0.08] transition-colors"
            >
              {copied ? 'Скопировано ✓' : 'Скопировать команду'}
            </button>
          </div>
        )}
      </section>

      {/* Bottom nav */}
      <div className="mt-6 flex items-center justify-between">
        {prevTopic ? (
          <Link href={`/trainer/topic/${prevTopic.slug}`} className="text-sm text-neutral-500 hover:text-white transition-colors">← {getTopicTitle(prevTopic.slug, prevTopic.title)}</Link>
        ) : <span />}
        {nextTopic ? (
          <Link href={`/trainer/topic/${nextTopic.slug}`} className="text-sm font-semibold text-[var(--app-yellow)] hover:underline">{getTopicTitle(nextTopic.slug, nextTopic.title)} →</Link>
        ) : <span />}
      </div>
    </main>
  )
}
