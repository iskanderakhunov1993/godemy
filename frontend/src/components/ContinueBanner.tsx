'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLastVisited, LastVisited } from '@/lib/streak'

export default function ContinueBanner() {
  const [last, setLast] = useState<LastVisited | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLast(getLastVisited())
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  if (!last) return null

  const label = last.type === 'lesson' ? 'Урок' : 'Задача'
  const title = /Project ZERO|Atlas Dev|стажиров|^[A-Za-z\s·-]+$/i.test(last.title.trim())
    ? 'последний открытый шаг'
    : last.title

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
      <Link
        href={last.href}
        className="group flex items-center gap-3 rounded-2xl border border-[#dfe6dc] bg-white/80 px-4 py-3 text-sm shadow-sm transition hover:border-[#20d47b]/35 hover:bg-white"
      >
        <div className="h-2 w-2 shrink-0 rounded-full bg-[#20d47b] shadow-[0_0_14px_rgba(32,212,123,0.45)]" />
        <div className="min-w-0 flex-1 truncate text-[#647067]">
          Продолжить: <span className="font-semibold text-[#17201d]">{label.toLowerCase()} · {title}</span>
        </div>
        <div className="shrink-0 text-base text-[#087a43] transition-transform group-hover:translate-x-1">
          →
        </div>
      </Link>
    </div>
  )
}
