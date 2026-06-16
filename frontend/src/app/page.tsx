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

const resumeHighlights = [
  '3 учебных проекта на Go с README и командами запуска',
  'понимание базового синтаксиса, функций, структур и ошибок',
  'первый опыт HTTP, JSON и простого хранения данных',
  'умение объяснить проект: задача, решение, запуск, что улучшить дальше',
]

const resumeStack = ['Go', 'HTTP', 'JSON', 'CLI', 'GitHub', 'README', 'CRUD', 'Testing basics']

const resumeProjects = [
  ['Game CLI', 'консольная игра с вводом пользователя, условиями, циклами и понятным запуском через go run'],
  ['Weather Service', 'мини-сервис с HTTP-запросом, JSON-ответом и обработкой ошибок'],
  ['Expense Tracker', 'учёт расходов с добавлением, просмотром и изменением записей'],
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
  ['Резюме', 'Описать проекты, стек и первый опыт для стажировки.'],
]

const firstThirtyMinutes = [
  'запустишь первую Go-программу',
  'изменишь код и увидишь результат',
  'поймёшь package main, func main и fmt.Println',
  'сможешь сохранить прогресс, когда будет что сохранять',
]

const diagnostics = [
  ['Я совсем с нуля', 'Покажем первый урок и не заставим выбирать из всех разделов сразу.', '/guide/atlas-first-day', 'Начать с первого урока'],
  ['Я знаю основы', 'Откроем маршрут курса, чтобы быстро дойти до первого проекта.', '/guide', 'Открыть маршрут'],
  ['Хочу резюме', 'Покажем проекты, стек и формулировки, которые можно добавить в портфолио.', '/bootcamp', 'Посмотреть результат'],
  ['Нужна практика', 'Отправим в тренажёр, если хочется закреплять темы короткими задачами.', '/trainer', 'Открыть тренажёр'],
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
            Старт → урок → практика → проект → резюме
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
            <span className="eyebrow">Быстрый старт</span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Не знаешь, с чего начать?
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Выбери ситуацию, а мы сразу дадим один следующий шаг:
              урок, маршрут, практику или карьерный результат.
            </p>
            <div className="mt-7 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Твой следующий шаг</p>
              <p className="mt-3 text-lg font-semibold text-white">{selectedDiagnostic[0]}</p>
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
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(8,13,26,0.94))] shadow-[0_28px_90px_rgba(2,6,23,0.3)]">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <span className="eyebrow">Портфолио после курса</span>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                Не просто уроки, а первые работы для GitHub
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-400">
                После бесплатной части у тебя появляется маленькое, но честное портфолио:
                проекты можно открыть, запустить и объяснить на первом созвоне.
              </p>

              <div className="mt-7 rounded-[24px] border border-white/10 bg-[#050914]">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">github.com/you/go-starter</span>
                </div>
                <div className="p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">README.md</p>
                  <h3 className="mt-3 text-xl font-black text-white">Go Starter Portfolio</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    3 проекта из курса, команды запуска, короткое описание задачи и что было изучено.
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {['go run .', 'README', 'demo output'].map((item) => (
                      <div key={item} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-3 text-center font-mono text-xs text-cyan-100">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Что появится</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">3 понятных проекта</h3>
                </div>
                <span className="w-fit rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  бесплатно
                </span>
              </div>

              <div className="space-y-3">
                {freeProjects.map((project, index) => (
                  <article key={project.title} className="group rounded-[22px] border border-white/8 bg-white/[0.035] p-4 transition hover:border-cyan-300/25 hover:bg-white/[0.055]">
                    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 text-sm font-black text-cyan-200">
                        0{index + 1}
                      </div>
                      <div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="text-lg font-black text-white">{project.title}</h4>
                          <span className="font-mono text-[11px] text-slate-500">{project.files[1]}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{project.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.learned.split(', ').map((item) => (
                            <span key={item} className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <p className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-300/[0.07] p-4 text-sm leading-7 text-violet-100">
                Такой блок в резюме выглядит честно: “учебные проекты на Go, умею запускать,
                документировать и объяснять код”. Для первого отклика этого уже достаточно,
                чтобы начать разговор.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <span className="eyebrow">После бесплатного курса</span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Уже можно готовить резюме и начинать искать первые вакансии
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Бесплатная часть даёт не просто “посмотрел уроки”, а набор конкретных пунктов:
              проекты, стек, GitHub-ссылки и понятное описание того, что ты умеешь делать на Go.
              С таким резюме можно откликаться на стажировки, trainee и junior-позиции, параллельно
              усиливая портфолио в продвинутом маршруте.
            </p>

            <div className="mt-7 grid gap-3">
              {resumeHighlights.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-xs font-black text-emerald-200">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/guide" className="btn-primary justify-center text-sm">
                Пройти бесплатный курс
              </Link>
              <Link href="/bootcamp" className="btn-secondary justify-center text-sm">
                Усилить резюме дальше
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-slate-950 p-3 shadow-[0_28px_90px_rgba(2,6,23,0.34)] sm:p-5">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#f8fafc] text-slate-950">
              <div className="border-b border-slate-200 bg-white px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-medium text-slate-500">resume-go-junior.pdf</span>
                </div>
              </div>

              <div className="bg-white px-5 py-6 sm:px-7 sm:py-8">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">Пример резюме</p>
                    <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
                      Go Backend Developer Intern
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                      Начинающий Go-разработчик после практического курса. Собрал 3 проекта,
                      умею запускать, документировать и объяснять код.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800">
                    Open to work
                  </div>
                </div>

                <div className="grid gap-5 py-5 sm:grid-cols-[0.75fr_1.25fr]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Стек</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resumeStack.map((item) => (
                        <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Готовность</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-950">
                        Можно откликаться на стажировки и junior-вакансии, где ценят базу,
                        GitHub и желание расти.
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Проекты</p>
                    <div className="mt-3 space-y-3">
                      {resumeProjects.map(([title, text]) => (
                        <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <h4 className="text-sm font-black text-slate-950">{title}</h4>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Как описать себя</p>
                  <p className="mt-2 rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                    “Ищу первую роль в Go/backend. В Godemy прошёл базовый маршрут,
                    собрал проекты с README, разобрал основы Go, HTTP, JSON и CRUD.
                    Готов к стажировке, code review и задачам под руководством команды.”
                  </p>
                </div>
              </div>
            </div>
          </div>
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
