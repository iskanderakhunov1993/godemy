import Link from 'next/link'

const sprints = [
  { label: 'Sprint 0: IT контекст, Agile, роли и карьера Go специалиста', free: false },
  { label: 'Sprint 1: Todo List API (roadmap.sh)', free: false },
  { label: 'Sprint 2: Blogging Platform API (roadmap.sh)', free: false },
  { label: 'Sprint 3: Weather API Wrapper Service (roadmap.sh)', free: false },
  { label: 'Sprint 4: Expense Tracker API (roadmap.sh)', free: false },
  { label: 'Sprint 5: GitHub User Activity CLI/API (roadmap.sh)', free: false },
]

export default function JuniorModulePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
          Bootcamp Junior
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Junior Module</h1>
        <p className="text-gray-400 max-w-2xl">
          Нулевая неделя + 5 спринтов = 5 реальных Go-проектов для резюме. Доступ входит в подписку Godemy Pro.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Link
          href="/junior/guide"
          className="card hover:bg-gray-800 transition-colors border-cyan-500/20"
        >
          <div className="text-cyan-400 text-sm mb-2">Junior • Курс</div>
          <h2 className="text-2xl font-semibold text-white mb-2">Курс Junior</h2>
          <p className="text-gray-400 mb-4">
            Пошаговые уроки для уверенного старта в Go на уровне junior-разработчика.
          </p>
          <span className="text-cyan-400">Открыть курс →</span>
        </Link>

        <Link
          href="/junior/trainer"
          className="card hover:bg-gray-800 transition-colors border-cyan-500/20"
        >
          <div className="text-cyan-400 text-sm mb-2">Junior • Тренажёр</div>
          <h2 className="text-2xl font-semibold text-white mb-2">Тренажёр Junior</h2>
          <p className="text-gray-400 mb-4">
            Практические задачи уровня junior с автопроверкой и подсказками.
          </p>
          <span className="text-cyan-400">Открыть тренажёр →</span>
        </Link>
      </div>

      <div className="mt-8 card">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <h3 className="text-xl font-semibold text-white">Программа Bootcamp Junior</h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Уровень 1 из 3
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm mb-5">
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">Теория: 10-20%</div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">Практика: 80-90%</div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">На спринт: 5 примеров + 2 задачи</div>
        </div>
        <ul className="space-y-2 mb-6">
          {sprints.map((s, i) => (
            <li key={s.label} className={`flex items-center gap-3 ${s.free ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                s.free
                  ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                  : 'bg-gray-800 border border-gray-700 text-gray-600'
              }`}>
                {s.free ? i + 1 : '🔒'}
              </span>
              <span className="flex-1">{s.label}</span>
              <span className="text-xs text-violet-300 font-semibold">Godemy Pro</span>
            </li>
          ))}
        </ul>

        {/* Buy CTA */}
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold mb-1">Все 5 проектов уже доступны</p>
            <p className="text-gray-400 text-sm">Авто-проверка кода · Задачи · Сертификат Junior</p>
          </div>
          <a
            href="https://t.me/golangacademy"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap text-sm"
          >
            Поддержка в Telegram →
          </a>
        </div>
      </div>
    </div>
  )
}
