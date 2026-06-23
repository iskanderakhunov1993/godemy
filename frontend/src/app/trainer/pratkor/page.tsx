'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  getPratkorExercises,
  getPratkorProgress,
  getPratkorStatusMap,
  getStatusCount,
  type PratkorStatus,
} from '@/lib/pratkor'

type FilterType = 'all' | PratkorStatus

const statusLabel: Record<FilterType, string> = {
  all: 'All Exercises',
  completed: 'Completed',
  in_progress: 'In Progress',
  available: 'Available',
  locked: 'Locked',
}

const difficultyLabel = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const statusBadgeClass: Record<PratkorStatus, string> = {
  completed: 'bg-[#FFF8DC] text-[#997A00] border-[#FFD60A]',
  in_progress: 'bg-[#FFF8DC] text-[#FFD60A] border-[#FFD60A]',
  available: 'bg-slate-100 text-slate-700 border-slate-200',
  locked: 'bg-slate-50 text-slate-400 border-slate-200',
}

export default function PratkorPage() {
  const exercises = useMemo(() => getPratkorExercises(), [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [statusMap, setStatusMap] = useState<Record<string, PratkorStatus>>({})

  useEffect(() => {
    const sync = () => {
      const progress = getPratkorProgress()
      setStatusMap(getPratkorStatusMap(exercises, progress))
    }

    sync()
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [exercises])

  const counts = useMemo(() => getStatusCount(statusMap), [statusMap])

  const filtered = useMemo(() => {
    return exercises.filter((item) => {
      const byQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())

      if (!byQuery) {
        return false
      }

      if (filter === 'all') {
        return true
      }

      return statusMap[item.slug] === filter
    })
  }, [exercises, filter, query, statusMap])

  const allCount = exercises.length
  const inProgress = counts.in_progress
  const completed = counts.completed
  const available = counts.available
  const locked = counts.locked

  return (
    <div className="min-h-screen bg-[#f2f4fa] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-[#d9dff0] bg-white p-5 sm:p-7">
          <Link href="/trainer" className="inline-flex text-sm text-[#45537a] hover:text-[#1d2a57] transition-colors">
            ← Back to Trainer
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1d2452] sm:text-4xl">Explore Go exercises on Prakter</h1>
              <p className="mt-2 text-sm text-[#586289] sm:text-base">
                100 заданий от простого к сложному: функции, структуры, интерфейсы, ошибки и конкурентность.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d9dff0] bg-[#f7f9ff] px-4 py-3 text-sm text-[#33406b]">
              Прогресс: <span className="font-semibold">{completed}/{allCount}</span>
            </div>
          </div>

          <div className="mt-6">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title"
              className="w-full rounded-2xl border border-[#cfd7ee] bg-white px-4 py-3 text-[#1d2452] outline-none transition-colors placeholder:text-[#7f8ab3] focus:border-[#7488d8]"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {([
              ['all', allCount],
              ['completed', completed],
              ['in_progress', inProgress],
              ['available', available],
              ['locked', locked],
            ] as Array<[FilterType, number]>).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  filter === key
                    ? 'border-[#5974d8] bg-[#e9eeff] text-[#24336a]'
                    : 'border-[#d9dff0] bg-white text-[#586289] hover:border-[#bcc8ec]'
                }`}
              >
                {statusLabel[key]} <span className="ml-1 font-semibold">{value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((item) => {
            const status = statusMap[item.slug] || 'available'
            const isLocked = status === 'locked'

            return (
              <Link
                key={item.slug}
                href={isLocked ? '#' : `/trainer/pratkor/${item.slug}`}
                onClick={(event) => {
                  if (isLocked) {
                    event.preventDefault()
                  }
                }}
                className={`group rounded-2xl border p-4 transition-all ${
                  isLocked
                    ? 'cursor-not-allowed border-[#e4e8f6] bg-[#f8f9fc]'
                    : 'border-[#d9dff0] bg-white hover:-translate-y-0.5 hover:border-[#b7c5ef] hover:shadow-[0_10px_25px_rgba(48,75,164,0.08)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7c88b3]">
                      #{item.id} • {item.category}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#1f2a5a]">{item.title}</h2>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-xs ${statusBadgeClass[status]}`}>
                    {statusLabel[status]}
                  </span>
                </div>

                <p className="mt-3 text-sm text-[#586289]">{item.summary}</p>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      item.difficulty === 'easy'
                        ? 'border-[#FFD60A] bg-[#FFF8DC] text-[#997A00]'
                        : item.difficulty === 'medium'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {difficultyLabel[item.difficulty]}
                  </span>
                  {!isLocked ? (
                    <span className="text-xs text-[#6572a0] group-hover:text-[#2f448c]">Open task →</span>
                  ) : (
                    <span className="text-xs text-[#9aa4c6]">Locked until previous progress</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#d9dff0] bg-white p-8 text-center text-[#6572a0]">
            Ничего не найдено по текущим фильтрам.
          </div>
        ) : null}
      </div>
    </div>
  )
}
