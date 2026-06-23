"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { adminApi, AdminLesson } from "@/lib/api"

// Страница: Level -> Module -> Category -> Lesson
export default function AdminLevelsPage() {
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const secret = ''

  useEffect(() => {
    adminApi
      .getLessons(secret)
      .then(setLessons)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [secret])

  // Группировка: level -> module -> category -> lessons
  const structure = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.level]) acc[lesson.level] = {}
    if (!acc[lesson.level][lesson.module]) acc[lesson.level][lesson.module] = {}
    if (!acc[lesson.level][lesson.module][lesson.category]) acc[lesson.level][lesson.module][lesson.category] = []
    acc[lesson.level][lesson.module][lesson.category].push(lesson)
    return acc
  }, {} as Record<string, Record<string, Record<string, AdminLesson[]>>>)

  if (loading) return <div className="text-gray-400">Загрузка...</div>
  if (error) return <div className="text-red-400">Ошибка: {error}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Структура курсов: уровни, модули, темы, уроки</h1>
      <div className="space-y-6">
        {Object.keys(structure).length === 0 && (
          <div className="text-gray-400">Нет уроков</div>
        )}
        {Object.entries(structure).map(([level, modules]) => (
          <div key={level} className="border border-emerald-700 rounded-lg p-4 bg-gray-900">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-[#FFD60A] text-lg">Уровень: {level}</span>
              {/* Кнопка для будущего добавления модуля */}
              {/* <button>+ Модуль</button> */}
            </div>
            <div className="ml-4 space-y-2">
              {Object.entries(modules).map(([module, categories]) => (
                <div key={module} className="border-l-2 border-cyan-700 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#FFD60A]">Модуль: {module}</span>
                    {/* Кнопка для будущего добавления темы */}
                    {/* <button>+ Тема</button> */}
                  </div>
                  <div className="ml-4 space-y-1">
                    {Object.entries(categories).map(([category, lessons]) => (
                      <div key={category} className="border-l-2 border-cyan-500 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#FFD60A]">Тема: {category}</span>
                          {/* Кнопка для будущего добавления урока */}
                          <Link href={`/admin/lessons/new?level=${encodeURIComponent(level)}&module=${encodeURIComponent(module)}&category=${encodeURIComponent(category)}`} className="text-xs bg-cyan-700 hover:bg-cyan-600 text-white rounded px-2 py-1 ml-2">+ Урок</Link>
                        </div>
                        <ul className="ml-4">
                          {lessons.map(lesson => (
                            <li key={lesson.id} className="flex items-center gap-2 py-1">
                              <Link href={`/admin/lessons/${lesson.id}`} className="text-white hover:underline">{lesson.title}</Link>
                              <span className="text-xs text-gray-500">(id: {lesson.id})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
