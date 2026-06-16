'use client'

import { useState } from 'react'
import { getStreak } from '@/lib/streak'

export default function StreakBadge() {
  const [streak] = useState(() => getStreak())

  if (streak < 1) return null

  return (
    <span
      title={`Серия: ${streak} ${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд`}
      className="flex items-center gap-1 text-sm font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-full px-2.5 py-0.5 select-none"
    >
      🔥 {streak}
    </span>
  )
}
