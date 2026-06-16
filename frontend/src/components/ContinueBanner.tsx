'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getLastVisited, LastVisited } from '@/lib/streak'

export default function ContinueBanner() {
  const [last] = useState<LastVisited | null>(() => getLastVisited())

  if (!last) return null

  const label = last.type === 'lesson' ? 'Урок' : 'Задача'
  const title = /Project ZERO|Atlas Dev|стажиров|^[A-Za-z\s·-]+$/i.test(last.title.trim())
    ? 'последний открытый шаг'
    : last.title

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
      <Link
        href={last.href}
        className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm transition hover:border-cyan-300/25 hover:bg-white/[0.055]"
      >
        <div className="h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.65)]" />
        <div className="min-w-0 flex-1 truncate text-gray-400">
          Продолжить: <span className="font-semibold text-gray-100">{label.toLowerCase()} · {title}</span>
        </div>
        <div className="shrink-0 text-base text-cyan-300 transition-transform group-hover:translate-x-1">
          →
        </div>
      </Link>
    </div>
  )
}
