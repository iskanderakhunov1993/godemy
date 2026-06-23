'use client'

import React from 'react'

interface SkillDTO {
  id: number
  name: string
  category: string
  icon: string
  proficiency: number
}

interface SkillsSectionProps {
  skills: SkillDTO[]
  juniorReadiness: number
}

const PERSONA_LEVELS = [
  { level: 1, emoji: '⭐' },
  { level: 2, emoji: '🐶' },
  { level: 3, emoji: '🗡️' },
  { level: 4, emoji: '🕷️' },
  { level: 5, emoji: '🦾' },
  { level: 6, emoji: '🦇' },
  { level: 7, emoji: '🕵️' },
  { level: 8, emoji: '🌀' },
  { level: 9, emoji: '🧪' },
  { level: 10, emoji: '🕶️' },
] as const

type Badge = { id: string; label: string; icon: string }

const SKILL_ASSETS: Record<string, { experience: string[]; tools: Badge[] }> = {
  'Go Basics': {
    experience: ['Бизнес-логика', 'Базовые структуры', 'CLI-скрипты'],
    tools: [
      { id: 'go', label: 'Go', icon: '🐹' },
      { id: 'cli', label: 'CLI', icon: '⌨️' },
    ],
  },
  'Functions & Structs': {
    experience: ['Проектирование функций', 'Работа со структурами'],
    tools: [{ id: 'clean-code', label: 'Clean Code', icon: '🧼' }],
  },
  Goroutines: {
    experience: ['Конкурентная обработка', 'Каналы и синхронизация'],
    tools: [
      { id: 'goroutines', label: 'Goroutines', icon: '⚙️' },
      { id: 'channels', label: 'Channels', icon: '📡' },
    ],
  },
  'HTTP Handlers': {
    experience: ['HTTP routes', 'REST API', 'Browser requests', 'Валидация запросов'],
    tools: [
      { id: 'http-routes', label: 'HTTP routes', icon: '🌐' },
      { id: 'rest-api', label: 'REST API', icon: '🔌' },
      { id: 'browser', label: 'Browser', icon: '🧭' },
    ],
  },
  PostgreSQL: {
    experience: ['SQL запросы', 'Схема БД', 'Хранение данных'],
    tools: [
      { id: 'postgresql', label: 'PostgreSQL', icon: '🐘' },
      { id: 'sql', label: 'SQL', icon: '🗄️' },
    ],
  },
  'Testing Basics': {
    experience: ['Unit тесты', 'Проверка стабильности', 'Regression check'],
    tools: [
      { id: 'unit-tests', label: 'Unit tests', icon: '✅' },
      { id: 'integration', label: 'Integration tests', icon: '🧪' },
    ],
  },
}

export default function SkillsSection({
  skills,
  juniorReadiness,
}: SkillsSectionProps) {
  const readiness = Math.max(0, Math.min(100, Math.round(juniorReadiness)))
  const levelIndex = Math.max(0, Math.min(9, Math.ceil(Math.max(readiness, 1) / 10) - 1))
  const persona = PERSONA_LEVELS[levelIndex]
  const unlockedSkills = skills
    .filter((skill) => skill.proficiency > 0)
    .sort((a, b) => b.proficiency - a.proficiency)

  const topSkills = unlockedSkills.slice(0, 10)
  const experienceLines = Array.from(
    new Set(
      topSkills.flatMap((skill) => SKILL_ASSETS[skill.name]?.experience || [skill.name])
    )
  )
  const tools = Array.from(
    new Map(
      topSkills
        .flatMap((skill) => SKILL_ASSETS[skill.name]?.tools || [{ id: `tool-${skill.id}`, label: skill.name, icon: skill.icon || '🧩' }])
        .map((tool) => [tool.id, tool])
    ).values()
  )

  return (
    <div className="space-y-5">
      <section className="surface-subcard rounded-3xl p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Онлайн-резюме</p>
            <div className="mt-3 flex h-14 w-14 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-3xl">
              {persona.emoji}
            </div>
          </div>
          <div className="w-full max-w-xl">
            <div className="mb-2 text-xs text-gray-400">
              Прогресс разработчика
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFD60A] to-[#FFE44D] transition-all duration-500"
                style={{ width: `${readiness}%` }}
              />
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1 text-[10px] text-gray-500">
              {[20, 40, 60, 80, 100].map((value) => (
                <span key={value}>{value}%</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="surface-subcard rounded-3xl p-6">
        <h4 className="text-lg font-semibold text-gray-100">Опыт в резюме</h4>

        <div className="mt-4 space-y-2">
          {experienceLines.length > 0 ? (
            experienceLines.map((line, index) => (
              <p key={index} className="text-sm text-gray-300">• {line}</p>
            ))
          ) : (
            <p className="text-sm text-gray-500">Пока пусто. После первых завершённых тем появятся пункты опыта.</p>
          )}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Инструменты</p>
          <div className="flex flex-wrap gap-2">
            {tools.length > 0 ? (
              tools.map((tool) => (
                <span
                  key={tool.id}
                  className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs text-gray-300"
                >
                  {tool.icon} {tool.label}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">Инструменты появятся после завершённых тем.</span>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
