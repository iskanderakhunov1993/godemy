'use client'

import { useState } from 'react'

interface Card {
  id: number
  q: string
  a: string
}

const ALL_CARDS: Card[] = [
  {
    id: 1,
    q: 'Что такое горутина и чем она отличается от потока ОС?',
    a: 'Горутина — лёгковесная единица конкурентного выполнения, управляемая рантаймом Go (планировщик M:N). Стек начинается ~2 КБ и растёт динамически. Можно запустить миллионы горутин при минимальных затратах памяти, тогда как поток ОС требует 1–8 МБ стека.',
  },
  {
    id: 2,
    q: 'Чем буферизованный канал отличается от небуферизованного?',
    a: 'Небуферизованный (make(chan T)) требует одновременного наличия отправителя и получателя — синхронная передача. Буферизованный (make(chan T, n)) имеет очередь: отправитель блокируется только когда буфер заполнен, получатель — только когда буфер пуст.',
  },
  {
    id: 3,
    q: 'Что такое интерфейс в Go и как он реализуется?',
    a: 'Интерфейс — набор сигнатур методов. Тип реализует интерфейс неявно, без ключевого слова implements. Под капотом значение интерфейса — пара (тип, указатель на данные). Это основа полиморфизма и тестирования через моки.',
  },
  {
    id: 4,
    q: 'Как работает defer в Go?',
    a: 'defer откладывает вызов функции до выхода из текущей функции. Вызовы накапливаются в стеке (LIFO). Выполняется даже при panic. Аргументы вычисляются в момент defer, а не при выполнении — важно для замыканий.',
  },
  {
    id: 5,
    q: 'Чем make отличается от new?',
    a: 'new(T) выделяет и обнуляет память, возвращает *T. make работает только для slice, map, channel: инициализирует внутренние структуры (длину, ёмкость, хеш-таблицу) и возвращает сам тип T, а не указатель.',
  },
  {
    id: 6,
    q: 'Что такое срез (slice) изнутри?',
    a: 'Срез — структура из трёх полей: указатель на базовый массив, len и cap. Несколько срезов могут разделять один массив. append создаёт новый массив при len > cap (обычно удваивает). Передача среза копирует заголовок, но не данные.',
  },
  {
    id: 7,
    q: 'Как обеспечить потокобезопасность при работе с map?',
    a: 'Встроенный map не thread-safe. Варианты: 1) sync.Mutex вокруг операций; 2) sync.RWMutex (быстрее при многих чтениях); 3) sync.Map — встроенная concurrent-safe карта, оптимальна когда ключи часто читаются, но редко меняются.',
  },
  {
    id: 8,
    q: 'Что такое panic и recover?',
    a: 'panic прерывает выполнение, раскручивает стек, выполняет все defer. recover внутри defer перехватывает panic и возвращает переданное ей значение. panic используют только для непредвиденных ситуаций — обычные ошибки возвращают через error.',
  },
  {
    id: 9,
    q: 'Как работает select в Go?',
    a: 'select ожидает сразу несколько каналов. Если несколько case готовы — выбирается случайный. Ветка default не блокирует. select — основной инструмент для таймаутов (time.After) и отмены (context.Done()).',
  },
  {
    id: 10,
    q: 'Что такое context в Go и зачем он нужен?',
    a: 'context.Context передаёт дедлайны, таймауты и сигнал отмены между горутинами. WithCancel — ручная отмена, WithTimeout / WithDeadline — автоматическая. Контекст всегда первый аргумент функции и не хранится в структурах.',
  },
  {
    id: 11,
    q: 'Pointer receiver vs value receiver — когда что использовать?',
    a: 'Pointer receiver (*T): метод меняет состояние, тип большой (дорого копировать), нужна согласованность набора методов. Value receiver (T): тип маленький и неизменяемый. Важно: если хотя бы один метод pointer-receiver — интерфейс реализуют только *T.',
  },
  {
    id: 12,
    q: 'Что такое embedding в Go?',
    a: 'Embedding — встраивание типа в структуру без имени поля. Методы и поля встроенного типа "прилетают" во внешнюю структуру. Это способ composition over inheritance. Можно встраивать интерфейсы — структура автоматически реализует встроенный интерфейс.',
  },
  {
    id: 13,
    q: 'Как работает sync.WaitGroup?',
    a: 'WaitGroup ждёт завершения группы горутин. Add(n) увеличивает счётчик. Done() (обычно defer) уменьшает. Wait() блокируется до обнуления. Ключевое: вызывать Add до запуска горутины, иначе Wait может завершиться раньше времени.',
  },
  {
    id: 14,
    q: 'Что такое замыкание (closure) и частая ошибка с ним в цикле?',
    a: 'Замыкание захватывает переменные из внешней области по ссылке. Ошибка: for i := 0; i < n; i++ { go func() { use(i) }() } — все горутины видят одно i на момент выполнения. Фикс: передавать i как аргумент функции: go func(i int) { use(i) }(i).',
  },
  {
    id: 15,
    q: 'Чем отличаются string и []byte в Go?',
    a: 'string — неизменяемая последовательность байт в UTF-8. []byte — изменяемый срез байт. Конвертация создаёт копию. Для эффективной конкатенации — strings.Builder. range по string итерирует по рунам (Unicode codepoints), range по []byte — по байтам.',
  },
  {
    id: 16,
    q: 'Как работает go mod?',
    a: 'go mod — система управления зависимостями (Go 1.11+). go.mod описывает модуль и версии зависимостей (semver), go.sum — хеши для проверки целостности. go mod tidy удаляет лишнее. GOPATH больше не нужен — код может быть в любом месте.',
  },
  {
    id: 17,
    q: 'Как тестировать код в Go?',
    a: 'Файлы тестов: *_test.go. Функция: func TestXxx(t *testing.T). Запуск: go test ./... Методы: t.Errorf, t.Fatalf, t.Run (подтесты). Table-driven tests — стандартный паттерн. Бенчмарки: func BenchmarkXxx(b *testing.B). Моки — через интерфейсы.',
  },
  {
    id: 18,
    q: 'Почему interface != nil не всегда означает, что значение не nil?',
    a: 'Интерфейс внутри — пара (тип, значение). Равен nil только если оба поля nil. Частая ошибка: var p *T = nil; var i I = p → i != nil, потому что поле типа установлено. Решение: возвращать nil интерфейс напрямую, а не (*T)(nil).',
  },
  {
    id: 19,
    q: 'Что такое Generics в Go и когда использовать?',
    a: 'Generics (Go 1.18+) — параметры типа: func Min[T constraints.Ordered](a, b T) T. Применять для обобщённых структур данных (стек, очередь), утилит над срезами/map. Не злоупотреблять — интерфейсы часто проще и понятнее.',
  },
  {
    id: 20,
    q: 'Как Go обнаруживает гонки данных (data races)?',
    a: 'Встроенный детектор: go test -race или go run -race. Гонка — два обращения к переменной без синхронизации, хотя бы одно на запись. Решения: sync.Mutex/RWMutex, sync/atomic, или передача через каналы ("share memory by communicating").',
  },
]

