'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { storyCourseLessons, storyModuleMeta } from '@/lib/storyCourse'
import { useAuthStore } from '@/lib/store'

const sprintFocus: Record<string, { skill: string; result: string; why: string }> = {
  'Спринт 0 · Онбординг в Atlas Dev': {
    skill: 'Войти в контекст команды',
    result: 'Ты понимаешь, как устроены Jira, DoD, роли и спринт.',
    why: 'Новичок не пугается процессов и быстрее начинает делать задачи руками.',
  },
  'Спринт 1 · Number Guessing Game': {
    skill: 'Собрать первый CLI-продукт',
    result: 'Ты закрепляешь условия, циклы, ввод-вывод и базовый UX программы.',
    why: 'Это первый момент, когда теория превращается в работающий мини-продукт.',
  },
  'Спринт 2 · Weather API Wrapper Service': {
    skill: 'Понять внешние API',
    result: 'Ты работаешь с HTTP, JSON, ошибками и контрактами между сервисами.',
    why: 'Именно здесь появляется ощущение “я уже делаю backend, а не упражнения”.',
  },
  'Спринт 3 · Expense Tracker': {
    skill: 'Мыслить данными и сценариями',
    result: 'Ты собираешь CRUD-инструмент с моделью данных и пользовательскими кейсами.',
    why: 'Этот проект сильнее всего похож на реальную прикладную разработку.',
  },
  'Спринт 4 · Demo Day и оффер': {
    skill: 'Упаковать и защитить результат',
    result: 'Ты превращаешь проекты в понятную историю для портфолио и собеседований.',
    why: 'Хороший проект без хорошей упаковки часто недооценивают — здесь мы закрываем этот разрыв.',
  },
}

