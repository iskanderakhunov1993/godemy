'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, type CertificateStatus, type UserProfile } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

function formatDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value))
}

function CertificatesContent() {
  const router = useRouter()
  const { user, token, setAuth } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [fullNameDraft, setFullNameDraft] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    if (!token) {
      router.push('/auth/login?next=/certificates')
      return
    }
    api.getUserProfile().then((next) => {
      setProfile(next)
      setFullNameDraft(next.user.fullName || '')
    })
  }, [router, token])

  const cert = profile?.certificates[0] as CertificateStatus | undefined

  async function refresh() {
    const next = await api.getUserProfile()
    setProfile(next)
    setFullNameDraft(next.user.fullName || '')
  }

  async function saveFullName() {
    if (!token || !user) return
    const trimmed = fullNameDraft.trim()
    if (trimmed.length < 5) return
    setSavingName(true)
    try {
      const updated = await api.updateMe({ fullName: trimmed })
      setAuth(token, updated)
      await refresh()
      setFlash('ФИО сохранено. Статус сертификата обновлён.')
    } finally {
      setSavingName(false)
    }
  }

  async function sendToEmail() {
    if (!cert?.emailAllowed) return
    setEmailing(true)
    try {
      const response = await api.emailCertificate(cert.id)
      setFlash(response.message)
    } catch (error) {
      setFlash(error instanceof Error ? error.message : 'Не удалось отправить письмо')
    } finally {
      setEmailing(false)
    }
  }

  if (!token || !user || !cert) {
    return <div className="mx-auto max-w-5xl px-4 py-12 text-gray-400">Загружаем сертификат...</div>
  }

  const percent = cert.total > 0 ? Math.round((cert.progress / cert.total) * 100) : 0

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/profile" className="text-sm text-gray-500 hover:text-gray-300">← Назад в профиль</Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="surface-card rounded-[32px] p-7">
          <span className="eyebrow">Сертификат результата</span>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white">{cert.title}</h1>
          <p className="mt-3 max-w-2xl text-gray-400 leading-7">{cert.description}</p>

          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Прогресс к сертификату</span>
              <span>{cert.progress} / {cert.total}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-800">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-emerald-300">{percent}%</p>
          </div>

          <h2 className="mt-8 text-2xl font-bold text-white">Обязательные проекты</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(cert.projects || []).map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`} className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 hover:border-cyan-400/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{project.kind === 'checkpoint' ? 'Checkpoint' : 'Project'}</p>
                    <h3 className="mt-1 font-bold text-white">{project.title}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${project.status === 'completed' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-gray-800 text-gray-400'}`}>
                    {project.status === 'completed' ? 'Готово' : 'Не готово'}
                  </span>
                </div>
                {project.githubUrl && <p className="mt-2 truncate text-xs text-gray-500">{project.githubUrl}</p>}
              </Link>
            ))}
          </div>
        </section>

        <aside className="surface-card h-fit rounded-[32px] p-6">
          <div className={`rounded-2xl border p-4 ${cert.previewAllowed ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-amber-400/20 bg-amber-400/10'}`}>
            <p className={`font-semibold ${cert.previewAllowed ? 'text-emerald-300' : 'text-amber-300'}`}>
              {cert.previewAllowed ? 'Сертификат готов' : 'Сертификат пока закрыт'}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-300">{cert.lockedReason || 'Можно открыть, скачать PDF и отправить на email.'}</p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-cyan-200">ФИО для сертификата</p>
            <input
              value={fullNameDraft}
              onChange={(event) => setFullNameDraft(event.target.value)}
              placeholder="Иванов Иван"
              className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            />
            <button
              onClick={saveFullName}
              disabled={savingName || fullNameDraft.trim().length < 5}
              className="mt-3 w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-black disabled:opacity-50"
            >
              {savingName ? 'Сохраняем...' : 'Сохранить ФИО'}
            </button>
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Дата выдачи</dt><dd className="text-white">{formatDate(cert.earnedAt)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">ID</dt><dd className="text-right text-white">{cert.certificateNumber || '—'}</dd></div>
          </dl>

          <div className="mt-5 space-y-3">
            {cert.previewAllowed ? (
              <>
                <Link href={`/certificate?type=${cert.id}`} className="btn-primary w-full justify-center">Открыть сертификат</Link>
                <a href={`/certificate?type=${cert.id}&print=1`} target="_blank" rel="noopener noreferrer" className="flex w-full justify-center rounded-xl bg-amber-400 px-4 py-3 font-bold text-black">Скачать PDF</a>
                <button onClick={sendToEmail} disabled={emailing} className="w-full rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 font-semibold text-violet-200 disabled:opacity-50">
                  {emailing ? 'Отправляем...' : 'Выслать на почту'}
                </button>
              </>
            ) : (
              <Link href={cert.ctaHref} className="btn-primary w-full justify-center">{cert.ctaLabel}</Link>
            )}
          </div>

          {flash && <p className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{flash}</p>}
        </aside>
      </div>
    </main>
  )
}

export default function CertificatesPage() {
  return (
    <Suspense>
      <CertificatesContent />
    </Suspense>
  )
}
