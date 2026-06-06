'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, AdminLesson } from '@/lib/api'

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  // Фильтры
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const secret = typeof window !== 'undefined' ? sessionStorage.getItem('admin_secret') || '' : ''

  useEffect(() => {
    adminApi
      .getLessons(secret)
      .then(setLessons)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [secret])

  async function handleDelete(id: number) {
    if (!confirm('Удалить урок?')) return
    setDeleting(id)
    try {
      await adminApi.deleteLesson(secret, id)
      setLessons(prev => prev.filter(l => l.id !== id))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="text-gray-400">Загрузка...</div>
  if (error) return <div className="text-red-400">Ошибка: {error}</div>

  // Получить уникальные значения для фильтров
  const modules = Array.from(new Set(lessons.map(l => l.module).filter(Boolean)))
  const categories = Array.from(new Set(lessons.map(l => l.category).filter(Boolean)))

  // Фильтрация
  const filtered = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase())
    const matchesModule = !moduleFilter || l.module === moduleFilter
    const matchesCategory = !categoryFilter || l.category === categoryFilter
    return matchesSearch && matchesModule && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Уроки ({filtered.length})</h1>
        <Link
          href="/admin/lessons/new"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors"
        >
          + Новый урок
        </Link>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 items-center mb-2">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-cyan-500"
          style={{ minWidth: 200 }}
        />
        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white text-sm"
        >
          <option value="">Все модули</option>
          {modules.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white text-sm"
        >
          <option value="">Все категории</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() => { setSearch(''); setModuleFilter(''); setCategoryFilter(''); }}
          className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm"
        >
          Сбросить фильтры
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Нет уроков по выбранным фильтрам</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Заголовок</th>
                <th className="px-4 py-3 text-left">Модуль</th>
                <th className="px-4 py-3 text-left">Категория</th>
                <th className="px-4 py-3 text-left">Порядок</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(lesson => (
                <tr key={lesson.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{lesson.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{lesson.title}</td>
                  <td className="px-4 py-3 text-gray-400">{lesson.module}</td>
                  <td className="px-4 py-3 text-gray-400">{lesson.category}</td>
                  <td className="px-4 py-3 text-gray-400">{lesson.order}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Изменить
                    </Link>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      disabled={deleting === lesson.id}
                      className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {deleting === lesson.id ? '...' : 'Удалить'}
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
