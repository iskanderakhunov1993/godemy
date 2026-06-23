'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, AdminTrainerTopic } from '@/lib/api'

export default function AdminTrainerTopicsPage() {
  const [topics, setTopics] = useState<AdminTrainerTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const secret = ''

  useEffect(() => {
    adminApi
      .getTrainerTopics(secret)
      .then(setTopics)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [secret])

  async function handleDelete(id: number) {
    if (!confirm('Удалить тему? Упражнения не удалятся, но потеряют привязку к теме.')) return
    setDeleting(id)
    try {
      await adminApi.deleteTrainerTopic(secret, id)
      setTopics(prev => prev.filter(t => t.id !== id))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="text-gray-400">Загрузка...</div>
  if (error) return <div className="text-red-400">Ошибка: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Темы тренажёра ({topics.length})</h1>
          <p className="text-gray-400 text-sm mt-1">
            Каждая тема содержит: синтаксис → объяснение → примеры → паттерны → задания
          </p>
        </div>
        <Link
          href="/admin/trainer-topics/new"
          className="px-4 py-2 bg-[#B8960A] hover:bg-[#FFD60A] rounded-lg text-sm font-medium transition-colors"
        >
          + Новая тема
        </Link>
      </div>

      {topics.length === 0 ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-400 mb-4">Тем пока нет. Создайте первую!</p>
          <Link
            href="/admin/trainer-topics/new"
            className="px-4 py-2 bg-[#B8960A] hover:bg-[#FFD60A] rounded-lg text-sm font-medium transition-colors"
          >
            + Создать тему
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {topics.map(topic => (
            <div
              key={topic.id}
              className="bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-gray-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#B8960A]/40 border border-[#FFD60A]/50 text-[#FFD60A] text-sm flex items-center justify-center font-bold shrink-0">
                {topic.order || topic.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{topic.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-800 rounded px-1.5 py-0.5">{topic.module}</span>
                  <span className="text-xs text-gray-600 font-mono">/{topic.slug}</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  {topic.syntax && <span>📐 Синтаксис</span>}
                  {topic.explanation && <span>💡 Объяснение</span>}
                  {topic.examples && topic.examples !== '[]' && <span>🧪 Примеры</span>}
                  {topic.patterns && <span>🔁 Паттерны</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/trainer/topic/${topic.slug}`}
                  target="_blank"
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Просмотр ↗
                </Link>
                <Link
                  href={`/admin/trainer-topics/${topic.id}`}
                  className="text-[#FFD60A] hover:text-[#FFD60A] text-sm transition-colors"
                >
                  Изменить
                </Link>
                <button
                  onClick={() => handleDelete(topic.id)}
                  disabled={deleting === topic.id}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors disabled:opacity-50"
                >
                  {deleting === topic.id ? '...' : 'Удалить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
