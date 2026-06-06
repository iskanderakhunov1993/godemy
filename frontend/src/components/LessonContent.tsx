'use client'

/**
 * Shared lesson content renderer used in:
 *  - admin editor preview (LessonEditor.tsx)
 *  - public lesson viewer (guide/[slug]/page.tsx)
 *
 * Exported:
 *  - parseContent()         — splits raw markdown into blocks
 *  - LessonContentRenderer  — renders blocks; calls onTasksChange({ total, done })
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

function resolveImageSrc(src?: string | Blob): string {
  if (!src) return ''
  if (typeof src !== 'string') return ''
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src
  const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || '').trim().replace(/\/+$/, '')
  if (!backend) return src
  if (src.startsWith('/')) return `${backend}${src}`
  return `${backend}/${src}`
}

const CHAT_AVATAR_MAP: Record<string, string> = {
  roma: '/avatars/chat/roma.svg',
  teamlead: '/avatars/chat/teamlead.svg',
  mentor: '/avatars/chat/mentor.svg',
  qa: '/avatars/chat/qa.svg',
  designer: '/avatars/chat/designer.svg',
  analyst: '/avatars/chat/analyst.svg',
  devops: '/avatars/chat/devops.svg',
  backend: '/avatars/chat/backend.svg',
  frontend: '/avatars/chat/frontend.svg',
  pm: '/avatars/chat/pm.svg',
  'рома': '/avatars/chat/roma.svg',
  'тимлид': '/avatars/chat/teamlead.svg',
  'ментор': '/avatars/chat/mentor.svg',
  'дизайнер': '/avatars/chat/designer.svg',
  'аналитик': '/avatars/chat/analyst.svg',
  'девопс': '/avatars/chat/devops.svg',
  'бэкенд': '/avatars/chat/backend.svg',
  'фронтенд': '/avatars/chat/frontend.svg',
  'пм': '/avatars/chat/pm.svg',
}

function normalizeAvatarKey(value: string): string {
  return value.toLowerCase().trim().replace(/[\s_-]+/g, '')
}

function resolveChatAvatar(avatarKey?: string, personName?: string): string | null {
  const candidates = [avatarKey || '', personName || '']
  for (const raw of candidates) {
    const val = raw.trim()
    if (!val) continue
    if (/^(https?:)?\/\//i.test(val) || val.startsWith('/')) return val
    const normalized = normalizeAvatarKey(val)
    if (CHAT_AVATAR_MAP[normalized]) return CHAT_AVATAR_MAP[normalized]
  }
  return null
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskType = 'choice' | 'sort' | 'freetext' | 'code' | 'form' | 'continue' | 'chat' | 'chatdialog' | 'interactive'

export interface ParsedBlock {
  type: 'markdown' | TaskType
  content: string
  lang?: string
  /** stable key for tracking completion per block */
  key: string
}

export interface TasksStatus {
  total: number  // blocks that need completion (choice, sort, code)
  done: number
}

interface BlockProps {
  blockKey: string
  content: string
  onDone: (key: string) => void
  isDone: boolean
}

interface BlockMeta {
  fields: Record<string, string>
  body: string
}

interface MarkdownCodeProps {
  className?: string
  children?: React.ReactNode
}

function applyUserPlaceholders(raw: string, fullName?: string, username?: string): string {
  const cleanFullName = (fullName || '').trim()
  const cleanUsername = (username || '').trim()
  const fallbackName = cleanUsername || 'друг'
  const resolvedName = cleanFullName || fallbackName
  const firstName = resolvedName.split(/\s+/)[0] || resolvedName

  return raw
    .replace(/\{\{\s*user_name\s*\}\}/gi, resolvedName)
    .replace(/\{\{\s*full_name\s*\}\}/gi, resolvedName)
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*username\s*\}\}/gi, cleanUsername || fallbackName)
}

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseContent(raw: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = []
  const regex = /:::([\w]+)([^\n]*)\n([\s\S]*?):::/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let idx = 0

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'markdown', content: raw.slice(lastIndex, match.index), key: `md-${idx++}` })
    }
    const type = match[1] as TaskType
    const langMatch = match[2].match(/lang=([\w+]+)/)
    blocks.push({ type, content: match[3], lang: langMatch?.[1], key: `task-${idx++}` })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < raw.length) {
    blocks.push({ type: 'markdown', content: raw.slice(lastIndex), key: `md-${idx++}` })
  }

  return blocks
}

