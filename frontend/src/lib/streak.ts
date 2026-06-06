const STREAK_KEY = 'go-streak'
const LAST_VISITED_KEY = 'go-last-visited'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10)
}

interface StreakData {
  count: number
  lastDate: string
}

export interface LastVisited {
  href: string
  title: string
  type: 'lesson' | 'exercise'
}

export function getStreak(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return 0
    const data: StreakData = JSON.parse(raw)
    const today = todayStr()
    const yesterday = yesterdayStr()
    if (data.lastDate === today || data.lastDate === yesterday) return data.count
    return 0
  } catch { return 0 }
}

export function markActivityToday(): void {
  if (typeof window === 'undefined') return
  const today = todayStr()
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (raw) {
      const data: StreakData = JSON.parse(raw)
      if (data.lastDate === today) return
      const newCount = data.lastDate === yesterdayStr() ? data.count + 1 : 1
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count: newCount, lastDate: today }))
    } else {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: today }))
    }
  } catch { /* ignore */ }
}

export function saveLastVisited(item: LastVisited): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(item))
  } catch { /* ignore */ }
}

export function getLastVisited(): LastVisited | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LAST_VISITED_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LastVisited
  } catch { return null }
}
