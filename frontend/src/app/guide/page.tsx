'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { api, getLevels, type AdminLevel, type Lesson } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type SprintGroup = {
  sprintKey: string
  sprintNum: number
  moduleSlug: string
  lessons: Lesson[]
}

const sprintMeta: Record<number, { name: string; icon: string; desc: string }> = {
  1:  { name: 'Введение в разработку',  icon: '🚀', desc: 'Почему Go, терминал, первая программа' },
  2:  { name: 'Фундамент инженерии',    icon: '🌐', desc: 'Интернет, HTTP, API, JSON' },
  3:  { name: 'IT-команда и Git',       icon: '👥', desc: 'Agile, Git, GitHub, задачи' },
  4:  { name: 'Подготовка: Угадайка',   icon: '📖', desc: 'Переменные, циклы, функции' },
  5:  { name: 'Проект: Угадайка',       icon: '🎮', desc: 'CLI-игра по шагам' },
  6:  { name: 'Подготовка: Погода',     icon: '📖', desc: 'HTTP-сервер, JSON, Docker' },
  7:  { name: 'Проект: Погода',         icon: '🌤', desc: 'API-сервис по шагам' },
  8:  { name: 'Подготовка: Todo-list',  icon: '📖', desc: 'SQL, CRUD, архитектура' },
  9:  { name: 'Проект: Todo-list',      icon: '📋', desc: 'REST API + PostgreSQL' },
  10: { name: 'Подготовка: Диплом',     icon: '📖', desc: 'Тесты, shutdown, логи' },
  11: { name: 'Дипломный проект',       icon: '🎓', desc: 'Финальная сборка' },
  12: { name: 'Карьера',               icon: '💼', desc: 'Резюме, портфолио, план' },
}

const moduleNames: Record<string, string> = {
  'module-1': 'Модуль 1. Погружение в профессию',
  'module-2': 'Модуль 2. Процессы и инструменты',
  'module-3': 'Модуль 3. Проект: Угадайка',
  'module-4': 'Модуль 4. Проект: Погода',
  'module-5': 'Модуль 5. Проект: Todo-list',
  'module-6': 'Модуль 6. Дипломный проект',
  'module-7': 'Модуль 7. Карьера и развитие',
}

