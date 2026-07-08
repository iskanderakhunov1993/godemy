'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ContinueBanner from '@/components/ContinueBanner'

const freeProjects = [
  {
    title: 'CLI-калькулятор',
    description: 'Консольная программа: ввод чисел, выбор операции, результат и обработка ошибок.',
    meta: 'В портфолио: README · go run · ошибки ввода',
    files: ['README.md', 'main.go', 'examples/output.txt'],
    learned: 'ввод/вывод, функции, ошибки',
  },
  {
    title: 'To-do приложение в консоли',
    description: 'CLI-приложение: добавить задачу, посмотреть список, отметить выполненной и сохранить в файл.',
    meta: 'В портфолио: JSON-файл · команды · состояние',
    files: ['README.md', 'todo.go', 'tasks.json'],
    learned: 'структуры, файлы, JSON',
  },
  {
    title: 'Мини REST API',
    description: 'Локальный HTTP-сервер с endpoints, JSON-ответами и curl/Postman проверками.',
    meta: 'В портфолио: HTTP · JSON · REST',
    files: ['README.md', 'server.go', 'requests.http'],
    learned: 'HTTP, JSON, status codes',
  },
]

const resumeHighlights = [
  '3 учебных проекта на Go с README и командами запуска',
  'понимание базового синтаксиса, функций, структур и ошибок',
  'первый опыт HTTP, JSON и простого хранения данных',
  'умение объяснить проект: задача, решение, запуск, что улучшить дальше',
]

const resumeStack = ['Go', 'HTTP', 'JSON', 'CLI', 'GitHub', 'README', 'CRUD', 'Postman', 'Git', 'Базовые тесты']

const resumeProjects = [
  ['cli-calculator-go', 'CLI-калькулятор: ввод чисел, операции, ошибки, README и запуск через go run.'],
  ['console-todo-go', 'To-do в консоли: команды add/list/done, JSON-файл и сохранение состояния.'],
  ['mini-rest-api-go', 'Мини REST API: HTTP endpoints, JSON-ответы, status codes и curl/Postman проверки.'],
]

const resumeExperience = [
  'Поддерживал внутренний сервис учебных заявок: разбирал простые backend-задачи и фиксировал сценарии в README.',
  'Собрал CLI-инструмент для проверки входных данных и описал команды запуска для команды поддержки.',
  'Работал с HTTP-запросами, JSON-ответами, ошибками и базовой структурой Go-проекта.',
]

const stats = [
  { value: '3', label: 'бесплатных проекта' },
  { value: '30 мин', label: 'до первого запуска' },
  { value: 'без входа', label: 'до сохранения прогресса' },
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
  ['Не уверен, что IT твоё', 'не покупай годовой курс: пройди месяц, собери первые проекты и реши без давления.'],
  ['Нет времени на группу', 'учись вечером, в выходные или в обед: уроки открыты, прогресс сохраняется, дедлайна группы нет.'],
  ['Нужен результат в резюме', 'каждый этап заканчивается артефактом: GitHub, README, проект или формулировка для отклика.'],
]

const valuePoints = [
  ['150 000 ₽ и кредит', '1000 ₽/мес. Можно остановиться в любой момент.'],
  ['Год до результата', 'Первый код за 30 минут, первый проект - в бесплатной части.'],
  ['Практика где-то потом', 'Каждый блок заканчивается задачей, GitHub или резюме.'],
  ['Темп всей группы', 'Идёшь сам: урок открыт, прогресс сохраняется, дедлайна группы нет.'],
]

const testimonials = [
  ['Алина, 29', 'Спасибо Godemy: я наконец свичнулась из поддержки в backend. Раньше бросала курсы после лекций, а тут через неделю уже был GitHub с проектами.'],
  ['Руслан, 34', 'Мне было важно не брать кредит на обучение. Оплатил месяц, прошёл базу, понял что Go заходит, и спокойно продолжил.'],
  ['Мария, 26', 'Самое ценное - не ждать группу и вебинар. Открыла урок после работы, сделала задачу, сохранила прогресс и пошла дальше.'],
  ['Денис, 31', 'На собеседовании я показывал не сертификат, а проекты: игру, сервис погоды и учёт расходов. Разговор сразу стал предметным.'],
]

const companyLogos = ['Яндекс', 'Wildberries', 'Ozon', 'Bell Integrator', 'ICL', 'SberTech', 'T-Bank', 'VK Tech']

