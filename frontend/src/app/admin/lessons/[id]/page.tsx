'use client'

import { useEffect, useState, useRef } from 'react'
// Компонент для загрузки картинки с предпросмотром и вставкой markdown-ссылки
function ImageUploadDropdown({ onInsert }: { onInsert: (markdown: string) => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      const reader = new FileReader()
      reader.onload = ev => setPreview(ev.target?.result as string)
      reader.readAsDataURL(f)
    }
  }

  function handleInsert() {
    if (preview && file) {
      // В реальном проекте тут должен быть upload на сервер и получение URL
      // Для демо вставляем base64 (или можно заменить на upload)
      const markdown = `![${file.name}](${preview})`
      onInsert(markdown)
      setOpen(false)
      setFile(null)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="px-2 py-1 text-xs rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-mono"
        onClick={() => setOpen(o => !o)}
        title="Загрузить картинку"
      >🖼</button>
      {open && (
        <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 w-72">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300 mb-2"
          />
          {preview && (
            <img src={preview} alt="preview" className="rounded-lg max-h-40 mb-2 border border-gray-800" />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium"
              onClick={handleInsert}
              disabled={!preview}
            >Вставить</button>
            <button
              type="button"
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs font-medium"
              onClick={() => { setOpen(false); setFile(null); setPreview(null); if (inputRef.current) inputRef.current.value = '' }}
            >Отмена</button>
          </div>
        </div>
      )}
    </div>
  )
}
import { useRouter, useParams } from 'next/navigation'
import { adminApi, AdminLesson } from '@/lib/api'

const emptyLesson: Omit<AdminLesson, 'id' | 'createdAt' | 'updatedAt'> = {
  level: 'junior',
  module: 'core',
  slug: '',
  title: '',
  description: '',
  content: '',
  order: 0,
  category: 'Основы',
}

export default function LessonEditorPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'
  const id = isNew ? null : Number(params.id)

  const [form, setForm] = useState<Omit<AdminLesson, 'id' | 'createdAt' | 'updatedAt'>>(emptyLesson)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const secret = typeof window !== 'undefined' ? sessionStorage.getItem('admin_secret') || '' : ''

  useEffect(() => {
    if (isNew) return
    adminApi
      .getLesson(secret, id!)
      .then(data => {
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = data
        setForm(rest)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [isNew, id, secret])

  function handleChange(field: keyof typeof form, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      if (isNew) {
        await adminApi.createLesson(secret, form)
      } else {
        await adminApi.updateLesson(secret, id!, form)
      }
      router.push('/admin/lessons')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  function insertAtCursor(text: string) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const newContent = form.content.slice(0, start) + text + form.content.slice(end)
    handleChange('content', newContent)
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length
      ta.focus()
    }, 0)
  }

  // Drag-and-drop image upload
  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        const url = ev.target?.result as string;
        const markdown = `![${file.name}](${url})`;
        insertAtCursor(markdown);
      };
      reader.readAsDataURL(file);
    }
  }
  function handleDragOver(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
  }

  if (loading) return <div className="text-gray-400">Загрузка...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/lessons')}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Назад
        </button>
        <h1 className="text-2xl font-bold">{isNew ? 'Новый урок' : 'Редактировать урок'}</h1>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Заголовок *">
          <input
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            className={inputCls}
            placeholder="Переменные и типы данных"
          />
        </Field>
        <Field label="Slug *">
          <input
            value={form.slug}
            onChange={e => handleChange('slug', e.target.value)}
            className={inputCls}
            placeholder="variables-and-types"
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
        <Field label="Категория">
          <input
            value={form.category}
            onChange={e => handleChange('category', e.target.value)}
            className={inputCls}
            placeholder="Основы"
          />
        </Field>
        <Field label="Порядок">
          <input
            type="number"
            value={form.order}
            onChange={e => handleChange('order', Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Описание">
          <input
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            className={inputCls}
            placeholder="Краткое описание урока"
          />
        </Field>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Содержимое (Markdown)</label>
          <div className="flex items-center gap-2">
            {/* Toolbar */}
            <div className="flex gap-1 border border-gray-700 rounded-lg p-1 bg-gray-900">
              <ToolbarBtn title="Жирный" onClick={() => insertAtCursor('**жирный текст**')}>B</ToolbarBtn>
              <ToolbarBtn title="Курсив" onClick={() => insertAtCursor('*курсив*')}>I</ToolbarBtn>
              <ToolbarBtn title="Заголовок H2" onClick={() => insertAtCursor('\n## Заголовок\n')}>H2</ToolbarBtn>
              <ToolbarBtn title="Заголовок H3" onClick={() => insertAtCursor('\n### Заголовок\n')}>H3</ToolbarBtn>
              <ToolbarBtn title="Код" onClick={() => insertAtCursor('`код`')}>{'<>'}</ToolbarBtn>
              <ToolbarBtn title="Блок кода" onClick={() => insertAtCursor('\n```go\n// код\n```\n')}>{'```'}</ToolbarBtn>
              {/* Дропдаун загрузки картинки */}
              <ImageUploadDropdown onInsert={insertAtCursor} />
              <ToolbarBtn title="Ссылка" onClick={() => insertAtCursor('[текст ссылки](https://example.com)')}>🔗</ToolbarBtn>
              <ToolbarBtn title="Список" onClick={() => insertAtCursor('\n- пункт 1\n- пункт 2\n- пункт 3\n')}>≡</ToolbarBtn>
              {/* Кнопка для варианта ответа */}
              <ToolbarBtn title="Вариант ответа" onClick={() => insertAtCursor('\n- [ ] Вариант ответа\n')}>☑️</ToolbarBtn>
              {/* Кнопка для свободного ответа */}
              <ToolbarBtn title="Свободный ответ" onClick={() => insertAtCursor('\n[Свободный ответ]\n')}>✍️</ToolbarBtn>
              <ToolbarBtn title="Опросник" onClick={() => insertAtCursor('\n<!-- Опросник: пример -->\n\n**Вопрос:** Какой язык компилируется в бинарник?\n\n- [ ] Python\n- [x] Go\n- [ ] JavaScript\n\n<!-- /Опросник -->\n')}>📝</ToolbarBtn>
              <ToolbarBtn title="Автопроверка" onClick={() => insertAtCursor('\n<!-- Автопроверка: пример -->\n\n```go test\nfunc TestSolution(t *testing.T) {\n    got := Solution(2, 3);\n    if got != 5 {\n        t.Errorf(\"ожидали 5, получили %d\", got);\n    }\n}\n```\n\n<!-- /Автопроверка -->\n')}>🤖</ToolbarBtn>
            </div>
            <button
              onClick={() => setPreview(p => !p)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                preview ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {preview ? 'Редактор' : 'Превью'}
            </button>
          </div>
        </div>

        {preview ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 min-h-[400px] prose prose-invert max-w-none text-sm">
            <MarkdownPreview content={form.content} />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={form.content}
            onChange={e => handleChange('content', e.target.value)}
            rows={20}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 resize-y"
            placeholder="# Заголовок урока&#10;&#10;Текст урока в формате Markdown...&#10;&#10;![Изображение](https://example.com/image.png)&#10;&#10;```go&#10;package main&#10;&#10;func main() {}&#10;```"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
        >
          {saving ? 'Сохранение...' : isNew ? 'Создать урок' : 'Сохранить изменения'}
        </button>
        <button
          onClick={() => router.push('/admin/lessons')}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Отмена
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

function ToolbarBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="px-2 py-1 text-xs rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-mono"
    >
      {children}
    </button>
  )
}

function MarkdownPreview({ content }: { content: string }) {
  // Simple markdown renderer without dependencies
  const html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-white">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-white">$1</h1>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="bg-gray-800 rounded-lg p-4 my-3 overflow-x-auto text-cyan-300 text-xs"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-cyan-300 text-xs">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-200">$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-3" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 underline hover:text-cyan-300" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 my-1 text-gray-200">• $1</li>')
    .replace(/\n\n/g, '</p><p class="my-2 text-gray-200">')
    .replace(/\n/g, '<br/>')

  return (
    <div
      className="text-gray-200 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="my-2 text-gray-200">${html}</p>` }}
    />
  )
}

const inputCls =
  'w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-cyan-500 text-sm'
