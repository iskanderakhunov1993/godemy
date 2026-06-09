import Link from 'next/link'
import ContinueBanner from '@/components/ContinueBanner'

const freeProjects = [
  {
    title: 'Number Guessing Game',
    description: 'Первый CLI-проект, чтобы спокойно понять ввод, условия, циклы и базовый UX консольной программы.',
    meta: 'Спринт 1 · CLI · Основы Go',
  },
  {
    title: 'Weather API Wrapper',
    description: 'Первый backend-сервис с HTTP, JSON и интеграцией с внешним API — уже похоже на реальную работу.',
    meta: 'Спринт 2 · API · Интеграции',
  },
  {
    title: 'Expense Tracker',
    description: 'Финальный бесплатный проект, где ты начинаешь мыслить состоянием, сценариями пользователя и CRUD-логикой.',
    meta: 'Спринт 3 · CRUD · Данные',
  },
]

const pillars = [
  {
    title: 'Бесплатный курс',
    text: 'Основа, теория по делу и 3 проекта, чтобы человек быстро понял: ему вообще нравится backend или нет.',
  },
  {
    title: 'Тренажёр',
    text: 'Короткие темы, синтаксис, паттерны и практика. Не лекции, а быстрые понятные закрепления.',
  },
  {
    title: 'Bootcamp Pro',
    text: 'Следующий слой для тех, кто уже прошёл базу и хочет расти до рабочего Junior, Middle и Senior.',
  },
]

const stats = [
  { value: '3', label: 'бесплатных проекта' },
  { value: '1', label: 'понятный маршрут' },
  { value: '∞', label: 'меньше хаоса и перегруза' },
]

const steps = [
  ['Понять тему', 'Короткая теория без лишней академичности.'],
  ['Сделать руками', 'Мини-практика, тренажёр или спринт-задача.'],
  ['Собрать проект', 'Результат, который уже не стыдно показать в GitHub.'],
  ['Подтвердить навык', 'Сертификат и понятное ощущение прогресса.'],
]

export default function Home() {
  return (
    <main className="page-shell">
      <ContinueBanner />

      <section className="page-wrap pt-8 pb-18 sm:pt-12 sm:pb-24">
        <div className="section-frame overflow-hidden rounded-[36px] px-6 py-8 sm:px-10 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <span className="eyebrow">Простой путь в Go</span>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-7xl">
                Учись Go
                <span className="block text-violet-300">без визуального шума</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Godemy — это спокойная и понятная платформа: бесплатный курс с тремя проектами,
                отдельный тренажёр для практики и bootcamp для роста в профессию.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/guide" className="btn-primary text-center text-sm sm:text-base">
                  Начать бесплатно
                </Link>
                <Link href="/trainer" className="btn-secondary text-center text-sm sm:text-base">
                  Открыть тренажёр
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="stat-card rounded-3xl p-4">
                    <div className="text-3xl font-black tracking-tight text-white">{item.value}</div>
                    <div className="mt-2 text-sm text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card rounded-[32px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Как устроен продукт</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Один маршрут вместо десяти кнопок</h2>
                </div>
                <div className="icon-chip">◎</div>
              </div>

              <div className="mt-6 space-y-3">
                {pillars.map((item, index) => (
                  <div key={item.title} className="surface-subcard rounded-[24px] p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-sm font-bold text-violet-200">
                        0{index + 1}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 text-sm leading-7 text-slate-400">{item.text}</p>
                      </div>
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
          <span className="eyebrow">Бесплатная часть</span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            3 проекта, чтобы не просто читать, а реально делать
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
            Бесплатный путь специально сделан законченным. Он не обрывается на “потом купи”,
            а даёт нормальный старт и реальные результаты.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {freeProjects.map((project, index) => (
            <article key={project.title} className="surface-card rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Спринт 0{index + 1}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                  Бесплатно
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-white">{project.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{project.description}</p>
              <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs text-slate-300">
                {project.meta}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="surface-card rounded-[32px] p-7">
            <span className="eyebrow">Тренажёр</span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">Короткие темы, чистый интерфейс, практика сразу рядом</h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Мы делаем тренажёр не “как энциклопедию”, а как понятную рабочую зону:
              теория, паттерн, пример и маленькая практика на одной оси внимания.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Теория по темам в стиле concept pages',
                'Минимум отвлекающих элементов',
                'Практика сразу после объяснения',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="icon-chip h-8 w-8 rounded-xl text-sm">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/trainer" className="btn-secondary mt-8 inline-flex">
              Перейти в тренажёр
            </Link>
          </div>

          <div className="surface-highlight rounded-[32px] p-7">
            <span className="eyebrow">Как учится пользователь</span>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {steps.map(([title, text], index) => (
                <div key={title} className="surface-subcard rounded-[24px] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Шаг 0{index + 1}</div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-20 sm:pb-28">
        <div className="section-frame rounded-[36px] px-6 py-8 sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="eyebrow">Следующий шаг</span>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                Когда база пройдена, включается Bootcamp Pro
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
                Без перегруза тарифами и развилками: один продукт для тех, кто хочет расти дальше
                до рабочего уровня Junior, Middle и Senior.
              </p>
            </div>
            <Link href="/bootcamp" className="btn-primary text-center">
              Посмотреть Bootcamp
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
