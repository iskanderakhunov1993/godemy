'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, AdminExercise } from '@/lib/api'

const difficultyColor: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
}

function getSprintFromCategory(category: string): number {
  const match = category.match(/Sprint\s+(\d+)/i)
  if (match) return Number(match[1])
  return 1
}

function updateCategoryWithSprint(category: string, sprint: number): string {
  if (/Sprint\s+\d+/i.test(category)) {
    return category.replace(/Sprint\s+\d+/i, `Sprint ${sprint}`)
  }
  return category === 'Основы' ? `Sprint ${sprint}` : `Sprint ${sprint} - ${category}`
}

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<AdminExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [updating, setUpdating] = useState<number | null>(null)

  const secret = ''

  useEffect(() => {
    adminApi
      .getExercises(secret)
      .then(setExercises)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [secret])

  async function handleDelete(id: number) {
    if (!confirm('Удалить упражнение?')) return
    setDeleting(id)
    try {
      await adminApi.deleteExercise(secret, id)
      setExercises(prev => prev.filter(e => e.id !== id))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setDeleting(null)
    }
  }

  async function handleMoveSprint(id: number, exercise: AdminExercise, direction: 'up' | 'down') {
    const currentSprint = getSprintFromCategory(exercise.category)
    const newSprint = direction === 'up' ? currentSprint - 1 : currentSprint + 1
    
    if (newSprint < 1 || newSprint > 5) return
    
    setUpdating(id)
    try {
      const newCategory = updateCategoryWithSprint(exercise.category, newSprint)
      await adminApi.updateExercise(secret, id, { category: newCategory })
      setExercises(prev => prev.map(e => 
        e.id === id ? { ...e, category: newCategory } : e
      ))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div className="text-gray-400">Загрузка...</div>
  if (error) return <div className="text-red-400">Ошибка: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Упражнения ({exercises.length})</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/trainer-practice"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
          >
            Практика по синтаксису
          </Link>
          <Link
            href="/admin/exercises/new"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors"
          >
            + Новое упражнение
          </Link>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        {exercises.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Упражнений нет</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Название</th>
                <th className="px-4 py-3 text-left">Модуль</th>
                <th className="px-4 py-3 text-left">Категория</th>
                <th className="px-4 py-3 text-left">Сложность</th>
                <th className="px-4 py-3 text-left">Порядок</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {exercises.map(ex => (
                <tr key={ex.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{ex.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{ex.title}</td>
                  <td className="px-4 py-3 text-gray-400">{ex.module}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* Спринт переноса для core модуля */}
                      {ex.module === 'core' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleMoveSprint(ex.id, ex, 'up')}
                            disabled={updating === ex.id || getSprintFromCategory(ex.category) <= 1}
                            className="text-xs px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded text-gray-300 hover:text-white transition-colors"
                            title="Предыдущий спринт"
                          >
                            ↑
                          </button>
                          <span className="text-xs px-1 py-0.5 bg-gray-800 rounded text-gray-400">
                            Sprint {getSprintFromCategory(ex.category)}
                          </span>
                          <button
                            onClick={() => handleMoveSprint(ex.id, ex, 'down')}
                            disabled={updating === ex.id || getSprintFromCategory(ex.category) >= 5}
                            className="text-xs px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded text-gray-300 hover:text-white transition-colors"
                            title="Следующий спринт"
                          >
                            ↓
                          </button>
                        </div>
                      )}
                      {ex.module !== 'core' && (
                        <span className="text-xs text-gray-500">{ex.category}</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-medium ${difficultyColor[ex.difficulty] || 'text-gray-400'}`}>
                    {ex.difficulty}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{ex.order}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/trainer-practice/${ex.id}`}
                      className="text-[#FFD60A] hover:text-[#FFD60A] transition-colors"
                    >
                      Практика
                    </Link>
                    <Link
                      href={`/admin/exercises/${ex.id}`}
                      className="text-[#FFD60A] hover:text-[#FFD60A] transition-colors"
                    >
                      Изменить
                    </Link>
                    <button
                      onClick={() => handleDelete(ex.id)}
                      disabled={deleting === ex.id}
                      className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {deleting === ex.id ? '...' : 'Удалить'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
