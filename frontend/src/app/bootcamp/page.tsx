import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Bootcamp Go: Junior, Middle, Senior | Godemy',
  description: 'Практическая подписка для роста Go-разработчика: проекты, задачи, проверка навыков и сертификаты уровней Junior, Middle и Senior.',
}

const levels = [
  {
    title: 'Junior',
    description: 'Собираешь рабочие backend-сервисы и начинаешь уверенно делать типовые продуктовые задачи.',
    bullets: ['REST API', 'PostgreSQL', 'JWT', 'Docker', 'Тестирование'],
  },
  {
    title: 'Middle',
    description: 'Учишься проектировать сервисы, разбирать сложность и работать с реальными интеграциями.',
    bullets: ['Redis', 'Очереди', 'gRPC', 'CI/CD', 'Архитектура'],
  },
  {
    title: 'Senior',
    description: 'Фокусируешься на системных решениях, производительности, безопасности и масштабе.',
    bullets: ['Highload', 'Security', 'System Design', 'Kubernetes', 'Performance'],
  },
]

const benefits = [
  'Один доступ ко всем уровням и материалам',
  'Больше длинных задач и проектной практики',
  'Сертификаты после подтверждения уровня',
  'Путь без хаоса и разрозненных мини-курсов',
]

export default function BootcampPage() {
  return (
    <main className="page-shell">
      <section className="page-wrap pt-10 pb-16 sm:pt-14 sm:pb-20">
        <div className="section-frame rounded-[36px] px-6 py-8 sm:px-10 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="eyebrow">Godemy Pro</span>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-7xl">
                Bootcamp для тех,
                <span className="block text-violet-300">кто уже прошёл базу</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Здесь не стартуют с нуля. Сначала человек проходит бесплатный путь,
                убеждается, что ему подходит backend, и только после этого заходит в более глубокую практику.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/bootcamp/buy" className="btn-primary text-center">
                  Оформить подписку
                </Link>
                <Link href="/guide" className="btn-secondary text-center">
                  Сначала пройти бесплатно
                </Link>
              </div>
            </div>

            <div className="surface-card rounded-[32px] p-6">
              <div className="grid gap-3">
                {benefits.map((item, index) => (
                  <div key={item} className="surface-subcard rounded-[24px] p-4">
                    <div className="flex gap-4">
                      <div className="icon-chip h-10 w-10 shrink-0 rounded-2xl text-sm">0{index + 1}</div>
                      <p className="text-sm leading-7 text-slate-300">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="mb-8">
          <span className="eyebrow">Маршрут роста</span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Один последовательный путь: Junior → Middle → Senior
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
            Мы убираем лишний выбор. Пользователь видит только следующий логичный этап,
            а не десятки равноправных меню и непонятных пакетов.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {levels.map((level, index) => (
            <article key={level.title} className="surface-card rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Уровень 0{index + 1}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                  {level.title}
                </span>
              </div>
              <h3 className="mt-6 text-3xl font-bold tracking-[-0.03em] text-white">{level.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{level.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {level.bullets.map((item) => (
                  <span key={item} className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
