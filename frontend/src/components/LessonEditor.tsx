'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { adminApi } from '@/lib/api'
import { LessonContentRenderer } from '@/components/LessonContent'

// ─── Types ────────────────────────────────────────────────────────────────────
type TaskType = 'choice' | 'sort' | 'freetext' | 'code' | 'form' | 'continue' | 'chat' | 'chatdialog' | 'interactive'

export interface LessonEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  saving: boolean
  lessonTitle: string
  onClose: () => void
  secret?: string
}

// ─── Config ───────────────────────────────────────────────────────────────────
const FONTS = [
  { label: 'Системный',      value: 'system-ui, sans-serif' },
  { label: 'Inter',          value: 'Inter, sans-serif' },
  { label: 'Roboto',         value: 'Roboto, sans-serif' },
  { label: 'Manrope',        value: 'Manrope, sans-serif' },
  { label: 'Montserrat',     value: 'Montserrat, sans-serif' },
  { label: 'Nunito Sans',    value: '"Nunito Sans", sans-serif' },
  { label: 'Lato',           value: 'Lato, sans-serif' },
  { label: 'Open Sans',      value: '"Open Sans", sans-serif' },
  { label: 'Arial',          value: 'Arial, sans-serif' },
  { label: 'Verdana',        value: 'Verdana, sans-serif' },
  { label: 'Tahoma',         value: 'Tahoma, sans-serif' },
  { label: 'Georgia',        value: 'Georgia, serif' },
  { label: 'Times New Roman',value: '"Times New Roman", serif' },
  { label: 'Merriweather',   value: 'Merriweather, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Courier New',    value: '"Courier New", monospace' },
  { label: 'Consolas',       value: 'Consolas, monospace' },
  { label: 'Fira Code',      value: '"Fira Code", monospace' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'IBM Plex Mono',  value: '"IBM Plex Mono", monospace' },
  { label: 'Source Code Pro', value: '"Source Code Pro", monospace' },
  { label: 'Space Mono',     value: '"Space Mono", monospace' },
  { label: 'Ubuntu Mono',    value: '"Ubuntu Mono", monospace' },
  { label: 'Trebuchet MS',   value: '"Trebuchet MS", sans-serif' },
]

const EDITOR_FONT_STORAGE_KEY = 'lesson-editor-font'

const TASK_TEMPLATES: Record<TaskType, string> = {
  choice: `
:::choice
вопрос: Какой ответ правильный?
- Вариант A
- Вариант B ✓
- Вариант C
- Вариант D
:::
`,
  sort: `
:::sort
вопрос: Расставь шаги в правильном порядке:
1. Первый шаг
2. Второй шаг
3. Третий шаг
:::
`,
  freetext: `
:::freetext
вопрос: Объясни своими словами...
подсказка: Вспомни предыдущий раздел
:::
`,
  code: `
:::code lang=go
вопрос: Напиши функцию, которая возвращает сумму двух чисел
\`\`\`go
package main

func solution(a, b int) int {
    // твой код здесь
}
\`\`\`
:::
`,
  form: `
:::form
заголовок: Нужна помощь?
поле: Телефон
placeholder: +7 (999) 999-99-99
кнопка: Отправить
успех: Спасибо! Мы получили заявку.

Напиши короткое описание формы.
- что получит пользователь
- что нужно заполнить
:::
`,
  continue: `
:::continue
кнопка: Что это такое?
height: 260

Сюда вставь длинный текст, который должен открываться по кнопке.
- Можно использовать markdown
- Можно ставить блок в любое место урока
:::
`,
  chat: `
:::chat
заголовок: Секретный агент
от: Тимлид
аватар: teamlead
канал: #slack
время: 09:42

{{user_name}}, ты работаешь в компании, а доступ к YouTube и Stack Overflow ограничен.

Задача: придумать безопасное и легальное решение, чтобы посмотреть туториал.
:::
`,
  chatdialog: `
:::chatdialog
заголовок: Новый тред
канал: #onboarding

left|Куратор|Привет, {{first_name}}! Сегодня запускаем первый этап.|avatar=mentor
right|Ты|Принято, уже в процессе 👌
left|Рома|Супер, отпишись как закончишь.|avatar=roma
:::
`,
  interactive: `
:::interactive lang=go
заголовок: Напиши код и посмотри результат
package main

import "fmt"

func main() {
    // твой код здесь
    fmt.Println("Привет, мир!")
}
:::
`,
}

// ─── Page Templates ───────────────────────────────────────────────────────────
interface PageTemplate {
  id: string
  category: string
  name: string
  description: string
  content: string
}

