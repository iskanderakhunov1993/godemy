import Link from 'next/link'
import ContinueBanner from '@/components/ContinueBanner'

const freeProjects = [
  {
    number: '01',
    title: 'Консольный трекер задач',
    result: 'Освоишь синтаксис, функции, структуры и работу с файлами.',
    stack: ['Go', 'CLI', 'JSON'],
  },
  {
    number: '02',
    title: 'REST API для заметок',
    result: 'Разберёшься с HTTP, роутами, валидацией и обработкой ошибок.',
    stack: ['REST', 'HTTP', 'CRUD'],
  },
  {
    number: '03',
    title: 'Сервис с PostgreSQL',
    result: 'Подключишь базу данных и соберёшь первый полноценный backend.',
    stack: ['PostgreSQL', 'SQL', 'Docker'],
  },
]

const levels = [
  {
    level: 'Junior',
    subtitle: 'Научись собирать рабочие сервисы',
    topics: ['REST API', 'PostgreSQL', 'JWT', 'Docker', 'Тесты'],
    color: 'cyan',
  },
  {
    level: 'Middle',
    subtitle: 'Научись проектировать и масштабировать',
    topics: ['Архитектура', 'Redis', 'Очереди', 'CI/CD', 'Concurrency'],
    color: 'violet',
  },
  {
    level: 'Senior',
    subtitle: 'Научись принимать системные решения',
    topics: ['Highload', 'Безопасность', 'System Design', 'Kubernetes', 'Performance'],
    color: 'amber',
  },
]

const steps = [
  ['Изучи тему', 'Короткая теория и примеры без длинных лекций.'],
  ['Закрепи в тренажёре', 'Пиши код и сразу получай результат проверки.'],
  ['Собери проект', 'Применяй навыки в задаче, похожей на реальную работу.'],
  ['Подтверди уровень', 'Заверши обязательные задания и получи сертификат.'],
]

