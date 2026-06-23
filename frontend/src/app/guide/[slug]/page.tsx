'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api, Lesson, getLevels, AdminLevel } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { markActivityToday, saveLastVisited } from '@/lib/streak'
import { LessonContentRenderer, hasGateableTasks, TasksStatus } from '@/components/LessonContent'
import { getStoryCourseLesson, storyCourseLessons, storyCourseLevels } from '@/lib/storyCourse'
import { getRecommendedTrainerConcepts } from '@/lib/trainerConcepts'

export default function LessonPage() {
  return (
    <Suspense>
      <LessonContent />
    </Suspense>
  )
}

function LessonContent() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const moduleSlug = searchParams.get('module') ?? ''
  const topicParam = searchParams.get('topic') ?? ''
  const storyLesson = getStoryCourseLesson(slug)
  const [lesson, setLesson] = useState<Lesson | null>(storyLesson)
  const [allLessons, setAllLessons] = useState<Lesson[]>(storyLesson ? storyCourseLessons : [])
  const [levels, setLevels] = useState<AdminLevel[]>(storyLesson ? storyCourseLevels : [])
  const [loading, setLoading] = useState(true)
  const { token, isCompleted, loadProgress } = useAuthStore()
  const [tasksStatus, setTasksStatus] = useState<TasksStatus | null>(null)

  useEffect(() => {
    if (token) loadProgress()
  }, [token, loadProgress])

  useEffect(() => {
    Promise.all([
      api.getLesson(slug),
      api.getLessons(),
      getLevels(),
    ])
      .then(([l, all, levelsData]) => {
        setLesson(l)
        setAllLessons(all)
        setLevels(levelsData.sort((a, b) => a.order - b.order))
        saveLastVisited({ href: `/guide/${slug}`, title: l.title, type: 'lesson' })
        markActivityToday()
      })
      .catch(() => {
        if (storyLesson) {
          setLesson(storyLesson)
          setAllLessons(storyCourseLessons)
          setLevels(storyCourseLevels)
          saveLastVisited({ href: `/guide/${slug}`, title: storyLesson.title, type: 'lesson' })
          markActivityToday()
          return
        }
        router.push('/guide')
      })
      .finally(() => setLoading(false))
  }, [slug, router, storyLesson])

  const markComplete = async () => {
    if (!token || !lesson) return
    await api.updateProgress('lesson', lesson.id, 'completed')
    await loadProgress()
  }

  // Auto-complete text-only lessons when they load
  useEffect(() => {
    if (!lesson || !token) return
    if (isCompleted('lesson', lesson.id)) return
    if (hasGateableTasks(lesson.content)) return
    // No required tasks — mark complete automatically
    markComplete()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, token])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-8 bg-gray-800 rounded w-1/3 animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-gray-800 rounded animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!lesson) return null

  // Keep navigation context stable even if URL misses module/topic params
  const decodedModule = moduleSlug ? decodeURIComponent(moduleSlug) : (lesson.module || '')
  const decodedTopic = topicParam ? decodeURIComponent(topicParam) : (lesson.category || '')
  const querySuffix = `${decodedModule ? `?module=${encodeURIComponent(decodedModule)}` : ''}${decodedTopic ? `${decodedModule ? '&' : '?'}topic=${encodeURIComponent(decodedTopic)}` : ''}`
  const sidebarLessons = (() => {
    let list = allLessons
    if (decodedModule) list = list.filter(l => l.module === decodedModule)
    if (decodedTopic)  list = list.filter(l => l.category === decodedTopic)
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
  })()

  const currentIndex = sidebarLessons.findIndex((l) => l.slug === slug)
  const safeIndex = currentIndex >= 0 ? currentIndex : sidebarLessons.findIndex((l) => l.id === lesson.id)
  const prevLessonRaw = safeIndex > 0 ? sidebarLessons[safeIndex - 1] : null
  const nextLessonRaw = safeIndex >= 0 && safeIndex < sidebarLessons.length - 1 ? sidebarLessons[safeIndex + 1] : null
  const prevLesson = prevLessonRaw?.slug === slug ? null : prevLessonRaw
  const nextLesson = nextLessonRaw?.slug === slug ? null : nextLessonRaw
  const completed = isCompleted('lesson', lesson.id)
  const allTasksDone = tasksStatus === null || tasksStatus.done >= tasksStatus.total
  const canProceed = completed || allTasksDone
  const relatedTrainerConcepts = getRecommendedTrainerConcepts({
    module: lesson.module,
    category: lesson.category,
    title: lesson.title,
    description: lesson.description,
  })

  const courseLessons = allLessons
  const currentLevelIndex = levels.findIndex((l) => l.slug === lesson.level)
  const nextLevel = currentLevelIndex >= 0 ? levels[currentLevelIndex + 1] : null
  const nextLevelFirstLesson = nextLevel
    ? [...courseLessons]
        .filter((l) => l.level === nextLevel.slug)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)[0] ?? null
    : null
  const showNextLevelButton = completed && !nextLesson && !!nextLevelFirstLesson

  return (
    <div>
      {/* Breadcrumb bar — sits right below navbar line */}
      <div className="border-b border-gray-800 bg-gray-950/60">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link href="/guide" className="hover:text-white transition-colors">Курс</Link>
          {lesson?.level && (
            <>
              <span className="text-gray-700">→</span>
              <Link href={`/guide/level/${encodeURIComponent(lesson.level)}`} className="hover:text-white transition-colors">Уровень</Link>
            </>
          )}
          {decodedModule && (
            <>
              <span className="text-gray-700">→</span>
              <Link href={`/guide/module/${encodeURIComponent(decodedModule)}`} className="hover:text-white transition-colors">{decodedModule}</Link>
            </>
          )}
          {decodedTopic && decodedModule && (
            <>
              <span className="text-gray-700">→</span>
              <Link href={`/guide/topic/${encodeURIComponent(decodedTopic)}?module=${encodeURIComponent(decodedModule)}`} className="hover:text-white transition-colors">{decodedTopic}</Link>
            </>
          )}
          <span className="text-gray-700">→</span>
          <span className="text-white">{lesson?.title ?? 'Урок'}</span>
        </nav>
      </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-1 order-2 lg:order-1 lg:border-r lg:border-gray-800/60 lg:pr-6">
          <div className="sticky top-20">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {decodedTopic || 'Уроки'}
            </h3>
            <nav className="space-y-1">
              {sidebarLessons.map((l) => {
                const done = isCompleted('lesson', l.id)
                return (
                  <Link
                    key={l.slug}
                    href={`/guide/${l.slug}${querySuffix}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${l.slug === slug ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${done ? 'bg-[#FFD60A] border-[#FFD60A]' : 'border-gray-600'}`}>
                      {done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="truncate">{l.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="prose-go">
              <LessonContentRenderer
                key={lesson.id}
                content={lesson.content}
                onTasksChange={status => {
                  setTasksStatus(status)
                  if (status.done >= status.total) markComplete()
                }}
              />
          </div>

          {relatedTrainerConcepts.length > 0 && (
            <section className="mt-10 rounded-3xl border border-[#FFD60A]/20 bg-[#FFD60A]/5 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#FFD60A]">Подкрепить навык</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Что потренировать после урока</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                    Курс даёт сюжет и проектный контекст, а тренажёр помогает быстро добить конкретный навык руками.
                  </p>
                </div>
                <Link href="/trainer" className="text-sm font-semibold text-[#FFD60A] hover:text-[#FFD60A]">
                  Открыть весь тренажёр →
                </Link>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {relatedTrainerConcepts.map((concept) => (
                  <Link
                    key={concept.slug}
                    href={`/trainer/topic/${concept.slug}`}
                    className="rounded-2xl border border-white/10 bg-gray-950/50 p-5 transition-colors hover:border-[#FFD60A]/40 hover:bg-gray-900"
                  >
                    <p className="text-sm font-semibold text-white">{concept.title}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{concept.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {concept.microSkills.slice(0, 2).map((skill) => (
                        <span key={skill} className="rounded-full border border-gray-800 bg-gray-900 px-2.5 py-1 text-[11px] text-gray-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {token ? (
              completed ? (
                <div className="flex items-center gap-2 text-[#FFD60A]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Урок пройден
                </div>
              ) : (
                  tasksStatus && tasksStatus.total > 0 ? (
                    <div className="text-sm text-gray-400">
                      Выполни задания: <span className="text-[#FFD60A] font-semibold">{tasksStatus.done}/{tasksStatus.total}</span>
                      {tasksStatus.done < tasksStatus.total && (
                        <span className="ml-2 text-xs text-gray-600">— нельзя перейти далее, пока не выполнены все задания</span>
                      )}
                    </div>
                  ) : (
                    <button onClick={markComplete} className="btn-primary">
                      Отметить как пройденный ✓
                    </button>
                  )
              )
            ) : (
              <div className="rounded-2xl border border-[#FFD60A]/20 bg-[#FFD60A]/[0.06] px-4 py-3">
                <p className="text-sm font-semibold text-[#FFD60A]">Сохрани прогресс</p>
                <p className="mt-1 text-xs leading-5 text-gray-400">
                  Урок можно читать без регистрации. Аккаунт пригодится, чтобы продолжить с этого места.
                </p>
                <Link href="/auth/register" className="mt-2 inline-flex text-sm font-semibold text-[#FFD60A] hover:text-[#FFD60A]">
                  Создать аккаунт →
                </Link>
              </div>
            )}

            <div className="flex items-center gap-3">
              {prevLesson && (
                <Link href={`/guide/${prevLesson.slug}${querySuffix}`} className="btn-secondary text-sm px-4 py-2">
                  ← Предыдущий
                </Link>
              )}
              {nextLesson && (
                  canProceed ? (
                    <Link href={`/guide/${nextLesson.slug}${querySuffix}`} className="btn-primary text-sm px-4 py-2">
                      Следующий →
                    </Link>
                  ) : (
                    <button disabled title="Выполни все задания чтобы продолжить" className="btn-primary text-sm px-4 py-2 opacity-40 cursor-not-allowed">
                      Следующий →
                    </button>
                  )
              )}
              {showNextLevelButton && nextLevelFirstLesson && (
                <Link href={`/guide/${nextLevelFirstLesson.slug}`} className="btn-primary text-sm px-4 py-2">
                  Перейти на следующий уровень →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
