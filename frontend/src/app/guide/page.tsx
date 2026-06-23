'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { getStoryModuleMeta, storyModuleMeta, type StoryModuleMeta } from '@/lib/storyCourse'
import { useAuthStore } from '@/lib/store'
import { useFlagshipCourse } from '@/lib/useFlagshipCourse'

type SprintState = 'done' | 'active' | 'queued'

const sprintSkills = [
  'Первый день',
  'Основы Go',
  'Данные из интернета',
  'Проект с записями',
  'Итог и портфолио',
]

function SprintNode({
  index,
  sprint,
  state,
  completedCount,
  lessonCount,
}: {
  index: number
  sprint: StoryModuleMeta
  state: SprintState
  completedCount: number
  lessonCount: number
}) {
  const statusLabel = state === 'done' ? 'Готово' : state === 'active' ? 'Сейчас' : 'В очереди'

  return (
    <li>
      <Link
        href={`/guide/module/${encodeURIComponent(sprint.name)}`}
        aria-current={state === 'active' ? 'step' : undefined}
        className={`group grid gap-4 rounded-2xl border p-4 transition duration-200 sm:grid-cols-[auto_1fr_auto] sm:items-center ${
          state === 'active'
            ? 'border-[#FFD60A]/40 bg-[#FFD60A]/[0.08]'
            : state === 'done'
              ? 'border-[#FFD60A]/20 bg-[#FFD60A]/[0.05] hover:border-[#FFD60A]/35'
              : 'border-white/8 bg-white/[0.025] hover:border-white/16 hover:bg-white/[0.045]'
        }`}
      >
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border font-mono text-xs font-bold ${
            state === 'active'
              ? 'border-[#FFD60A]/40 bg-[#FFD60A] text-black'
              : state === 'done'
                ? 'border-[#FFD60A]/30 bg-[#FFD60A]/15 text-[#FFD60A]'
                : 'border-white/10 bg-white/5 text-gray-500'
          }`}
        >
          {state === 'done' ? '✓' : String(index + 1).padStart(2, '0')}
        </span>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold leading-snug text-white">
              {sprintSkills[index] ?? sprint.name}
            </h2>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                state === 'active'
                  ? 'bg-[#FFD60A]/15 text-[#FFD60A]'
                  : state === 'done'
                    ? 'bg-[#FFD60A]/10 text-[#FFD60A]'
                    : 'bg-white/5 text-gray-500'
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-gray-400">{sprint.project}</p>
        </div>

        <div className="min-w-36">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>{completedCount}/{lessonCount}</span>
            <span className="text-gray-400 transition group-hover:text-white">Открыть →</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full ${state === 'done' ? 'bg-[#FFD60A]' : 'bg-[#FFD60A]'}`}
              style={{ width: `${lessonCount ? (completedCount / lessonCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </Link>
    </li>
  )
}

export default function GuidePage() {
  const { token, loadProgress, isCompleted } = useAuthStore()
  const { lessons: courseLessons } = useFlagshipCourse()

  useEffect(() => {
    if (token) loadProgress()
  }, [token, loadProgress])

  const completedLessons = useMemo(
    () => courseLessons.filter((lesson) => isCompleted('lesson', lesson.id)).length,
    [courseLessons, isCompleted]
  )

  const currentLesson = useMemo(
    () => courseLessons.find((lesson) => !isCompleted('lesson', lesson.id)) || courseLessons.at(-1)!,
    [courseLessons, isCompleted]
  )

  const courseModules = useMemo(() => {
    const names: string[] = []
    for (const lesson of courseLessons) {
      if (!names.includes(lesson.module)) names.push(lesson.module)
    }
    return names.map((name, index) => getStoryModuleMeta(name) ?? {
      name,
      sprint: `Module ${index + 1}`,
      subtitle: courseLessons.find((lesson) => lesson.module === name)?.description || 'Новый модуль курса.',
      project: 'Учебный модуль',
      role: 'Intern Go Developer',
      duration: `${courseLessons.filter((lesson) => lesson.module === name).length} уроков`,
      ticket: `COURSE-${index + 1}`,
      ritual: 'Изучение + практика',
      deliverable: 'Завершить все уроки модуля',
      mood: 'Двигаться маленькими шагами',
    })
  }, [courseLessons])

  const currentModuleIndex = Math.max(
    0,
    courseModules.findIndex((module) => module.name === currentLesson.module)
  )
  const currentModule = courseModules[currentModuleIndex] ?? storyModuleMeta[0]
  const currentModuleLessons = courseLessons.filter((lesson) => lesson.module === currentModule.name)
  const currentModuleCompleted = currentModuleLessons.filter((lesson) => isCompleted('lesson', lesson.id)).length
  const progressPercent = Math.round((completedLessons / Math.max(courseLessons.length, 1)) * 100)
  const completedProjects = courseModules.slice(1, 4).filter((module) => {
    const lessons = courseLessons.filter((lesson) => lesson.module === module.name)
    return lessons.every((lesson) => isCompleted('lesson', lesson.id))
  }).length

  return (
    <main className="min-h-screen bg-[#050914]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFD60A]">
              <span className="h-2 w-2 rounded-full bg-[#FFD60A] shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              Бесплатный курс · Go с нуля
            </div>
          </div>

          <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_0.34fr] lg:items-end">
            <div>
              <p className="text-sm font-medium text-[#FFD60A]">Следующий урок</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
                {currentLesson.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                {currentLesson.description}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={`/guide/${currentLesson.slug}?module=${encodeURIComponent(currentLesson.module)}&topic=${encodeURIComponent(currentLesson.category)}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#FFD60A] px-6 text-sm font-bold text-black shadow-[0_12px_35px_rgba(34,211,238,0.18)] hover:-translate-y-0.5 hover:bg-[#FFE44D]"
                >
                  Начать урок →
                </Link>
                <p className="text-xs leading-5 text-gray-500">
                  Без регистрации на старте. Прогресс можно сохранить позже.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-black/15 p-5">
              <p className="text-xs text-gray-500">Прогресс курса</p>
              <p className="mt-2 text-3xl font-semibold text-white">{progressPercent}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FFD60A] via-[#FFE44D] to-[#FFD60A] transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-4 grid gap-1 text-xs leading-5 text-gray-500">
                <span>{completedLessons} из {courseLessons.length} уроков</span>
                <span>{completedProjects} из 3 проектов</span>
                <span>Раздел: {currentModuleCompleted}/{currentModuleLessons.length}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.38fr]">
          <div className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5 sm:p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">Маршрут</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">5 коротких шагов</h2>
            </div>

            <ol className="mt-5 space-y-3">
              {courseModules.map((module, index) => {
                const lessons = courseLessons.filter((lesson) => lesson.module === module.name)
                const completedCount = lessons.filter((lesson) => isCompleted('lesson', lesson.id)).length
                const state: SprintState = completedCount === lessons.length
                  ? 'done'
                  : index === currentModuleIndex
                    ? 'active'
                    : 'queued'

                return (
                  <SprintNode
                    key={module.name}
                    index={index}
                    sprint={module}
                    state={state}
                    completedCount={completedCount}
                    lessonCount={lessons.length}
                  />
                )
              })}
            </ol>
          </div>

          <aside className="rounded-[28px] border border-[#FFD60A]/12 bg-[linear-gradient(145deg,rgba(16,185,129,0.08),rgba(34,211,238,0.06))] p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFD60A]">Результат</p>
            <h2 className="mt-3 text-xl font-semibold text-white">После курса</h2>
            <div className="mt-5 space-y-3">
              {courseModules.slice(1, 4).map((module) => {
                const lessons = courseLessons.filter((lesson) => lesson.module === module.name)
                const done = lessons.every((lesson) => isCompleted('lesson', lesson.id))

                return (
                  <Link
                    key={module.name}
                    href={`/guide/module/${encodeURIComponent(module.name)}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-sm transition hover:border-white/16"
                  >
                    <span className="text-gray-300">{module.project}</span>
                    <span className={done ? 'text-[#FFD60A]' : 'text-gray-600'}>{done ? '✓' : '○'}</span>
                  </Link>
                )
              })}
            </div>
            <div className="mt-5 border-t border-white/8 pt-4">
              <p className="text-sm leading-6 text-gray-300">
                Итог: 3 проекта, GitHub-описание и заготовка для первого резюме.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