const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'longread',
    category: 'Статья',
    name: '📄 Лонгрид',
    description: 'Большая статья: Hero, введение, разделы, цитата, итог',
    content: `# Заголовок статьи

> Короткое вводное предложение — суть в одной строке.

## Введение

Напиши краткое введение к теме. Объясни, зачем это важно и что читатель узнает.

---

## Раздел 1: Основы

Основной текст раздела. Можно использовать **жирный**, *курсив* и \`код\`.

- Ключевой пункт один
- Ключевой пункт два
- Ключевой пункт три

\`\`\`go
// Пример кода
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
\`\`\`

---

## Раздел 2: Углубляемся

Продолжай раскрывать тему. Добавь примеры, сравнения, схемы.

> 💡 **Совет:** Используй цитаты чтобы выделить важные мысли.

---

## Итог

Коротко подведи итог: что узнал читатель и что делать дальше.

1. Первый вывод
2. Второй вывод
3. Следующий шаг
`,
  },
  {
    id: 'step-by-step',
    category: 'Туториал',
    name: '🪜 Шаг за шагом',
    description: 'Пошаговый туториал с нумерованными этапами',
    content: `# Как сделать: заголовок туториала

Короткое описание — чему научится читатель и сколько времени займёт.

**Что понадобится:**
- Требование 1
- Требование 2
- Требование 3

---

## Шаг 1: Название первого шага

Опиши что нужно сделать на этом шаге.

\`\`\`go
// Код для шага 1
\`\`\`

✅ **Результат:** Что должно получиться после этого шага.

---

## Шаг 2: Название второго шага

Продолжение инструкции.

\`\`\`go
// Код для шага 2
\`\`\`

✅ **Результат:** Что должно получиться.

---

## Шаг 3: Финальный шаг

Завершающее действие.

\`\`\`go
// Финальный код
\`\`\`

✅ **Готово!** Опиши итоговый результат.

---

## Частые ошибки

- **Ошибка 1** — как исправить
- **Ошибка 2** — как исправить
`,
  },
  {
    id: 'cards',
    category: 'Контент',
    name: '🃏 Карточки понятий',
    description: 'Набор карточек для объяснения терминов или концепций',
    content: `# Ключевые понятия

Краткое описание темы и зачем знать эти понятия.

---

### 📌 Понятие 1

**Определение:** Краткое чёткое определение термина.

**Пример:**
\`\`\`go
// Пример использования
var x int = 42
\`\`\`

**Когда использовать:** Объясни в каких случаях это применяется.

---

### 📌 Понятие 2

**Определение:** Краткое чёткое определение термина.

**Пример:**
\`\`\`go
// Пример использования
type User struct {
    Name string
}
\`\`\`

**Когда использовать:** Объясни в каких случаях это применяется.

---

### 📌 Понятие 3

**Определение:** Краткое чёткое определение термина.

**Пример:**
\`\`\`go
// Пример использования
func greet(name string) string {
    return "Hello, " + name
}
\`\`\`

**Когда использовать:** Объясни в каких случаях это применяется.

---

## Сравнительная таблица

| Понятие | Когда использовать | Пример |
|---------|-------------------|--------|
| Понятие 1 | Случай 1 | \`код\` |
| Понятие 2 | Случай 2 | \`код\` |
| Понятие 3 | Случай 3 | \`код\` |
`,
  },
  {
    id: 'theory-practice',
    category: 'Урок',
    name: '🎓 Теория + Практика',
    description: 'Структура урока: теория, примеры, задание',
    content: `# Тема урока

## Что ты узнаешь

- Пункт знания 1
- Пункт знания 2
- Пункт знания 3

---

## Теория

Объясни концепцию простыми словами. Используй аналогии.

### Как это работает

Подробное объяснение механизма. Схема или список шагов.

1. Шаг первый
2. Шаг второй
3. Шаг третий

---

## Примеры

### Простой пример

\`\`\`go
package main

import "fmt"

func example() {
    // простой пример
    fmt.Println("Простой пример")
}
\`\`\`

### Реальный пример

\`\`\`go
package main

import "fmt"

func realExample() {
    // более сложный реальный пример
    result := compute(10, 20)
    fmt.Println(result)
}
\`\`\`

---

## Практика

`,
  },
  {
    id: 'faq',
    category: 'Справка',
    name: '❓ FAQ / Вопрос-Ответ',
    description: 'Страница частых вопросов в формате вопрос-ответ',
    content: `# Часто задаваемые вопросы

---

### ❓ Вопрос 1?

Подробный ответ на первый вопрос. Можно использовать списки и код.

\`\`\`go
// Пример кода если нужен
\`\`\`

---

### ❓ Вопрос 2?

Подробный ответ на второй вопрос.

> 💡 **Совет:** Дополнительный контекст или полезная информация.

---

### ❓ Вопрос 3?

Подробный ответ на третий вопрос.

- Дополнительный пункт 1
- Дополнительный пункт 2

---

### ❓ Вопрос 4?

Подробный ответ на четвёртый вопрос.

---

## Не нашёл ответа?

Напиши нам — мы поможем разобраться.
`,
  },
  {
    id: 'cheatsheet',
    category: 'Справка',
    name: '📋 Шпаргалка',
    description: 'Компактная страница-шпаргалка с кодом и командами',
    content: `# Шпаргалка: тема

Краткий справочник для быстрого поиска синтаксиса и команд.

---

## Основной синтаксис

| Что делает | Синтаксис |
|-----------|-----------|
| Объявить переменную | \`var x int\` |
| Короткое объявление | \`x := 42\` |
| Функция | \`func name() {}\` |
| Структура | \`type T struct {}\` |

---

## Часто используемые конструкции

### Цикл

\`\`\`go
for i := 0; i < 10; i++ {
    fmt.Println(i)
}
\`\`\`

### Условие

\`\`\`go
if x > 0 {
    // ...
} else {
    // ...
}
\`\`\`

### Switch

\`\`\`go
switch x {
case 1:
    // ...
case 2:
    // ...
default:
    // ...
}
\`\`\`

---

## Команды / CLI

\`\`\`bash
go build .        # сборка
go run main.go    # запуск
go test ./...     # тесты
go mod tidy       # зависимости
\`\`\`

---

## Частые паттерны

\`\`\`go
// Обработка ошибки
result, err := someFunc()
if err != nil {
    return fmt.Errorf("context: %w", err)
}
\`\`\`
`,
  },
]

// ─── Content Parser ───────────────────────────────────────────────────────────
interface ParsedBlock {
  type: 'markdown' | TaskType
  content: string
  lang?: string
}

function parseContent(raw: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = []
  const regex = /:::([\w]+)([^\n]*)\n([\s\S]*?):::/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'markdown', content: raw.slice(lastIndex, match.index) })
    }
    const type = match[1] as TaskType
    const langMatch = match[2].match(/lang=([\w+]+)/)
    blocks.push({ type, content: match[3], lang: langMatch?.[1] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < raw.length) {
    blocks.push({ type: 'markdown', content: raw.slice(lastIndex) })
  }

  return blocks
}

