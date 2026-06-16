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
  { value: '30 мин', label: 'до первого запуска' },
  { value: 'без входа', label: 'до сохранения прогресса' },
]

const steps = [
  ['Старт', 'Понять маршрут и открыть первый урок без регистрации.'],
  ['1 урок', 'Запустить первую Go-программу и изменить код.'],
  ['Мини-практика', 'Закрепить package main, func main и fmt.Println руками.'],
  ['Первый проект', 'Собрать маленький результат, который можно показать.'],
  ['Итог', 'Сохранить прогресс и увидеть, что уже получилось.'],
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

const audienceFit = [
  ['Подойдёт', 'если ты начинаешь с нуля, устал смотреть видео без практики или хочешь собрать первые Go-проекты.'],
  ['Не подойдёт', 'если тебе нужен академический справочник по всему языку или глубокий backend senior-level сразу.'],
  ['Формат', 'короткий урок, понятная мини-практика, затем проект с README и командами запуска.'],
]

const authorContext = [
  'Курс собран как продуктовый маршрут: меньше развилок, больше одного понятного следующего шага.',
  'Внутри нет обещания “выучишь всё за вечер”. Задача бесплатной части — дать первый рабочий результат.',
  'Примеры проектов оформлены так, чтобы их можно было спокойно объяснить и положить в портфолио.',
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

const lessonPreviewSteps = [
  ['Читаешь короткое объяснение', 'Зачем нужны package main, func main и fmt.Println.'],
  ['Меняешь строку в коде', 'Пишешь свою фразу вместо готового текста.'],
  ['Запускаешь и видишь результат', 'Сразу понятно, что именно сделал код.'],
]

export default function Home() {
  const [selectedPath, setSelectedPath] = useState(0)
  const selectedDiagnostic = diagnostics[selectedPath]

  return (
    <main className="page-shell">
      <ContinueBanner />

      <section className="page-wrap pt-8 pb-16 sm:pt-10 sm:pb-20">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_78%_18%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,12,24,0.98))] px-6 py-7 shadow-[0_28px_90px_rgba(2,6,23,0.28)] sm:px-8 sm:py-9">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Первый урок без регистрации
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl">
                Go с нуля:
                <span className="block text-cyan-200">первый код за 30 минут</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                Открой урок, измени строку в коде и запусти результат. Аккаунт понадобится только тогда,
                когда уже появится прогресс, который хочется сохранить.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={firstLessonHref} className="btn-primary justify-center text-sm sm:text-base">
                  Начать первый урок
                </Link>
                <Link href="/trainer" className="btn-secondary justify-center text-sm sm:text-base">
                  Открыть тренажёр
                </Link>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
                    <div className="text-xl font-black tracking-tight text-white">{item.value}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-[#090f1d]/90 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.34)] sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Превью урока</p>
                  <h2 className="mt-2 max-w-md text-xl font-bold leading-snug text-white sm:text-2xl">
                    Так выглядит первый шаг внутри урока
                  </h2>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-200">
                  Go
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#050914]">
                <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-slate-500">first.go</span>
                </div>
                <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-6 text-slate-200 sm:px-5 sm:text-sm">
                  <code>
                    {previewCodeLines.map((line, index) => (
                      <span key={`${line}-${index}`} className="grid min-h-6 grid-cols-[2rem_1fr] gap-3">
                        <span className="select-none text-right text-slate-600">{index + 1}</span>
                        <span>{line || ' '}</span>
                      </span>
                    ))}
                  </code>
                </pre>
                <div className="border-t border-white/8 bg-emerald-300/[0.045] px-4 py-3 sm:px-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Результат</p>
                  <p className="mt-2 font-mono text-sm text-emerald-300">Привет, Go</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {lessonPreviewSteps.map(([title, text], index) => (
                  <div key={title} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-[11px] font-bold text-cyan-200">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-slate-300">
                      <span className="block font-semibold text-white">{title}</span>
                      <span className="text-slate-500">{text}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="surface-card rounded-[28px] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:items-center">
            <div>
              <span className="eyebrow">Первые 30 минут</span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
                Не “изучить всё”, а сделать первый запуск
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {firstThirtyMinutes.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <p className="text-[11px] font-semibold text-cyan-300">0{index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="mb-8">
          <span className="eyebrow">Один маршрут</span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Старт → урок → практика → проект → понятный итог
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
        <div className="grid gap-5 lg:grid-cols-3">
          {audienceFit.map(([title, text]) => (
            <div key={title} className="surface-card rounded-[26px] p-6">
              <span className="eyebrow">{title}</span>
              <p className="mt-4 text-base leading-8 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="surface-card rounded-[32px] p-7">
            <span className="eyebrow">Авторский подход</span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">
              Не энциклопедия, а путь до первого результата
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Godemy объясняет Go через действия: открыть урок, изменить код,
              собрать проект и понять, что делать дальше.
            </p>
            <ul className="mt-6 space-y-3">
              {authorContext.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                  <span className="icon-chip h-8 w-8 rounded-xl text-sm">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
