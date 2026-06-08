'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { api, getLevels, Lesson, AdminLevel } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const S = '#8B5CF6'
const SW = 1.6

function ModuleIllustration({ idx }: { idx: number }) {
  const v = idx % 8
  if (v === 0) return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <rect x="18" y="22" width="80" height="16" rx="4" stroke={S} strokeWidth={SW}/>
      <rect x="18" y="46" width="80" height="16" rx="4" stroke={S} strokeWidth={SW}/>
      <rect x="18" y="70" width="52" height="16" rx="4" stroke={S} strokeWidth={SW}/>
      <path d="M118 30 Q118 22 126 22 L170 22 Q178 22 178 30 L178 110 Q178 118 170 118 L126 118 Q118 118 118 110 Z" stroke={S} strokeWidth={SW}/>
      <path d="M133 65 L148 55 L163 65 M148 55 L148 85" stroke={S} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M133 95 L163 95" stroke={S} strokeWidth={SW} strokeLinecap="round"/>
    </svg>
  )
  if (v === 1) return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <circle cx="78" cy="48" r="22" stroke={S} strokeWidth={SW}/>
      <path d="M56 88 C56 72 100 72 100 88 L100 118 L56 118 Z" stroke={S} strokeWidth={SW} strokeLinejoin="round"/>
      <path d="M100 78 L128 68 L140 92 L116 102" stroke={S} strokeWidth={SW} strokeLinejoin="round"/>
      <path d="M140 68 L158 58 L164 82 L148 90" stroke={S} strokeWidth={SW} strokeLinejoin="round"/>
      <path d="M116 100 L122 118" stroke={S} strokeWidth={SW} strokeLinecap="round"/>
      <path d="M148 88 L154 106" stroke={S} strokeWidth={SW} strokeLinecap="round"/>
    </svg>
  )
  if (v === 2) return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <rect x="14" y="18" width="90" height="65" rx="6" stroke={S} strokeWidth={SW}/>
      <rect x="22" y="26" width="74" height="46" rx="3" stroke={S} strokeWidth={SW}/>
      <path d="M38 100 L80 100 L80 112 L38 112 Z" stroke={S} strokeWidth={SW}/>
      <rect x="118" y="28" width="54" height="78" rx="6" stroke={S} strokeWidth={SW}/>
      <circle cx="145" cy="67" r="12" stroke={S} strokeWidth={SW}/>
      <path d="M139 67 L151 67 M145 61 L145 73" stroke={S} strokeWidth={SW} strokeLinecap="round"/>
    </svg>
  )
  if (v === 3) return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <path d="M22 115 L22 52 L58 28 L94 52 L94 115 Z" stroke={S} strokeWidth={SW} strokeLinejoin="round"/>
      <path d="M94 115 L94 60 L130 40 L166 60 L166 115" stroke={S} strokeWidth={SW} strokeLinejoin="round"/>
      <rect x="34" y="70" width="24" height="26" rx="3" stroke={S} strokeWidth={SW}/>
      <rect x="106" y="74" width="24" height="26" rx="3" stroke={S} strokeWidth={SW}/>
      <path d="M22 115 L166 115" stroke={S} strokeWidth={SW} strokeLinecap="round"/>
    </svg>
  )
  if (v === 4) return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <path d="M18 70 Q34 38 50 70 Q66 102 82 70 Q98 38 114 70 Q130 102 146 70 Q162 38 178 70" stroke={S} strokeWidth={SW} strokeLinecap="round"/>
      <path d="M18 95 Q34 63 50 95 Q66 127 82 95 Q98 63 114 95 Q130 127 146 95 Q162 63 178 95" stroke={S} strokeWidth={SW} strokeLinecap="round"/>
      <circle cx="100" cy="35" r="14" stroke={S} strokeWidth={SW}/>
      <path d="M93 35 L100 27 L107 35 M100 27 L100 47" stroke={S} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
  if (v === 5) return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <rect x="18" y="25" width="164" height="90" rx="10" stroke={S} strokeWidth={SW}/>
      <path d="M44 70 L60 50 L76 70" stroke={S} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M60 50 L60 92" stroke={S} strokeWidth={SW} strokeLinecap="round"/>
      <path d="M92 50 L108 68 L92 86" stroke={S} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M118 50 L134 68 L118 86" stroke={S} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
  if (v === 6) return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <rect x="14" y="28" width="80" height="84" rx="8" stroke={S} strokeWidth={SW}/>
      <rect x="28" y="42" width="52" height="8" rx="3" stroke={S} strokeWidth={SW}/>
      <rect x="28" y="58" width="52" height="8" rx="3" stroke={S} strokeWidth={SW}/>
      <rect x="28" y="74" width="34" height="8" rx="3" stroke={S} strokeWidth={SW}/>
      <circle cx="148" cy="70" r="36" stroke={S} strokeWidth={SW}/>
      <path d="M134 70 L148 56 L162 70 L148 84 Z" stroke={S} strokeWidth={SW} strokeLinejoin="round"/>
    </svg>
  )
  // v === 7
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <path d="M30 28 L30 112 L170 112" stroke={S} strokeWidth={SW} strokeLinecap="round"/>
      <path d="M30 88 L60 62 L90 74 L120 44 L150 56 L170 36" stroke={S} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx="60" cy="62" r="5" fill={S}/>
      <circle cx="90" cy="74" r="5" fill={S}/>
      <circle cx="120" cy="44" r="5" fill={S}/>
      <circle cx="150" cy="56" r="5" fill={S}/>
    </svg>
  )
}

type ModuleCard = {
  name: string
  levelKey: string
  levelOrder: number
  lessonCount: number
  firstLessonOrder: number
}

