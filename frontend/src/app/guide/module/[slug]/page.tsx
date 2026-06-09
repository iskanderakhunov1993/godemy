'use client'

import { useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Lesson } from '@/lib/api'
import { getStoryLessonsByModule, getStoryModuleMeta } from '@/lib/storyCourse'
import { useAuthStore } from '@/lib/store'

type TopicGroup = { name: string; lessons: Lesson[] }

function groupByTopic(lessons: Lesson[]): TopicGroup[] {
  const map = new Map<string, TopicGroup>()
  for (const l of lessons) {
    const topic = l.category || 'Основное'
    if (!map.has(topic)) map.set(topic, { name: topic, lessons: [] })
    map.get(topic)!.lessons.push(l)
  }
  const groups = Array.from(map.values())
  groups.forEach(g => g.lessons.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id))
  return groups
}

export default function ModulePage() {
  const { slug } = useParams<{ slug: string }>()
  const moduleName = decodeURIComponent(slug)
  const { isCompleted, loadProgress, token } = useAuthStore()

  useEffect(() => {
    if (token) loadProgress()
  }, [token, loadProgress])

  const moduleLessons = useMemo(() => getStoryLessonsByModule(moduleName), [moduleName])
  const moduleMeta = useMemo(() => getStoryModuleMeta(moduleName), [moduleName])

  const topics = useMemo(() => groupByTopic(moduleLessons), [moduleLessons])
  const completedCount = moduleLessons.filter(l => isCompleted('lesson', l.id)).length
  const levelSlug = moduleLessons[0]?.level

  if (moduleLessons.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Модуль не найден или уроки ещё не добавлены.</p>
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
        <span className="text-gray-700">→</span>
        <span className="text-white font-medium">{moduleName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{moduleName}</h1>
        <p className="text-gray-400 text-sm">
          {topics.length} {topics.length === 1 ? 'тема' : topics.length < 5 ? 'темы' : 'тем'} · {moduleLessons.length} уроков · {completedCount} пройдено
        </p>
        {moduleMeta && (
          <div className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">{moduleMeta.sprint}</p>
              <p className="mt-2 text-sm leading-6 text-gray-300">{moduleMeta.subtitle}</p>
            </div>
            <div className="grid gap-2 text-sm text-gray-300">
              <p><span className="text-gray-500">Jira:</span> <span className="font-mono text-cyan-300">{moduleMeta.ticket}</span></p>
              <p><span className="text-gray-500">Ритуал:</span> {moduleMeta.ritual}</p>
              <p><span className="text-gray-500">Результат:</span> {moduleMeta.deliverable}</p>
            </div>
          </div>
        )}
        <div className="mt-5 rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">Как учиться в этом спринте</p>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            Сначала пройди уроки этого спринта по порядку, потом добей узкие навыки в тренажёре.
            Так ты получишь и продуктовый контекст, и короткие технические повторы без перегруза.
          </p>
          <Link href="/trainer" className="mt-3 inline-flex text-sm font-semibold text-violet-300 hover:text-violet-200">
            Открыть тренажёр →
          </Link>
        </div>
      </div>

      {/* Topics list (or lessons directly if single topic) */}
      {topics.length === 0 ? (
        <p className="text-gray-500 text-sm">Уроки ещё не добавлены.</p>
      ) : (
        /* Always show topic cards — never skip topic level */
        <ol className="space-y-3">
          {topics.map((topic, idx) => {
            const topicCompleted = topic.lessons.filter(l => isCompleted('lesson', l.id)).length
            const allDone = topic.lessons.length > 0 && topicCompleted === topic.lessons.length
            return (
              <li key={topic.name}>
                <Link
                  href={`/guide/topic/${encodeURIComponent(topic.name)}?module=${encodeURIComponent(moduleName)}`}
                  className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-2xl px-6 py-4 transition-all group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${allDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
                    {allDone ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{topic.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{topicCompleted} / {topic.lessons.length} уроков</p>
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
