'use client'

import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Редакторы контента</h1>
      <p className="text-gray-300">
        В админке доступны отдельные редакторы: основной курс и буткемп.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/structure"
          className="inline-flex items-center bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg px-4 py-2 transition-colors"
        >
          Открыть редактор курса
        </Link>
        <Link
          href="/admin/bootcamp"
          className="inline-flex items-center bg-amber-700 hover:bg-amber-600 text-white rounded-lg px-4 py-2 transition-colors"
        >
          Открыть редактор буткемпа
        </Link>
        <Link
          href="/admin/exercises"
          className="inline-flex items-center bg-violet-700 hover:bg-violet-600 text-white rounded-lg px-4 py-2 transition-colors"
        >
          Упражнения тренажёра
        </Link>
        <Link
          href="/admin/trainer-topics"
          className="inline-flex items-center bg-purple-700 hover:bg-purple-600 text-white rounded-lg px-4 py-2 transition-colors"
        >
          Темы тренажёра
        </Link>
      </div>
    </div>
  )
}
