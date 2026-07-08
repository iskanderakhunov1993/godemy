'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api, type CertificateStatus, type UserProfile } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const CERT_THEME: Record<CertificateStatus['id'], { accent: string; glow: string; ribbon: string }> = {
  'go-junior': { accent: '#f59e0b', glow: 'rgba(245,158,11,0.26)', ribbon: 'Go Junior' },
}

function formatDate(value?: string) {
  const source = value ? new Date(value) : new Date()
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(source)
}

function lockedStateTitle(certificate: CertificateStatus) {
  if (certificate.earned && certificate.fullNameRequired) return 'Нужно заполнить ФИО'
  if (certificate.earned && !certificate.downloadAllowed) return 'Сертификат готов'
  return 'Сертификат пока недоступен'
}

function CertificateContent() {
  const searchParams = useSearchParams()
  const { token, user } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [flashMessage, setFlashMessage] = useState<string | null>(null)

  const type = (searchParams.get('type') || 'go-junior') as CertificateStatus['id']
  const autoprint = searchParams.get('print') === '1'

  useEffect(() => {
    if (!token) {
      return
    }

    api.getUserProfile()
      .then(setUserProfile)
      .finally(() => setLoading(false))
  }, [token])

  const certificate = useMemo(
    () => userProfile?.certificates.find((item) => item.id === type) ?? null,
    [userProfile, type]
  )

  const theme = CERT_THEME[type] || CERT_THEME['go-junior']

  const sendToEmail = async () => {
    if (!certificate?.emailAllowed) return
    setSending(true)
    setFlashMessage(null)
    try {
      const response = await api.emailCertificate(certificate.id)
      setFlashMessage(response.message)
    } catch (error) {
      setFlashMessage(error instanceof Error ? error.message : 'Не удалось отправить письмо')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (autoprint && certificate?.downloadAllowed) {
      const timer = setTimeout(() => window.print(), 700)
      return () => clearTimeout(timer)
    }
  }, [autoprint, certificate?.downloadAllowed])

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 text-center max-w-lg">
          <h1 className="text-2xl font-black text-white">Нужен вход</h1>
          <p className="mt-3 text-gray-400">Войди в аккаунт, чтобы открыть свои сертификаты.</p>
          <Link href="/auth/login" className="mt-6 inline-flex rounded-xl bg-violet-500 px-5 py-3 font-bold text-white hover:bg-violet-400 transition-colors">
            Войти
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="min-h-screen bg-[#090b14]" />
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 text-center max-w-lg">
          <h1 className="text-2xl font-black text-white">Сертификат не найден</h1>
          <Link href="/certificates" className="mt-6 inline-flex rounded-xl border border-gray-700 px-5 py-3 font-semibold text-gray-200 hover:border-gray-500 transition-colors">
            Вернуться к сертификатам
          </Link>
        </div>
      </div>
    )
  }

  if (!certificate.previewAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-8 max-w-xl">
          <h1 className="text-3xl font-black text-white">{lockedStateTitle(certificate)}</h1>
          <p className="mt-4 text-gray-400 leading-7">{certificate.lockedReason || 'Сначала заверши программу.'}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/certificates" className="rounded-xl border border-gray-700 px-5 py-3 font-semibold text-gray-200 hover:border-gray-500 transition-colors">
              Назад
            </Link>
            <Link href={certificate.ctaHref} className="rounded-xl bg-violet-500 px-5 py-3 font-bold text-white hover:bg-violet-400 transition-colors">
              {certificate.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const certificateName = userProfile?.user.fullName?.trim() || user.fullName || user.username

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #certificate-printable, #certificate-printable * { visibility: visible !important; }
          #certificate-printable { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 32px !important; }
          .no-print { display: none !important; }
          body { background: #090b14 !important; }
        }
      `}</style>

      <div className="no-print max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/certificates" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Назад к сертификатам
        </Link>
        <div className="flex flex-wrap gap-3">
          {certificate.emailAllowed && (
            <button
              onClick={sendToEmail}
              disabled={sending}
              className="rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-50 text-violet-200 font-semibold px-5 py-2.5 text-sm transition-colors"
            >
              {sending ? 'Отправляем...' : 'Выслать на почту'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold px-5 py-2.5 text-sm transition-colors"
          >
            Скачать PDF
          </button>
        </div>
      </div>

      {flashMessage && (
        <div className="no-print max-w-6xl mx-auto px-4">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
            {flashMessage}
          </div>
        </div>
      )}

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 bg-[#090b14]">
        <div
          id="certificate-printable"
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#090b14]"
          style={{
            width: '1024px',
            minHeight: '640px',
            boxShadow: `0 30px 120px ${theme.glow}`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.08),transparent_36%)]" />

          <div className="relative grid min-h-[640px] grid-cols-[220px_minmax(0,1fr)]">
            <aside className="relative border-r border-white/10 bg-[linear-gradient(180deg,#16112f_0%,#120d27_100%)] px-8 py-10">
              <div className="rounded-2xl border border-violet-500/20 bg-white/5 px-5 py-4 text-violet-200">
                <div className="text-3xl font-black tracking-tight">[ godemy ]</div>
                <p className="mt-4 text-xs leading-6 text-violet-100/70">
                  Практическое обучение
                  <br />
                  для разработчиков
                </p>
              </div>

              <div
                className="mt-12 rounded-b-[28px] rounded-t-xl px-5 py-10 text-center text-white"
                style={{ background: `linear-gradient(180deg, ${theme.accent}88 0%, ${theme.accent}44 100%)` }}
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/20 text-4xl">
                  📘
                </div>
              </div>

              <div className="mt-12 space-y-6 text-sm">
                <div>
                  <p className="text-white/40">ID сертификата</p>
                  <p className="mt-2 font-semibold text-white">{certificate.certificateNumber}</p>
                  <div className="mt-3 h-[2px] w-20 rounded-full" style={{ backgroundColor: theme.accent }} />
                </div>
                <div>
                  <p className="text-white/40">Дата выдачи</p>
                  <p className="mt-2 font-semibold text-white">{formatDate(certificate.earnedAt)}</p>
                </div>
              </div>
            </aside>

            <main className="relative px-12 py-12 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-6xl font-black tracking-tight" style={{ color: theme.accent }}>
                    СЕРТИФИКАТ
                  </h1>
                  <p className="mt-6 text-lg text-white/60">подтверждает, что</p>
                  <p className="mt-4 text-6xl font-black tracking-tight">{certificateName}</p>
                  <p className="mt-5 text-xl text-white/70">успешно завершил(а) курс</p>
                  <p className="mt-2 text-5xl font-black">{certificate.courseName}</p>
                </div>
                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                  Курс завершён
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
                и получил(а) практические знания и навыки для разработки современных и надёжных продуктов на Go.
              </p>

              <div className="mt-8 inline-flex max-w-2xl rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-100">
                Сертификат выпущен бесплатно. Публичный ID для проверки: {certificate.certificateNumber}.
              </div>

              <div className="mt-16 flex items-end justify-between gap-6">
                <div>
                  <div className="text-6xl leading-none text-white/90">∿</div>
                  <div className="mt-3 h-px w-56 bg-white/20" />
                  <p className="mt-4 text-xl font-semibold">Команда godemy</p>
                  <p className="text-sm text-white/50">Онлайн-школа для разработчиков</p>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full border border-violet-500/10 opacity-40" />
            </main>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CertificatePage() {
  return (
    <Suspense>
      <CertificateContent />
    </Suspense>
  )
}