// ─── Task Block: Choice ───────────────────────────────────────────────────────
function ChoiceBlock({ content }: { content: string }) {
  const lines = content.trim().split('\n')
  const question = lines[0].replace(/^вопрос:\s*/, '')
  const options = lines
    .slice(1)
    .filter(l => l.trim().startsWith('-'))
    .map(l => ({
      text: l.replace(/^-\s*/, '').replace(/\s*✓\s*$/, '').trim(),
      correct: l.includes('✓'),
    }))
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="my-4 rounded-xl border border-purple-800/40 bg-purple-950/20 p-4">
      <div className="text-[11px] uppercase tracking-wider text-purple-400 font-semibold mb-3">
        ☑ Задание: выбор ответа
      </div>
      <p className="text-white font-medium mb-3 text-sm">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left rounded-lg px-4 py-2.5 text-sm transition-all border ${
              selected === null
                ? 'bg-gray-800/60 text-gray-200 border-gray-700 hover:border-purple-600 hover:bg-gray-700/60'
                : selected === i
                ? opt.correct
                  ? 'bg-emerald-900/60 text-[#FFE44D] border-emerald-600'
                  : 'bg-red-900/60 text-red-100 border-red-600'
                : opt.correct && selected !== null
                ? 'bg-emerald-900/30 text-[#FFD60A] border-emerald-800/40'
                : 'bg-gray-800/40 text-gray-500 border-gray-800'
            }`}
          >
            <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
            {opt.text}
          </button>
        ))}
      </div>
      {selected !== null && (
        <p className={`mt-3 text-sm font-medium ${options[selected]?.correct ? 'text-[#FFD60A]' : 'text-red-400'}`}>
          {options[selected]?.correct ? '✓ Правильно!' : '✗ Неверно — попробуй ещё'}
        </p>
      )}
    </div>
  )
}

// ─── Task Block: Sort ─────────────────────────────────────────────────────────
function SortBlock({ content }: { content: string }) {
  const lines = content.trim().split('\n')
  const question = lines[0].replace(/^вопрос:\s*/, '')
  const items = lines
    .slice(1)
    .filter(l => /^\d+\./.test(l.trim()))
    .map(l => l.replace(/^\d+\.\s*/, '').trim())

  const [order, setOrder] = useState<number[]>(() =>
    [...items.map((_, i) => i)].sort(() => Math.random() - 0.5)
  )
  const [checked, setChecked] = useState(false)
  const isCorrect = order.every((v, i) => v === i)

  const move = (pos: number, dir: -1 | 1) => {
    const next = [...order]
    const newPos = pos + dir
    if (newPos < 0 || newPos >= next.length) return
    ;[next[pos], next[newPos]] = [next[newPos], next[pos]]
    setOrder(next)
    setChecked(false)
  }

  return (
    <div className="my-4 rounded-xl border border-blue-800/40 bg-blue-950/20 p-4">
      <div className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold mb-3">
        ↕ Задание: сортировка
      </div>
      <p className="text-white font-medium mb-3 text-sm">{question}</p>
      <div className="space-y-2">
        {order.map((origIdx, pos) => (
          <div
            key={origIdx}
            className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2.5 text-sm text-gray-200 border border-gray-700/50"
          >
            <span className="text-gray-500 text-xs w-4 text-center">{pos + 1}</span>
            <span className="flex-1">{items[origIdx]}</span>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => move(pos, -1)}
                disabled={pos === 0}
                className="text-gray-500 hover:text-white disabled:opacity-20 leading-none px-1 text-xs"
              >▲</button>
              <button
                onClick={() => move(pos, 1)}
                disabled={pos === order.length - 1}
                className="text-gray-500 hover:text-white disabled:opacity-20 leading-none px-1 text-xs"
              >▼</button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setChecked(true)}
        className="mt-3 text-xs bg-blue-800 hover:bg-blue-700 text-white rounded-lg px-4 py-1.5"
      >
        Проверить порядок
      </button>
      {checked && (
        <p className={`mt-2 text-sm font-medium ${isCorrect ? 'text-[#FFD60A]' : 'text-red-400'}`}>
          {isCorrect ? '✓ Правильный порядок!' : '✗ Порядок неверный, попробуй ещё'}
        </p>
      )}
    </div>
  )
}

// ─── Task Block: FreeText ─────────────────────────────────────────────────────
function FreeTextBlock({ content }: { content: string }) {
  const lines = content.trim().split('\n')
  const question = lines[0].replace(/^вопрос:\s*/, '')
  const hint = lines.find(l => l.startsWith('подсказка:'))?.replace(/^подсказка:\s*/, '')
  const [answer, setAnswer] = useState('')

  return (
    <div className="my-4 rounded-xl border border-amber-800/40 bg-amber-950/20 p-4">
      <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold mb-3">
        ✏ Задание: свободный ответ
      </div>
      <p className="text-white font-medium mb-2 text-sm">{question}</p>
      {hint && <p className="text-xs text-gray-500 mb-3">💡 Подсказка: {hint}</p>}
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        rows={4}
        placeholder="Напиши свой ответ здесь..."
        className="w-full bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 resize-none outline-none focus:border-amber-600/60"
      />
    </div>
  )
}

// ─── Task Block: Code ─────────────────────────────────────────────────────────
function CodeTaskBlock({ content, lang = 'go' }: { content: string; lang?: string }) {
  const question = content.split('\n')[0].replace(/^вопрос:\s*/, '')
  const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/)
  const [code, setCode] = useState(codeMatch?.[1] ?? '')

  return (
    <div className="my-4 rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
      <div className="text-[11px] uppercase tracking-wider text-[#FFD60A] font-semibold mb-3">
        {'<>'} Задание: написать код ({lang})
      </div>
      <p className="text-white font-medium mb-3 text-sm">{question}</p>
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        rows={10}
        spellCheck={false}
        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm text-green-300 font-mono resize-y outline-none focus:border-emerald-600/60"
      />
    </div>
  )
}

// ─── Lesson Preview ───────────────────────────────────────────────────────────
function LessonPreview({ content }: { content: string }) {
  return <LessonContentRenderer content={content} />
}

// ─── Choice Builder Modal ─────────────────────────────────────────────────────
interface ChoiceOption { text: string; correct: boolean }

interface FormBuilderValues {
  title: string
  body: string
  fieldLabel: string
  placeholder: string
  buttonLabel: string
  successText: string
  link: string
}

interface CodeSnippetValues {
  language: string
  title: string
  code: string
}

type ChatSide = 'left' | 'right'

interface ChatCharacter {
  key: string
  name: string
  avatar: string
  icon: string
}

interface ChatDialogLine {
  side: ChatSide
  speakerName: string
  characterKey: string
  text: string
}

const CHAT_CHARACTERS: ChatCharacter[] = [
  { key: 'teamlead', name: 'Тимлид', avatar: '/avatars/chat/teamlead.svg', icon: '👨‍💼' },
  { key: 'roma', name: 'Рома', avatar: '/avatars/chat/roma.svg', icon: '🙂' },
  { key: 'mentor', name: 'Ментор', avatar: '/avatars/chat/mentor.svg', icon: '🧑‍🏫' },
  { key: 'qa', name: 'QA', avatar: '/avatars/chat/qa.svg', icon: '🕵️' },
  { key: 'designer', name: 'Дизайнер', avatar: '/avatars/chat/designer.svg', icon: '🎨' },
  { key: 'analyst', name: 'Аналитик', avatar: '/avatars/chat/analyst.svg', icon: '📊' },
  { key: 'devops', name: 'DevOps', avatar: '/avatars/chat/devops.svg', icon: '⚙️' },
  { key: 'backend', name: 'Backend', avatar: '/avatars/chat/backend.svg', icon: '🧠' },
  { key: 'frontend', name: 'Frontend', avatar: '/avatars/chat/frontend.svg', icon: '✨' },
  { key: 'pm', name: 'PM', avatar: '/avatars/chat/pm.svg', icon: '📌' },
]

const CODE_LANG_OPTIONS = [
  { label: 'Go', value: 'go' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'JavaScript', value: 'js' },
  { label: 'JSON', value: 'json' },
  { label: 'Bash', value: 'bash' },
  { label: 'SQL', value: 'sql' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Text', value: 'text' },
]

function ChoiceBuilderModal({ onInsert, onClose }: {
  onInsert: (md: string) => void
  onClose: () => void
}) {
  const [question, setQuestion] = useState('Какой ответ правильный?')
  const [options, setOptions] = useState<ChoiceOption[]>([
    { text: 'Вариант A', correct: false },
    { text: 'Вариант B', correct: true },
    { text: 'Вариант C', correct: false },
    { text: 'Вариант D', correct: false },
  ])

  const addOpt    = () => setOptions(o => [...o, { text: 'Новый вариант', correct: false }])
  const removeOpt = (i: number) => setOptions(o => o.filter((_, j) => j !== i))
  const updateOpt = (i: number, text: string) => setOptions(o => o.map((x, j) => j === i ? { ...x, text } : x))
  const toggleOpt = (i: number) => setOptions(o => o.map((x, j) => j === i ? { ...x, correct: !x.correct } : x))

  const doInsert = () => {
    const opts = options.map(o => `- ${o.text}${o.correct ? ' ✓' : ''}`).join('\n')
    onInsert(`\n:::choice\nвопрос: ${question}\n${opts}\n:::\n`)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-[#13151c] border border-gray-700 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">☑ Вопрос с выбором ответа</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Текст вопроса</label>
          <input autoFocus value={question} onChange={e => setQuestion(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-purple-500" />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400">
            Варианты ответа — <span className="text-[#FFD60A]">зелёный = правильный</span> (студент не видит пока не ответит)
          </label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => toggleOpt(i)}
                title="Отметить как правильный"
                className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center border text-xs font-bold transition-colors ${
                  opt.correct
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-transparent hover:border-emerald-700'
                }`}
              >✓</button>
              <input value={opt.text} onChange={e => updateOpt(i, e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 outline-none focus:border-purple-500" />
              {options.length > 2 && (
                <button onClick={() => removeOpt(i)} className="text-gray-600 hover:text-red-400 w-5 text-center text-sm">✕</button>
              )}
            </div>
          ))}
          <button onClick={addOpt} className="text-xs text-purple-400 hover:text-purple-300 px-1 mt-1">+ Добавить вариант</button>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2">Отмена</button>
          <button onClick={doInsert} className="text-sm bg-purple-700 hover:bg-purple-600 text-white rounded-lg px-4 py-2 font-medium">Вставить блок</button>
        </div>
      </div>
    </div>
  )
}

