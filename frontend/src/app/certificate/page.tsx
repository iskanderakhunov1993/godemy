'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'

const CERT_CONFIG: Record<string, {
  title: string
  subtitle: string
  desc: string
  color: string
  icon: string
  accentFrom: string
  accentTo: string
}> = {
  trainer: {
    title: 'Практик Go',
    subtitle: 'Тренажёр пройден',
    desc: 'Успешно выполнил практические задачи в интерактивном тренажёре Godemy, подтвердив навыки написания Go-кода',
    color: '#22d3ee',
    icon: '⚡',
    accentFrom: '#06b6d4',
    accentTo: '#2563eb',
  },
  flashcards: {
    title: 'Знаток Go',
    subtitle: 'Карточки пройдены',
    desc: 'Изучил все тематические карточки Godemy, освоив ключевые концепции языка программирования Go',
    color: '#a78bfa',
    icon: '🃏',
    accentFrom: '#7c3aed',
    accentTo: '#9333ea',
  },
  course: {
    title: 'Выпускник курса',
    subtitle: 'Курс Go завершён',
    desc: 'Прошёл полный курс Godemy, освоив основы, структуры данных, горутины и обработку ошибок',
    color: '#34d399',
    icon: '🎓',
    accentFrom: '#059669',
    accentTo: '#0d9488',
  },
  bootcamp: {
    title: 'Agile-практик',
    subtitle: 'Bootcamp Junior',
    desc: 'Завершил Bootcamp Junior в Godemy: разработал 5 реальных проектов, применяя Go, REST API и Agile-методологию',
    color: '#fbbf24',
    icon: '🏆',
    accentFrom: '#d97706',
    accentTo: '#ea580c',
  },
}

function CertificateContent() {
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const type = searchParams.get('type') || 'course'
  const autoprint = searchParams.get('print') === '1'

  const cfg = CERT_CONFIG[type] || CERT_CONFIG.course
  const certificateName = user?.fullName?.trim() || user?.username || ''

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    if (autoprint) {
      const t = setTimeout(() => window.print(), 800)
      return () => clearTimeout(t)
    }
  }, [autoprint])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Войди, чтобы просмотреть сертификат</p>
          <Link href="/auth/login" className="btn-primary">Войти</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #certificate-printable, #certificate-printable * { visibility: visible !important; }
          #certificate-printable { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/profile" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Назад в профиль
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold px-5 py-2 rounded-xl text-sm transition-colors"
        >
          ⬇ Сохранить PDF
        </button>
      </div>

      {/* Certificate */}
      <div className="flex items-center justify-center px-4 py-6 min-h-[80vh]">
        <div
          id="certificate-printable"
          style={{
            width: '794px',
            minHeight: '562px',
            background: '#0f1117',
            border: `2px solid ${cfg.color}33`,
            borderRadius: '24px',
            padding: '56px 64px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Georgia, serif',
            boxShadow: `0 0 80px ${cfg.color}14`,
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(ellipse at top right, ${cfg.color}0a 0%, transparent 60%)`,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-40px', left: '-40px',
            width: '300px', height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${cfg.color}07 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Top bar */}
          <div style={{
            height: '4px',
            background: `linear-gradient(90deg, ${cfg.accentFrom}, ${cfg.accentTo})`,
            borderRadius: '2px',
            marginBottom: '40px',
          }} />

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <div style={{ color: cfg.color, fontSize: '12px', fontFamily: 'monospace', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Godemy
              </div>
              <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: 'sans-serif', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Сертификат об окончании
              </div>
            </div>
            <div style={{ fontSize: '48px', lineHeight: 1 }}>{cfg.icon}</div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#6b7280', fontSize: '13px', fontFamily: 'sans-serif', marginBottom: '6px' }}>Выдан</div>
            <div style={{ color: '#ffffff', fontSize: '38px', fontWeight: 'bold', letterSpacing: '1px' }}>
              {certificateName}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ color: '#6b7280', fontSize: '13px', fontFamily: 'sans-serif', marginBottom: '6px' }}>За то, что</div>
            <div style={{ color: '#d1d5db', fontSize: '16px', fontFamily: 'sans-serif', lineHeight: '1.6', maxWidth: '540px' }}>
              {cfg.desc}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'inline-block',
                background: `linear-gradient(135deg, ${cfg.accentFrom}, ${cfg.accentTo})`,
                borderRadius: '12px',
                padding: '10px 20px',
              }}>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                  {cfg.title}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontFamily: 'sans-serif' }}>
                  {cfg.subtitle}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'sans-serif' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '2px' }}>Дата выдачи</div>
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>{today}</div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, ${cfg.accentFrom}60, transparent)`,
            borderRadius: '1px',
            marginTop: '32px',
          }} />
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
