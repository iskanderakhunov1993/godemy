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

const sprintSymbols = ['◎', '01', '02', '03', '✓']

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
    <li className="w-[82vw] shrink-0 snap-start sm:w-auto sm:min-w-0">
      <Link
        href={`/guide/module/${encodeURIComponent(sprint.name)}`}
        aria-current={state === 'active' ? 'step' : undefined}
        className={`group relative flex h-full min-h-44 flex-col rounded-3xl border p-5 transition duration-200 ${
          state === 'active'
            ? 'border-cyan-300/50 bg-cyan-300/[0.08] shadow-[0_18px_60px_rgba(34,211,238,0.10)]'
            : state === 'done'
              ? 'border-emerald-400/20 bg-emerald-400/[0.05] hover:border-emerald-300/35'
              : 'border-white/8 bg-white/[0.025] hover:border-white/16 hover:bg-white/[0.045]'
        }`}
      >
        {index < 4 && (
          <span className="absolute -right-3 top-9 z-10 hidden h-px w-6 bg-white/12 xl:block" aria-hidden="true" />
        )}

        <div className="flex items-center justify-between gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border font-mono text-xs font-bold ${
              state === 'active'
                ? 'border-cyan-300/40 bg-cyan-300 text-slate-950'
                : state === 'done'
                  ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-gray-500'
            }`}
          >
            {state === 'done' ? '✓' : (sprintSymbols[index] ?? String(index + 1).padStart(2, '0'))}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              state === 'active'
                ? 'bg-cyan-300/15 text-cyan-200'
                : state === 'done'
                  ? 'bg-emerald-400/10 text-emerald-300'
                  : 'bg-white/5 text-gray-500'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
          Шаг {index + 1}
        </p>
        <h2 className="mt-2 text-base font-semibold leading-snug text-white">
          {sprintSkills[index] ?? sprint.name}
        </h2>
        <p className="mt-1 truncate text-xs text-gray-500">{sprint.project}</p>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>{completedCount}/{lessonCount} уроков</span>
            <span className="text-gray-400 transition group-hover:text-white">Открыть →</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full ${state === 'done' ? 'bg-emerald-400' : 'bg-cyan-300'}`}
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
        <header className="grid overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_100%_0%,rgba(139,92,246,0.12),transparent_28%),#0a1020] lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between border-b border-white/8 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                Бесплатный курс · Go с нуля
              </div>
              <div className="mt-4 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                Бесплатный курс
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Твой путь обучения
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
                Проходи уроки по порядку, собирай проекты и видь понятный прогресс.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500">Прогресс обучения</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{progressPercent}%</p>
                </div>
                <p className="text-right text-xs leading-5 text-gray-500">
                  {completedProjects} из 3 проектов
                  <br />
                  {completedLessons} из {courseLessons.length} уроков
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-violet-400/12 px-2.5 py-1 font-mono text-xs text-violet-300">
                  Раздел {currentModuleIndex + 1}
                </span>
                <span className="text-xs text-gray-500">Шаг {currentModuleIndex + 1}</span>
              </div>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-medium text-amber-200">
                Текущий шаг
              </span>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="text-xs font-medium text-cyan-300">Следующий урок</p>
                <h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  {currentLesson.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                  {currentLesson.description}
                </p>
              </div>
              <Link
                href={`/guide/${currentLesson.slug}?module=${encodeURIComponent(currentLesson.module)}&topic=${encodeURIComponent(currentLesson.category)}`}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-5 text-sm font-bold text-slate-950 shadow-[0_12px_35px_rgba(34,211,238,0.18)] hover:-translate-y-0.5 hover:bg-cyan-200"
              >
                Начать урок →
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/8 pt-5 text-xs">
              <span className="text-gray-500">
                Направление <strong className="ml-1 font-medium text-gray-200">Go-разработка</strong>
              </span>
              <span className="text-gray-500">
                Раздел <strong className="ml-1 font-medium text-gray-200">{currentModuleCompleted}/{currentModuleLessons.length}</strong>
              </span>
              <span className="text-gray-500">
                Цель <strong className="ml-1 font-medium text-gray-200">завершить уроки раздела</strong>
              </span>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">План курса</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">От первого урока до проекта</h2>
            </div>
            <p className="text-sm text-gray-500">5 разделов · 3 проекта · понятный итог</p>
          </div>

          <ol className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
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
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[28px] border border-white/8 bg-white/[0.025] p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300">Практический результат</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Три проекта для первого портфолио</h2>
              </div>
              <span className="font-mono text-xs text-gray-500">{completedProjects}/3 готово</span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {courseModules.slice(1, 4).map((module, projectIndex) => {
                const lessons = courseLessons.filter((lesson) => lesson.module === module.name)
                const done = lessons.every((lesson) => isCompleted('lesson', lesson.id))
                const active = currentModule.name === module.name

                return (
                  <Link
                    key={module.name}
                    href={`/guide/module/${encodeURIComponent(module.name)}`}
                    className={`rounded-2xl border p-4 transition ${
                      active
                        ? 'border-violet-400/35 bg-violet-400/[0.08]'
                        : 'border-white/8 bg-black/15 hover:border-white/16'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-gray-500">0{projectIndex + 1}</span>
                      <span className={done ? 'text-emerald-300' : active ? 'text-violet-300' : 'text-gray-600'}>
                        {done ? '✓' : active ? '●' : '○'}
                      </span>
                    </div>
                    <p className="mt-5 text-sm font-semibold text-white">{module.project}</p>
                    <p className="mt-1 text-xs text-gray-500">{sprintSkills[projectIndex + 1] ?? module.subtitle}</p>
                  </Link>
                )
              })}
            </div>
          </div>

          <aside className="rounded-[28px] border border-white/8 bg-[linear-gradient(145deg,rgba(34,211,238,0.06),rgba(139,92,246,0.06))] p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-300 text-sm font-bold text-slate-950">
                TL
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Наставник курса</p>
                <p className="text-xs text-emerald-300">подсказывает маршрут</p>
              </div>
            </div>
            <blockquote className="mt-5 text-sm leading-6 text-gray-300">
              «Не пытайся пройти всё сразу. Сделай текущий урок, закрепи практикой и переходи дальше».
            </blockquote>
            <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-xs">
              <span className="text-gray-500">После раздела</span>
              <span className="font-medium text-cyan-200">+1 понятный навык</span>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
