'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { getPratkorExercises, getPratkorProgress } from '@/lib/pratkor'
import { useAuthStore } from '@/lib/store'

function CertificatesContent() {
  const router = useRouter()
  const { user, token, progress, loadProgress, setAuth } = useAuthStore()
  const [courseLessonIds, setCourseLessonIds] = useState<number[]>([])
  const [trainerExerciseIds, setTrainerExerciseIds] = useState<number[]>([])
  const [trainerLocalTotal, setTrainerLocalTotal] = useState(0)
  const [trainerLocalCompleted, setTrainerLocalCompleted] = useState(0)
  const [flashcardsLearned] = useState(() => {
    if (typeof window === 'undefined') return 0
    try {
      const raw = localStorage.getItem('go-flashcards-v1')
      if (!raw) return 0
      const data = JSON.parse(raw) as Record<string, string>
      return Object.values(data).filter((v) => v === 'learned').length
    } catch {
      return 0
    }
  })
  const [fullNameDraft, setFullNameDraft] = useState<string | null>(null)
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return }
    loadProgress()
  }, [token, router, loadProgress])

  useEffect(() => {
    Promise.all([
      api.getLessons(),
      api.getExercises({ module: 'core' }),
    ]).then(([allLessons, syntaxExercises]) => {
      const freeCourseLessons = allLessons.filter((lesson) => lesson.module !== 'bootcamp')
      setCourseLessonIds(freeCourseLessons.map((lesson) => lesson.id))
      setTrainerExerciseIds(syntaxExercises.map((exercise) => exercise.id))

      const pratkorExercises = getPratkorExercises()
      const pratkorProgress = getPratkorProgress()
      setTrainerLocalTotal(pratkorExercises.length)
      setTrainerLocalCompleted(pratkorProgress.completedSlugs.length)
    }).catch(() => {
      // leave empty stats on API failure
    })
  }, [])

  const fullName = fullNameDraft ?? (user?.fullName || '')

  const saveFullName = async () => {
    if (!token || !user) return
    const trimmed = fullName.trim()
    if (trimmed.length < 3) return
    setSavingName(true)
    try {
      const updated = await api.updateMe({ fullName: trimmed })
      setAuth(token, updated)
      setFullNameDraft(null)
    } finally {
      setSavingName(false)
    }
  }

  const courseLessonSet = useMemo(() => new Set(courseLessonIds), [courseLessonIds])
  const trainerExerciseSet = useMemo(() => new Set(trainerExerciseIds), [trainerExerciseIds])

  const completedExercises = useMemo(() => {
    if (trainerExerciseSet.size === 0) return 0
    return progress.filter(
      (p) => p.entityType === 'exercise' && p.status === 'completed' && trainerExerciseSet.has(p.entityId)
    ).length
  }, [progress, trainerExerciseSet])

  const completedLessons = useMemo(() => {
    if (courseLessonSet.size === 0) return 0
    return progress.filter(
      (p) => p.entityType === 'lesson' && p.status === 'completed' && courseLessonSet.has(p.entityId)
    ).length
  }, [progress, courseLessonSet])

  const totalTrainerTasksRaw = trainerExerciseIds.length + trainerLocalTotal
  const totalTrainerTasks = totalTrainerTasksRaw > 0 ? totalTrainerTasksRaw : null
  const completedTrainerTasks = completedExercises + trainerLocalCompleted
  const totalCourseLessons = courseLessonIds.length > 0 ? courseLessonIds.length : null

  const certificates = useMemo(() => [
    {
      id: 'trainer',
      title: 'Практик Go',
      subtitle: 'Тренажёр пройден',
      desc: 'Выдаётся за полное прохождение синтаксиса тренажёра и всех задач Практера',
      icon: '⚡',
      gradient: 'from-cyan-500/20 to-blue-600/20',
      border: 'border-cyan-500/40',
      glow: 'shadow-cyan-500/10',
      earned: totalTrainerTasks !== null && completedTrainerTasks >= totalTrainerTasks,
      progress: totalTrainerTasks !== null ? Math.min(completedTrainerTasks, totalTrainerTasks) : 0,
      total: totalTrainerTasks,
      earnedDate: totalTrainerTasks !== null && completedTrainerTasks >= totalTrainerTasks
        ? progress
        .filter((p) => p.entityType === 'exercise' && p.status === 'completed' && trainerExerciseSet.has(p.entityId))
            .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0]
            ?.updatedAt
        : null,
    },
    {
      id: 'flashcards',
      title: 'Знаток Go',
      subtitle: 'Карточки пройдены',
      desc: 'Выдаётся за изучение всех 20 тематических карточек',
      icon: '🃏',
      gradient: 'from-violet-500/20 to-purple-600/20',
      border: 'border-violet-500/40',
      glow: 'shadow-violet-500/10',
      earned: flashcardsLearned >= 20,
      progress: Math.min(flashcardsLearned, 20),
      total: 20,
      earnedDate: null,
    },
    {
      id: 'course',
      title: 'Выпускник курса',
      subtitle: 'Курс Go завершён',
      desc: 'Выдаётся за полное прохождение бесплатного курса',
      icon: '🎓',
      gradient: 'from-emerald-500/20 to-teal-600/20',
      border: 'border-emerald-500/40',
      glow: 'shadow-emerald-500/10',
      earned: totalCourseLessons !== null && completedLessons >= totalCourseLessons,
      progress: totalCourseLessons !== null ? Math.min(completedLessons, totalCourseLessons) : 0,
      total: totalCourseLessons,
      earnedDate: totalCourseLessons !== null && completedLessons >= totalCourseLessons
        ? progress
        .filter((p) => p.entityType === 'lesson' && p.status === 'completed' && courseLessonSet.has(p.entityId))
            .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0]
            ?.updatedAt
        : null,
    },
    {
      id: 'bootcamp',
      title: 'Agile-практик',
      subtitle: 'Буткемп & Agile',
      desc: 'Выдаётся за прохождение буткемпа и освоение Agile-методологии',
      icon: '🏆',
      gradient: 'from-amber-500/20 to-orange-600/20',
      border: 'border-amber-500/40',
      glow: 'shadow-amber-500/10',
      earned: false,
      progress: 0,
      total: null,
      earnedDate: null,
      comingSoon: true,
    },
  ], [completedLessons, flashcardsLearned, progress, totalTrainerTasks, completedTrainerTasks, totalCourseLessons, trainerExerciseSet, courseLessonSet])

  const earnedCount = certificates.filter((c) => c.earned).length

  if (!token || !user) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-5 transition-colors"
        >
          ← Назад к профилю
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Сертификаты</h1>
            <p className="text-gray-400 mt-2">
              Подтверди свои знания и получи сертификаты за прохождение курсов
            </p>
          </div>
          {earnedCount > 0 && (
            <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2">
              <span className="text-amber-400 text-xl">🏅</span>
              <span className="text-amber-300 font-bold">{earnedCount} из {certificates.length} получено</span>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="text-sm text-cyan-200 font-semibold mb-2">Имя в сертификате (ФИО)</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={fullName}
              onChange={(e) => setFullNameDraft(e.target.value)}
              placeholder="Например: Иванов Иван Иванович"
              className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
            />
            <button
              onClick={saveFullName}
              disabled={savingName || fullName.trim().length < 3}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-4 py-2.5 text-sm"
            >
              {savingName ? 'Сохраняем...' : 'Сохранить ФИО'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">Это имя автоматически будет отображаться на PDF сертификате.</p>
        </div>
      </div>

      {/* Certificates grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className={`relative rounded-[28px] border bg-gradient-to-br ${
              cert.earned
                ? `${cert.gradient} ${cert.border} shadow-lg ${cert.glow}`
                : 'border-gray-700/60 bg-gray-800/30'
            } p-6 overflow-hidden transition-all`}
          >
            {cert.earned && (
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
                  backgroundSize: '20px 20px',
                }}
              />
            )}

            <div className="relative">
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                    cert.earned ? 'bg-white/10' : 'bg-gray-700/50'
                  }`}
                >
                  {cert.earned ? cert.icon : '🔒'}
                </div>
                {cert.earned ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-3 py-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Получен
                  </span>
                ) : cert.comingSoon ? (
                  <span className="text-xs text-gray-600 bg-gray-800 border border-gray-700 rounded-full px-2.5 py-1">
                    Скоро
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 rounded-full px-2.5 py-1">
                    Не получен
                  </span>
                )}
              </div>

              <h3 className={`font-bold text-xl mb-0.5 ${cert.earned ? 'text-white' : 'text-gray-400'}`}>
                {cert.title}
              </h3>
              <p className={`text-sm font-medium mb-3 ${cert.earned ? 'text-cyan-400' : 'text-gray-600'}`}>
                {cert.subtitle}
              </p>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{cert.desc}</p>

              {/* Progress bar */}
              {cert.total !== null && !cert.earned && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Прогресс</span>
                    <span>{cert.progress} / {cert.total}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500 rounded-full transition-all"
                      style={{ width: `${(cert.progress / cert.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {cert.earned && cert.earnedDate && (
                <p className="text-xs text-gray-500 mb-4">
                  Получен{' '}
                  {new Intl.DateTimeFormat('ru-RU', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date(cert.earnedDate))}
                </p>
              )}

              {cert.earned && !cert.earnedDate && (
                <p className="text-xs text-gray-500 mb-4">Получен</p>
              )}

              {/* Action button */}
              {cert.earned ? (
                user.isPremium ? (
                  <a
                    href={`/certificate?type=${cert.id}&print=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    ⬇ Скачать PDF
                  </a>
                ) : (
                  <Link
                    href="/bootcamp/buy"
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    🔒 Премиум — скачать PDF
                  </Link>
                )
              ) : !cert.comingSoon ? (
                <Link
                  href={
                    cert.id === 'trainer'
                      ? '/trainer'
                      : cert.id === 'flashcards'
                        ? '/trainer'
                        : '/guide'
                  }
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 px-4 py-2.5 rounded-xl transition-colors"
                >
                  Начать →
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Info block */}
      <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/50 px-6 py-5">
        <p className="text-sm text-gray-400 leading-relaxed">
          <span className="text-white font-semibold">Как скачать сертификат?</span>{' '}
          Сертификаты доступны в формате PDF для пользователей с Премиум доступом.{' '}
          <Link href="/bootcamp/buy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Получить Премиум →
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function CertificatesPage() {
  return (
    <Suspense>
      <CertificatesContent />
    </Suspense>
  )
}