export default function Home() {
  return (
    <main>
      <ContinueBanner />

      <section className="relative overflow-hidden border-b border-gray-800/70">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-64 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-violet-500/8 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Первый путь и 3 проекта — бесплатно
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl">
                Научись Go,
                <span className="block text-cyan-400">создавая продукты</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
                Начни с бесплатного курса, закрепляй знания в тренажёре и собери три проекта.
                Когда будешь готов расти дальше — переходи в Bootcamp.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/guide" className="btn-primary px-7 py-3.5 text-base">
                  Начать бесплатно →
                </Link>
                <Link href="/start" className="btn-secondary px-7 py-3.5 text-base">
                  Посмотреть путь
                </Link>
              </div>
              <p className="mt-5 text-sm text-gray-500">
                Не нужна карта · Можно начать без регистрации · Прогресс сохраняется в аккаунте
              </p>
            </div>

            <div className="rounded-3xl border border-gray-700/70 bg-gray-900/85 p-5 shadow-2xl shadow-cyan-950/20">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Твой маршрут</p>
                  <p className="mt-1 font-semibold text-white">От первого урока до Go-разработчика</p>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">Практика</span>
              </div>
              <div className="space-y-3">
                {[
                  ['1', 'Бесплатный курс', 'Основы Go и 3 проекта', 'Открыт'],
                  ['2', 'Тренажёр', 'Задачи и подготовка к интервью', 'Открыт'],
                  ['3', 'Bootcamp', 'Junior → Middle → Senior', 'По подписке'],
                  ['4', 'Сертификаты', 'За подтверждённые навыки', 'Включены'],
                ].map(([number, title, desc, badge], index) => (
                  <div key={title} className="flex items-center gap-4 rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${
                      index < 2 ? 'bg-cyan-500 text-gray-950' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-100">{title}</p>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                    <span className="hidden rounded-full border border-gray-700 px-2.5 py-1 text-[11px] text-gray-400 sm:block">
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">Бесплатный старт</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Не просто посмотри курс — собери три проекта</h2>
          <p className="mt-4 text-gray-400">
            Бесплатная часть даёт законченный результат: основы языка, практика и первые работы для GitHub.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {freeProjects.map((project) => (
            <article key={project.number} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-7 flex items-center justify-between">
                <span className="font-mono text-3xl font-black text-cyan-500/50">{project.number}</span>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Бесплатно
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{project.title}</h3>
              <p className="mt-3 min-h-16 text-sm leading-relaxed text-gray-400">{project.result}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <span key={item} className="rounded-lg bg-gray-800 px-2.5 py-1 text-xs font-mono text-gray-400">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/guide" className="btn-primary inline-flex px-6 py-3">
            Начать первый проект →
          </Link>
        </div>
      </section>

      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-violet-400">Тренажёр остаётся с тобой</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Понимать мало. Нужно уметь написать код самому.</h2>
            <p className="mt-5 leading-relaxed text-gray-400">
              Тренажёр — отдельная рабочая зона для практики: задачи по синтаксису, алгоритмам,
              собеседованиям, карточки и понятная карта развития.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-gray-300">
              {['Запуск Go-кода прямо в браузере', 'Мгновенная проверка и подсказки', 'Задачи по темам и уровням сложности'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-xs text-violet-300">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/trainer" className="mt-8 inline-flex rounded-xl bg-violet-500 px-6 py-3 font-bold text-white transition-colors hover:bg-violet-400">
              Открыть тренажёр →
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-700 bg-gray-950 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-gray-800 px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-amber-500/70" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs font-mono text-gray-500">main.go</span>
              <span className="ml-auto rounded bg-cyan-500/10 px-2 py-1 text-xs font-mono text-cyan-300">Go 1.22</span>
            </div>
            <div className="grid min-h-72 sm:grid-cols-2">
              <div className="border-b border-gray-800 p-6 sm:border-b-0 sm:border-r">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Задача</p>
                <h3 className="mt-3 font-bold text-white">Безопасный счётчик</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  Запусти несколько горутин и безопасно посчитай результат без гонки данных.
                </p>
                <div className="mt-5 rounded-xl bg-gray-900 p-3 text-xs font-mono text-emerald-300">
                  expected: Count: 1000
                </div>
              </div>
              <pre className="overflow-hidden p-6 text-sm leading-7 text-gray-300">
                <span className="text-blue-400">func</span> <span className="text-cyan-300">main</span>() {'{'}{'\n'}
                {'  '}<span className="text-blue-400">var</span> counter int{'\n'}
                {'  '}<span className="text-blue-400">var</span> wg sync.WaitGroup{'\n\n'}
                {'  '}<span className="text-gray-600">{'// твой код'}</span>{'\n\n'}
                {'  '}fmt.Println(counter){'\n'}
                {'}'}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-amber-400">Godemy Pro</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Bootcamp — когда готов превратить знания в профессию</h2>
            <p className="mt-4 text-gray-400">Одна подписка. Три последовательных уровня. Никакой путаницы с тарифами.</p>
          </div>
          <Link href="/bootcamp" className="btn-secondary shrink-0 px-5 py-3">
            Подробнее о Bootcamp →
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {levels.map((item, index) => {
            const styles = {
              cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300',
              violet: 'border-violet-500/30 bg-violet-500/5 text-violet-300',
              amber: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
            }[item.color]

            return (
              <article key={item.level} className={`rounded-3xl border p-6 ${styles}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Уровень {index + 1}</span>
                  <span className="font-mono text-sm opacity-60">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-3xl font-black text-white">{item.level}</h3>
                <p className="mt-2 min-h-12 text-sm text-gray-400">{item.subtitle}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.topics.map((topic) => (
                    <span key={topic} className="rounded-lg border border-gray-700/70 bg-gray-950/50 px-2.5 py-1 text-xs text-gray-400">
                      {topic}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">Простой учебный цикл</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Всегда понятно, что делать дальше</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {steps.map(([title, desc], index) => (
              <div key={title} className="relative rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
                <span className="text-sm font-black text-cyan-400">0{index + 1}</span>
                <h3 className="mt-5 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <div className="rounded-[32px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-gray-900 to-violet-500/10 px-6 py-14 sm:px-12">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Начни с одного урока. Бесплатно.</h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            Не нужно заранее решать, станешь ли ты разработчиком. Собери первый проект и реши на основе результата.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/guide" className="btn-primary px-7 py-3.5">
              Начать курс →
            </Link>
            <Link href="/auth/register" className="btn-secondary px-7 py-3.5">
              Создать аккаунт
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
