import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Bootcamp Go: Junior, Middle, Senior | Godemy',
  description: 'Практическая подписка для роста Go-разработчика: проекты, задачи, проверка навыков и сертификаты уровней Junior, Middle и Senior.',
}

const levels = [
  {
    number: '01',
    name: 'Junior',
    promise: 'Собирай рабочие backend-сервисы самостоятельно',
    projects: ['Сервис авторизации', 'REST API с PostgreSQL', 'Проект с тестами и Docker'],
    skills: ['HTTP', 'SQL', 'JWT', 'Docker', 'Testing'],
    status: 'Начни здесь',
    accent: 'cyan',
  },
  {
    number: '02',
    name: 'Middle',
    promise: 'Проектируй устойчивые сервисы и работай со сложностью',
    projects: ['Сервис с Redis и очередью', 'Микросервисное взаимодействие', 'Production CI/CD'],
    skills: ['Architecture', 'Redis', 'Queues', 'gRPC', 'CI/CD'],
    status: 'После Junior',
    accent: 'violet',
  },
  {
    number: '03',
    name: 'Senior',
    promise: 'Принимай архитектурные решения для нагруженных систем',
    projects: ['Highload-сервис', 'System Design кейс', 'Performance-аудит'],
    skills: ['Highload', 'Security', 'Kubernetes', 'Performance', 'Leadership'],
    status: 'После Middle',
    accent: 'amber',
  },
]

const included = [
  ['Проекты', 'Практические задания с понятным результатом для портфолио.'],
  ['Тренажёр', 'Дополнительные задачи по темам каждого уровня.'],
  ['Проверка навыков', 'Уровень завершается не просмотром, а выполненной работой.'],
  ['Сертификаты', 'PDF-сертификат включён после выполнения требований уровня.'],
]

const fitChecks = [
  'Ты уже прошёл бесплатный путь и хочешь не “ещё уроков”, а рост до рабочего уровня.',
  'Тебе нужен следующий слой сложности: архитектура, интеграции, production-мышление.',
  'Ты хочешь собирать проекты, которые уже можно показывать как взрослую работу.',
]

const notFitChecks = [
  'Если ты ещё не прошёл бесплатные 3 проекта, сначала лучше идти через них.',
  'Если нужен только “вводный старт”, подписка будет преждевременной.',
  'Если не хочется много практики и длинных задач, формат Bootcamp покажется тяжёлым.',
]

export default function BootcampPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute left-1/2 top-0 h-96 w-[720px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300">
            Godemy Pro · одна подписка
          </span>
          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black leading-tight text-white sm:text-6xl">
            Понятный апгрейд после бесплатного курса
            <span className="block text-violet-400">от Junior до Senior через практику</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            Бесплатный курс доказывает, что тебе заходит backend-путь. Bootcamp начинается после него:
            больше глубины, длиннее проекты, взрослее инженерные решения и один последовательный маршрут роста.
          </p>
          <div className="mx-auto mt-8 grid max-w-4xl gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="text-[11px] uppercase tracking-[0.24em] text-violet-300">После базы</p>
              <p className="mt-2 text-sm font-semibold text-white">Не для старта, а для роста</p>
              <p className="mt-2 text-sm leading-6 text-gray-400">Сначала человек проходит 3 бесплатных проекта и только потом понимает, нужен ли ему Pro-слой.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="text-[11px] uppercase tracking-[0.24em] text-violet-300">Одна подписка</p>
              <p className="mt-2 text-sm font-semibold text-white">Без дробления на пакеты</p>
              <p className="mt-2 text-sm leading-6 text-gray-400">Один доступ ко всем уровням, тренажёру Pro, проектам и сертификатам.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="text-[11px] uppercase tracking-[0.24em] text-violet-300">Логика продукта</p>
              <p className="mt-2 text-sm font-semibold text-white">Junior → Middle → Senior</p>
              <p className="mt-2 text-sm leading-6 text-gray-400">Каждый следующий уровень открывается после подтверждения предыдущего.</p>
            </div>
          </div>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/bootcamp/buy" className="rounded-xl bg-violet-500 px-7 py-3.5 font-bold text-white transition-colors hover:bg-violet-400">
              Получить доступ →
            </Link>
            <Link href="/guide" className="btn-secondary px-7 py-3.5">
              Сначала пройти бесплатно
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400">Три уровня мастерства</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Один маршрут, а не хаос из десятка курсов</h2>
          <p className="mt-4 text-gray-400">Пользователь видит только ближайшую цель и не тонет в выборе. Это делает продукт проще и понятнее.</p>
        </div>

        <div className="space-y-5">
          {levels.map((level) => {
            const accent = {
              cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300',
              violet: 'border-violet-500/30 bg-violet-500/5 text-violet-300',
              amber: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
            }[level.accent]

            return (
              <article key={level.name} className={`rounded-3xl border p-6 sm:p-8 ${accent}`}>
                <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm opacity-60">{level.number}</span>
                      <span className="rounded-full border border-current/20 px-3 py-1 text-xs font-semibold">{level.status}</span>
                    </div>
                    <h3 className="mt-8 text-4xl font-black text-white">{level.name}</h3>
                    <p className="mt-3 text-gray-400">{level.promise}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {level.skills.map((skill) => (
                        <span key={skill} className="rounded-lg border border-gray-700 bg-gray-950/50 px-2.5 py-1 text-xs font-mono text-gray-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Проекты уровня</p>
                    <div className="space-y-3">
                      {level.projects.map((project, index) => (
                        <div key={project} className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-800 text-xs font-bold text-gray-400">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-200">{project}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-white">Что входит в подписку</h2>
            <p className="mt-3 text-gray-400">Без скрытых доплат за сертификаты или отдельные куски программы.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {included.map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-300">✓</span>
                <h3 className="mt-5 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Кому подходит</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-gray-300">
              {fitChecks.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-emerald-300">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Кому пока рано</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-gray-300">
              {notFitChecks.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-amber-300">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/guide" className="mt-6 inline-flex text-sm font-semibold text-amber-200 hover:text-white">
              Сначала пройти бесплатный путь →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <div className="rounded-[32px] border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-8 sm:p-12">
          <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-300">Godemy Pro</p>
              <h2 className="mt-3 text-3xl font-black text-white">Один доступ ко всему пути роста</h2>
              <p className="mt-3 text-gray-400">Junior, Middle, Senior, проекты, тренажёр Pro и сертификаты — в одной подписке без лишних решений.</p>
            </div>
            <Link href="/bootcamp/buy" className="rounded-xl bg-violet-500 px-7 py-3.5 text-center font-bold text-white transition-colors hover:bg-violet-400">
              Выбрать подписку →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
