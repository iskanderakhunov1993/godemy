'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, type CertificateStatus, type UserProfile } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

function formatEarnedDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function CertificatesContent() {
  const router = useRouter()
  const { user, token, setAuth } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [fullNameDraft, setFullNameDraft] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [emailingId, setEmailingId] = useState<string | null>(null)
  const [flashMessage, setFlashMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
      return
    }

    api.getUserProfile()
      .then((profile) => {
        setUserProfile(profile)
        setFullNameDraft(profile.user.fullName || '')
      })
      .catch(() => {
        setUserProfile(null)
      })
  }, [token, router])

  const certificates = userProfile?.certificates ?? []
  const earnedCount = useMemo(() => certificates.filter((cert) => cert.earned).length, [certificates])

  const saveFullName = async () => {
    if (!token || !user) return
    const trimmed = fullNameDraft.trim()
    if (trimmed.length < 5) return

    setSavingName(true)
    try {
      const updated = await api.updateMe({ fullName: trimmed })
      setAuth(token, updated)
      const profile = await api.getUserProfile()
      setUserProfile(profile)
      setFlashMessage('ФИО сохранено. Сертификаты обновлены.')
    } finally {
      setSavingName(false)
    }
  }

  const sendToEmail = async (type: CertificateStatus['id']) => {
    setEmailingId(type)
    setFlashMessage(null)
    try {
      const response = await api.emailCertificate(type)
      setFlashMessage(response.message)
    } catch (error) {
      setFlashMessage(error instanceof Error ? error.message : 'Не удалось отправить письмо')
    } finally {
      setEmailingId(null)
    }
  }

  if (!token || !user) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-5 transition-colors"
        >
          ← Назад в профиль
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Сертификаты</h1>
            <p className="text-gray-400 mt-2 max-w-3xl">
              Сертификат появляется только после полного завершения трека. Открыть его можно сразу,
              а скачать PDF или отправить себе на почту — только с подпиской Godemy Pro.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2">
            <span className="text-amber-400 text-xl">🏅</span>
            <span className="text-amber-300 font-bold">{earnedCount} из {certificates.length} получено</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="text-sm text-cyan-200 font-semibold mb-2">ФИО для сертификата</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={fullNameDraft}
              onChange={(e) => setFullNameDraft(e.target.value)}
              placeholder="Например: Иванов Иван Иванович"
              className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
            />
            <button
              onClick={saveFullName}
              disabled={savingName || fullNameDraft.trim().length < 5}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-4 py-2.5 text-sm"
            >
              {savingName ? 'Сохраняем...' : 'Сохранить ФИО'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Для выпуска сертификата нужно указать минимум имя и фамилию.
          </p>
        </div>

        {flashMessage && (
          <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
            {flashMessage}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {certificates.map((cert) => (
          <article
            key={cert.id}
            className={`rounded-[28px] border p-6 transition-all ${
              cert.earned
                ? 'border-violet-500/30 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),rgba(17,24,39,0.96)_42%)] shadow-[0_16px_50px_rgba(76,29,149,0.18)]'
                : 'border-gray-800 bg-gray-900/70'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-300">{cert.subtitle}</p>
                <h2 className="mt-2 text-2xl font-black text-white">{cert.title}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                cert.earned ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
                {cert.earned ? 'Доступен' : 'В процессе'}
              </span>
            </div>

            <p className="mt-3 text-sm leading-7 text-gray-400">{cert.description}</p>

            <div className="mt-5 rounded-2xl border border-gray-800 bg-black/20 p-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Прогресс</span>
                <span>{cert.progress} / {cert.total}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${cert.earned ? 'bg-emerald-400' : 'bg-violet-400'}`}
                  style={{ width: `${cert.total > 0 ? (cert.progress / cert.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Курс</dt>
                <dd className="text-white text-right">{cert.courseName}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Дата выдачи</dt>
                <dd className="text-white text-right">{formatEarnedDate(cert.earnedAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Номер</dt>
                <dd className="text-white text-right">{cert.certificateNumber || '—'}</dd>
              </div>
            </dl>

            {cert.lockedReason && (
              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {cert.lockedReason}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {cert.previewAllowed ? (
                <Link
                  href={`/certificate?type=${cert.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold px-4 py-3 transition-colors"
                >
                  Открыть сертификат
                </Link>
              ) : (
                <Link
                  href={cert.ctaHref}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold px-4 py-3 transition-colors"
                >
                  {cert.ctaLabel}
                </Link>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cert.downloadAllowed ? (
                  <a
                    href={`/certificate?type=${cert.id}&print=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2.5 transition-colors"
                  >
                    Скачать PDF
                  </a>
                ) : (
                  <Link
                    href="/bootcamp/buy"
                    className="flex items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold px-4 py-2.5 transition-colors"
                  >
                    Godemy Pro
                  </Link>
                )}

                {cert.emailAllowed ? (
                  <button
                    onClick={() => sendToEmail(cert.id)}
                    disabled={emailingId === cert.id}
                    className="rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-50 text-violet-200 font-semibold px-4 py-2.5 transition-colors"
                  >
                    {emailingId === cert.id ? 'Отправляем...' : 'Выслать на почту'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="rounded-xl border border-gray-800 bg-gray-900 text-gray-500 font-semibold px-4 py-2.5 cursor-not-allowed"
                  >
                    Выслать на почту
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
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
