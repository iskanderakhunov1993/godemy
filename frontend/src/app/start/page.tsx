'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function StartPage() {
  const { user, token, progress, loadProgress } = useAuthStore()
  const [lessonsTotal, setLessonsTotal] = useState(0)
  const [exercisesTotal, setExercisesTotal] = useState(0)

  useEffect(() => {
    if (token) loadProgress()
    Promise.all([
      api.getLessons(),
      api.getExercises({ module: 'core' }),
    ]).then(([lessons, exercises]) => {
      setLessonsTotal(lessons.filter((lesson) => lesson.module !== 'bootcamp').length)
      setExercisesTotal(exercises.length)
    }).catch(() => {})
  }, [token, loadProgress])

  const completedLessons = useMemo(
    () => progress.filter((item) => item.entityType === 'lesson' && item.status === 'completed').length,
    [progress]
  )
  const completedExercises = useMemo(
    () => progress.filter((item) => item.entityType === 'exercise' && item.status === 'completed').length,
    [progress]
  )

  const lessonProgress = lessonsTotal > 0 ? Math.min(Math.round((completedLessons / lessonsTotal) * 100), 100) : 0
  const exerciseProgress = exercisesTotal > 0 ? Math.min(Math.round((completedExercises / exercisesTotal) * 100), 100) : 0

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">Твой маршрут</p>
        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Всегда один понятный следующий шаг</h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-400">
          Не пытайся пройти всё сразу. Сначала собери базу бесплатно, затем переходи к профессиональной практике.
        </p>
      </div>

      <div className="mt-12 space-y-5">
        <section className="rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6 sm:p-8">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 font-black text-gray-950">1</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Бесплатно</p>
                  <h2 className="text-2xl font-black text-white">Курс и 3 учебных проекта</h2>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-gray-400">
                Изучи основы Go и примени их последовательно: простая программа, сервис с данными из интернета и проект с хранением записей.
              </p>
              {token && lessonsTotal > 0 && (
                <div className="mt-6 max-w-xl">
                  <div className="mb-2 flex justify-between text-xs text-gray-400">
                    <span>Прогресс курса</span>
                    <span>{completedLessons} / {lessonsTotal}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${lessonProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
            <Link href="/guide" className="btn-primary whitespace-nowrap px-6 py-3">
              {completedLessons > 0 ? 'Продолжить курс →' : 'Начать курс →'}
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-violet-500/30 bg-violet-500/5 p-6 sm:p-8">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 font-black text-white">2</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-300">Практикуйся параллельно</p>
                  <h2 className="text-2xl font-black text-white">Практика Go</h2>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-gray-400">
                Используй её после каждой темы: решай упражнения, повторяй материал по карточкам и закрепляй новые идеи.
              </p>
              {token && exercisesTotal > 0 && (
                <div className="mt-6 max-w-xl">
                  <div className="mb-2 flex justify-between text-xs text-gray-400">
                    <span>Решено задач</span>
                    <span>{completedExercises} / {exercisesTotal}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                    <div className="h-full rounded-full bg-violet-400" style={{ width: `${exerciseProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
            <Link href="/trainer" className="whitespace-nowrap rounded-xl bg-violet-500 px-6 py-3 font-bold text-white transition-colors hover:bg-violet-400">
              Открыть практику →
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-violet-500/5 p-6 sm:p-8">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 font-black text-gray-950">3</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Следующий этап</p>
                  <h2 className="text-2xl font-black text-white">Продвинутый курс</h2>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-gray-400">
                Переходи дальше, когда готов строить более сложные проекты, подтверждать уровни и собирать профессиональное портфолио.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Проекты', 'Задачи', 'Проверка навыков', 'Сертификаты'].map((item) => (
                  <span key={item} className="rounded-lg border border-gray-700 bg-gray-950/50 px-3 py-1.5 text-xs text-gray-400">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href={user?.isPremium ? '/junior' : '/bootcamp'}
              className="whitespace-nowrap rounded-xl bg-amber-400 px-6 py-3 text-center font-bold text-gray-950 transition-colors hover:bg-amber-300"
            >
              {user?.isPremium ? 'Продолжить курс →' : 'Посмотреть следующий этап →'}
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/profile" className="rounded-2xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700">
          <p className="font-bold text-white">Профиль и прогресс</p>
          <p className="mt-2 text-sm text-gray-500">Продолжай с нужного места и следи за завершёнными материалами.</p>
        </Link>
        <Link href="/certificates" className="rounded-2xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700">
          <p className="font-bold text-white">Сертификаты</p>
          <p className="mt-2 text-sm text-gray-500">Смотри требования и скачивай полученные сертификаты.</p>
        </Link>
      </div>
    </main>
  )
}
