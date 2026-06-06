'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, getLevels, Lesson, AdminLevel } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type ModuleGroup = { name: string; lessonCount: number }

function groupByModule(lessons: Lesson[]): ModuleGroup[] {
  const map = new Map<string, number>()
  for (const l of lessons) {
    const mod = l.module || 'Без модуля'
    map.set(mod, (map.get(mod) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([name, lessonCount]) => ({ name, lessonCount }))
}

export default function LevelPage() {
  const { slug } = useParams<{ slug: string }>()
  const levelSlug = decodeURIComponent(slug)

  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [levels, setLevels] = useState<AdminLevel[]>([])
  const [loading, setLoading] = useState(true)
  const { isCompleted, loadProgress, token } = useAuthStore()

  useEffect(() => {
    Promise.all([api.getLessons(), getLevels()])
      .then(([lessons, lvls]) => {
        setAllLessons(lessons)
        setLevels(lvls)
      })
      .finally(() => setLoading(false))
    if (token) loadProgress()
  }, [token, loadProgress])

  const levelLessons = useMemo(
    () => allLessons.filter(l => l.level === levelSlug),
    [allLessons, levelSlug]
  )

  const modules = useMemo(() => groupByModule(levelLessons), [levelLessons])

  const levelInfo = useMemo(() => levels.find(l => l.slug === levelSlug), [levels, levelSlug])

  const completedCount = levelLessons.filter(l => isCompleted('lesson', l.id)).length

  const displayTitle = levelInfo?.title ?? levelSlug

  if (!loading && levelLessons.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Уровень не найден или уроки ещё не добавлены.</p>
        <Link href="/guide" className="mt-4 inline-block text-cyan-400 hover:underline">← Назад к курсу</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/guide" className="hover:text-white transition-colors">Курс</Link>
        <span className="text-gray-700">→</span>
        <span className="text-white font-medium">{displayTitle}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{displayTitle}</h1>
        {!loading && (
          <p className="text-gray-400 text-sm">
            {modules.length} {modules.length === 1 ? 'модуль' : 'модулей'} · {levelLessons.length} уроков · {completedCount} пройдено
          </p>
        )}
      </div>

      {/* Module list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ol className="space-y-3">
          {modules.map((mod, idx) => {
            const modLessons = levelLessons.filter(l => l.module === mod.name)
            const modCompleted = modLessons.filter(l => isCompleted('lesson', l.id)).length
            const allDone = mod.lessonCount > 0 && modCompleted === mod.lessonCount

            return (
              <li key={mod.name}>
                <Link
                  href={`/guide/module/${encodeURIComponent(mod.name)}`}
                  className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-2xl px-6 py-4 transition-all group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${allDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
                    {allDone ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-base md:text-lg leading-tight">{mod.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{modCompleted} / {mod.lessonCount} уроков</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-300 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
