'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api, Lesson } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

function TopicContent() {
  const { topicName } = useParams<{ topicName: string }>()
  const searchParams = useSearchParams()
  const topicDecoded = decodeURIComponent(topicName)
  const moduleDecoded = decodeURIComponent(searchParams.get('module') ?? '')

  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const { isCompleted, loadProgress, token } = useAuthStore()

  useEffect(() => {
    api.getLessons().then(setAllLessons).finally(() => setLoading(false))
    if (token) loadProgress()
  }, [token, loadProgress])

  const topicLessons = useMemo(() => {
    let filtered = allLessons.filter(l => l.category === topicDecoded)
    if (moduleDecoded) filtered = filtered.filter(l => l.module === moduleDecoded)
    return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
  }, [allLessons, topicDecoded, moduleDecoded])

  const levelSlug = topicLessons[0]?.level
  const completedCount = topicLessons.filter(l => isCompleted('lesson', l.id)).length

  if (!loading && topicLessons.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Тема не найдена.</p>
        <Link href="/guide" className="mt-4 inline-block text-cyan-400 hover:underline">← Назад к курсу</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link href="/guide" className="hover:text-white transition-colors">Курс</Link>
        {levelSlug && (
          <>
            <span className="text-gray-700">→</span>
            <Link href={`/guide/level/${encodeURIComponent(levelSlug)}`} className="hover:text-white transition-colors">Уровень</Link>
          </>
        )}
        {moduleDecoded && (
          <>
            <span className="text-gray-700">→</span>
            <Link href={`/guide/module/${encodeURIComponent(moduleDecoded)}`} className="hover:text-white transition-colors">{moduleDecoded}</Link>
          </>
        )}
        <span className="text-gray-700">→</span>
        <span className="text-white font-medium">{topicDecoded}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{topicDecoded}</h1>
        {!loading && (
          <p className="text-gray-400 text-sm">
            {topicLessons.length} уроков · {completedCount} пройдено
          </p>
        )}
      </div>

      {/* Lesson list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ol className="space-y-2">
          {topicLessons.map((lesson, idx) => {
            const done = isCompleted('lesson', lesson.id)
            const href = `/guide/${lesson.slug}?module=${encodeURIComponent(moduleDecoded)}&topic=${encodeURIComponent(topicDecoded)}`
            return (
              <li key={lesson.slug}>
                <Link
                  href={href}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-gray-900 transition-colors group border border-transparent hover:border-gray-800"
                >
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold border ${done ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-gray-900 border-gray-700 text-gray-500 group-hover:border-gray-600'}`}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'text-gray-400' : 'text-white'}`}>{lesson.title}</p>
                    {lesson.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{lesson.description}</p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
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