/** Returns true if the lesson content contains any gateable task blocks */
export function hasGateableTasks(raw: string): boolean {
  return /:::(choice|sort|code)/.test(raw)
}

function parseBlockMeta(content: string): BlockMeta {
  const lines = content.trim().split('\n')
  const fields: Record<string, string> = {}
  let bodyStart = lines.length

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      bodyStart = index + 1
      break
    }

    const match = trimmed.match(/^([^:]+):\s*(.*)$/)
    if (!match) {
      bodyStart = index
      break
    }

    fields[match[1].trim().toLowerCase()] = match[2].trim()
  }

  return {
    fields,
    body: lines.slice(bodyStart).join('\n').trim(),
  }
}

// ─── Choice Block ─────────────────────────────────────────────────────────────

function ChoiceBlock({ blockKey, content, onDone, isDone }: BlockProps) {
  const lines = content.trim().split('\n')
  const question = lines[0].replace(/^вопрос:\s*/, '')
  const options = lines
    .slice(1)
    .filter(l => l.trim().startsWith('-'))
    .map(l => ({
      text: l.replace(/^-\s*/, '').replace(/\s*✓\s*$/, '').trim(),
      correct: l.includes('✓'),
    }))
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const pick = (i: number) => {
    setSelected(i)
  }

  const revealAnswer = () => {
    if (selected === null) return
    setRevealed(true)
    if (options[selected]?.correct) onDone(blockKey)
  }

  return (
    <div className={`my-4 rounded-xl border p-4 transition-colors ${isDone ? 'border-emerald-700/60 bg-emerald-950/20' : 'border-purple-800/40 bg-purple-950/20'}`}>
      <div className="text-[11px] uppercase tracking-wider text-purple-400 font-semibold mb-3">
        ☑ Задание: выбор ответа
        {isDone && <span className="ml-2 text-emerald-400">✓ Выполнено</span>}
      </div>
      <p className="text-white font-medium mb-3 text-sm">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            className={`w-full text-left rounded-lg px-4 py-2.5 text-sm transition-all border ${
              !revealed
                ? 'bg-gray-800/60 text-gray-200 border-gray-700 hover:border-purple-600 hover:bg-gray-700/60'
                : selected === i
                ? opt.correct
                  ? 'bg-emerald-900/60 text-emerald-100 border-emerald-600'
                  : 'bg-red-900/60 text-red-100 border-red-600'
                : opt.correct && selected !== null
                ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800/40'
                : 'bg-gray-800/40 text-gray-500 border-gray-800'
            }`}
          >
            <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
            {opt.text}
          </button>
        ))}
      </div>
      {!revealed && (
        <button
          onClick={revealAnswer}
          disabled={selected === null}
          className="mt-3 text-xs bg-purple-800 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg px-4 py-1.5"
        >
          Узнать ответ
        </button>
      )}
      {revealed && selected !== null && (
        <p className={`mt-3 text-sm font-medium ${options[selected]?.correct ? 'text-emerald-400' : 'text-red-400'}`}>
          {options[selected]?.correct ? '✓ Правильно!' : '✗ Неверно — попробуй ещё'}
        </p>
      )}
    </div>
  )
}

// ─── Sort Block ───────────────────────────────────────────────────────────────

