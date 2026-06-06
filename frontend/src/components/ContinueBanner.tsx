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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      <Link
        href={last.href}
        className="surface-highlight flex items-center gap-4 hover:border-cyan-500/40 rounded-2xl px-5 py-4 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wide mb-0.5">
            Продолжить с того места
          </div>
          <div className="text-gray-100 font-medium truncate">
            {label}: {last.title}
          </div>
        </div>
        <div className="flex-shrink-0 text-cyan-500 group-hover:translate-x-1 transition-transform text-lg">
          →
        </div>
      </Link>
    </div>
  )
}
