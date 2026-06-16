'use client'

import { useState } from 'react'
import Link from 'next/link'
import ContinueBanner from '@/components/ContinueBanner'

const freeProjects = [
  {
    title: 'Игра “Угадай число”',
    description: 'CLI-проект с понятным README, командами запуска и простой логикой условий/циклов.',
    meta: 'В портфолио: README · go run · сценарии игры',
    files: ['README.md', 'main.go', 'examples/output.txt'],
    learned: 'условия, циклы, ввод/вывод',
  },
  {
    title: 'Сервис погоды',
    description: 'Мини-сервис, который получает данные из интернета и показывает результат человеку.',
    meta: 'В портфолио: HTTP · JSON · обработка ошибок',
    files: ['README.md', 'server.go', '.env.example'],
    learned: 'HTTP, JSON, внешние API',
  },
  {
    title: 'Учёт расходов',
    description: 'Проект с записями: добавить, посмотреть, изменить и объяснить продуктовый сценарий.',
    meta: 'В портфолио: CRUD · хранение · команды запуска',
    files: ['README.md', 'storage.go', 'commands.md'],
    learned: 'CRUD, состояние, сценарии пользователя',
  },
]

const stats = [
  { value: '3', label: 'бесплатных проекта' },
  { value: '30', label: 'минут до первого кода' },
  { value: '0', label: 'регистрации до старта' },
]

const steps = [
  ['Старт', 'Понять маршрут и открыть первый урок без регистрации.'],
  ['1 урок', 'Запустить первую Go-программу и изменить код.'],
  ['Мини-практика', 'Закрепить package main, func main и fmt.Println руками.'],
  ['Первый проект', 'Собрать маленький результат, который можно показать.'],
  ['Сертификат', 'Сохранить прогресс и получить подтверждение бесплатной части.'],
]

const firstThirtyMinutes = [
  'запустишь первую Go-программу',
  'изменишь код и увидишь результат',
  'поймёшь package main, func main и fmt.Println',
  'сможешь сохранить прогресс, когда будет что сохранять',
]

const diagnostics = [
  ['Я совсем с нуля', 'Начать с первого урока и идти спокойно по порядку.', '/guide/atlas-first-day', 'Первый урок без регистрации'],
  ['Я знаю основы', 'Быстро освежить темы и перейти к первому проекту.', '/guide', 'Открыть маршрут курса'],
  ['Готовлюсь к работе', 'Посмотреть маршрут проектов и навыки для портфолио.', '/bootcamp', 'Посмотреть следующий этап'],
  ['Хочу практику', 'Открыть тренажёр и закреплять темы кодом.', '/trainer', 'Перейти к упражнениям'],
]

const trustPoints = [
  ['Без входа в начале', 'Первый урок можно открыть сразу. Аккаунт нужен только для сохранения прогресса.'],
  ['Маршрут как у продукта', 'Каждая тема ведёт к действию: урок, практика, проект, понятный итог.'],
  ['Не только теория', 'В бесплатной части пользователь собирает 3 проекта и видит, что положить в портфолио.'],
]

const faq = [
  ['Нужен ли опыт?', 'Нет. Старт рассчитан на человека, который только разбирается, что такое Go и backend.'],
  ['Нужен ли английский?', 'Для первых уроков нет. Английские термины объясняются по ходу, без резкого входа в документацию.'],
  ['Сколько времени нужно?', 'Первый результат можно получить за 30 минут. Бесплатную часть удобно проходить короткими подходами.'],
  ['Это бесплатно?', 'Первый маршрут и 3 стартовых проекта доступны бесплатно. Регистрация нужна, чтобы сохранять прогресс.'],
  ['Что дальше после 3 проектов?', 'Можно перейти к продвинутому маршруту: больше backend-практики, работы с данными и задач ближе к junior-уровню.'],
]

const firstLessonHref = '/guide/atlas-first-day'
const previewCodeLines = [
  'package main',
  '',
  'import "fmt"',
  '',
  'func main() {',
  '    fmt.Println("Привет, Go")',
  '}',
]

