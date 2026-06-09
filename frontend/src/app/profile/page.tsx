'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Exercise, Lesson, Progress, UserProfile } from '@/lib/api'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { getLastVisited } from '@/lib/streak'
import SkillsSection from '@/components/SkillsSection'

// Show last ~9 weeks (2 months)
const WEEKS_TO_SHOW = 9
const DAYS_IN_WEEK = 7
const TOTAL_DAYS = WEEKS_TO_SHOW * DAYS_IN_WEEK

type HeatmapCell = {
  date: Date
  dateKey: string
  count: number
}

function startOfDay(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

function formatDateKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10)
}

function formatJoinDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function buildActivityMap(progress: Progress[]): Map<string, number> {
  const map = new Map<string, number>()

  for (const item of progress) {
    if (item.status !== 'completed') continue
    const key = formatDateKey(new Date(item.updatedAt || item.createdAt))
    map.set(key, (map.get(key) ?? 0) + 1)
  }

  return map
}

function buildHeatmapCells(progress: Progress[]): HeatmapCell[] {
  const activityMap = buildActivityMap(progress)
  const today = startOfDay(new Date())
  const cells: HeatmapCell[] = []

  for (let offset = TOTAL_DAYS - 1; offset >= 0; offset--) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const dateKey = formatDateKey(date)
    cells.push({
      date,
      dateKey,
      count: activityMap.get(dateKey) ?? 0,
    })
  }

  return cells
}

function groupByWeek(cells: HeatmapCell[]): HeatmapCell[][] {
  const weeks: HeatmapCell[][] = []

  for (let i = 0; i < cells.length; i += DAYS_IN_WEEK) {
    weeks.push(cells.slice(i, i + DAYS_IN_WEEK))
  }

  return weeks
}

function intensityClass(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return 'bg-gray-700/70'

  const ratio = count / maxCount
  if (ratio >= 0.75) return 'bg-cyan-300 border-cyan-200/60'
  if (ratio >= 0.5) return 'bg-cyan-400/80 border-cyan-300/50'
  if (ratio >= 0.25) return 'bg-cyan-500/60 border-cyan-400/40'
  return 'bg-cyan-600/40 border-cyan-500/30'
}

function isCourseLesson(lesson: Lesson): boolean {
  return lesson.module !== 'bootcamp'
}

function lessonHref(lesson: Lesson): string {
  const params = new URLSearchParams()
  if (lesson.module) params.set('module', lesson.module)
  if (lesson.category) params.set('topic', lesson.category)
  const query = params.toString()
  return `/guide/${lesson.slug}${query ? `?${query}` : ''}`
}

function trainerExerciseHref(exercise: Exercise): string {
  return `/trainer/${exercise.id}`
}

