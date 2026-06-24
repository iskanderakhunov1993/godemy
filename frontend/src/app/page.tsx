'use client'

import Link from 'next/link'
import ContinueBanner from '@/components/ContinueBanner'

const codeLines = [
  'package main',
  '',
  'import "fmt"',
  '',
  'func main() {',
  '    fmt.Println("Привет, Go!")',
  '}',
]

const projects = [
  {
    num: '01',
    title: 'Игра «Угадай число»',
    tags: ['CLI', 'циклы', 'условия'],
    desc: 'Консольная игра с уровнями сложности. Первый проект в портфолио.',
  },
  {
    num: '02',
    title: 'Сервис погоды',
    tags: ['HTTP', 'JSON', 'Docker'],
    desc: 'Backend-сервис с внешним API, кешированием и контейнером.',
  },
  {
    num: '03',
    title: 'Todo-list API',
    tags: ['REST', 'PostgreSQL', 'CRUD'],
    desc: 'Полноценный API с базой данных и чистой архитектурой.',
  },
]

const githubRepos = [
  { name: 'number-guessing-go', desc: 'CLI-игра: ввод пользователя, условия, циклы, README', lang: 'Go' },
  { name: 'weather-service-go', desc: 'HTTP-сервис: внешний API, JSON, кеширование, Docker', lang: 'Go' },
  { name: 'todo-api-go', desc: 'REST API: PostgreSQL, CRUD, чистая архитектура', lang: 'Go' },
]

const resumeSkills = ['Go', 'HTTP', 'REST API', 'JSON', 'PostgreSQL', 'Docker', 'Git', 'CLI', 'Тесты', 'Clean Architecture']

const comparison = [
  { label: 'Цена', others: '150 000 ₽ + кредит', godemy: 'Бесплатно' },
  { label: 'Срок до первого кода', others: '2–4 недели лекций', godemy: '30 минут' },
  { label: 'Практика', others: 'После теории, где-то потом', godemy: 'С первого урока в тренажёре' },
  { label: 'Проекты', others: 'В конце курса, если дойдёшь', godemy: '3 проекта уже в бесплатной части' },
  { label: 'Портфолио', others: 'Сертификат PDF', godemy: 'GitHub с проектами + резюме' },
  { label: 'Темп', others: 'Расписание группы', godemy: 'Свой темп, без дедлайнов' },
]

const faq = [
  ['Нужен ли опыт?', 'Нет. Курс начинается с нуля — с установки Go и первой строчки кода.'],
  ['Это правда бесплатно?', 'Да. Весь курс, 3 проекта, тренажёр и подготовка резюме — бесплатно. Продвинутая часть — 1000 ₽/мес.'],
  ['Сколько времени?', 'Первый код за 30 минут. Весь курс — 3–6 месяцев в своём темпе.'],
  ['Что будет в портфолио?', '3 проекта на GitHub с README, командами запуска и описанием стека.'],
]

