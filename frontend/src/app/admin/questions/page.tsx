'use client'

import { useState } from 'react'

interface InterviewQuestion {
  id: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  answer: string
  keywords: string[]
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('interview-questions')
    if (!saved) return []
    try {
      return JSON.parse(saved) as InterviewQuestion[]
    } catch (e) {
      console.error('Ошибка загрузки вопросов:', e)
      return []
    }
  })
  const [newQuestion, setNewQuestion] = useState<Partial<InterviewQuestion>>({
    category: 'general',
    difficulty: 'medium',
    question: '',
    answer: '',
    keywords: [],
  })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  const STORAGE_KEY = 'interview-questions'

  // Сохранение в localStorage
  const saveQuestions = (updatedQuestions: InterviewQuestion[]) => {
    setQuestions(updatedQuestions)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuestions))
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question || !newQuestion.answer) {
      alert('Заполните вопрос и ответ')
      return
    }

    if (editingId) {
      // Редактирование
      const updated = questions.map((q) =>
        q.id === editingId ? { ...q, ...newQuestion } : q
      ) as InterviewQuestion[]
      saveQuestions(updated)
      setEditingId(null)
    } else {
      // Добавление
      const question: InterviewQuestion = {
        id: `q-${Date.now()}`,
        category: newQuestion.category || 'general',
        difficulty: newQuestion.difficulty || 'medium',
        question: newQuestion.question || '',
        answer: newQuestion.answer || '',
        keywords: newQuestion.keywords || [],
      }
      saveQuestions([...questions, question])
    }

    setNewQuestion({
      category: 'general',
      difficulty: 'medium',
      question: '',
      answer: '',
      keywords: [],
    })
    setShowForm(false)
  }

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Вы уверены?')) {
      saveQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const handleEditQuestion = (question: InterviewQuestion) => {
    setNewQuestion(question)
    setEditingId(question.id)
    setShowForm(true)
  }

  const filteredQuestions =
    filter === 'all' ? questions : questions.filter((q) => q.difficulty === filter)

  const badgeClass = (difficulty: string) => {
    if (difficulty === 'easy')
      return 'bg-[#FFD60A]/20 text-[#FFE44D] border-[#FFD60A]/50'
    if (difficulty === 'medium')
      return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50'
    return 'bg-red-500/20 text-red-200 border-red-500/50'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Редактор вопросов</h1>
          <p className="text-gray-400">
            Управление вопросами для собеседования. Всего вопросов: {questions.length}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            if (!showForm) {
              setNewQuestion({
                category: 'general',
                difficulty: 'medium',
                question: '',
                answer: '',
                keywords: [],
              })
            }
          }}
          className="px-6 py-2 rounded-lg bg-[#B8960A] hover:bg-[#B8960A] text-white font-semibold transition-colors"
        >
          {showForm ? '❌ Отменить' : '➕ Новый вопрос'}
        </button>
      </div>

      {/* Форма добавления */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Категория
              </label>
              <input
                type="text"
                value={newQuestion.category || ''}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, category: e.target.value })
                }
                placeholder="Go, Backend, Database..."
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:border-[#FFD60A]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Сложность
              </label>
              <select
                value={newQuestion.difficulty || 'medium'}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    difficulty: e.target.value as InterviewQuestion['difficulty'],
                  })
                }
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:border-[#FFD60A]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Вопрос *
            </label>
            <textarea
              value={newQuestion.question || ''}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
              }
              placeholder="Введите вопрос для собеседования..."
              rows={3}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white resize-none focus:outline-none focus:border-[#FFD60A]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Ответ / Подсказка *
            </label>
            <textarea
              value={newQuestion.answer || ''}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, answer: e.target.value })
              }
              placeholder="Введите ожидаемый ответ или подсказку..."
              rows={4}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white resize-none focus:outline-none focus:border-[#FFD60A]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Ключевые слова (через запятую)
            </label>
            <input
              type="text"
              value={(newQuestion.keywords || []).join(', ')}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  keywords: e.target.value.split(',').map((k) => k.trim()),
                })
              }
              placeholder="goroutine, channel, mutex..."
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:border-[#FFD60A]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddQuestion}
              className="flex-1 rounded-lg bg-[#B8960A] hover:bg-[#B8960A] px-4 py-2 text-white font-semibold transition-colors"
            >
              {editingId ? '💾 Сохранить изменения' : '✅ Добавить вопрос'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-500 transition-colors"
            >
              Отменить
            </button>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="mb-6 flex gap-2">
        {(['all', 'easy', 'medium', 'hard'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === f
                ? 'bg-[#B8960A] text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'Все' : f}
          </button>
        ))}
      </div>

      {/* Список вопросов */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Вопросов не найдено</p>
            <p className="text-sm mt-1">Добавьте первый вопрос для собеседования</p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 p-5 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                      {question.category}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-base">{question.question}</p>
                </div>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <p className="text-sm text-gray-300">{question.answer}</p>
              </div>

              {question.keywords && question.keywords.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {question.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs px-2 py-1 rounded bg-[#FFD60A]/20 text-[#FFE44D]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleEditQuestion(question)}
                  className="px-3 py-1.5 rounded-lg bg-[#FFD60A] hover:bg-[#997A00] text-sm text-white font-medium transition-colors"
                >
                  ✏️ Редактировать
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-sm text-red-300 font-medium transition-colors border border-red-500/50"
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