function buildModuleCards(lessons: Lesson[], levels: AdminLevel[]): ModuleCard[] {
  const levelMap = new Map(levels.map(l => [l.slug, l]))
  const map = new Map<string, ModuleCard>()
  for (const l of lessons) {
    const lk = l.level || 'level1'
    const dbLevel = levelMap.get(lk)
    const numericLevel = parseInt(lk.replace('level', ''), 10) || 1
    const moduleName = l.module || 'Без модуля'
    const key = `${lk}::${moduleName}`
    if (!map.has(key)) {
      map.set(key, {
        name: moduleName,
        levelKey: lk,
        levelOrder: dbLevel?.order ?? numericLevel,
        lessonCount: 0,
        firstLessonOrder: Number.MAX_SAFE_INTEGER,
      })
    }
    const card = map.get(key)!
    card.lessonCount += 1
    card.firstLessonOrder = Math.min(card.firstLessonOrder, l.order ?? Number.MAX_SAFE_INTEGER)
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.levelOrder !== b.levelOrder) return a.levelOrder - b.levelOrder
    if (a.firstLessonOrder !== b.firstLessonOrder) return a.firstLessonOrder - b.firstLessonOrder
    return a.name.localeCompare(b.name)
  })
}

function GuideContent() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [levels, setLevels] = useState<AdminLevel[]>([])
  const [loading, setLoading] = useState(true)
  const { isCompleted, loadProgress, token, user } = useAuthStore()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === '1'

  useEffect(() => {
    Promise.all([api.getLessons(), getLevels()])
      .then(([lessonsData, levelsData]) => {
        setLessons(lessonsData)
        setLevels(levelsData.sort((a, b) => a.order - b.order))
      })
      .finally(() => setLoading(false))
    if (token) loadProgress()
  }, [token, loadProgress])

  const moduleCards = useMemo(() => buildModuleCards(lessons, levels), [lessons, levels])
  const nextLesson = useMemo(() => lessons.find((l) => !isCompleted('lesson', l.id)) ?? lessons[0], [lessons, isCompleted])
  const completedCount = useMemo(() => lessons.filter((l) => isCompleted('lesson', l.id)).length, [lessons, isCompleted])
  const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {!loading && lessons.length > 0 && (
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl px-6 py-4 mb-8 flex items-center gap-6 flex-wrap shadow-[0_12px_30px_rgba(2,6,23,0.35)]">
            <div className="flex-1 min-w-48">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400 font-medium">Прогресс обучения</span>
                <span className="text-gray-100 font-semibold">{pct}%</span>
              </div>
              <div className="h-2.5 bg-gray-700/80 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">{completedCount} из {lessons.length} уроков пройдено</p>
            </div>
            {nextLesson && (
              <Link href={`/guide/${nextLesson.slug}`} className="flex-shrink-0 flex items-center gap-2 border border-violet-500/40 bg-violet-500/15 hover:bg-violet-500/25 text-violet-200 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <span>{completedCount > 0 ? 'Продолжить обучение' : 'Начать обучение'}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </Link>
            )}
          </div>
        )}

        {isWelcome && !loading && (
          <div className="mb-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-6 py-4">
            <p className="text-violet-300 text-sm font-medium">Добро пожаловать! Начни с первого модуля.</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : moduleCards.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl px-8 py-12 text-center">
            <p className="text-gray-500 text-sm">Программа курса ещё не опубликована.</p>
            {user?.isAdmin && (
              <Link href="/admin/structure" className="mt-3 inline-block text-violet-300 hover:underline text-sm">
                Перейти в админку →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {(() => {
              // Group by level, preserve order
              const levelGroups: { levelKey: string; mods: typeof moduleCards }[] = []
              for (const mod of moduleCards) {
                const last = levelGroups[levelGroups.length - 1]
                if (last && last.levelKey === mod.levelKey) {
                  last.mods.push(mod)
                } else {
                  levelGroups.push({ levelKey: mod.levelKey, mods: [mod] })
                }
              }
              let globalIdx = 0
              return levelGroups.map(({ levelKey, mods }) => {
                const levelInfo = levels.find(l => l.slug === levelKey)
                const levelLabel = levelInfo?.title || levelKey
                return (
                  <div key={levelKey}>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="h-px flex-1 bg-gray-800/80" />
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">{levelLabel}</h2>
                      <div className="h-px flex-1 bg-gray-800/80" />
                    </div>
                    <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {mods.map((mod) => {
                        const idx = globalIdx++
                        const modLessons = lessons.filter(l => l.module === mod.name)
                        const modCompleted = modLessons.filter(l => isCompleted('lesson', l.id)).length
                        const allDone = mod.lessonCount > 0 && modCompleted === mod.lessonCount
                        return (
                          <li key={`${mod.levelKey}-${mod.name}`}>
                            <Link
                              href={`/guide/module/${encodeURIComponent(mod.name)}`}
                              className="group block bg-gray-900/80 border border-gray-800 hover:border-violet-500/40 hover:bg-gray-900 rounded-2xl p-6 h-full transition-colors"
                            >
                              <div className="h-36 flex items-center justify-center mb-5" style={{ opacity: allDone ? 0.45 : 1 }}>
                                <ModuleIllustration idx={idx} />
                              </div>
                              <h1 className="text-gray-100 text-3xl font-semibold tracking-tight leading-tight mb-0.5">{mod.name}</h1>
                              <p className="text-[11px] font-medium text-violet-300 uppercase tracking-wider mb-1">Модуль {idx + 1}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {mod.lessonCount} уроков
                                {allDone ? ' · Пройдено ✓' : modCompleted > 0 ? ` · ${modCompleted} пройдено` : ''}
                              </p>
                            </Link>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                )
              })
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default function GuidePage() {
  return (
    <Suspense>
      <GuideContent />
    </Suspense>
  )
}
