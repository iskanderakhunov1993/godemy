'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { adminApi, AdminExercise } from '@/lib/api'

const emptyExercise: Omit<AdminExercise, 'id' | 'createdAt' | 'updatedAt'> = {
  level: 'junior',
  module: 'core',
  title: '',
  description: '',
  difficulty: 'easy',
  category: 'Основы',
  starterCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// Ваш код здесь\n}\n',
  trainerLayout: '',
  solutionCode: '',
  testCode: '',
  hints: '[]',
  order: 0,
}

const tabs = ['Основное', 'Стартовый код', 'Решение', 'Тесты', 'Подсказки'] as const
type Tab = (typeof tabs)[number]

// Нормализация категории для спринтов: если модуль "core", то категория должна иметь спринт
function normalizeCategory(category: string, module: string, order: number): string {
  if (module !== 'core') return category
  
  // Для модуля "core" определяем спринт по порядку
  // До 5-го инкремента (включ.) - спринт 1, затем спринт 2
  const sprint = order <= 5 ? 'Sprint 1' : 'Sprint 2'
  
  // Если категория уже содержит Sprint, оставляем как есть
  if (/Sprint\s+\d+/i.test(category)) return category
  
  // Иначе добавляем спринт перед категорией
  return category === 'Основы' ? sprint : `${sprint} - ${category}`
}

// Извлечение спринта из категории
function getSprintFromCategory(category: string): number {
  const match = category.match(/Sprint\s+(\d+)/i)
  if (match) return Number(match[1])
  return 1
}

// Исправление категории при смене спринта
function updateCategoryWithSprint(category: string, sprint: number): string {
  // Если категория содержит спринт, заменяем его
  if (/Sprint\s+\d+/i.test(category)) {
    return category.replace(/Sprint\s+\d+/i, `Sprint ${sprint}`)
  }
  // Иначе добавляем спринт в начало
  return category === 'Основы' ? `Sprint ${sprint}` : `Sprint ${sprint} - ${category}`
}

