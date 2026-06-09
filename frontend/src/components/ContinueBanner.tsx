'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getLastVisited, LastVisited } from '@/lib/streak'

export default function ContinueBanner() {
  const [last] = useState<LastVisited | null>(() => getLastVisited())

  if (!last) return null

  const icon = last.type === 'lesson' ? '📖' : '⚡'
  const label = last.type === 'lesson' ? 'Урок' : 'Задача'

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <Link
        href={last.href}
        className="surface-highlight group flex items-center gap-4 rounded-[26px] px-5 py-4 hover:-translate-y-0.5 hover:border-violet-400/30"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/16 bg-violet-400/10 text-xl text-violet-200">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Продолжить с того места
          </div>
          <div className="truncate font-medium text-gray-100">
            {label}: {last.title}
          </div>
        </div>
        <div className="shrink-0 text-lg text-violet-300 transition-transform group-hover:translate-x-1">
          →
        </div>
      </Link>
    </div>
  )
}