function SprintCard({ moduleName, index }: { moduleName: string; index: number }) {
  const meta = storyModuleMeta[index]
  const { isCompleted } = useAuthStore()
  const lessons = storyCourseLessons.filter((lesson) => lesson.module === moduleName)
  const completedCount = lessons.filter((lesson) => isCompleted('lesson', lesson.id)).length
  const focus = sprintFocus[moduleName]
  const isCurrent = completedCount < lessons.length && index === 0
    ? true
    : storyModuleMeta.slice(0, index).every((item) => {
        const sprintLessons = storyCourseLessons.filter((lesson) => lesson.module === item.name)
        return sprintLessons.every((lesson) => isCompleted('lesson', lesson.id))
      })
  const badge = completedCount === lessons.length
    ? 'Завершён'
    : isCurrent
    ? 'Текущий спринт'
    : 'Скоро'

  return (
    <li className="h-full">
      <Link
        href={`/guide/module/${encodeURIComponent(moduleName)}`}
        className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_38%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_24px_80px_rgba(6,182,212,0.12)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-300/80">{meta.sprint}</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-white">{moduleName}</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-gray-300">
            {badge}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-300">{meta.subtitle}</p>

        <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Проект</span>
            <span className="font-medium text-white">{meta.project}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Роль</span>
            <span>{meta.role}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Ритуал</span>
            <span>{meta.ritual}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Jira</span>
            <span className="font-mono text-cyan-300">{meta.ticket}</span>
          </div>
        </div>

        {focus && (
          <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">Что реально прокачаешь</p>
            <p className="mt-2 text-sm font-medium text-white">{focus.skill}</p>
            <p className="mt-2 text-sm leading-6 text-gray-300">{focus.result}</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">{focus.why}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">{meta.duration}</span>
          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">{meta.mood}</span>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Прогресс спринта</span>
            <span>{completedCount}/{lessons.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-300 transition-all duration-700"
              style={{ width: `${lessons.length ? (completedCount / lessons.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-dashed border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">Definition of done</p>
            <p className="mt-2 text-sm leading-6 text-white">{meta.deliverable}</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-cyan-200 transition group-hover:text-white">
            Открыть спринт
            <span aria-hidden="true">→</span>
          </div>
        </div>
      </Link>
    </li>
  )
}

export default function GuidePage() {
  const { token, loadProgress, isCompleted } = useAuthStore()

  useEffect(() => {
    if (token) loadProgress()
  }, [token, loadProgress])

  const completedLessons = useMemo(
    () => storyCourseLessons.filter((lesson) => isCompleted('lesson', lesson.id)).length,
    [isCompleted]
  )

  const currentLesson = useMemo(
    () => storyCourseLessons.find((lesson) => !isCompleted('lesson', lesson.id)) || storyCourseLessons[0],
    [isCompleted]
  )

  const currentModule = currentLesson?.module || storyModuleMeta[0].name
  const progressPercent = Math.round((completedLessons / storyCourseLessons.length) * 100)

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#030712_0%,#07111f_45%,#020617_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_30%),radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(3,7,18,0.98))] p-8 shadow-[0_32px_90px_rgba(2,6,23,0.45)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Internship Simulator</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Ты случайно попал на стажировку в IT-компанию и должен пройти 3 проекта, чтобы получить оффер.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                Это не курс “почитай и забудь”. Это симуляция первой работы:
                Jira, стендапы, брифы, ревью, демо и маленькие победы. Теория встроена прямо в контекст задач,
                а каждая тема заканчивается действием, вопросом или кодом.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">Бесплатно</p>
                  <p className="mt-2 text-sm font-semibold text-white">3 проекта + онбординг</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">Понять, подходит ли тебе backend и доводишь ли ты задачи до конца.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">Результат</p>
                  <p className="mt-2 text-sm font-semibold text-white">Рабочие мини-продукты</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">Не отдельные абстрактные уроки, а набор законченных проектных историй.</p>
                </div>
                <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-violet-300">Следующий шаг</p>
                  <p className="mt-2 text-sm font-semibold text-white">Bootcamp Pro</p>
                  <p className="mt-2 text-sm leading-6 text-gray-300">Когда прошёл базу и хочешь расти до Junior → Middle → Senior.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Бесплатный путь: онбординг + 3 проекта</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Тренажёр: отдельная зона тем и синтаксиса</span>
                <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-violet-200">Bootcamp: подписка и уровни роста</span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-cyan-100">
                  5 спринтов
                </span>
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-amber-100">
                  3 реальных проекта
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-gray-200">
                  Роли, процессы и продуктовая логика
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={`/guide/module/${encodeURIComponent(currentModule)}`}
                  className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Продолжить спринт
                </Link>
                <Link
                  href={`/guide/${currentLesson.slug}?module=${encodeURIComponent(currentLesson.module)}&topic=${encodeURIComponent(currentLesson.category)}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-white/10"
                >
                  Открыть следующий урок
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/25 p-6 backdrop-blur">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Твой статус</span>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-200">Intern Go Developer</span>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Прогресс кампании</span>
                  <span className="font-semibold text-white">{progressPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-300 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">{completedLessons} из {storyCourseLessons.length} уроков закрыто</p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Сегодня в Jira</p>
                  <p className="mt-2 font-mono text-sm text-cyan-300">{storyModuleMeta.find((module) => module.name === currentModule)?.ticket}</p>
                  <p className="mt-2 text-sm text-white">{storyModuleMeta.find((module) => module.name === currentModule)?.deliverable}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Текущий проект</p>
                  <p className="mt-2 text-lg font-semibold text-white">{storyModuleMeta.find((module) => module.name === currentModule)?.project}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-300">{storyModuleMeta.find((module) => module.name === currentModule)?.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Программа курса</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Спринты как мини-сезон стажировки</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
                Каждый модуль устроен как реальный спринт: контекст от команды, короткая теория, маленькие проверки,
                код, релиз и рефлексия. Пользователь не просто учит Go, а постепенно понимает, как на самом деле
                живёт продуктовая разработка.
              </p>
            </div>
          </div>

          <ol className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {storyModuleMeta.map((module, index) => (
              <SprintCard key={module.name} moduleName={module.name} index={index} />
            ))}
          </ol>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Что пользователь реально получает</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Бесплатный путь должен сам по себе давать ценность</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ['Понять профессию', 'Пользователь видит, как живут роли, спринты, Jira, ревью и демо внутри команды.'],
                ['Собрать 3 проекта', 'На выходе остаются законченные проекты, а не только просмотренные уроки.'],
                ['Проверить мотивацию', 'Бесплатный курс должен честно показать: нравится ли человеку backend-путь вообще.'],
                ['Подготовиться к покупке', 'Подписка продаётся не обещаниями, а логичным продолжением после уже пройденного пути.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-300">Когда идти в Bootcamp</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Не раньше, чем база реально прожита</h2>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-gray-300">
              <li>✓ ты прошёл бесплатный путь и не сдулся на 3 проектах;</li>
              <li>✓ понимаешь, что хочешь глубже в backend и системное мышление;</li>
              <li>✓ готов к более длинным проектам, подписке и уровневой системе роста.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/bootcamp" className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                Посмотреть Bootcamp →
              </Link>
              <Link href="/trainer" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10">
                Добить темы в тренажёре
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
