'use client'

import { useState, useEffect } from 'react'

function pseudoRandom(seed: number): number {
  return ((seed * 1664525 + 1013904223) >>> 0)
}

function getOnlineCount(now = new Date()): number | null {
  const hour = now.getHours()

  // At night we do not show any online stats.
  if (hour >= 0 && hour < 8) {
    return null
  }

  const day = now.getDay() // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6

  // Keep number stable for each 30-minute window.
  const window30 = Math.floor(now.getTime() / (30 * 60 * 1000))
  const seed = pseudoRandom(window30 + day * 97)

  if (isWeekend) {
    // Weekend peak traffic, up to 70 users.
    const peakHours = hour >= 12 && hour <= 22
    const min = peakHours ? 58 : 42
    const max = 70
    return (seed % (max - min + 1)) + min
  }

  // Weekdays: usually around 25-30 users.
  const min = 25
  const max = 30
  return (seed % (max - min + 1)) + min
}

export default function OnlineCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    setCount(getOnlineCount())

    const msInWindow = 30 * 60 * 1000
    const msUntilNext = msInWindow - (Date.now() % msInWindow)

    const timeout = setTimeout(() => {
      setCount(getOnlineCount())
      const interval = setInterval(() => setCount(getOnlineCount()), msInWindow)
      return () => clearInterval(interval)
    }, msUntilNext)

    return () => clearTimeout(timeout)
  }, [])

  if (count === null) {
    return null
  }

  return (
    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Сейчас онлайн: {count} человек
    </span>
  )
}