type CardStatus = 'new' | 'again' | 'learned'
type SessionStatus = Record<number, CardStatus>

const STORAGE_KEY = 'go-flashcards-v1'

function loadStatus(): SessionStatus {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

function saveStatus(s: SessionStatus) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue(s: SessionStatus) {
  const again = ALL_CARDS.filter(c => s[c.id] === 'again')
  const newCards = ALL_CARDS.filter(c => !s[c.id] || s[c.id] === 'new')
  return shuffle([...again, ...newCards])
}

export default function FlashcardsTab() {
  const [status, setStatus] = useState<SessionStatus>(() => loadStatus())
  const [queue, setQueue] = useState<Card[]>(() => buildQueue(loadStatus()))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionDone, setSessionDone] = useState(() => buildQueue(loadStatus()).length === 0)

  const currentCard = queue[currentIdx]
  const learnedCount = ALL_CARDS.filter(c => status[c.id] === 'learned').length
  const againCount = ALL_CARDS.filter(c => status[c.id] === 'again').length
  const remaining = queue.length - currentIdx

  const advance = (newStatus: CardStatus) => {
    if (!currentCard) return
    const updated = { ...status, [currentCard.id]: newStatus }
    setStatus(updated)
    saveStatus(updated)
    setShowAnswer(false)
    if (currentIdx + 1 >= queue.length) {
      // Check if there are "again" cards remaining
      const hasAgain = ALL_CARDS.some(c => updated[c.id] === 'again')
      if (hasAgain) {
        const newQueue = shuffle(ALL_CARDS.filter(c => updated[c.id] === 'again'))
        setQueue(newQueue)
        setCurrentIdx(0)
      } else {
        setSessionDone(true)
      }
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  const handleRepeat = () => advance('again')
  const handleLearned = () => advance('learned')

  const resetAll = () => {
    const fresh: SessionStatus = {}
    setStatus(fresh)
    saveStatus(fresh)
    const q = buildQueue(fresh)
    setQueue(q)
    setCurrentIdx(0)
    setShowAnswer(false)
    setSessionDone(false)
  }

  // Session done
  if (sessionDone) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-3">Раунд завершён!</h2>
        <p className="text-gray-400 mb-8">Выучено карточек: <span className="text-emerald-400 font-bold">{learnedCount}</span> из {ALL_CARDS.length}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {learnedCount < ALL_CARDS.length && (
            <button
              onClick={() => {
                const q = buildQueue(status)
                setQueue(q)
                setCurrentIdx(0)
                setShowAnswer(false)
                setSessionDone(q.length === 0)
              }}
              className="btn-primary"
            >
              Повторить оставшиеся
            </button>
          )}
          <button onClick={resetAll} className="btn-secondary">
            Начать заново
          </button>
        </div>
      </div>
    )
  }

  if (!currentCard) return null

  const cardNum = ALL_CARDS.findIndex(c => c.id === currentCard.id) + 1

  return (
    <div className="max-w-xl mx-auto py-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>Вопрос {cardNum} из {ALL_CARDS.length}</span>
        <div className="flex items-center gap-4">
          {learnedCount > 0 && <span className="text-emerald-400">✓ {learnedCount} выучено</span>}
          {againCount > 0 && <span className="text-amber-400">↺ {againCount} повторить</span>}
          <span>Осталось: {remaining}</span>
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6">
        <div
          className="bg-cyan-500 h-1.5 rounded-full transition-all"
          style={{ width: `${(learnedCount / ALL_CARDS.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
        {/* Question */}
        <div className="p-6 border-b border-gray-800">
          <div className="text-xs text-gray-500 mb-3 font-mono">ВОПРОС #{cardNum}</div>
          <p className="text-white text-xl font-semibold leading-relaxed">{currentCard.q}</p>
        </div>

        {/* Answer area */}
        <div className="p-6">
          {!showAnswer ? (
            <div className="text-center">
              <button
                onClick={() => setShowAnswer(true)}
                className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:border-cyan-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Посмотреть ответ
              </button>
            </div>
          ) : (
            <div>
              <div className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Образцовый ответ</div>
              <p className="text-gray-300 leading-relaxed text-sm mb-6">{currentCard.a}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleRepeat}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:border-amber-500 hover:text-amber-400 transition-colors font-medium"
                >
                  <span className="text-lg">↺</span>
                  Повторить позже
                </button>
                <button
                  onClick={handleLearned}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 transition-colors font-medium"
                >
                  <span className="text-lg">✓</span>
                  Отметить выученным
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skip link */}
      <div className="text-center mt-4">
        <button
          onClick={resetAll}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Сбросить прогресс
        </button>
      </div>
    </div>
  )
}
