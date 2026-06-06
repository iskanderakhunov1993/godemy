'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function StartPage() {
  const { user, token, progress, loadProgress } = useAuthStore()
  const [flashcardsLearned, setFlashcardsLearned] = useState(0)
  const [lessonsTotal, setLessonsTotal] = useState(8)

  useEffect(() => {
    if (token) loadProgress()
    api.getLessons({ module: 'core' }).then((l) => setLessonsTotal(l.length)).catch(() => {})
  }, [token, loadProgress])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('go-flashcards-v1')
      if (raw) {
        const data = JSON.parse(raw) as Record<string, string>
        const count = Object.values(data).filter((v) => v === 'learned').length
        setFlashcardsLearned(count)
      }
    } catch { /* ignore */ }
  }, [])

  const completedLessons = useMemo(
    () => progress.filter((p) => p.entityType === 'lesson' && p.status === 'completed').length,
    [progress]
  )
  const completedExercises = useMemo(
    () => progress.filter((p) => p.entityType === 'exercise' && p.status === 'completed').length,
    [progress]
  )

  const lessonPct = Math.round((completedLessons / lessonsTotal) * 100)
  const exercisePct = Math.min(Math.round((completedExercises / 5) * 100), 100)
  const flashcardPct = Math.min(Math.round((flashcardsLearned / 20) * 100), 100)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">Путь от нуля до Junior</p>
        <h1 className="text-4xl font-bold text-white mb-4">С чего начать</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Платформа состоит из 4 блоков. Проходи по порядку — каждый шаг готовит тебя к следующему.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">

        {/* Step 1 — Course */}
        <div className="group relative rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-cyan-500 rounded-l-2xl" />
          <div className="px-7 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl">
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Шаг 1</span>
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">Бесплатно</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">Курс по Go</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {lessonsTotal} уроков от основ до горутин. Читай теорию, смотри примеры кода — никакой воды, только суть. Каждый урок занимает 10–15 минут.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Синтаксис', 'Типы данных', 'Функции', 'Структуры', 'Горутины', 'Ошибки'].map((tag) => (
                      <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full border border-gray-700">{tag}</span>
                    ))}
                  </div>
                  {token && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Пройдено уроков</span>
                        <span className="font-semibold text-white">{completedLessons} / {lessonsTotal}</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full transition-all duration-700" style={{ width: `${lessonPct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link href="/guide" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {completedLessons > 0 ? 'Продолжить курс' : 'Начать курс'} →
            </Link>
          </div>
        </div>

        {/* Step 2 — Trainer */}
        <div className="group relative rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden hover:border-violet-500/40 transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-violet-500 rounded-l-2xl" />
          <div className="px-7 py-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Шаг 2</span>
                  <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">Бесплатно</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Тренажёр</h2>
                <p className="text-gray-400 text-sm">
                  Закрепи знания практикой. Тренажёр включает три инструмента — выбирай нужный.
                </p>
              </div>
            </div>

            {/* 3 sub-tools */}
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                <div className="text-lg mb-2">💻</div>
                <div className="font-semibold text-white text-sm mb-1">Задачи</div>
                <div className="text-xs text-gray-500 mb-3">Реши задачи прямо в браузере — как на собеседовании</div>
                {token && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{completedExercises} / 5</span>
                      <span>{exercisePct}%</span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${exercisePct}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                <div className="text-lg mb-2">🗺️</div>
                <div className="font-semibold text-white text-sm mb-1">Роадмапа</div>
                <div className="text-xs text-gray-500">Наглядный путь Go-разработчика: от основ до продвинутых тем</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                <div className="text-lg mb-2">🃏</div>
                <div className="font-semibold text-white text-sm mb-1">Карточки</div>
                <div className="text-xs text-gray-500 mb-3">20 карточек с ключевыми вопросами для интервью</div>
                {token && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{flashcardsLearned} / 20</span>
                      <span>{flashcardPct}%</span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${flashcardPct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link href="/trainer" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Открыть тренажёр →
            </Link>
          </div>
        </div>

        {/* Step 3 — Profile */}
        <div className="group relative rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl" />
          <div className="px-7 py-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
                🏅
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Шаг 3</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Профиль и сертификаты</h2>
                <p className="text-gray-400 text-sm">
                  В профиле хранится вся твоя история: GitHub-like тепловая карта активности и сертификаты.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">📊</span>
                <div>
                  <div className="font-semibold text-white text-sm mb-1">Активность</div>
                  <div className="text-xs text-gray-500">Тепловая карта за 9 месяцев — как у GitHub</div>
                </div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">🎓</span>
                <div>
                  <div className="font-semibold text-white text-sm mb-1">Сертификаты</div>
                  <div className="text-xs text-gray-500">Открываются по мере прохождения курса. Премиум-сертификат — с Premium-аккаунтом</div>
                </div>
              </div>
            </div>
            <Link href="/profile" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Перейти в профиль →
            </Link>
          </div>
        </div>

        {/* Step 4 — Bootcamp Junior (flagship) */}
        <div className="group relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-gray-900 to-orange-600/5 hover:border-amber-500/60 transition-all">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-l-2xl" />

          <div className="px-7 py-6 relative">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl">
                🚀
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Шаг 4 · Флагман</span>
                  <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Premium</span>
                  <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold">Скоро</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Bootcamp Junior</h2>
                <p className="text-amber-200/60 text-sm font-medium mb-1">Чистая практика — без воды</p>
                <p className="text-gray-400 text-sm">
                  Наш главный продукт. Реальные задачи уровня Junior, код-ревью, работа в команде и портфолио на выходе. Ты не просто учишься — ты уже работаешь.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {[
                { icon: '🛠️', title: 'Реальные проекты', desc: 'Пишешь код, который работает' },
                { icon: '👥', title: 'Командная работа', desc: 'GitHub, PR, код-ревью' },
                { icon: '📁', title: 'Портфолио', desc: 'Проекты для резюме' },
              ].map((f) => (
                <div key={f.title} className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                  <div className="text-lg mb-2">{f.icon}</div>
                  <div className="font-semibold text-white text-sm mb-1">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button disabled className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 font-semibold px-5 py-2.5 rounded-xl text-sm cursor-not-allowed border border-amber-500/20">
                🔒 Скоро открывается
              </button>
              <span className="text-xs text-gray-500">Оставь заявку — получишь доступ первым</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      {!user && (
        <div className="mt-10 text-center bg-gray-900 border border-gray-800 rounded-2xl px-6 py-8">
          <p className="text-white font-semibold text-lg mb-2">Готов начать?</p>
          <p className="text-gray-400 text-sm mb-5">Создай бесплатный аккаунт — прогресс сохраняется, сертификаты открываются</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-colors">
            Создать аккаунт бесплатно →
          </Link>
        </div>
      )}
    </div>
  )
}