function getOnlineLearners() {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const isWeekend = day === 0 || day === 6
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + hour * 17
  const wave = Math.abs(Math.sin(seed))

  if (hour >= 0 && hour < 9) return 3 + Math.floor(wave * 18)
  if (!isWeekend && hour >= 19 && hour <= 23) return 180 + Math.floor(wave * 320)
  if (isWeekend && hour >= 12 && hour <= 23) return 140 + Math.floor(wave * 360)
  if (!isWeekend && hour >= 9 && hour < 19) return 40 + Math.floor(wave * 120)
  return 18 + Math.floor(wave * 60)
}

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
  const [onlineLearners] = useState(() => getOnlineLearners())
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
        <div className="mb-8">
          <span className="eyebrow">Портфолио после курса</span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Так могут выглядеть первые проекты на GitHub
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">
            После бесплатной части у тебя не просто пройденные уроки, а 3 репозитория:
            их можно открыть, запустить и показать в резюме или на первом созвоне.
          </p>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-slate-700 bg-[#0d1117] shadow-[0_28px_90px_rgba(2,6,23,0.34)]">
          <div className="flex flex-col gap-4 border-b border-slate-700 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-black text-[#0d1117]">
                GH
              </div>
              <p className="text-sm font-bold text-slate-100">Марк Цукерберг</p>
            </div>
            <div className="hidden min-w-72 rounded-xl border border-slate-700 bg-[#010409] px-4 py-2 text-sm text-slate-500 sm:block">
              Type / to search
            </div>
          </div>

          <div className="border-b border-slate-700 px-5">
            <div className="flex gap-6 overflow-x-auto text-sm font-semibold text-slate-300">
              {['Overview', 'Repositories 3', 'Projects', 'Packages', 'Stars'].map((item, index) => (
                <div
                  key={item}
                  className={`shrink-0 border-b-2 py-3 ${index === 0 ? 'border-orange-400 text-white' : 'border-transparent text-slate-500'}`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[0.36fr_0.64fr]">
            <aside>
	              <div className="relative h-32 w-32 overflow-hidden rounded-full border border-slate-700 bg-[#161b22] sm:h-44 sm:w-44">
	                <Image
	                  src="/people/mark-zuckerberg.png"
	                  alt="Марк Цукерберг"
	                  fill
	                  sizes="(min-width: 640px) 176px, 128px"
	                  className="object-cover"
	                />
	              </div>
	              <h3 className="mt-5 text-2xl font-semibold text-slate-200">Марк Цукерберг</h3>
	              <p className="mt-1 text-sm text-slate-500">Go Backend Intern</p>
              <div className="mt-4 rounded-xl border border-slate-700 bg-[#21262d] px-4 py-2 text-center text-sm font-semibold text-slate-200">
                Edit profile
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">
	                Учусь Go, собираю первые backend-проекты и готовлю портфолио для стажировки в Facebook.
              </p>
            </aside>

            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">Popular repositories</h3>
                  <p className="mt-1 text-sm text-slate-500">3 проекта после бесплатного курса</p>
                </div>
                <span className="hidden text-sm text-blue-400 sm:inline">Customize your pins</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {freeProjects.map((project, index) => (
                  <article key={project.title} className="min-h-40 rounded-xl border border-slate-700 bg-[#0d1117] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-400">
                          {['number-guessing-go', 'weather-service-go', 'expense-tracker-go'][index]}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{project.description}</p>
                      </div>
                      <span className="rounded-full border border-slate-600 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                        Public
                      </span>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-cyan-400" />
                        Go
                      </span>
                      <span>README</span>
                      <span>{project.files[1]}</span>
                    </div>
                  </article>
                ))}
                <div className="rounded-xl border border-dashed border-slate-700 bg-[#010409] p-5">
                  <p className="text-sm font-semibold text-slate-200">Что видно работодателю</p>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                    <p>Проекты названы понятно, у каждого есть описание и язык Go.</p>
                    <p>В README можно добавить запуск, примеры вывода и чему научился.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-700 bg-[#010409] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-base font-semibold text-slate-100">Contribution activity</h4>
                  <span className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">2026</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 84 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-3 rounded-[3px] ${
                        [8, 14, 21, 33, 45, 58, 71, 77].includes(index)
                          ? 'bg-emerald-500'
                          : [6, 25, 46, 62, 81].includes(index)
                            ? 'bg-emerald-700'
                            : 'bg-[#161b22]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-300/[0.07] p-4 text-sm leading-7 text-violet-100">
                Такой GitHub-блок можно приложить к резюме: 3 учебных проекта на Go,
                понятные README и видимая активность вместо пустого профиля.
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
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#f7f7f5] text-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 bg-[#e9e9e7] px-5 py-3">
                <span className="text-xs font-semibold text-slate-500">resume-mark-zuckerberg.pdf</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white">hh</span>
              </div>

              <div className="bg-white px-5 py-6 sm:px-7 sm:py-8">
                <div className="grid gap-5 border-b border-slate-200 pb-6 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Пример резюме после курса</p>
                    <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                      Марк Цукерберг
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">Москва · 23 года · telegram: @mark_zuckerberg_go</p>
                    <p className="mt-4 text-xl font-black text-slate-950">Go Backend Developer Intern</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Начинающий backend-разработчик. После практического курса собрал 3 проекта на Go,
                      оформил GitHub, умею запускать сервисы, читать JSON и объяснять код на созвоне.
                    </p>
                  </div>

                  <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-end">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      <Image
                        src="/people/mark-zuckerberg.png"
                        alt="Марк Цукерберг"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
                      Готов к стажировке
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 py-6 lg:grid-cols-[0.72fr_1.28fr]">
                  <aside className="space-y-5">
                    <div>
                      <p className="border-b border-slate-200 pb-1 text-sm font-semibold text-slate-400">Навыки</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resumeStack.map((item) => (
                          <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="border-b border-slate-200 pb-1 text-sm font-semibold text-slate-400">О себе</p>
                      <p className="mt-3 text-xs leading-5 text-slate-600">
                        Ищу первую роль в Go/backend. Быстро учусь, веду README, не боюсь правок
                        и хочу расти через code review и реальные задачи.
                      </p>
                    </div>
                  </aside>

                  <div className="space-y-6">
                    <div>
                      <p className="border-b border-slate-200 pb-1 text-sm font-semibold text-slate-400">Опыт работы</p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
                        <div className="text-xs leading-5 text-slate-500">
                          Май 2026 - сейчас
                          <br />
                          2 месяца
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-950">Facebook, стажировка</h4>
                          <p className="mt-1 text-sm text-slate-500">Учебный пример · backend-практика на Go</p>
                          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-700">
                            {resumeExperience.map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="border-b border-slate-200 pb-1 text-sm font-semibold text-slate-400">Проекты</p>
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
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <p className="rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                    Такой пример выглядит как настоящее стартовое резюме: есть должность,
                    опыт, 3 проекта, стек, GitHub-логика и понятное описание того, что кандидат делал руками.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_18%_10%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(7,10,22,0.98))]">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <span className="eyebrow">Почему дешевле и быстрее</span>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                  Не кредит. Не год ожидания. Практика сразу.
                </h2>
              </div>

              <div className="rounded-[28px] border border-emerald-300/25 bg-emerald-300/[0.08] p-5">
                <p className="text-sm font-semibold text-emerald-100">Проверь за месяц, твоё ли это</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <p className="text-6xl font-black tracking-[-0.06em] text-white">1000 ₽</p>
                  <p className="text-sm font-bold text-emerald-100 sm:pb-2">
                    в месяц, без кредита и оплаты за год
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {valuePoints.map(([pain, answer]) => (
                <div key={pain} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-200">Боль</p>
                  <h3 className="mt-3 min-h-14 text-xl font-black leading-tight text-white">{pain}</h3>
                  <div className="mt-4 h-px bg-white/10" />
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">Godemy</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-cyan-300/20 bg-cyan-300/[0.07] px-5 py-4">
              <p className="text-base font-black leading-7 text-cyan-50">
                Смысл простой: сначала реальные задания и первые проекты, потом решение - продолжать или нет.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card rounded-[32px] p-6 sm:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow">Отзывы</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1 text-xs font-bold text-emerald-100">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
                  {onlineLearners} онлайн сейчас
                </span>
              </div>
              <div>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                  Люди приходят не за лекциями, а за переходом
                </h2>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {testimonials.map(([person, text]) => (
                <article key={person} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/10 text-sm font-black text-cyan-100">
                      {person.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{person}</h3>
                      <p className="text-xs font-semibold text-slate-500">перешёл в IT через практику</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">“{text}”</p>
                </article>
              ))}
            </div>
          </div>

          <div className="surface-highlight rounded-[32px] p-6 sm:p-7">
            <span className="eyebrow">Где работают</span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">
              Наши пользователи работают в сильных IT-командах
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Практический путь нужен не для галочки в сертификате, а чтобы уверенно говорить
              про код, проекты и backend-задачи на собеседованиях.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {companyLogos.map((company) => (
                <div key={company} className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-center text-sm font-black text-slate-100">
                  {company}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-cyan-300/[0.07] p-5">
              <p className="text-sm leading-7 text-cyan-50">
                Рынок смотрит не только на диплом: GitHub, README, стек и понятное объяснение
                своих проектов помогают пройти первый технический разговор спокойнее.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-18 sm:pb-24">
        <div className="surface-card rounded-[32px] p-6 sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <span className="eyebrow">Кому это особенно полезно</span>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                Когда страшно платить много, а попробовать хочется
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-400">
                Этот формат закрывает главный риск новичка: не потерять год и большую сумму,
                если программирование окажется не твоим.
              </p>
            </div>

            <div className="grid gap-4">
              {audienceFit.map(([title, text], index) => (
                <div key={title} className="grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.045] p-5 sm:grid-cols-[56px_1fr] sm:items-start">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-sm font-black text-cyan-100">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