function getSprintNum(level: string): number {
  const m = level.match(/sprint-(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

function getModuleSlug(sprintNum: number): string {
  if (sprintNum <= 2) return 'module-1'
  if (sprintNum <= 3) return 'module-2'
  if (sprintNum <= 5) return 'module-3'
  if (sprintNum <= 7) return 'module-4'
  if (sprintNum <= 9) return 'module-5'
  if (sprintNum <= 11) return 'module-6'
  return 'module-7'
}

export default function GuidePage() {
  const { token, loadProgress, isCompleted } = useAuthStore()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (token) loadProgress() }, [token, loadProgress])

  useEffect(() => {
    api.getLessons()
      .then((all) => {
        setLessons(
          all.filter((l) => l.module === 'course')
            .sort((a, b) => getSprintNum(a.level) - getSprintNum(b.level) || a.order - b.order)
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sprints = useMemo<SprintGroup[]>(() => {
    const map = new Map<string, Lesson[]>()
    for (const l of lessons) {
      const arr = map.get(l.level) || []
      arr.push(l)
      map.set(l.level, arr)
    }
    return Array.from(map.entries())
      .map(([key, lsns]) => ({
        sprintKey: key,
        sprintNum: getSprintNum(key),
        moduleSlug: getModuleSlug(getSprintNum(key)),
        lessons: lsns,
      }))
      .sort((a, b) => a.sprintNum - b.sprintNum)
  }, [lessons])

  const totalLessons = lessons.length
  const completedLessons = lessons.filter((l) => isCompleted('lesson', l.id)).length
  const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
  const currentLesson = lessons.find((l) => !isCompleted('lesson', l.id)) || lessons[0]
  const currentSprintNum = currentLesson ? getSprintNum(currentLesson.level) : 1

  // Sprint is unlocked if it's the current sprint or any previous sprint
  const isSprintUnlocked = (num: number) => num <= currentSprintNum

  const [expandedSprint, setExpandedSprint] = useState<number | null>(null)

  // Auto-expand current sprint
  useEffect(() => {
    if (currentSprintNum) setExpandedSprint(currentSprintNum)
  }, [currentSprintNum])

  if (loading) {
    return (
      <main className="page-wrap py-10">
        <div className="h-40 animate-pulse rounded-2xl bg-neutral-800" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-neutral-800" />)}
        </div>
      </main>
    )
  }

  const isFirstTime = completedLessons === 0

  return (
    <main className="page-wrap py-8 sm:py-10">
      {/* Hero */}
      <header className={`rounded-2xl p-6 sm:p-8 ${
        isFirstTime
          ? 'border border-[var(--app-yellow)]/20 bg-[var(--app-yellow)]/[0.05] text-center'
          : 'border border-white/10 bg-white/[0.03]'
      }`}>
        {isFirstTime ? (
          <>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              Программа курса
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-neutral-400">
              {totalLessons} уроков · 12 спринтов · 3 проекта. Весь курс бесплатный.
              Начни с первого урока — он занимает 5 минут.
            </p>
            {currentLesson && (
              <Link href={`/guide/${currentLesson.slug}`} className="btn-primary mt-6 inline-flex text-base px-8 py-4">
                Начать первый урок →
              </Link>
            )}
          </>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--app-yellow)]">Продолжить</p>
              <h1 className="mt-2 text-2xl font-black text-white">{currentLesson?.title}</h1>
              <p className="mt-1 text-sm text-neutral-400">{currentLesson?.description}</p>
              <Link href={`/guide/${currentLesson?.slug}`} className="btn-primary mt-4 inline-flex text-sm">
                Продолжить урок →
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-black text-white">{progressPercent}%</p>
                <p className="text-xs text-neutral-500">{completedLessons}/{totalLessons} уроков</p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-white/10 relative">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--app-yellow)" strokeWidth="4"
                    strokeDasharray={`${progressPercent * 1.76} 176`} strokeLinecap="round" opacity="0.9" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Sprint grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sprints.map((sprint) => {
          const meta = sprintMeta[sprint.sprintNum] || { name: `Спринт ${sprint.sprintNum}`, icon: '📄', desc: '' }
          const sCompleted = sprint.lessons.filter((l) => isCompleted('lesson', l.id)).length
          const sDone = sCompleted === sprint.lessons.length && sprint.lessons.length > 0
          const isCurrent = sprint.sprintNum === currentSprintNum
          const unlocked = isSprintUnlocked(sprint.sprintNum)
          const hasContent = sprint.lessons.some((l) => l.content)
          const isExpanded = expandedSprint === sprint.sprintNum

          return (
            <div key={sprint.sprintKey} className={`rounded-2xl border overflow-hidden transition-all ${
              isCurrent
                ? 'border-[var(--app-yellow)]/30 bg-[var(--app-yellow)]/[0.05]'
                : sDone
                  ? 'border-[var(--app-yellow)]/15 bg-white/[0.03]'
                  : unlocked
                    ? 'border-white/10 bg-white/[0.03]'
                    : 'border-white/5 bg-white/[0.015] opacity-60'
            }`}>
              {/* Sprint card header */}
              <button
                type="button"
                onClick={() => setExpandedSprint(isExpanded ? null : sprint.sprintNum)}
                className="w-full text-left p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-3xl">{meta.icon}</div>
                  <div className="flex items-center gap-2">
                    {sDone && (
                      <span className="rounded-full bg-[var(--app-yellow)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--app-yellow)]">Пройден</span>
                    )}
                    {isCurrent && !sDone && (
                      <span className="rounded-full bg-[var(--app-yellow)] px-2 py-0.5 text-[10px] font-bold text-black">Текущий</span>
                    )}
                    {!unlocked && (
                      <span className="text-xs text-neutral-600">🔒</span>
                    )}
                  </div>
                </div>
                <h3 className="mt-3 text-base font-bold text-white">Спринт {sprint.sprintNum}</h3>
                <p className="text-sm text-neutral-400">{meta.name}</p>
                <p className="mt-1 text-xs text-neutral-500">{meta.desc}</p>

                {/* Progress bar */}
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                  <span>{sCompleted}/{sprint.lessons.length} уроков</span>
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[var(--app-yellow)] transition-all duration-500"
                    style={{ width: `${sprint.lessons.length ? (sCompleted / sprint.lessons.length) * 100 : 0}%` }}
                  />
                </div>
              </button>

              {/* Expanded lesson list */}
              {isExpanded && (
                <div className="border-t border-white/8 px-5 py-3 space-y-0.5">
                  {sprint.lessons.map((lesson, li) => {
                    const done = isCompleted('lesson', lesson.id)
                    const isCurrentLesson = currentLesson?.slug === lesson.slug
                    const available = unlocked && hasContent && lesson.content

                    if (!available) {
                      return (
                        <div key={lesson.slug} className="flex items-center gap-3 rounded-xl px-3 py-2.5 opacity-40">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] font-bold text-neutral-600">
                            {li + 1}
                          </span>
                          <span className="text-sm text-neutral-600">{lesson.title}</span>
                          <span className="ml-auto text-[10px] text-neutral-700">скоро</span>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={lesson.slug}
                        href={`/guide/${lesson.slug}`}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors group ${
                          isCurrentLesson
                            ? 'bg-[var(--app-yellow)]/[0.1]'
                            : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                          done
                            ? 'bg-[var(--app-yellow)]/15 text-[var(--app-yellow)]'
                            : isCurrentLesson
                              ? 'bg-[var(--app-yellow)] text-black'
                              : 'bg-white/5 text-neutral-500'
                        }`}>
                          {done ? '✓' : li + 1}
                        </span>
                        <span className={`flex-1 text-sm ${
                          done ? 'text-neutral-400' : isCurrentLesson ? 'text-white font-semibold' : 'text-neutral-300'
                        }`}>
                          {lesson.title}
                        </span>
                        {isCurrentLesson && (
                          <span className="rounded-lg bg-[var(--app-yellow)] px-3 py-1 text-xs font-bold text-black">
                            Начать →
                          </span>
                        )}
                        {!isCurrentLesson && !done && (
                          <span className="hidden text-xs text-neutral-500 group-hover:block">Открыть</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom CTA for first-time users */}
      {isFirstTime && currentLesson && (
        <div className="mt-8 rounded-2xl border border-[var(--app-yellow)]/20 bg-[var(--app-yellow)]/[0.05] p-6 text-center">
          <p className="text-base text-neutral-400">Не знаешь с чего начать?</p>
          <Link href={`/guide/${currentLesson.slug}`} className="btn-primary mt-4 inline-flex text-sm">
            Начать с урока 1.1 →
          </Link>
        </div>
      )}
    </main>
  )
}