function certificateIcon(id: string): string {
  switch (id) {
    case 'course':
      return '🎓'
    case 'trainer':
      return '⚡'
    case 'bootcamp':
      return '🏆'
    default:
      return '📘'
  }
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  )
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, token, progress, loadProgress, setAuth } = useAuthStore()
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([])
  const [trainerExercises, setTrainerExercises] = useState<Exercise[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Handle Yandex OAuth callback: /profile?code=...
  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) return
    // Remove code from URL immediately to prevent re-runs
    router.replace('/profile')
    api.yandexExchange(code)
      .then(({ token, user }) => {
        setAuth(token, user)
      })
      .catch(() => {
        router.replace('/auth/login')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token) return
    loadProgress()
  }, [token, loadProgress])

  useEffect(() => {
    if (!token) return
    api.getUserProfile()
      .then(setUserProfile)
      .catch(() => {
        setUserProfile(null)
      })
  }, [token])

  useEffect(() => {
    api.getLessons()
      .then((lessons) => {
        const filtered = lessons
          .filter(isCourseLesson)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
        setCourseLessons(filtered)
      })
      .catch(() => {
        setCourseLessons([])
      })
  }, [])

  useEffect(() => {
    api.getExercises({ module: 'core' })
      .then((exercises) => {
        const sorted = [...exercises].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
        setTrainerExercises(sorted)
      })
      .catch(() => {
        setTrainerExercises([])
      })
  }, [])

  useEffect(() => {
    if (!token && !searchParams.get('code')) {
      router.push('/auth/login')
    }
  }, [token, router, searchParams])

  const completedExercises = useMemo(
    () => progress.filter((p) => p.entityType === 'exercise' && p.status === 'completed').length,
    [progress]
  )
  const completedLessons = useMemo(
    () => progress.filter((p) => p.entityType === 'lesson' && p.status === 'completed').length,
    [progress]
  )
  const completedCourseLessonIds = useMemo(() => {
    return new Set(
      progress
        .filter((p) => p.entityType === 'lesson' && p.status === 'completed')
        .map((p) => p.entityId)
    )
  }, [progress])
  const completedTrainerExerciseIds = useMemo(() => {
    return new Set(
      progress
        .filter((p) => p.entityType === 'exercise' && p.status === 'completed')
        .map((p) => p.entityId)
    )
  }, [progress])

  const nextCourseLesson = useMemo(() => {
    if (courseLessons.length === 0) return null
    return courseLessons.find((lesson) => !completedCourseLessonIds.has(lesson.id)) ?? courseLessons[0]
  }, [courseLessons, completedCourseLessonIds])

  const lastVisitedCourseLesson = useMemo(() => {
    const last = getLastVisited()
    if (!last || last.type !== 'lesson') return null
    const slug = last.href.split('?')[0].split('/').pop()
    if (!slug) return null
    return courseLessons.find((lesson) => lesson.slug === slug) ?? null
  }, [courseLessons])

  const continueCourseLesson = lastVisitedCourseLesson ?? nextCourseLesson
  const nextTrainerExercise = useMemo(() => {
    if (trainerExercises.length === 0) return null
    return trainerExercises.find((exercise) => !completedTrainerExerciseIds.has(exercise.id)) ?? trainerExercises[0]
  }, [trainerExercises, completedTrainerExerciseIds])

  const lastVisitedTrainer = useMemo(() => {
    const last = getLastVisited()
    if (!last || !last.href.startsWith('/trainer')) return null
    return last
  }, [])

  const continueTrainerHref = lastVisitedTrainer?.href || (nextTrainerExercise ? trainerExerciseHref(nextTrainerExercise) : '/trainer')
  const continueTrainerTitle = lastVisitedTrainer?.title || nextTrainerExercise?.title || 'Продолжить тренажер'

  const cells = useMemo(() => buildHeatmapCells(progress), [progress])
  const certificates = userProfile?.certificates ?? []
  const earnedCount = certificates.filter((c) => c.earned).length
  const weeks = useMemo(() => groupByWeek(cells), [cells])
  const maxCount = useMemo(() => Math.max(...cells.map((cell) => cell.count), 0), [cells])
  const totalActivities = useMemo(() => cells.reduce((sum, cell) => sum + cell.count, 0), [cells])

  // Total lessons / exercises for progress %
  const totalLessons = courseLessons.length || 8
  const [totalExercises] = useState(50) // approximate total exercises

  const monthLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
    return weeks.map((week, index) => {
      const firstDay = week[0]
      if (!firstDay) return { index, label: '' }
      const prevWeek = weeks[index - 1]
      const prevMonth = prevWeek?.[0] ? prevWeek[0].date.getMonth() : null
      const currentMonth = firstDay.date.getMonth()
      return {
        index,
        label: index === 0 || currentMonth !== prevMonth ? formatter.format(firstDay.date) : '',
      }
    })
  }, [weeks])

  if (!token || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="surface-card rounded-3xl px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Профиль недоступен</h1>
          <p className="text-gray-400 mb-4">Войди, чтобы увидеть свою активность и прогресс обучения.</p>
          <Link href="/auth/login" className="btn-primary inline-flex">
            Войти
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="surface-card rounded-[32px] px-6 py-8 text-center">
            <div className="mx-auto mb-6 flex h-56 w-56 items-center justify-center rounded-full border-4 border-cyan-400/90 bg-[radial-gradient(circle_at_35%_30%,rgba(130,220,255,0.45),rgba(15,23,42,0.35)_30%,rgba(7,10,20,0.95)_70%)] shadow-[0_0_40px_rgba(34,211,238,0.08)]">
              <span className="text-7xl font-bold text-white/95">{user.username.slice(0, 1).toUpperCase()}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-100">{user.username}</h1>
            <p className="mt-2 text-sm text-gray-500">ID #{user.id}</p>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="surface-highlight rounded-[32px] px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">Продолжить обучение</h2>
                <p className="text-sm text-gray-400 mt-1">Возвращайся к текущему уроку или задаче в один клик</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href={continueCourseLesson ? lessonHref(continueCourseLesson) : '/guide'}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-4 py-2.5 transition-colors"
                >
                  📖 Курс
                </Link>
                <Link
                  href={continueTrainerHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 text-cyan-200 hover:text-cyan-100 hover:border-cyan-300/60 px-4 py-2.5 transition-colors"
                >
                  ⚡ Тренажер
                </Link>
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-xs sm:text-sm text-gray-300">
              <div>
                Курс: <span className="text-cyan-200">{continueCourseLesson?.title || 'Перейти к программе курса'}</span>
              </div>
              <div>
                Тренажер: <span className="text-cyan-200">{continueTrainerTitle}</span>
              </div>
            </div>
          </section>

          <section className="surface-card rounded-[32px] px-8 py-8">
            <h2 className="text-3xl font-bold text-gray-100 mb-6">Основная информация</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-base">
                <span className="font-semibold text-cyan-400">Дата старта</span>
                <span className="font-semibold text-gray-100">{formatJoinDate(user.createdAt)}</span>
              </div>

              {/* Trainer progress */}
              <div className="surface-subcard rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <span className="font-semibold text-gray-200 text-sm">Тренажёр</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-cyan-400">
                      {Math.round((completedExercises / totalExercises) * 100)}%
                    </span>
                    <Link
                      href="/trainer"
                      className="text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 px-3 py-1 rounded-lg transition-colors"
                    >
                      Начать
                    </Link>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{ width: `${Math.min((completedExercises / totalExercises) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{completedExercises} из {totalExercises} задач выполнено</p>
              </div>

              {/* Course progress */}
              <div className="surface-subcard rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📖</span>
                    <span className="font-semibold text-gray-200 text-sm">Курс Go</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-cyan-400">
                      {Math.round((completedLessons / totalLessons) * 100)}%
                    </span>
                    <Link
                      href={continueCourseLesson ? lessonHref(continueCourseLesson) : '/guide'}
                      className="text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 px-3 py-1 rounded-lg transition-colors"
                    >
                      {completedLessons > 0 ? 'Продолжить' : 'Начать'}
                    </Link>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{ width: `${Math.min((completedLessons / totalLessons) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{completedLessons} из {totalLessons} уроков пройдено</p>
                {continueCourseLesson && (
                  <p className="text-xs text-gray-400 mt-1">
                    Следующий урок: <span className="text-cyan-300">{continueCourseLesson.title}</span>
                  </p>
                )}
              </div>

              {/* Bootcamp progress */}
              <div className="surface-subcard rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <span className="font-semibold text-gray-200 text-sm">Bootcamp · Junior</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-amber-400">
                      {user.isPremium ? '5%' : '0%'}
                    </span>
                    <Link
                      href={user.isPremium ? '/junior' : '/bootcamp'}
                      className="text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-lg transition-colors"
                    >
                      Начать
                    </Link>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: user.isPremium ? '5%' : '0%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  {user.isPremium ? 'Уровень Junior открыт' : 'Доступ по подписке Godemy Pro'}
                </p>
              </div>
            </div>
          </section>

          {userProfile && (
            <section className="surface-card rounded-[32px] px-8 py-8">
              <h2 className="text-3xl font-bold text-gray-100 mb-6">Портрет разработчика</h2>
              <SkillsSection
                skills={userProfile.skills}
                juniorReadiness={userProfile.juniorReadiness}
              />
            </section>
          )}

          <section className="surface-card rounded-[32px] px-8 py-8 overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-100 mb-6">
              {totalActivities} активностей за последние 2 месяца
            </h2>

            <div className="overflow-x-auto pb-2">
              <div className="min-w-[820px]">
                <div
                  className="mb-3 grid text-sm text-gray-400"
                  style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
                >
                  {monthLabels.map(({ index, label }) => (
                    <div key={index} className="px-0.5">
                      {label}
                    </div>
                  ))}
                </div>

                <div className="flex gap-1.5">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-1.5">
                      {week.map((cell) => (
                        <div
                          key={cell.dateKey}
                          title={`${cell.dateKey}: ${cell.count} активн.`}
                          className={`h-5 w-5 rounded-md border border-transparent transition-transform hover:scale-110 ${intensityClass(cell.count, maxCount)}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 text-sm text-gray-500 flex-wrap">
              <span>Активность считается по завершённым задачам и урокам.</span>
              <div className="flex items-center gap-2">
                <span>Меньше</span>
                <div className="h-4 w-4 rounded border border-transparent bg-gray-700/70" />
                <div className="h-4 w-4 rounded border border-cyan-500/30 bg-cyan-600/40" />
                <div className="h-4 w-4 rounded border border-cyan-400/40 bg-cyan-500/60" />
                <div className="h-4 w-4 rounded border border-cyan-300/50 bg-cyan-400/80" />
                <div className="h-4 w-4 rounded border border-cyan-200/60 bg-cyan-300" />
                <span>Больше</span>
              </div>
            </div>
          </section>

          {/* Certificates — link to separate page */}
          <section className="surface-card rounded-[32px] px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">Сертификаты</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {earnedCount} из {certificates.length} получено
                </p>
              </div>
              <Link
                href="/certificates"
                className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Смотреть все
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Mini preview */}
            <div className="mt-4 flex flex-wrap gap-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  title={cert.title}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                    cert.earned
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                      : 'bg-gray-800/50 border-gray-700/50 text-gray-500'
                  }`}
                >
                  <span>{cert.earned ? certificateIcon(cert.id) : '🔒'}</span>
                  <span className="text-xs font-medium">{cert.title}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900/60 px-4 py-3 text-sm text-gray-400">
              {earnedCount > 0
                ? 'Открывай раздел сертификатов, чтобы выпустить, посмотреть и скачать свои документы.'
                : 'Сертификаты появятся после полного завершения бесплатного курса, тренажёра или буткемпа.'}
            </div>
          </section>

          {/* Feedback quick link */}
          <section className="surface-card rounded-[32px] px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-100">Обратная связь</h2>
                  <p className="text-sm text-gray-500">Вопросы, ошибки, идеи и поддержка проекта</p>
                </div>
              </div>
              <Link
                href="/feedback"
                className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Перейти
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
