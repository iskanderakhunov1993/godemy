'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api, Lesson, Exercise } from '@/lib/api'

type SearchResult =
  | { type: 'lesson'; item: Lesson }
  | { type: 'exercise'; item: Exercise }
  | { type: 'page'; title: string; desc: string; href: string }

const STATIC_PAGES: { title: string; desc: string; href: string }[] = [
  { title: 'Начать с нуля',      desc: 'Все уроки бесплатного курса',      href: '/guide' },
  { title: 'Практика',           desc: 'Темы, упражнения и повторение',     href: '/trainer' },
  { title: 'Продвинутый курс',   desc: 'Следующий этап после базы',         href: '/bootcamp' },
  { title: 'Профиль',         desc: 'Твоя активность и прогресс',     href: '/profile' },
  { title: 'Сертификаты',     desc: 'Все твои сертификаты',           href: '/certificates' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load data once
  useEffect(() => {
    api.getLessons({ module: 'core' }).then(setLessons).catch(() => {})
    api.getExercises().then(setExercises).catch(() => {})
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelected(0)
    }
  }, [open])

  // Keyboard close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const results: SearchResult[] = (() => {
    const q = query.trim().toLowerCase()
    if (!q) return STATIC_PAGES.map((p) => ({ type: 'page' as const, ...p }))

    const matched: SearchResult[] = []

    for (const p of STATIC_PAGES) {
      if (p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
        matched.push({ type: 'page', ...p })
      }
    }
    for (const l of lessons) {
      if (l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)) {
        matched.push({ type: 'lesson', item: l })
      }
    }
    for (const ex of exercises) {
      if (ex.title.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q)) {
        matched.push({ type: 'exercise', item: ex })
      }
    }
    return matched.slice(0, 12)
  })()

  const navigate = useCallback(
    (result: SearchResult) => {
      onClose()
      if (result.type === 'page') {
        router.push(result.href)
      } else if (result.type === 'lesson') {
        router.push(`/guide/${result.item.slug}`)
      } else {
        router.push(`/trainer/${result.item.id}`)
      }
    },
    [onClose, router]
  )

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selected]) navigate(results[selected])
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKey}
            placeholder="Поиск по платформе..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
          <kbd className="hidden sm:inline text-xs text-gray-600 border border-gray-700 rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-6">Ничего не найдено</p>
          ) : (
            results.map((result, i) => {
              const isSelected = i === selected
              if (result.type === 'page') {
                return (
                  <button
                    key={`page-${result.href}`}
                    onClick={() => navigate(result)}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-gray-800/50'}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-gray-700/60 flex items-center justify-center text-sm flex-shrink-0">🔗</span>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-cyan-400' : 'text-gray-200'}`}>{result.title}</p>
                      <p className="text-xs text-gray-500">{result.desc}</p>
                    </div>
                  </button>
                )
              } else if (result.type === 'lesson') {
                return (
                  <button
                    key={`lesson-${result.item.id}`}
                    onClick={() => navigate(result)}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-gray-800/50'}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-sm flex-shrink-0">📖</span>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-cyan-400' : 'text-gray-200'}`}>{result.item.title}</p>
                      <p className="text-xs text-gray-500">Урок · {result.item.category}</p>
                    </div>
                  </button>
                )
              } else {
                return (
                  <button
                    key={`ex-${result.item.id}`}
                    onClick={() => navigate(result)}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-gray-800/50'}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm flex-shrink-0">⚡</span>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-cyan-400' : 'text-gray-200'}`}>{result.item.title}</p>
                      <p className="text-xs text-gray-500">Задача · {result.item.category}</p>
                    </div>
                  </button>
                )
              }
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-800 text-xs text-gray-600">
          <span>↑↓ выбор</span>
          <span>↵ открыть</span>
          <span>Esc закрыть</span>
        </div>
      </div>
    </div>
  )
}