export default function ExerciseEditorPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'
  const id = isNew ? null : Number(params.id)

  const [form, setForm] = useState<Omit<AdminExercise, 'id' | 'createdAt' | 'updatedAt'>>(emptyExercise)
  const [history, setHistory] = useState<Array<Omit<AdminExercise, 'id' | 'createdAt' | 'updatedAt'>>>([emptyExercise])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('Основное')

  const secret = ''

  useEffect(() => {
    if (isNew) return
    adminApi
      .getExercise(secret, id!)
      .then(data => {
        const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = data
        setForm(rest)
        setHistory([rest])
        setHistoryIndex(0)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [isNew, id, secret])

  // Обработка Ctrl+Z / Cmd+Z для undo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setHistoryIndex(newIndex)
          setForm(history[newIndex]!)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [historyIndex, history])

  function handleChange(field: keyof typeof form, value: string | number) {
    const newForm = { ...form, [field]: value }
    setForm(newForm)
    
    // Добавляем в историю
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newForm)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  function handleUndo() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setForm(history[newIndex]!)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      // Нормализуем категорию в зависимости от модуля и порядка
      const normalizedForm = {
        ...form,
        category: normalizeCategory(form.category, form.module, form.order)
      }
      
      if (isNew) {
        await adminApi.createExercise(secret, normalizedForm)
      } else {
        await adminApi.updateExercise(secret, id!, normalizedForm)
      }
      router.push('/admin/exercises')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400">Загрузка...</div>

  return (
    <div className="space-y-6 user-select-none" onMouseDown={(e) => {
      // Разрешаем выделение в input/textarea элементах
      const target = e.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        if (e.button === 1) { // Средняя кнопка мыши
          e.preventDefault()
        }
      }
    }}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/exercises')}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Назад
        </button>
        <h1 className="text-2xl font-bold">{isNew ? 'Новое упражнение' : 'Редактировать упражнение'}</h1>
        {!isNew ? (
          <button
            onClick={() => router.push(`/admin/trainer-practice/${id}`)}
            className="ml-auto px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
          >
            Открыть практику
          </button>
        ) : null}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Основное' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Название *">
            <input
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              className={inputCls}
              placeholder="Сумма элементов среза"
            />
          </Field>
          <Field label="Модуль">
            <input
              value={form.module}
              onChange={e => handleChange('module', e.target.value)}
              className={inputCls}
              placeholder="core"
            />
          </Field>
          
          {/* Спринт selector for core module */}
          {form.module === 'core' && (
            <Field label="Спринт">
              <div className="flex gap-2">
                <select
                  value={getSprintFromCategory(form.category)}
                  onChange={e => {
                    const newSprint = Number(e.target.value)
                    const newCategory = updateCategoryWithSprint(form.category, newSprint)
                    handleChange('category', newCategory)
                  }}
                  className={inputCls}
                >
                  <option value="1">Sprint 1</option>
                  <option value="2">Sprint 2</option>
                  <option value="3">Sprint 3</option>
                  <option value="4">Sprint 4</option>
                  <option value="5">Sprint 5</option>
                </select>
              </div>
            </Field>
          )}
          
          <Field label="Категория">
            <input
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
              className={inputCls}
              placeholder="Срезы"
            />
          </Field>
          <Field label="Сложность">
            <select
              value={form.difficulty}
              onChange={e => handleChange('difficulty', e.target.value)}
              className={inputCls}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </Field>
          <Field label="Порядок">
            <input
              type="number"
              value={form.order}
              onChange={e => handleChange('order', Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Описание задачи *">
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={6}
                className={`${inputCls} font-mono resize-y`}
                placeholder="Напишите функцию sumSlice, которая принимает срез целых чисел и возвращает их сумму."
              />
            </Field>
          </div>
        </div>
      )}

      {activeTab === 'Стартовый код' && (
        <Field label="Стартовый код (Go)">
          <textarea
            value={form.starterCode}
            onChange={e => handleChange('starterCode', e.target.value)}
            rows={20}
            className={`${inputCls} font-mono resize-y`}
            placeholder="package main&#10;&#10;func sumSlice(nums []int) int {&#10;    // Ваш код&#10;}"
          />
        </Field>
      )}

      {activeTab === 'Решение' && (
        <Field label="Код решения (Go) — не отображается пользователям">
          <textarea
            value={form.solutionCode}
            onChange={e => handleChange('solutionCode', e.target.value)}
            rows={20}
            className={`${inputCls} font-mono resize-y`}
            placeholder="package main&#10;&#10;func sumSlice(nums []int) int {&#10;    sum := 0&#10;    for _, v := range nums { sum += v }&#10;    return sum&#10;}"
          />
        </Field>
      )}

      {activeTab === 'Тесты' && (
        <div className="space-y-3">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-4 py-3 text-yellow-300 text-sm">
            Тест-код выполняется в песочнице Go. Используйте пакет <code className="bg-yellow-900/40 px-1 rounded">testing</code> или просто вывод через <code className="bg-yellow-900/40 px-1 rounded">fmt.Println</code>.
          </div>
          <Field label="Тест-код (Go)">
            <textarea
              value={form.testCode}
              onChange={e => handleChange('testCode', e.target.value)}
              rows={20}
              className={`${inputCls} font-mono resize-y`}
              placeholder="// Тесты автоматически запускаются после кода пользователя&#10;fmt.Println(sumSlice([]int{1,2,3})) // 6"
            />
          </Field>
        </div>
      )}

      {activeTab === 'Подсказки' && (
        <div className="space-y-3">
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 text-sm">
            Формат JSON-массива строк: <code className="text-cyan-400">{`["Подсказка 1", "Подсказка 2"]`}</code>
          </div>
          <Field label="Подсказки (JSON)">
            <textarea
              value={form.hints}
              onChange={e => handleChange('hints', e.target.value)}
              rows={8}
              className={`${inputCls} font-mono resize-y`}
              placeholder='["Используйте цикл range", "Объявите переменную sum := 0"]'
            />
          </Field>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
        >
          {saving ? 'Сохранение...' : isNew ? 'Создать упражнение' : 'Сохранить изменения'}
        </button>
        <button
          onClick={() => router.push('/admin/exercises')}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Отмена
        </button>
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="ml-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-sm"
          title="Ctrl+Z / Cmd+Z"
        >
          ↶ Отменить
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-cyan-500 text-sm user-select-text'
