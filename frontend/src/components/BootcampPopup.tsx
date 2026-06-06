'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const DISMISSED_KEY = 'bootcamp-popup-dismissed-v1'

export default function BootcampPopup() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.body.scrollHeight - window.innerHeight
      if (total > 0 && scrolled / total >= 0.25) {
        setVisible(true)
        window.removeEventListener('scroll', onScroll)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const dismiss = () => {
    setVisible(false)
    setDismissed(true)
    sessionStorage.setItem(DISMISSED_KEY, '1')
  }

  if (dismissed || !visible) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-300"
      style={{ animation: 'popupIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="relative rounded-2xl border border-amber-500/40 bg-gray-950 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-5 pt-5 pb-5">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚀</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Bootcamp</span>
          </div>

          <h3 className="text-white font-bold text-lg leading-snug mb-2">
            Хватит читать — пора строить
          </h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            <span className="text-white font-medium">Только практика.</span> Реальные проекты, код-ревью и портфолио на выходе. Без воды — сразу в бой.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['Реальные проекты', 'Код-ревью', 'Портфолио', 'Junior → Middle'].map((f) => (
              <span key={f} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300/80 px-2.5 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/bootcamp"
              onClick={dismiss}
              className="flex-1 text-center text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 px-4 py-2.5 rounded-xl transition-colors"
            >
              Узнать подробнее →
            </Link>
            <button
              onClick={dismiss}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors whitespace-nowrap"
            >
              Не сейчас
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