function SortBlock({ blockKey, content, onDone, isDone }: BlockProps) {
  const lines = content.trim().split('\n')
  const question = lines[0].replace(/^вопрос:\s*/, '')
  const items = lines
    .slice(1)
    .filter(l => /^\d+\./.test(l.trim()))
    .map(l => l.replace(/^\d+\.\s*/, '').trim())

  const [order, setOrder] = useState<number[]>(() =>
    [...items.map((_, i) => i)].sort(() => Math.random() - 0.5)
  )
  const [checked, setChecked] = useState(false)
  const isCorrect = order.every((v, i) => v === i)

  const move = (pos: number, dir: -1 | 1) => {
    const next = [...order]
    const newPos = pos + dir
    if (newPos < 0 || newPos >= next.length) return
    ;[next[pos], next[newPos]] = [next[newPos], next[pos]]
    setOrder(next)
    setChecked(false)
  }

  const check = () => {
    setChecked(true)
    if (isCorrect) onDone(blockKey)
  }

  return (
    <div className={`my-4 rounded-xl border p-4 transition-colors ${isDone ? 'border-emerald-700/60 bg-emerald-950/20' : 'border-blue-800/40 bg-blue-950/20'}`}>
      <div className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold mb-3">
        ↕ Задание: сортировка
        {isDone && <span className="ml-2 text-emerald-400">✓ Выполнено</span>}
      </div>
      <p className="text-white font-medium mb-3 text-sm">{question}</p>
      <div className="space-y-2">
        {order.map((origIdx, pos) => (
          <div key={origIdx} className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2.5 text-sm text-gray-200 border border-gray-700/50">
            <span className="text-gray-500 text-xs w-4 text-center">{pos + 1}</span>
            <span className="flex-1">{items[origIdx]}</span>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => move(pos, -1)} disabled={pos === 0}
                className="text-gray-500 hover:text-white disabled:opacity-20 leading-none px-1 text-xs">▲</button>
              <button onClick={() => move(pos, 1)} disabled={pos === order.length - 1}
                className="text-gray-500 hover:text-white disabled:opacity-20 leading-none px-1 text-xs">▼</button>
            </div>
          </div>
        ))}
      </div>
      {!isDone && (
        <button onClick={check} className="mt-3 text-xs bg-blue-800 hover:bg-blue-700 text-white rounded-lg px-4 py-1.5">
          Проверить порядок
        </button>
      )}
      {checked && (
        <p className={`mt-2 text-sm font-medium ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCorrect ? '✓ Правильный порядок!' : '✗ Порядок неверный, попробуй ещё'}
        </p>
      )}
    </div>
  )
}

// ─── FreeText Block ───────────────────────────────────────────────────────────

function FreeTextBlock({ content }: { content: string }) {
  const lines = content.trim().split('\n')
  const question = lines[0].replace(/^вопрос:\s*/, '')
  const hint = lines.find(l => l.startsWith('подсказка:'))?.replace(/^подсказка:\s*/, '')
  const [answer, setAnswer] = useState('')

  return (
    <div className="my-4 rounded-xl border border-amber-800/40 bg-amber-950/20 p-4">
      <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold mb-3">
        ✏ Задание: свободный ответ
      </div>
      <p className="text-white font-medium mb-2 text-sm">{question}</p>
      {hint && <p className="text-xs text-gray-500 mb-3">💡 Подсказка: {hint}</p>}
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        rows={4}
        placeholder="Напиши свой ответ здесь..."
        className="w-full bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 resize-none outline-none focus:border-amber-600/60"
      />
    </div>
  )
}

// ─── Code Task Block ──────────────────────────────────────────────────────────

function CodeTaskBlock({ blockKey, content, lang = 'go', onDone, isDone }: BlockProps & { lang?: string }) {
  const question = content.split('\n')[0].replace(/^вопрос:\s*/, '')
  const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/)
  const [code, setCode] = useState(codeMatch?.[1] ?? '')
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  const run = async () => {
    if (!code.trim()) return
    setRunning(true)
    setOutput(null)
    setHasError(false)
    try {
      const result = await api.runCode(code)
      const out = result.output ?? result.error ?? ''
      const err = !!result.error
      setOutput(out)
      setHasError(err)
      if (!err) onDone(blockKey)
    } catch (e: unknown) {
      setOutput(e instanceof Error ? e.message : 'Ошибка запуска')
      setHasError(true)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className={`my-4 rounded-xl border p-4 transition-colors ${isDone ? 'border-emerald-700/60 bg-emerald-950/20' : 'border-emerald-800/40 bg-emerald-950/10'}`}>
      <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold mb-3">
        {'<>'} Задание: написать код ({lang})
        {isDone && <span className="ml-2 text-emerald-400">✓ Выполнено</span>}
      </div>
      <p className="text-white font-medium mb-3 text-sm">{question}</p>

      <div className="relative rounded-lg overflow-hidden border border-gray-700 mb-3">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/80 border-b border-gray-700">
          <span className="text-xs font-mono text-gray-500">{lang}</span>
          <button
            onClick={run}
            disabled={running || isDone}
            className="text-xs bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded px-3 py-1 font-medium transition-colors flex items-center gap-1.5"
          >
            {running ? (
              <><span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />Запуск...</>
            ) : isDone ? '✓ Запущено' : '▶ Запустить'}
          </button>
        </div>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          rows={10}
          spellCheck={false}
          disabled={isDone}
          className="w-full bg-gray-950 px-4 py-3 text-sm text-green-300 font-mono resize-y outline-none disabled:opacity-70"
        />
      </div>

      {output !== null && (
        <div className={`rounded-lg border p-3 font-mono text-xs whitespace-pre-wrap ${hasError ? 'border-red-800/50 bg-red-950/20 text-red-300' : 'border-emerald-800/40 bg-gray-950 text-emerald-200'}`}>
          <div className={`text-[10px] uppercase tracking-wider mb-1.5 font-semibold ${hasError ? 'text-red-500' : 'text-emerald-500'}`}>
            {hasError ? '✗ Ошибка' : '✓ Вывод'}
          </div>
          {output || '(нет вывода)'}
        </div>
      )}
    </div>
  )
}

// ─── Interactive Code Block ───────────────────────────────────────────────────

function InteractiveCodeBlock({ content, lang = 'go' }: { content: string; lang?: string }) {
  const lines = content.trim().split('\n')
  const title = lines[0].replace(/^заголовок:\s*/, '')
  const defaultCode = lines.slice(1).join('\n').trim()
  const [code, setCode] = useState(defaultCode)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  const run = async () => {
    if (!code.trim()) return
    setRunning(true)
    setOutput(null)
    setHasError(false)
    try {
      const result = await api.runCode(code)
      const out = result.output ?? result.error ?? ''
      const err = !!result.error
      setOutput(out)
      setHasError(err)
    } catch (e: unknown) {
      setOutput(e instanceof Error ? e.message : 'Ошибка запуска')
      setHasError(true)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="my-4 rounded-xl border border-blue-800/40 bg-blue-950/10 p-4">
      <div className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold mb-3">
        {'⚡'} Интерактивный редактор ({lang})
      </div>
      {title && <p className="text-white font-medium mb-3 text-sm">{title}</p>}

      <div className="relative rounded-lg overflow-hidden border border-gray-700 mb-3">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/80 border-b border-gray-700">
          <span className="text-xs font-mono text-gray-500">{lang}</span>
          <button
            onClick={run}
            disabled={running}
            className="text-xs bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded px-3 py-1 font-medium transition-colors flex items-center gap-1.5"
          >
            {running ? (
              <><span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />Запуск...</>
            ) : '▶ Запустить'}
          </button>
        </div>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full bg-gray-950 px-4 py-3 text-sm text-green-300 font-mono resize-y outline-none"
        />
      </div>

      {output !== null && (
        <div className={`rounded-lg border p-3 font-mono text-xs whitespace-pre-wrap ${hasError ? 'border-red-800/50 bg-red-950/20 text-red-300' : 'border-blue-800/40 bg-gray-950 text-blue-200'}`}>
          <div className={`text-[10px] uppercase tracking-wider mb-1.5 font-semibold ${hasError ? 'text-red-500' : 'text-blue-500'}`}>
            {hasError ? '✗ Ошибка' : '✓ Вывод'}
          </div>
          {output || '(нет вывода)'}
        </div>
      )}
    </div>
  )
}

// ─── Form Block ───────────────────────────────────────────────────────────────

function FormBlock({ content }: { content: string }) {
  const { fields, body } = parseBlockMeta(content)
  const title = fields['заголовок'] || fields['title'] || 'Форма'
  const fieldLabel = fields['поле'] || fields['label'] || 'Ответ'
  const placeholder = fields['placeholder'] || 'Введите значение'
  const buttonLabel = fields['кнопка'] || fields['button'] || 'Отправить'
  const successText = fields['успех'] || fields['success'] || 'Спасибо! Данные отправлены.'
  const actionLink = fields['ссылка'] || fields['link'] || ''

  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const submit = () => {
    if (!value.trim()) {
      setError('Заполни поле перед отправкой')
      return
    }

    setError('')
    setSubmitted(true)

    if (actionLink) {
      const nextLink = actionLink.includes('{value}')
        ? actionLink.replaceAll('{value}', encodeURIComponent(value.trim()))
        : actionLink
      window.open(nextLink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="my-6 rounded-[28px] border border-gray-700/70 bg-gray-100 text-gray-950 p-6 sm:p-8">
      <h3 className="text-2xl sm:text-3xl font-semibold mb-4">{title}</h3>
      {body && (
        <div className="mb-5 prose max-w-none prose-p:my-2 prose-li:my-1 prose-strong:text-gray-950 prose-a:text-blue-700 prose-a:underline hover:prose-a:text-blue-800">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{body}</ReactMarkdown>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">{fieldLabel}</label>
        <input
          value={value}
          onChange={event => {
            setValue(event.target.value)
            if (error) setError('')
          }}
          placeholder={placeholder}
          className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-gray-500"
        />
        <button
          onClick={submit}
          className="w-full rounded-2xl bg-gray-900 px-5 py-3 text-base font-medium text-white transition hover:bg-gray-800"
        >
          {buttonLabel}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {submitted && !error && <p className="mt-3 text-sm text-emerald-700">{successText}</p>}
    </div>
  )
}

function extractPlainText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractPlainText).join('')
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractPlainText(node.props.children)
  }
  return ''
}

function MarkdownCode({ className, children }: MarkdownCodeProps) {
  const [copied, setCopied] = useState(false)
  const code = extractPlainText(children).replace(/\n$/, '')
  const lang = className?.match(/language-([\w+-]+)/)?.[1]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // Ignore clipboard failures (e.g. blocked permissions)
    }
  }

  if (!lang) {
    return <code className={className}>{children}</code>
  }

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-[#2d333b] bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-[#2d333b] bg-[#161b22] px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8b949e]">
          {lang ?? 'code'}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-[#30363d] bg-[#21262d] px-2 py-1 text-[11px] text-[#c9d1d9] transition hover:bg-[#30363d]"
        >
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <pre
        className="overflow-x-auto text-[13px] leading-6 text-[#c9d1d9] selection:bg-[#264f78] selection:text-[#d4d4d4]"
        style={{ margin: 0, background: 'transparent', border: 'none', borderRadius: 0, padding: '14px 16px' }}
      >
        <code className={`${className ?? ''} font-mono`}>{children}</code>
      </pre>
    </div>
  )
}

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-3xl font-bold text-white mt-6 mb-3">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-2xl font-bold text-white mt-5 mb-3">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-xl font-semibold text-white mt-4 mb-2">{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h4>,
  h5: ({ children }: { children?: React.ReactNode }) => <h5 className="text-base font-semibold text-white mt-3 mb-1">{children}</h5>,
  h6: ({ children }: { children?: React.ReactNode }) => <h6 className="text-sm font-semibold text-gray-300 mt-3 mb-1">{children}</h6>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    const isExternal = !!href && /^(https?:)?\/\//.test(href)
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="text-cyan-300 underline underline-offset-4 transition hover:text-cyan-200"
      >
        {children}
      </a>
    )
  },
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const rawAlign = (props as unknown as Record<string, unknown>)['data-align']
    const align = String(rawAlign ?? '').toLowerCase()
    const margin = align === 'left'
      ? '16px auto 16px 0'
      : align === 'right'
      ? '16px 0 16px auto'
      : '16px auto'

    return (
      <img
        src={resolveImageSrc(src)}
        alt={alt ?? ''}
        style={{
          maxWidth: '100%',
          maxHeight: '560px',
          objectFit: 'contain',
          borderRadius: '10px',
          margin,
          display: 'block',
        }}
      />
    )
  },
  code: ({ className, children }: { className?: string; children?: React.ReactNode }) => (
    <MarkdownCode className={className}>
      {children}
    </MarkdownCode>
  ),
}

function ContinueBlock({ content, expanded, onExpand }: { content: string; expanded: boolean; onExpand: () => void }) {
  const { fields, body } = parseBlockMeta(content)
  const buttonLabel = fields['кнопка'] || fields['button'] || fields['label'] || 'Продолжить'
  const defaultHeight = Number.parseInt(fields['height'] || '', 10)
  const collapsedHeight = Number.isFinite(defaultHeight) ? Math.min(Math.max(defaultHeight, 140), 560) : 300

  if (!body.trim()) return null

  return (
    <div className="my-5">
      <article className={`prose-go max-w-none relative overflow-hidden transition-all ${expanded ? '' : 'max-h-[300px]'}`} style={!expanded ? { maxHeight: `${collapsedHeight}px` } : undefined}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          urlTransform={(url) => url}
          components={markdownComponents}
        >{body}</ReactMarkdown>
        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent" />
        )}
      </article>

      {!expanded && (
        <div className="mt-4 mb-1 rounded-2xl bg-gray-100/85 px-3 py-4 sm:px-4">
          <button
            type="button"
            onClick={onExpand}
            className="mx-auto block rounded-lg bg-gradient-to-r from-indigo-700 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition hover:from-indigo-600 hover:to-indigo-500"
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  )
}

function ChatBlock({ content }: { content: string }) {
  const { fields, body } = parseBlockMeta(content)
  const title = fields['заголовок'] || fields['title'] || 'Сообщение из чата'
  const sender = fields['от'] || fields['from'] || 'Коллега'
  const channel = fields['канал'] || fields['channel'] || ''
  const time = fields['время'] || fields['time'] || ''
  const avatarKey = fields['аватар'] || fields['avatar'] || ''
  const avatarSrc = resolveChatAvatar(avatarKey, sender)
  const text = body || content

  return (
    <div className="my-5 rounded-2xl border border-indigo-700/40 bg-[#11151d] p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-indigo-300/90">💬 {title}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-300">
            {avatarSrc ? (
              <img src={avatarSrc} alt={sender} className="h-6 w-6 rounded-full border border-gray-700/60 object-cover" />
            ) : null}
            <span className="font-semibold text-white">{sender}</span>
            {channel ? <span className="text-gray-500">· {channel}</span> : null}
          </div>
        </div>
        {time ? <span className="text-xs text-gray-500">{time}</span> : null}
      </div>

      <div className="rounded-xl border border-gray-700/70 bg-gray-900/70 px-4 py-3 text-gray-100">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          urlTransform={(url) => url}
          components={markdownComponents}
        >{text}</ReactMarkdown>
      </div>
    </div>
  )
}

function ChatDialogBlock({ content }: { content: string }) {
  const { fields, body } = parseBlockMeta(content)
  const title = fields['заголовок'] || fields['title'] || 'Чат-диалог'
  const channel = fields['канал'] || fields['channel'] || ''

  const rows = (body || content)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim())
      if (parts.length < 3) return null
      const side = parts[0].toLowerCase() === 'right' ? 'right' : 'left'
      const name = parts[1] || (side === 'right' ? 'Ты' : 'Собеседник')
      const last = parts[parts.length - 1] || ''
      const hasAvatarToken = /^avatar\s*=|^av\s*=|^аватар\s*=/i.test(last)
      const avatarKey = hasAvatarToken ? last.replace(/^avatar\s*=|^av\s*=|^аватар\s*=/i, '').trim() : ''
      const textParts = hasAvatarToken ? parts.slice(2, -1) : parts.slice(2)
      const text = textParts.join(' | ')
      return { side, name, text, avatarKey }
    })
    .filter((row): row is { side: 'left' | 'right'; name: string; text: string; avatarKey: string } => row !== null)

  if (rows.length === 0) {
    return (
      <div className="my-5 rounded-2xl border border-fuchsia-700/30 bg-[#11151d] p-4 text-sm text-gray-400">
        Формат блока chatdialog: <code>left|Имя|Текст|avatar=roma</code> или <code>right|Ты|Текст</code>
      </div>
    )
  }

  return (
    <div className="my-5 rounded-2xl border border-fuchsia-700/30 bg-[#11151d] p-4 sm:p-5">
      <div className="mb-3 text-[11px] uppercase tracking-wider text-fuchsia-300/90">🧵 {title}</div>
      {channel ? <div className="mb-3 text-xs text-gray-500">{channel}</div> : null}

      <div className="space-y-3">
        {rows.map((row, idx) => {
          const initial = row.name.trim().charAt(0).toUpperCase() || '•'
          const isRight = row.side === 'right'
          const avatarSrc = resolveChatAvatar(row.avatarKey, row.name)
          return (
            <div key={`${row.name}-${idx}`} className={`flex items-start gap-2 ${isRight ? 'justify-end' : 'justify-start'}`}>
              {!isRight && (
                avatarSrc ? (
                  <img src={avatarSrc} alt={row.name} className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-gray-700/60 object-cover" />
                ) : (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fuchsia-900/50 text-xs font-semibold text-fuchsia-200">
                    {initial}
                  </div>
                )
              )}

              <div className={`max-w-[82%] rounded-2xl border px-3 py-2 ${isRight ? 'border-indigo-500/40 bg-indigo-900/35 text-indigo-50' : 'border-gray-700/70 bg-gray-900/75 text-gray-100'}`}>
                <div className={`mb-1 text-xs ${isRight ? 'text-indigo-200/90' : 'text-gray-400'}`}>{row.name}</div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{row.text}</p>
              </div>

              {isRight && (
                avatarSrc ? (
                  <img src={avatarSrc} alt={row.name} className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-gray-700/60 object-cover" />
                ) : (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-900/50 text-xs font-semibold text-indigo-200">
                    {initial}
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Markdown Block ───────────────────────────────────────────────────────────

function MarkdownBlock({ content }: { content: string }) {
  return (
    <article className="prose-go max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        urlTransform={(url) => url}
        components={markdownComponents}
      >{content}</ReactMarkdown>
    </article>
  )
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

interface RendererProps {
  content: string
  /** Called every time task completion state changes */
  onTasksChange?: (status: TasksStatus) => void
}

export function LessonContentRenderer({ content, onTasksChange }: RendererProps) {
  const user = useAuthStore((state) => state.user)
  const personalizedContent = useMemo(
    () => applyUserPlaceholders(content, user?.fullName, user?.username),
    [content, user?.fullName, user?.username]
  )
  const blocks = useMemo(() => parseContent(personalizedContent), [personalizedContent])

  const gateableKeys = useMemo(
    () => blocks.filter(b => b.type === 'choice' || b.type === 'sort' || b.type === 'code').map(b => b.key),
    [blocks]
  )

  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set())
  const [openedContinueKeys, setOpenedContinueKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    setOpenedContinueKeys(new Set())
  }, [personalizedContent])

  const handleDone = useCallback((key: string) => {
    setDoneKeys(prev => {
      if (prev.has(key)) return prev
      return new Set([...prev, key])
    })
  }, [])

  const handleContinueOpen = useCallback((key: string) => {
    setOpenedContinueKeys(prev => {
      if (prev.has(key)) return prev
      return new Set([...prev, key])
    })
  }, [])

  const firstLockedContinueIndex = useMemo(
    () => blocks.findIndex((block) => block.type === 'continue' && !openedContinueKeys.has(block.key)),
    [blocks, openedContinueKeys]
  )

  const visibleBlocks = useMemo(
    () => (firstLockedContinueIndex === -1 ? blocks : blocks.slice(0, firstLockedContinueIndex + 1)),
    [blocks, firstLockedContinueIndex]
  )

  // Notify parent of task status whenever doneKeys changes
  useEffect(() => {
    if (gateableKeys.length === 0) return
    onTasksChange?.({ total: gateableKeys.length, done: doneKeys.size })
  }, [doneKeys, gateableKeys, onTasksChange])

  if (!personalizedContent.trim()) {
    return <p className="text-gray-600 text-sm italic">Предпросмотр появится здесь...</p>
  }

  return (
    <div>
      {visibleBlocks.map((block, idx) => {
        const isDone = doneKeys.has(block.key)
        let inner: React.ReactNode = null
        if (block.type === 'markdown') inner = <MarkdownBlock key={block.key} content={block.content} />
        else if (block.type === 'choice')   inner = <ChoiceBlock   key={block.key} blockKey={block.key} content={block.content} onDone={handleDone} isDone={isDone} />
        else if (block.type === 'sort')     inner = <SortBlock     key={block.key} blockKey={block.key} content={block.content} onDone={handleDone} isDone={isDone} />
        else if (block.type === 'freetext') inner = <FreeTextBlock key={block.key} content={block.content} />
        else if (block.type === 'code')     inner = <CodeTaskBlock key={block.key} blockKey={block.key} content={block.content} lang={block.lang} onDone={handleDone} isDone={isDone} />
        else if (block.type === 'interactive') inner = <InteractiveCodeBlock key={block.key} content={block.content} lang={block.lang} />
        else if (block.type === 'form')     inner = <FormBlock     key={block.key} content={block.content} />
        else if (block.type === 'continue') inner = (
          <ContinueBlock
            key={block.key}
            content={block.content}
            expanded={openedContinueKeys.has(block.key)}
            onExpand={() => handleContinueOpen(block.key)}
          />
        )
        else if (block.type === 'chat')     inner = <ChatBlock     key={block.key} content={block.content} />
        else if (block.type === 'chatdialog') inner = <ChatDialogBlock key={block.key} content={block.content} />
        if (!inner) return null
        return <RevealBlock key={block.key} delay={idx * 60}>{inner}</RevealBlock>
      })}
    </div>
  )
}

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────

function RevealBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {children}
    </div>
  )
}
