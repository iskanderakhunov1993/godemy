'use client'

import { useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { storyCourseLessons, storyCourseLevels } from '@/lib/storyCourse'
import { useAuthStore } from '@/lib/store'

function groupByModule() {
  const map = new Map<string, number>()
  for (const lesson of storyCourseLessons) {
    map.set(lesson.module, (map.get(lesson.module) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([name, lessonCount]) => ({ name, lessonCount }))
}

export default function LevelPage() {
  const { slug } = useParams<{ slug: string }>()
  const levelSlug = decodeURIComponent(slug)
  const { isCompleted, loadProgress, token } = useAuthStore()

  useEffect(() => {
    if (token) loadProgress()
  }, [token, loadProgress])

  const levelInfo = useMemo(() => storyCourseLevels.find((item) => item.slug === levelSlug), [levelSlug])
  const levelLessons = useMemo(
    () => storyCourseLessons.filter((lesson) => lesson.level === levelSlug),
    [levelSlug]
  )
  const modules = useMemo(() => groupByModule(), [])
  const completedCount = levelLessons.filter((lesson) => isCompleted('lesson', lesson.id)).length

  if (!levelInfo || levelLessons.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-gray-400">Уровень не найден.</p>
        <Link href="/guide" className="mt-4 inline-block text-cyan-400 hover:underline">← Назад к курсу</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/guide" className="transition-colors hover:text-white">Курс</Link>
        <span className="text-gray-700">→</span>
        <span className="font-medium text-white">{levelInfo.title}</span>
      </nav>

      <header className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">Campaign</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{levelInfo.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">{levelInfo.description}</p>
        <p className="mt-4 text-sm text-gray-400">
          {modules.length} модулей · {levelLessons.length} уроков · {completedCount} пройдено
        </p>
      </header>

      <ol className="space-y-3">
        {modules.map((moduleItem, index) => {
          const lessons = levelLessons.filter((lesson) => lesson.module === moduleItem.name)
          const done = lessons.filter((lesson) => isCompleted('lesson', lesson.id)).length
          const completed = lessons.length > 0 && done === lessons.length

          return (
            <li key={moduleItem.name}>
              <Link
                href={`/guide/module/${encodeURIComponent(moduleItem.name)}`}
                className="group flex items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900 px-6 py-4 transition-all hover:border-cyan-300/30 hover:bg-gray-800"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold ${completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-400'}`}>
                  {completed ? '✓' : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-white">{moduleItem.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{done} / {moduleItem.lessonCount} уроков</p>
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
