'use client'

import { useMemo, useState } from 'react'
import {
  buildCoursePrompt,
  CourseGeneratorInput,
  CourseGeneratorMode,
} from '@/lib/course-generator'

const initialInput: CourseGeneratorInput = {
  mode: 'module',
  moduleNumber: '1',
  moduleContext: 'Первый рабочий спринт. Студент готовит локальное окружение и выпускает небольшой CLI-сервис для внутренней команды банка.',
  lessonTopic: '',
  lessonModule: '',
  projectContext: '',
  concept: '',
  extraContext: '',
}

const modes: Array<{ id: CourseGeneratorMode; label: string; hint: string }> = [
  { id: 'module', label: 'Модуль', hint: 'Спринт целиком' },
  { id: 'lesson', label: 'Урок', hint: 'Одна рабочая задача' },
  { id: 'concept', label: 'Concept card', hint: '3-5 минут чтения' },
]

export default function CourseGeneratorPage() {
  const [input, setInput] = useState<CourseGeneratorInput>(initialInput)
  const [copied, setCopied] = useState(false)
  const prompt = useMemo(() => buildCoursePrompt(input), [input])

  function update<K extends keyof CourseGeneratorInput>(key: K, value: CourseGeneratorInput[K]) {
    setInput((current) => ({ ...current, [key]: value }))
    setCopied(false)
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 grid gap-5 border-b border-gray-800 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-amber-300">
            Project ZERO → Engineer
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Course Generator
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
            Собирает production-ready prompt для модуля, урока или concept card.
            Сюжет, практика и методика уже зашиты в основу.
          </p>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-100">
          <span className="font-semibold">90% hands-on</span>
          <span className="mx-2 text-amber-500/50">/</span>
          theory on demand
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <section className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5 shadow-2xl shadow-black/20 sm:p-6">
          <div className="mb-6 grid grid-cols-3 gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => update('mode', mode.id)}
                className={`rounded-xl border px-3 py-3 text-left ${
                  input.mode === mode.id
                    ? 'border-amber-400/60 bg-amber-400/10 text-white'
                    : 'border-gray-700 bg-gray-950/40 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="block text-sm font-bold">{mode.label}</span>
                <span className="mt-1 block text-[11px] text-gray-500">{mode.hint}</span>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {input.mode === 'module' && (
              <>
                <Field label="Номер модуля">
                  <input
                    value={input.moduleNumber}
                    onChange={(event) => update('moduleNumber', event.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-amber-400"
                    placeholder="Например, 2"
                  />
                </Field>
                <Field label="Контекст модуля">
                  <textarea
                    value={input.moduleContext}
                    onChange={(event) => update('moduleContext', event.target.value)}
                    className="min-h-40 w-full resize-y rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-amber-400"
                    placeholder="Что происходит в истории и какой проект двигает студент?"
                  />
                </Field>
              </>
            )}

            {input.mode === 'lesson' && (
              <>
                <Field label="Тема урока">
                  <input
                    value={input.lessonTopic}
                    onChange={(event) => update('lessonTopic', event.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-amber-400"
                    placeholder="Например, HTTP handlers в Go"
                  />
                </Field>
                <Field label="Модуль">
                  <input
                    value={input.lessonModule}
                    onChange={(event) => update('lessonModule', event.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-amber-400"
                    placeholder="Например, Sprint 3 · Первый REST API"
                  />
                </Field>
                <Field label="Контекст проекта">
                  <textarea
                    value={input.projectContext}
                    onChange={(event) => update('projectContext', event.target.value)}
                    className="min-h-32 w-full resize-y rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-amber-400"
                    placeholder="Какой банковский сервис делает команда и что сломалось?"
                  />
                </Field>
              </>
            )}

            {input.mode === 'concept' && (
              <>
                <Field label="Концепция">
                  <input
                    value={input.concept}
                    onChange={(event) => update('concept', event.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-amber-400"
                    placeholder="Например, context.Context"
                  />
                </Field>
                <Field label="Где понадобится">
                  <textarea
                    value={input.projectContext}
                    onChange={(event) => update('projectContext', event.target.value)}
                    className="min-h-32 w-full resize-y rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-amber-400"
                    placeholder="Контекст текущего проекта или задачи"
                  />
                </Field>
              </>
            )}

            <Field label="Дополнительные ограничения" optional>
              <textarea
                value={input.extraContext}
                onChange={(event) => update('extraContext', event.target.value)}
                className="min-h-28 w-full resize-y rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-amber-400"
                placeholder="Что уже знает студент, длительность, обязательный deliverable..."
              />
            </Field>
          </div>
        </section>

        <section className="flex min-h-[680px] flex-col overflow-hidden rounded-2xl border border-gray-800 bg-[#080b12] shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-gray-500">Generated prompt</p>
              <p className="mt-1 text-sm text-gray-300">{prompt.length.toLocaleString('ru-RU')} символов</p>
            </div>
            <button
              type="button"
              onClick={copyPrompt}
              className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-200 hover:bg-amber-400/20"
            >
              {copied ? 'Скопировано' : 'Копировать prompt'}
            </button>
          </div>
          <textarea
            readOnly
            value={prompt}
            className="min-h-0 flex-1 resize-none bg-transparent p-5 font-mono text-[13px] leading-6 text-gray-300 outline-none sm:p-6"
            aria-label="Сгенерированный prompt"
          />
        </section>
      </div>
    </div>
  )
}

function Field({
  label,
  optional = false,
  children,
}: {
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-200">
        {label}
        {optional && <span className="text-xs font-normal text-gray-600">необязательно</span>}
      </span>
      {children}
    </label>
  )
}

