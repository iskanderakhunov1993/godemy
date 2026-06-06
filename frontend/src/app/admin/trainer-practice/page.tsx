'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, AdminExercise } from '@/lib/api'

export default function TrainerPracticeAdminPage() {
  const [exercises, setExercises] = useState<AdminExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const secret = typeof window !== 'undefined' ? sessionStorage.getItem('admin_secret') || '' : ''

  useEffect(() => {
    adminApi
      .getExercises(secret)
      .then(setExercises)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [secret])

  if (loading) return <div className="text-gray-400">Загрузка...</div>
  if (error) return <div className="text-red-400">Ошибка: {error}</div>

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Практика по синтаксису</h1>
        <p className="mt-1 text-sm text-gray-400">
          Отдельная админка для настройки страницы формата `/trainer/[id]`: теория, примеры, mini-задачи и строгие regex-проверки.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Упражнение</th>
              <th className="px-4 py-3 text-left">Категория</th>
              <th className="px-4 py-3 text-left">Конфиг</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {exercises.map((exercise) => (
              <tr key={exercise.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-gray-500">{exercise.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{exercise.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{exercise.module}</div>
                </td>
                <td className="px-4 py-3 text-gray-400">{exercise.category}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    exercise.trainerLayout?.trim()
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {exercise.trainerLayout?.trim() ? 'Настроен' : 'Пусто'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/trainer-practice/${exercise.id}`}
                    className="text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Открыть редактор
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}