function FormBuilderModal({ onInsert, onClose }: {
  onInsert: (md: string) => void
  onClose: () => void
}) {
  const [values, setValues] = useState<FormBuilderValues>({
    title: 'Подробнее об учёбе',
    body: 'Добавь сюда текст формы. Можно использовать markdown и списки.\n- ответим на вопросы\n- поможем выбрать программу',
    fieldLabel: 'Телефон',
    placeholder: '+7 (999) 999-99-99',
    buttonLabel: 'Хочу консультацию',
    successText: 'Спасибо! Мы получили заявку.',
    link: '',
  })

  const setField = (field: keyof FormBuilderValues, nextValue: string) => {
    setValues(current => ({ ...current, [field]: nextValue }))
  }

  const doInsert = () => {
    onInsert(
      `\n:::form\n` +
      `заголовок: ${values.title}\n` +
      `поле: ${values.fieldLabel}\n` +
      `placeholder: ${values.placeholder}\n` +
      `кнопка: ${values.buttonLabel}\n` +
      `успех: ${values.successText}\n` +
      `${values.link.trim() ? `ссылка: ${values.link.trim()}\n` : ''}` +
      `\n${values.body.trim()}\n:::\n`
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-[#13151c] border border-gray-700 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">📝 Блок с формой</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Заголовок</label>
            <input autoFocus value={values.title} onChange={e => setField('title', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Подпись поля</label>
            <input value={values.fieldLabel} onChange={e => setField('fieldLabel', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Placeholder</label>
            <input value={values.placeholder} onChange={e => setField('placeholder', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Текст кнопки</label>
            <input value={values.buttonLabel} onChange={e => setField('buttonLabel', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Текст после отправки</label>
          <input value={values.successText} onChange={e => setField('successText', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500" />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Ссылка после отправки (необязательно)</label>
          <input value={values.link} onChange={e => setField('link', e.target.value)} placeholder="https://example.com или https://t.me/user?text={value}" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500" />
          <p className="text-[11px] text-gray-500">Если указать {'{value}'}, введённый текст подставится в ссылку.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Основной текст блока</label>
          <textarea value={values.body} onChange={e => setField('body', e.target.value)} rows={6} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500 resize-y" />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2">Отмена</button>
          <button onClick={doInsert} className="text-sm bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg px-4 py-2 font-medium">Вставить блок</button>
        </div>
      </div>
    </div>
  )
}

function ChatBuilderModal({ onInsert, onClose }: {
  onInsert: (md: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('Сообщение из чата')
  const [channel, setChannel] = useState('#slack')
  const [time, setTime] = useState('09:42')
  const [characterKey, setCharacterKey] = useState('teamlead')
  const [text, setText] = useState('Привет, {{first_name}}! Есть короткая задача на сегодня.')

  const character = CHAT_CHARACTERS.find(c => c.key === characterKey) || CHAT_CHARACTERS[0]

  const doInsert = () => {
    onInsert(
      `\n:::chat\n` +
      `заголовок: ${title.trim() || 'Сообщение из чата'}\n` +
      `от: ${character.name}\n` +
      `аватар: ${character.key}\n` +
      `${channel.trim() ? `канал: ${channel.trim()}\n` : ''}` +
      `${time.trim() ? `время: ${time.trim()}\n` : ''}` +
      `\n${text.trim() || 'Сообщение'}\n:::\n`
    )
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-[#13151c] border border-gray-700 rounded-2xl p-6 w-full max-w-3xl space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">💬 Конструктор чата</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-400">Заголовок</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Время</label>
            <input value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-500" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Канал</label>
          <input value={channel} onChange={e => setChannel(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-500" />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400">Персонаж</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {CHAT_CHARACTERS.map(char => (
              <button
                key={char.key}
                type="button"
                onClick={() => setCharacterKey(char.key)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-xs transition-colors ${characterKey === char.key ? 'bg-indigo-900/50 border-indigo-500 text-indigo-100' : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500'}`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-700/60 bg-gray-950 text-[13px] leading-none">
                  {char.icon}
                </span>
                <span className="truncate">{char.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Текст сообщения</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={5} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-500 resize-y" />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2">Отмена</button>
          <button onClick={doInsert} className="text-sm bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium">Вставить чат</button>
        </div>
      </div>
    </div>
  )
}

function ChatDialogBuilderModal({ onInsert, onClose }: {
  onInsert: (md: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState('Новый тред')
  const [channel, setChannel] = useState('#onboarding')
  const [lines, setLines] = useState<ChatDialogLine[]>([
    { side: 'left', speakerName: 'Тимлид', characterKey: 'teamlead', text: 'Привет, {{first_name}}! Как прогресс?' },
    { side: 'right', speakerName: 'Я', characterKey: 'frontend', text: 'Отлично, уже закончил блок ✅' },
  ])

  const updateLine = (index: number, patch: Partial<ChatDialogLine>) => {
    setLines(prev => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  const addLine = () => {
    setLines(prev => [...prev, { side: 'left', speakerName: 'Новый персонаж', characterKey: 'mentor', text: '' }])
  }

  const removeLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index))
  }

  const doInsert = () => {
    const prepared = lines
      .map((line) => {
        const char = CHAT_CHARACTERS.find(c => c.key === line.characterKey)
        if (!char || !line.text.trim()) return null
        const speakerName = line.speakerName.trim() || char.name
        return `${line.side}|${speakerName}|${line.text.trim()}|avatar=${char.key}`
      })
      .filter(Boolean)
      .join('\n')

    if (!prepared) return

    onInsert(
      `\n:::chatdialog\n` +
      `заголовок: ${title.trim() || 'Новый тред'}\n` +
      `${channel.trim() ? `канал: ${channel.trim()}\n` : ''}` +
      `\n${prepared}\n:::\n`
    )
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-[#13151c] border border-gray-700 rounded-2xl p-6 w-full max-w-4xl space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">🧵 Конструктор диалога</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Заголовок</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-fuchsia-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Канал</label>
            <input value={channel} onChange={e => setChannel(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-fuchsia-500" />
          </div>
        </div>

        <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
          {lines.map((line, idx) => {
            const character = CHAT_CHARACTERS.find(c => c.key === line.characterKey) || CHAT_CHARACTERS[0]
            return (
              <div key={idx} className="rounded-xl border border-gray-700 bg-gray-900/70 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <select value={line.side} onChange={e => updateLine(idx, { side: e.target.value as ChatSide })} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200">
                    <option value="left">Слева</option>
                    <option value="right">Справа</option>
                  </select>

                  <input
                    value={line.speakerName}
                    onChange={e => updateLine(idx, { speakerName: e.target.value })}
                    placeholder="Я / Новый персонаж"
                    className="min-w-0 flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-1 text-xs text-gray-100 outline-none focus:border-fuchsia-500"
                  />

                  <select value={line.characterKey} onChange={e => updateLine(idx, { characterKey: e.target.value })} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200">
                    {CHAT_CHARACTERS.map(char => (
                      <option key={char.key} value={char.key}>{char.name}</option>
                    ))}
                  </select>

                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-700/60 bg-gray-950 text-[13px] leading-none">
                    {character.icon}
                  </span>
                  <span className="text-xs text-gray-400">{character.name}</span>

                  <button onClick={() => removeLine(idx)} disabled={lines.length <= 1} className="ml-auto text-xs text-red-400 hover:text-red-300 disabled:opacity-30">Удалить</button>
                </div>

                <textarea
                  value={line.text}
                  onChange={e => updateLine(idx, { text: e.target.value })}
                  rows={2}
                  placeholder="Текст реплики"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-fuchsia-500 resize-y"
                />
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button onClick={addLine} className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg px-3 py-2">+ Реплика</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2">Отмена</button>
            <button onClick={doInsert} className="text-sm bg-fuchsia-700 hover:bg-fuchsia-600 text-white rounded-lg px-4 py-2 font-medium">Вставить диалог</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Editor Component ────────────────────────────────────────────────────
export default function LessonEditor({
  value, onChange, onSave, saving, lessonTitle, onClose, secret = '',
}: LessonEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [editorFont, setEditorFont] = useState(() => {
    if (typeof window === 'undefined') return FONTS[8].value
    try {
      const stored = window.localStorage.getItem(EDITOR_FONT_STORAGE_KEY)
      if (stored && FONTS.some(f => f.value === stored)) return stored
    } catch {
      // no-op: localStorage may be unavailable
    }
    return FONTS[8].value
  })
  const [showImageModal, setShowImageModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showChoiceBuilder, setShowChoiceBuilder] = useState(false)
  const [showFormBuilder, setShowFormBuilder] = useState(false)
  const [showChatBuilder, setShowChatBuilder] = useState(false)
  const [showChatDialogBuilder, setShowChatDialogBuilder] = useState(false)
  const [showCodeSnippetModal, setShowCodeSnippetModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [templateCategory, setTemplateCategory] = useState<string>('Все')
  const [imgUrl, setImgUrl] = useState('')
  const [imgAlt, setImgAlt] = useState('')
  const [imgPreview, setImgPreview] = useState('')
  const [imgUploading, setImgUploading] = useState(false)
  const [imgAlign, setImgAlign] = useState<'left' | 'center' | 'right'>('center')
  const imgFileRef = useRef<HTMLInputElement>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [snippet, setSnippet] = useState<CodeSnippetValues>({
    language: 'go',
    title: '',
    code: 'func name() {\n  // тело функции\n}',
  })
  const [cursorLine, setCursorLine] = useState(1)
  const [cursorCol, setCursorCol]   = useState(1)
  // savedSel: last known selection before toolbar click took focus away
  const [savedSel, setSavedSel] = useState<[number, number]>([0, 0])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(EDITOR_FONT_STORAGE_KEY, editorFont)
    } catch {
      // no-op: localStorage may be unavailable
    }
  }, [editorFont])

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const charCount = value.length

  // Insert text around cursor — uses savedSel so toolbar buttons work after blur
  const insert = useCallback((before: string, after = '', placeholder = '') => {
    const ta = taRef.current
    if (!ta) return
    const s = savedSel[0]
    const e = savedSel[1]
    const sel = value.slice(s, e) || placeholder
    const next = value.slice(0, s) + before + sel + after + value.slice(e)
    onChange(next)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(s + before.length, s + before.length + sel.length)
    }, 0)
  }, [value, onChange, savedSel])

  // Heading — uses savedSel
  const heading = useCallback((level: number) => {
    const ta = taRef.current
    if (!ta) return
    const s = savedSel[0]
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const lineEnd = value.indexOf('\n', s)
    const line = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)
    const clean = line.replace(/^#{1,6}\s/, '')
    const prefix = '#'.repeat(level) + ' '
    const next = value.slice(0, lineStart) + prefix + clean + (lineEnd === -1 ? '' : value.slice(lineEnd))
    onChange(next)
    setTimeout(() => { ta.focus() }, 0)
  }, [value, onChange, savedSel])

  // Task blocks
  const insertTask = useCallback((type: TaskType) => {
    const ta = taRef.current
    const pos = ta?.selectionEnd ?? value.length
    onChange(value.slice(0, pos) + TASK_TEMPLATES[type] + value.slice(pos))
    setTimeout(() => { ta?.focus() }, 0)
  }, [value, onChange])

  const insertImage = () => {
    if (!imgUrl.trim()) return
    const ta = taRef.current
    const pos = ta?.selectionEnd ?? value.length
    const alt = imgAlt.trim() || 'изображение'
    const url = imgUrl.trim()
    const snippet = `\n<img src="${url}" alt="${alt}" data-align="${imgAlign}" />\n`
    onChange(value.slice(0, pos) + snippet + value.slice(pos))
    setShowImageModal(false); setImgUrl(''); setImgAlt(''); setImgPreview(''); setImgAlign('center')
    setTimeout(() => { ta?.focus() }, 0)
  }

  const handleImgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл больше 5MB')
      return
    }
    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    setImgPreview(localPreview)
    if (!imgAlt) setImgAlt(file.name.replace(/\.[^.]+$/, ''))
    // Upload to server
    setImgUploading(true)
    try {
      const url = await adminApi.uploadImage(secret, file)
      setImgUrl(url)
      setImgPreview(localPreview) // keep local preview
    } catch {
      alert('Ошибка загрузки. Попробуй ещё раз.')
      setImgPreview('')
    } finally {
      setImgUploading(false)
    }
  }

  const insertLink = () => {
    if (!linkUrl.trim()) return
    const ta = taRef.current
    const s = savedSel[0]
    const e = savedSel[1]
    const text = linkText.trim() || value.slice(s, e) || 'ссылка'
    const snippet = `[${text}](${linkUrl.trim()})`
    onChange(value.slice(0, s) + snippet + value.slice(e))
    setShowLinkModal(false); setLinkUrl(''); setLinkText('')
    setTimeout(() => { ta?.focus() }, 0)
  }

  const insertCodeSnippet = () => {
    const text = snippet.code.trimEnd()
    if (!text) return
    const ta = taRef.current
    const pos = savedSel[1]
    const titleLine = snippet.title.trim() ? `\n**${snippet.title.trim()}**\n` : '\n'
    const md = `${titleLine}\n\`\`\`${snippet.language}\n${text}\n\`\`\`\n`
    onChange(value.slice(0, pos) + md + value.slice(pos))
    setShowCodeSnippetModal(false)
    setTimeout(() => { ta?.focus() }, 0)
  }

  // Drag & drop image into editor
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл больше 5MB')
      return
    }
    const pos = taRef.current?.selectionEnd ?? value.length
    const placeholder = `\n![загрузка...]()\n`
    const withPlaceholder = value.slice(0, pos) + placeholder + value.slice(pos)
    onChange(withPlaceholder)
    try {
      const url = await adminApi.uploadImage(secret ?? '', file)
      const altText = file.name.replace(/\.[^.]+$/, '')
      const snippet = `\n![${altText}](${url})\n`
      onChange(withPlaceholder.replace(placeholder, snippet))
    } catch {
      onChange(withPlaceholder.replace(placeholder, ''))
      alert('Ошибка загрузки картинки')
    }
  }, [value, onChange, secret])

  // Track cursor position for status bar
  const handleCursorChange = () => {
    const ta = taRef.current
    if (!ta) return
    const before = ta.value.slice(0, ta.selectionStart)
    const lines = before.split('\n')
    setCursorLine(lines.length)
    setCursorCol(lines[lines.length - 1].length + 1)
  }

  // Keyboard shortcuts in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab → 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = taRef.current!
      const s = ta.selectionStart
      const next = value.slice(0, s) + '  ' + value.slice(s)
      onChange(next)
      setTimeout(() => { ta.setSelectionRange(s + 2, s + 2) }, 0)
      return
    }
    // Ctrl/Cmd+S → save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      onSave()
      return
    }
    // Ctrl/Cmd+B → bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      insert('**', '**', 'текст')
      return
    }
    // Ctrl/Cmd+I → italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault()
      insert('*', '*', 'текст')
      return
    }
    // Ctrl/Cmd+K → link
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      const ta = taRef.current
      if (ta) setLinkText(value.slice(ta.selectionStart, ta.selectionEnd))
      setShowLinkModal(true)
      return
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0f14]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 bg-[#13151c] border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#FFD60A] flex-shrink-0" />
          <span className="text-sm font-semibold text-white truncate">{lessonTitle}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
          <span className="hidden sm:inline">{wordCount} слов · {charCount} симв.</span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span className="font-mono">Стр {cursorLine}:{cursorCol}</span>
          <span className="text-gray-700 mx-1">|</span>
          <button
            onClick={onSave}
            disabled={saving}
            className="text-sm bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg px-4 py-1.5 font-medium"
          >
            {saving ? '...' : '⌘S Сохранить'}
          </button>
          <button
            onClick={onClose}
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-3 py-1.5"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1 px-4 py-2 bg-[#13151c]/80 border-b border-gray-800/60 flex-shrink-0">

        {/* Font */}
        <select
          value={editorFont}
          onChange={e => setEditorFont(e.target.value)}
          className="text-xs bg-gray-800 border border-gray-700/50 rounded-md px-2 py-1 text-gray-300 cursor-pointer mr-1"
          title="Шрифт редактора"
        >
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <div className="h-5 w-px bg-gray-700/60 mx-1" />

        {/* Headings */}
        <div className="flex gap-0.5">
          {[1,2,3,4,5,6].map(n => (
            <button key={n} onClick={() => heading(n)}
              className="text-[11px] font-bold bg-gray-800/70 hover:bg-gray-700 text-gray-300 rounded px-1.5 py-1 w-7"
              title={`Заголовок H${n}`}
            >H{n}</button>
          ))}
        </div>

        <div className="h-5 w-px bg-gray-700/60 mx-1" />

        {/* Inline formatting */}
        <div className="flex gap-0.5">
          <button onClick={() => insert('**', '**', 'текст')} title="Жирный (⌘B)" className="text-xs font-bold bg-gray-800/70 hover:bg-gray-700 text-white rounded px-2 py-1">B</button>
          <button onClick={() => insert('*', '*', 'текст')} title="Курсив (⌘I)" className="text-xs italic bg-gray-800/70 hover:bg-gray-700 text-gray-300 rounded px-2 py-1">I</button>
          <button onClick={() => insert('~~', '~~', 'текст')} title="Зачёркнутый" className="text-xs line-through bg-gray-800/70 hover:bg-gray-700 text-gray-400 rounded px-2 py-1">S</button>
            <button onClick={() => insert('<span style="font-weight:300">', '</span>', 'тонкий текст')} title="Тонкий текст" className="text-xs bg-gray-800/70 hover:bg-gray-700 text-gray-300 rounded px-2 py-1 font-light">T</button>
          <button onClick={() => insert('`', '`', 'код')} title="Инлайн-код" className="font-mono text-[11px] bg-gray-800/70 hover:bg-gray-700 text-[#FFD60A] rounded px-2 py-1">`x`</button>
          <button onClick={() => insert('\n```go\n', '\n```\n', '// код')} title="Блок кода" className="font-mono text-[11px] bg-gray-800/70 hover:bg-gray-700 text-[#FFD60A] rounded px-2 py-1">```</button>
        </div>

        <div className="h-5 w-px bg-gray-700/60 mx-1" />

        {/* Blocks */}
        <div className="flex gap-0.5">
          <button onClick={() => insert('\n- ', '', 'пункт')} title="Список" className="text-xs bg-gray-800/70 hover:bg-gray-700 text-gray-300 rounded px-2 py-1">• Список</button>
          <button onClick={() => insert('\n1. ', '', 'пункт')} title="Нумерованный" className="text-xs bg-gray-800/70 hover:bg-gray-700 text-gray-300 rounded px-2 py-1">1. Список</button>
          <button onClick={() => insert('\n> ', '', 'цитата')} title="Цитата" className="text-xs bg-gray-800/70 hover:bg-gray-700 text-gray-400 rounded px-2 py-1">&ldquo; Цитата</button>
          <button onClick={() => insert('\n---\n', '', '')} title="Горизонтальная линия" className="text-xs bg-gray-800/70 hover:bg-gray-700 text-gray-400 rounded px-2 py-1">― HR</button>
        </div>

        <div className="h-5 w-px bg-gray-700/60 mx-1" />

        {/* Media */}
        <div className="flex gap-0.5">
          <button onClick={() => setShowImageModal(true)} title="Вставить изображение" className="text-xs bg-gray-800/70 hover:bg-gray-700 text-gray-300 rounded px-2 py-1">🖼 Картинка</button>
          <button onClick={() => { setLinkText(value.slice(savedSel[0], savedSel[1])); setShowLinkModal(true) }} title="Вставить ссылку (⌘K)" className="text-xs bg-gray-800/70 hover:bg-gray-700 text-blue-300 rounded px-2 py-1">🔗 Ссылка</button>
          <button onClick={() => insert('', '', '{{user_name}}')} title="Подставить имя пользователя" className="text-xs bg-gray-800/70 hover:bg-gray-700 text-[#FFD60A] rounded px-2 py-1">👤 Имя</button>
          <button
            onClick={() => {
              const ta = taRef.current
              const selected = ta ? value.slice(ta.selectionStart, ta.selectionEnd) : ''
              if (selected.trim()) setSnippet(prev => ({ ...prev, code: selected }))
              setShowCodeSnippetModal(true)
            }}
            title="Вставить код в отдельном окне"
            className="text-xs bg-gray-800/70 hover:bg-gray-700 text-[#FFD60A] rounded px-2 py-1"
          >🧩 Код-окно</button>
        </div>

        <div className="h-5 w-px bg-gray-700/60 mx-1" />

        {/* Tasks */}
        <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">Задание:</span>
        <div className="flex gap-0.5">
          <button onClick={() => setShowChoiceBuilder(true)} className="text-xs bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 border border-purple-800/30 rounded px-2 py-1">☑ Выбор</button>
          <button onClick={() => insertTask('sort')}     className="text-xs bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-800/30 rounded px-2 py-1">↕ Порядок</button>
          <button onClick={() => insertTask('freetext')} className="text-xs bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-800/30 rounded px-2 py-1">✏ Текст</button>
          <button onClick={() => insertTask('code')}     className="text-xs bg-emerald-900/40 hover:bg-emerald-800/60 text-[#FFD60A] border border-emerald-800/30 rounded px-2 py-1">{'<>'} Go код</button>
          <button onClick={() => insertTask('interactive')} className="text-xs bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-800/30 rounded px-2 py-1">⚡ Интерактив</button>
          <button onClick={() => setShowFormBuilder(true)} className="text-xs bg-cyan-900/40 hover:bg-cyan-800/60 text-[#FFD60A] border border-cyan-800/30 rounded px-2 py-1">📝 Форма</button>
          <button onClick={() => insertTask('continue')} className="text-xs bg-zinc-900/70 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/70 rounded px-2 py-1">⤵ Продолжить</button>
          <button onClick={() => setShowChatBuilder(true)} className="text-xs bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 border border-indigo-800/30 rounded px-2 py-1">💬 Чат</button>
          <button onClick={() => setShowChatDialogBuilder(true)} className="text-xs bg-fuchsia-900/40 hover:bg-fuchsia-800/60 text-fuchsia-300 border border-fuchsia-800/30 rounded px-2 py-1">🧵 Диалог</button>
        </div>

        <div className="h-5 w-px bg-gray-700/60 mx-1" />

        {/* Templates */}
        <button
          onClick={() => setShowTemplatesModal(true)}
          className="text-xs bg-violet-900/40 hover:bg-violet-800/60 text-[#FFD60A] border border-violet-800/30 rounded px-2 py-1 font-medium"
        >
          📚 Шаблоны
        </button>
      </div>

      {/* ── Editor + Preview ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left — textarea */}
        <div
          className={`flex-1 flex flex-col border-r border-gray-800/50 min-w-0 relative`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex items-center justify-between px-5 py-1.5 bg-[#13151c]/60 border-b border-gray-800/40 flex-shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-gray-600 font-medium">Markdown</span>
            <span className="text-[10px] text-gray-700">Tab = 2 пробела · Перетащи картинку для вставки</span>
          </div>
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-cyan-500/10 border-2 border-dashed border-cyan-500 pointer-events-none" style={{ top: '32px' }}>
              <p className="text-[#FFD60A] text-sm font-semibold bg-[#0d0f14]/90 px-6 py-3 rounded-xl">Отпусти для вставки изображения 🖼</p>
            </div>
          )}
          <textarea
            ref={taRef}
            value={value}
            onChange={e => { onChange(e.target.value); handleCursorChange() }}
            onKeyDown={handleKeyDown}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            onBlur={() => { const ta = taRef.current; if (ta) setSavedSel([ta.selectionStart, ta.selectionEnd]) }}
            spellCheck={false}
            placeholder={'Начни писать урок...\n\nИспользуй тулбар или горячие клавиши:\n⌘B — жирный   ⌘I — курсив   ⌘K — ссылка   ⌘S — сохранить'}
            className="flex-1 bg-transparent text-gray-100 resize-none outline-none selection:bg-[#264f78] selection:text-[#d4d4d4]"
            style={{
              fontFamily: editorFont,
              fontSize: '15px',
              lineHeight: '1.9',
              padding: '28px 40px',
              tabSize: 2,
            }}
          />
        </div>

        {/* Right — preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-1.5 bg-[#13151c]/60 border-b border-gray-800/40 flex-shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-gray-600 font-medium">Предпросмотр</span>
          </div>
          <div className="flex-1 overflow-auto bg-[#0f1117]">
            <div
              className="max-w-2xl mx-auto px-10 py-10 text-[15px] leading-8 text-gray-100"
              style={{ fontFamily: editorFont }}
            >
              <LessonPreview content={value} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Image modal ── */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]" onClick={() => { setShowImageModal(false); setImgUrl(''); setImgAlt(''); setImgPreview(''); setImgAlign('center') }}>
          <div className="bg-[#13151c] border border-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold">🖼 Вставить изображение</h3>

            {/* File upload */}
            <div
              className="border-2 border-dashed border-gray-600 hover:border-cyan-500 rounded-xl p-4 text-center cursor-pointer transition-colors"
              onClick={() => imgFileRef.current?.click()}
            >
              {imgPreview ? (
                <div className="relative">
                  <img src={imgPreview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                  {imgUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <span className="text-white text-xs">Загрузка...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm space-y-1">
                  <div className="text-2xl">📁</div>
                  <div>Нажми чтобы выбрать файл</div>
                  <div className="text-xs text-gray-600">PNG, JPG, GIF, WebP — до 5MB</div>
                </div>
              )}
            </div>
            <input ref={imgFileRef} type="file" accept="image/*" className="hidden" onChange={handleImgFileChange} />

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-xs text-gray-600">или вставь URL</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">URL изображения</label>
              <input
                autoFocus={!imgPreview}
                value={imgPreview ? '' : imgUrl}
                onChange={e => { setImgUrl(e.target.value); setImgPreview('') }}
                onKeyDown={e => e.key === 'Enter' && insertImage()}
                placeholder="https://example.com/image.png"
                disabled={!!imgPreview}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500 disabled:opacity-40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Подпись (alt)</label>
              <input value={imgAlt} onChange={e => setImgAlt(e.target.value)} placeholder="Описание картинки"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500" />
            </div>

            {/* Alignment */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Выравнивание</label>
              <div className="flex gap-2">
                {([
                  { value: 'left',   label: '← Левый',  icon: '▤' },
                  { value: 'center', label: '↔ По центру', icon: '▥' },
                  { value: 'right',  label: 'Правый →', icon: '▦' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setImgAlign(opt.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      imgAlign === opt.value
                        ? 'bg-cyan-700 border-cyan-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => { setShowImageModal(false); setImgUrl(''); setImgAlt(''); setImgPreview(''); setImgAlign('center') }} className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2">Отмена</button>
              <button onClick={insertImage} disabled={(!imgUrl.trim() && !imgPreview) || imgUploading} className="text-sm bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white rounded-lg px-4 py-2 font-medium">{imgUploading ? 'Загрузка...' : 'Вставить'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Link modal ── */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]" onClick={() => setShowLinkModal(false)}>
          <div className="bg-[#13151c] border border-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold">🔗 Вставить ссылку</h3>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">URL *</label>
              <input autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && insertLink()}
                placeholder="https://example.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Текст ссылки {linkText && <span className="text-blue-400">(выделенный текст подставлен)</span>}</label>
              <input value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Читать подробнее"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-blue-500" />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowLinkModal(false)} className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2">Отмена</button>
              <button onClick={insertLink} className="text-sm bg-blue-700 hover:bg-blue-600 text-white rounded-lg px-4 py-2 font-medium">Вставить</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Code snippet modal ── */}
      {showCodeSnippetModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60]" onClick={() => setShowCodeSnippetModal(false)}>
          <div className="bg-[#13151c] border border-gray-700 rounded-2xl p-6 w-full max-w-4xl space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">🧩 Вставка кода отдельным блоком</h3>
              <button onClick={() => setShowCodeSnippetModal(false)} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Язык</label>
                <select
                  value={snippet.language}
                  onChange={e => setSnippet(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500"
                >
                  {CODE_LANG_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-gray-400">Подпись (необязательно)</label>
                <input
                  value={snippet.title}
                  onChange={e => setSnippet(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Например: Пример функции"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Код</label>
                <textarea
                  autoFocus
                  value={snippet.code}
                  onChange={e => setSnippet(prev => ({ ...prev, code: e.target.value }))}
                  rows={14}
                  spellCheck={false}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 font-mono resize-y outline-none focus:border-cyan-500 selection:bg-[#264f78] selection:text-[#d4d4d4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Как будет выглядеть</label>
                <div className="overflow-hidden rounded-2xl border border-[#2d333b] bg-[#0d1117]">
                  <div className="flex items-center justify-between border-b border-[#2d333b] bg-[#161b22] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#c9d1d9] text-sm">{'</>'}</span>
                      <span className="text-[#c9d1d9] font-semibold">{CODE_LANG_OPTIONS.find(x => x.value === snippet.language)?.label ?? 'Code'}</span>
                    </div>
                    <span className="text-[#8b949e] text-xs">копировать</span>
                  </div>
                  <pre className="m-0 overflow-x-auto px-4 py-4 text-[14px] leading-7 text-[#c9d1d9] selection:bg-[#264f78] selection:text-[#d4d4d4]">
                    <code className="font-mono whitespace-pre">{snippet.code || '// вставь код, чтобы увидеть превью'}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowCodeSnippetModal(false)} className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2">Отмена</button>
              <button onClick={insertCodeSnippet} disabled={!snippet.code.trim()} className="text-sm bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white rounded-lg px-4 py-2 font-medium">Вставить как блок кода</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Choice builder modal ── */}
      {showChoiceBuilder && (
        <ChoiceBuilderModal
          onClose={() => setShowChoiceBuilder(false)}
          onInsert={(md) => {
            const pos = savedSel[1]
            onChange(value.slice(0, pos) + md + value.slice(pos))
            setShowChoiceBuilder(false)
            setTimeout(() => { taRef.current?.focus() }, 0)
          }}
        />
      )}

      {showFormBuilder && (
        <FormBuilderModal
          onClose={() => setShowFormBuilder(false)}
          onInsert={(md) => {
            const pos = savedSel[1]
            onChange(value.slice(0, pos) + md + value.slice(pos))
            setShowFormBuilder(false)
            setTimeout(() => { taRef.current?.focus() }, 0)
          }}
        />
      )}

      {showChatBuilder && (
        <ChatBuilderModal
          onClose={() => setShowChatBuilder(false)}
          onInsert={(md) => {
            const pos = savedSel[1]
            onChange(value.slice(0, pos) + md + value.slice(pos))
            setShowChatBuilder(false)
            setTimeout(() => { taRef.current?.focus() }, 0)
          }}
        />
      )}

      {showChatDialogBuilder && (
        <ChatDialogBuilderModal
          onClose={() => setShowChatDialogBuilder(false)}
          onInsert={(md) => {
            const pos = savedSel[1]
            onChange(value.slice(0, pos) + md + value.slice(pos))
            setShowChatDialogBuilder(false)
            setTimeout(() => { taRef.current?.focus() }, 0)
          }}
        />
      )}

      {/* ── Templates modal ── */}
      {showTemplatesModal && (() => {
        const categories = ['Все', ...Array.from(new Set(PAGE_TEMPLATES.map(t => t.category)))]
        const filtered = templateCategory === 'Все' ? PAGE_TEMPLATES : PAGE_TEMPLATES.filter(t => t.category === templateCategory)
        return (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]"
            onClick={() => setShowTemplatesModal(false)}
          >
            <div
              className="bg-[#13151c] border border-gray-700 rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
                <div>
                  <h3 className="text-white font-semibold text-base">📚 Библиотека шаблонов</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Выбери шаблон — он заменит текущее содержимое редактора</p>
                </div>
                <button onClick={() => setShowTemplatesModal(false)} className="text-gray-500 hover:text-gray-300 text-lg">✕</button>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 px-6 py-3 border-b border-gray-800 flex-shrink-0 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTemplateCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      templateCategory === cat
                        ? 'bg-violet-700 border-violet-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Template grid */}
              <div className="overflow-y-auto flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      if (value.trim() && !confirm('Шаблон заменит текущее содержимое. Продолжить?')) return
                      onChange(tpl.content)
                      setShowTemplatesModal(false)
                      setTimeout(() => { taRef.current?.focus() }, 0)
                    }}
                    className="text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-violet-700/50 rounded-xl p-4 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-white group-hover:text-[#FFD60A] transition-colors">{tpl.name}</span>
                      <span className="text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full flex-shrink-0">{tpl.category}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{tpl.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