export default function Home() {
  const [selectedPath, setSelectedPath] = useState(0)
  const selectedDiagnostic = diagnostics[selectedPath]

  return (
    <main className="page-shell">
      <ContinueBanner />

      <section className="page-wrap pt-8 pb-18 sm:pt-12 sm:pb-24">
        <div className="section-frame overflow-hidden rounded-[36px] px-6 py-8 sm:px-10 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <span className="eyebrow">Попробуй без регистрации</span>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-7xl">
                Первый урок Go
                <span className="block text-violet-300">за пару кликов</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Открой первый урок сразу: старт, первая мини-практика, первый проект
                и сертификат после бесплатной части. Аккаунт попросим только когда
                появится прогресс, который стоит сохранить.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={firstLessonHref} className="btn-primary text-center text-sm sm:text-base">
                  Начать первый урок
                </Link>
                <Link href="/trainer" className="btn-secondary text-center text-sm sm:text-base">
                  Перейти к практике
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Превью первого урока</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Ты видишь код, результат и следующий шаг</h2>
                </div>
                <div className="icon-chip">◎</div>
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#060b16]">
                <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-slate-500">first.go</span>
                </div>
                <pre className="overflow-x-auto px-5 py-4 text-sm leading-7 text-slate-200">
                  <code>
                    {previewCodeLines.map((line, index) => (
                      <span key={`${line}-${index}`} className="block min-h-7">
                        {line || ' '}
                      </span>
                    ))}
                  </code>
                </pre>
                <div className="border-t border-white/8 bg-white/[0.03] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Результат</p>
                  <p className="mt-2 font-mono text-sm text-emerald-300">Привет, Go</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {firstThirtyMinutes.map((item, index) => (
                  <div key={item} className="surface-subcard rounded-2xl p-4">
                    <p className="text-xs font-semibold text-violet-300">0{index + 1}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="mb-8">
          <span className="eyebrow">Один маршрут</span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Старт → урок → практика → проект → сертификат
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {steps.map(([title, text], index) => (
            <div key={title} className="surface-card rounded-[24px] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-sm font-black text-cyan-200">
                {index + 1}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="eyebrow">Диагностика на входе</span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Куда вести тебя сейчас?
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Выбери состояние, а платформа подсветит один следующий шаг.
              Никаких развилок из десяти кнопок.
            </p>
            <div className="mt-7 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
              <p className="text-sm font-semibold text-cyan-200">{selectedDiagnostic[0]}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedDiagnostic[1]}</p>
              <Link href={selectedDiagnostic[2]} className="btn-primary mt-5 inline-flex text-sm">
                {selectedDiagnostic[3]}
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {diagnostics.map(([title, text], index) => (
              <button
                key={title}
                type="button"
                onClick={() => setSelectedPath(index)}
                className={`surface-card rounded-[24px] p-5 text-left transition ${
                  selectedPath === index ? 'border-cyan-300/40 bg-cyan-300/[0.06]' : 'hover:border-cyan-300/30'
                }`}
              >
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="mb-8">
          <span className="eyebrow">Примеры проектов</span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            GitHub-style результат после бесплатной части
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
            Не абстрактные “3 проекта”, а понятные артефакты:
            что проект делает, как его запустить и чему он научился.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {freeProjects.map((project, index) => (
            <article key={project.title} className="surface-card rounded-[30px] p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Проект 0{index + 1}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                  Бесплатно
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-white">{project.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{project.description}</p>
              <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">project-root</span>
                  <span className="text-slate-500">public</span>
                </div>
                <div className="space-y-2">
                  {project.files.map((file) => (
                    <div key={file} className="flex items-center gap-2 rounded-xl bg-white/[0.035] px-3 py-2 font-mono text-xs text-slate-300">
                      <span className="text-cyan-300">▸</span>
                      {file}
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-white/8 pt-3 text-xs leading-6 text-slate-400">
                  <p>{project.meta}</p>
                  <p className="text-violet-200">Научился: {project.learned}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="surface-card rounded-[32px] p-7">
            <span className="eyebrow">Доверие</span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">Почему этому маршруту можно доверять</h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Платформа не просит поверить на слово. Она быстро показывает продукт,
              даёт попробовать урок и объясняет, какой результат останется после бесплатной части.
            </p>
            <ul className="mt-6 space-y-3">
              {trustPoints.map(([title, text]) => (
                <li key={title} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="icon-chip h-8 w-8 rounded-xl text-sm">✓</span>
                  <span>
                    <span className="block font-semibold text-white">{title}</span>
                    <span className="mt-1 block leading-6 text-slate-400">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href={firstLessonHref} className="btn-secondary mt-8 inline-flex">
              Попробовать урок
            </Link>
          </div>

          <div className="surface-highlight rounded-[32px] p-7">
            <span className="eyebrow">FAQ</span>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {faq.map(([title, text]) => (
                <div key={title} className="surface-subcard rounded-[24px] p-5">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
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
              <span className="eyebrow">Когда база понятна</span>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                После первых проектов можно идти глубже
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
                Продвинутый курс нужен не в первый день, а после базы: там больше практики,
                длиннее задачи и понятный рост к уровню работы в команде.
              </p>
            </div>
            <Link href="/bootcamp" className="btn-primary text-center">
              Посмотреть следующий этап
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
