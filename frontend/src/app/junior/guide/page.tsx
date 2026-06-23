'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, Lesson } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const categoryColors: Record<string, string> = {
  'Sprint 0': 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/20',
  'Sprint 1': 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/20',
  'Sprint 2': 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/20',
  'Sprint 3': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'Sprint 4': 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  'Sprint 5': 'bg-rose-500/10 text-rose-300 border-rose-500/20',
}

function sprintOrder(category: string): number {
  const match = category.match(/Sprint\s+(\d+)/i)
  if (!match) return 999
  return Number(match[1])
}

export default function JuniorGuidePage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const { isCompleted, loadProgress, token } = useAuthStore()

  useEffect(() => {
    api.getLessons({ module: 'bootcamp' }).then(setLessons).finally(() => setLoading(false))
    if (token) loadProgress()
  }, [token, loadProgress])

  const orderedLessons = [...lessons].sort((a, b) => a.order - b.order)
  const categories = [...new Set(orderedLessons.map((l) => l.category))].sort(
    (a, b) => sprintOrder(a) - sprintOrder(b)
  )

  const totalCount = orderedLessons.length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20 mb-3">
          3 модуль
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Junior Course</h1>
        <p className="text-gray-400">Полный roadmap: Sprint 0 + 5 проектных спринтов. Доступно {totalCount} страниц.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border mb-4 ${categoryColors[cat] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                {cat}
              </div>
              <div className="space-y-2">
                {orderedLessons
                  .filter((l) => l.category === cat)
                  .map((lesson) => {
                    const done = isCompleted('lesson', lesson.id)
                    return (
                      <Link
                        key={lesson.id}
                        href={`/junior/guide/${lesson.slug}`}
                        className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-5 py-4 transition-colors group"
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${done ? 'bg-[#FFD60A] border-[#FFD60A]' : 'border-gray-600 group-hover:border-[#FFD60A]'}`}>
                          {done && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white group-hover:text-[#FFD60A] transition-colors">
                            {lesson.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">{lesson.description}</div>
                        </div>
                        <span className="text-gray-600 group-hover:text-gray-400 flex-shrink-0">→</span>
                      </Link>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