export default function Home() {
  return (
    <main className="page-shell">
      <ContinueBanner />

      {/* ── Hero ── */}
      <section className="page-wrap pt-10 pb-20 sm:pt-16 sm:pb-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
              Полностью бесплатный курс
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              Научись писать
              <span className="block text-[var(--app-yellow)]">backend на Go</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-400">
              Бесплатный курс с нуля до первой работы. 3&nbsp;реальных проекта для GitHub,
              тренажёр с автопроверкой и готовое резюме в&nbsp;конце.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/guide" className="btn-primary text-center">
                Начать бесплатно
              </Link>
              <Link href="/trainer" className="btn-secondary text-center">
                Тренажёр
              </Link>
            </div>
            <div className="mt-8 flex gap-6 text-sm text-neutral-500">
              <span><strong className="text-white">106</strong> уроков</span>
              <span><strong className="text-white">12</strong> спринтов</span>
              <span><strong className="text-white">3</strong> проекта</span>
              <span><strong className="text-white">0 ₽</strong></span>
            </div>
          </div>

          {/* Code preview */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              <span className="ml-3 text-xs text-neutral-500">main.go</span>
            </div>
            <pre className="px-5 py-5 text-sm leading-7 text-neutral-200 font-mono">
              <code>{codeLines.map((line, i) => (
                <span key={i} className="flex">
                  <span className="w-8 select-none text-right text-neutral-600 mr-4">{i + 1}</span>
                  <span>{line || ' '}</span>
                </span>
              ))}</code>
            </pre>
            <div className="border-t border-white/8 bg-green-500/5 px-5 py-3">
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Вывод</span>
              <p className="mt-1 font-mono text-sm text-green-300">Привет, Go!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="page-wrap pb-20 sm:pb-28">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Как устроен курс
        </h2>
        <p className="mt-3 max-w-2xl text-base text-neutral-400">
          Теория → тренажёр → проект. Каждый спринт заканчивается результатом.
        </p>
        <div className="mt-10 grid gap-px rounded-2xl border border-white/10 bg-white/5 overflow-hidden sm:grid-cols-4">
          {[
            ['Читаешь', 'Короткий урок с примерами кода. Без воды и видеолекций.'],
            ['Решаешь', 'Задачи в тренажёре с автопроверкой прямо в браузере.'],
            ['Собираешь', 'Проект по шагам: коммит за коммитом, как в реальной работе.'],
            ['Получаешь', 'GitHub с проектами, резюме и навыки для собеседований.'],
          ].map(([title, desc], i) => (
            <div key={i} className="bg-[#0d1117] p-6 sm:p-8">
              <span className="text-xs font-bold text-[var(--app-yellow)] uppercase tracking-wider">Шаг {i + 1}</span>
              <h3 className="mt-3 text-xl font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Projects ── */}
      <section className="page-wrap pb-20 sm:pb-28">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          3 реальных проекта для портфолио
        </h2>
        <p className="mt-3 max-w-2xl text-base text-neutral-400">
          Не тесты и не домашки. Настоящие проекты — каждый ты пушишь на GitHub
          и можешь показать на собеседовании.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {projects.map((p) => (
            <div key={p.num} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="text-xs font-bold text-[var(--app-yellow)]">{p.num}</span>
              <h3 className="mt-3 text-lg font-bold text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{p.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-neutral-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you get: GitHub + Resume ── */}
      <section className="page-wrap pb-20 sm:pb-28">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Что ты получишь в конце
        </h2>
        <p className="mt-3 max-w-2xl text-base text-neutral-400">
          Не сертификат PDF, а рабочий GitHub-профиль и резюме,
          с которым можно откликаться на junior-вакансии.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* GitHub mock */}
          <div className="rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 text-xs font-bold text-white">A</div>
              <span className="text-sm font-semibold text-neutral-200">aleksei-petrov</span>
              <span className="ml-auto text-xs text-neutral-500">Repositories 3</span>
            </div>
            <div className="p-5 space-y-3">
              {githubRepos.map((repo) => (
                <div key={repo.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--app-yellow)]">{repo.name}</h4>
                      <p className="mt-1 text-xs text-neutral-500">{repo.desc}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-neutral-500">Public</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--app-yellow)]" />
                    {repo.lang}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resume mock */}
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="bg-white px-6 py-6 sm:px-8 sm:py-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Пример резюме после курса</p>
              <h3 className="mt-3 text-2xl font-black text-black sm:text-3xl">Алексей Петров</h3>
              <p className="mt-1 text-xs text-neutral-500">Москва · 24 года · telegram: @aleksei_go</p>
              <p className="mt-3 text-lg font-bold text-black">Go Backend Developer — Junior</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Прошёл практический курс по Go. Собрал 3 backend-проекта с нуля,
                оформил GitHub, умею работать с HTTP, PostgreSQL, Docker и объяснить код на созвоне.
              </p>

              <div className="mt-5">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Навыки</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {resumeSkills.map((s) => (
                    <span key={s} className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-700">{s}</span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Проекты</p>
                <div className="mt-2 space-y-2">
                  {githubRepos.map((r) => (
                    <div key={r.name} className="rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2">
                      <span className="text-xs font-bold text-black">{r.name}</span>
                      <span className="ml-2 text-xs text-neutral-500">{r.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-neutral-900 px-6 py-4">
              <p className="text-sm text-neutral-300">
                Такой GitHub + резюме можно собрать за время прохождения курса.
                Всё <strong className="text-white">бесплатно</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="page-wrap pb-20 sm:pb-28">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Чем Godemy отличается
        </h2>
        <p className="mt-3 max-w-2xl text-base text-neutral-400">
          Честное сравнение с платными онлайн-школами.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          {/* Header */}
          <div className="grid grid-cols-3 bg-white/[0.06]">
            <div className="p-4 text-sm font-bold text-neutral-400" />
            <div className="p-4 text-sm font-bold text-neutral-400 text-center">Другие курсы</div>
            <div className="p-4 text-sm font-bold text-[var(--app-yellow)] text-center">Godemy</div>
          </div>
          {/* Rows */}
          {comparison.map((row, i) => (
            <div key={row.label} className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.04]'}`}>
              <div className="p-4 text-sm font-semibold text-white">{row.label}</div>
              <div className="p-4 text-sm text-neutral-500 text-center">{row.others}</div>
              <div className="p-4 text-sm text-green-400 font-semibold text-center">{row.godemy}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trainer & Practice ── */}
      <section className="page-wrap pb-20 sm:pb-28">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <span className="text-xs font-bold text-[var(--app-yellow)] uppercase tracking-wider">Тренажёр</span>
            <h3 className="mt-3 text-2xl font-black text-white">Пиши код в браузере</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Десятки задач с автопроверкой — от переменных до горутин.
              Не нужно ничего устанавливать. Открыл, написал, запустил.
            </p>
            <Link href="/trainer" className="mt-6 inline-flex btn-secondary text-sm">
              Открыть тренажёр
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <span className="text-xs font-bold text-[var(--app-yellow)] uppercase tracking-wider">Практика</span>
            <h3 className="mt-3 text-2xl font-black text-white">Проекты по шагам</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Каждый проект разбит на требования. Ты пишешь код, коммитишь
              и получаешь готовый репозиторий — как в настоящей работе.
            </p>
            <Link href="/guide" className="mt-6 inline-flex btn-secondary text-sm">
              Начать курс
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="page-wrap pb-20 sm:pb-28">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Частые вопросы
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {faq.map(([q, a]) => (
            <div key={q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-base font-bold text-white">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="page-wrap pb-20 sm:pb-28">
        <div className="rounded-2xl border border-[var(--app-yellow)]/20 bg-[var(--app-yellow)]/[0.05] px-6 py-10 text-center sm:px-12 sm:py-14">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Бесплатно. Без регистрации. Прямо сейчас.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-neutral-400">
            Открой первый урок и напиши свой первый Go-код за 30 минут.
            Регистрация нужна только чтобы сохранить прогресс.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/guide" className="btn-primary text-center">
              Начать бесплатно
            </Link>
            <Link href="/bootcamp" className="btn-secondary text-center">
              Продвинутый курс
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
