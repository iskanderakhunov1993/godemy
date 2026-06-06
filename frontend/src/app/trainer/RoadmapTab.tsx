'use client'

type NodeLevel = 'start' | 'beginner' | 'intermediate' | 'advanced'

interface RoadmapNode {
  title: string
  icon: string
  level: NodeLevel
  items: string[]
  done?: boolean
}

const roadmap: RoadmapNode[] = [
  {
    title: 'Начало пути',
    icon: '🚀',
    level: 'start',
    items: ['Установка Go и настройка среды', 'Hello World / go run / go build', 'Структура проекта', 'go fmt / gofmt'],
  },
  {
    title: 'Основы языка',
    icon: '📦',
    level: 'beginner',
    items: ['Переменные, константы, типы', 'Функции и возврат нескольких значений', 'if / for / switch / range', 'Пакеты и импорты', 'init() функции'],
  },
  {
    title: 'Структуры данных',
    icon: '🗂️',
    level: 'beginner',
    items: ['Arrays и Slices (append, copy, cap)', 'Maps (создание, итерация, удаление)', 'Structs и встроенные методы', 'Pointers (& и *)'],
  },
  {
    title: 'ООП в Go',
    icon: '🔌',
    level: 'beginner',
    items: ['Методы (value vs pointer receiver)', 'Интерфейсы и неявная реализация', 'Embedding (composition)', 'Type assertion и type switch'],
  },
  {
    title: 'Обработка ошибок',
    icon: '⚠️',
    level: 'intermediate',
    items: ['error interface', 'fmt.Errorf / errors.As / errors.Is', 'panic и recover', 'defer (LIFO, захват аргументов)'],
  },
  {
    title: 'Конкурентность',
    icon: '⚡',
    level: 'intermediate',
    items: ['Goroutines (go keyword)', 'Channels (буфер, направление)', 'select statement', 'sync.Mutex / RWMutex / WaitGroup', 'context (withCancel, withTimeout)', 'sync/atomic, sync.Once'],
  },
  {
    title: 'Стандартная библиотека',
    icon: '📚',
    level: 'intermediate',
    items: ['fmt, strings, strconv, unicode', 'io, os, bufio, filepath', 'time, math/rand', 'sort, slices (Go 1.21+)'],
  },
  {
    title: 'Сеть и JSON',
    icon: '🌐',
    level: 'intermediate',
    items: ['net/http (клиент и сервер)', 'Роутинг и middleware', 'encoding/json (Marshal/Unmarshal)', 'http.Client, timeouts, retry'],
  },
  {
    title: 'Инструменты Go',
    icon: '🛠️',
    level: 'intermediate',
    items: ['go mod и go.sum', 'go test, t.Run, Table-driven tests', 'go vet, staticcheck, golangci-lint', 'go generate, stringer'],
  },
  {
    title: 'Продвинутые темы',
    icon: '🧠',
    level: 'advanced',
    items: ['Generics (type parameters, constraints)', 'Рефлексия (reflect.Type / Value)', 'Unsafe pointer', 'Профилирование (pprof, trace)'],
  },
  {
    title: 'Backend разработка',
    icon: '🏗️',
    level: 'advanced',
    items: ['REST API (gin / chi / stdlib)', 'gRPC и Protocol Buffers', 'Работа с БД: database/sql, sqlx, gorm', 'Migrations (goose, golang-migrate)'],
  },
  {
    title: 'Production',
    icon: '🏆',
    level: 'advanced',
    items: ['Docker + multi-stage build', 'Graceful shutdown', 'Structured logging (slog / zap)', 'Metrics (prometheus), Tracing (otel)'],
  },
]

const levelConfig: Record<NodeLevel, { border: string; badge: string; badgeText: string }> = {
  start:        { border: 'border-cyan-500',   badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',   badgeText: 'Старт' },
  beginner:     { border: 'border-blue-500',   badge: 'bg-blue-500/20 text-blue-400 border-blue-500/40',   badgeText: 'Новичок' },
  intermediate: { border: 'border-violet-500', badge: 'bg-violet-500/20 text-violet-400 border-violet-500/40', badgeText: 'Средний' },
  advanced:     { border: 'border-rose-500',   badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',   badgeText: 'Продвинутый' },
}

const connectorColor: Record<NodeLevel, string> = {
  start: 'bg-cyan-500/40',
  beginner: 'bg-blue-500/40',
  intermediate: 'bg-violet-500/40',
  advanced: 'bg-rose-500/40',
}

export default function RoadmapTab() {
  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-10">
        {(Object.entries(levelConfig) as [NodeLevel, typeof levelConfig[NodeLevel]][]).map(([level, cfg]) => (
          <span key={level} className={`text-xs font-medium px-3 py-1 rounded-full border ${cfg.badge}`}>
            {cfg.badgeText}
          </span>
        ))}
      </div>

      {/* Nodes */}
      <div className="relative">
        {roadmap.map((node, idx) => {
          const cfg = levelConfig[node.level]
          const isLast = idx === roadmap.length - 1
          return (
            <div key={node.title} className="relative">
              {/* Node card */}
              <div className={`bg-gray-900 border-2 ${cfg.border} rounded-2xl p-5 relative`}>
                {/* Badge */}
                <span className={`absolute -top-3 left-5 text-xs font-semibold px-3 py-0.5 rounded-full border ${cfg.badge}`}>
                  {cfg.badgeText}
                </span>

                <div className="flex items-start gap-3 mt-1">
                  <span className="text-2xl flex-shrink-0">{node.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base mb-3">{node.title}</h3>
                    <ul className="space-y-1.5">
                      {node.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex flex-col items-center my-1">
                  <div className={`w-0.5 h-6 ${connectorColor[node.level]}`} />
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-600" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 text-center text-xs text-gray-600">
        Роадмап составлен на основе реальных требований к Go-разработчикам
      </div>
    </div>
  )
}
