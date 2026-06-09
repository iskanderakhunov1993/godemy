'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getStoryLessonsByTopic } from '@/lib/storyCourse'
import { useAuthStore } from '@/lib/store'

function TopicContent() {
  const { topicName } = useParams<{ topicName: string }>()
  const searchParams = useSearchParams()
  const topicDecoded = decodeURIComponent(topicName)
  const moduleDecoded = decodeURIComponent(searchParams.get('module') ?? '')
  const { isCompleted, loadProgress, token } = useAuthStore()

  useEffect(() => {
    if (token) loadProgress()
  }, [token, loadProgress])

  const topicLessons = useMemo(
    () => getStoryLessonsByTopic(topicDecoded, moduleDecoded || undefined),
    [topicDecoded, moduleDecoded]
  )

  if (topicLessons.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-gray-400">Тема не найдена.</p>
        <Link href="/guide" className="mt-4 inline-block text-cyan-400 hover:underline">← Назад к курсу</Link>
      </div>
    )
  }

  const completedCount = topicLessons.filter((lesson) => isCompleted('lesson', lesson.id)).length
  const levelSlug = topicLessons[0]?.level

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link href="/guide" className="transition-colors hover:text-white">Курс</Link>
        {levelSlug && (
          <>
            <span className="text-gray-700">→</span>
            <Link href={`/guide/level/${encodeURIComponent(levelSlug)}`} className="transition-colors hover:text-white">Уровень</Link>
          </>
        )}
        {moduleDecoded && (
          <>
            <span className="text-gray-700">→</span>
            <Link href={`/guide/module/${encodeURIComponent(moduleDecoded)}`} className="transition-colors hover:text-white">{moduleDecoded}</Link>
          </>
        )}
        <span className="text-gray-700">→</span>
        <span className="font-medium text-white">{topicDecoded}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-white">{topicDecoded}</h1>
        <p className="mt-2 text-sm text-gray-400">{topicLessons.length} уроков · {completedCount} пройдено</p>
      </header>

      <ol className="space-y-2">
        {topicLessons.map((lesson, index) => {
          const done = isCompleted('lesson', lesson.id)
          const href = `/guide/${lesson.slug}?module=${encodeURIComponent(lesson.module)}&topic=${encodeURIComponent(topicDecoded)}`
          return (
            <li key={lesson.slug}>
              <Link
                href={href}
                className="group flex items-center gap-4 rounded-xl border border-transparent px-5 py-4 transition-colors hover:border-gray-800 hover:bg-gray-900"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl border text-sm font-bold ${done ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-gray-700 bg-gray-900 text-gray-500'}`}>
                  {done ? '✓' : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${done ? 'text-gray-400' : 'text-white'}`}>{lesson.title}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{lesson.description}</p>
                </div>
                <span className="text-gray-600 transition-colors group-hover:text-cyan-200">→</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function TopicPage() {
  return (
    <Suspense>
      <TopicContent />
    </Suspense>
  )
}
