import Link from 'next/link'
import ContinueBanner from '@/components/ContinueBanner'

const bentoCards = [
  ['PROJECTS', '3 проекта бесплатно', 'CLI Calculator, console To-do и mini REST API как первые портфолио-артефакты.'],
  ['LOCAL DEV', 'Работа на своём ПК', 'Go, терминал, редактор, README и команды запуска вместо пассивного просмотра.'],
  ['TRAINER', 'Go Trainer', 'Короткие задачи по функциям, структурам, ошибкам, JSON, HTTP и тестам.'],
  ['BOOTCAMP', 'Junior Bootcamp', 'Backend-проекты, checkpoint и маршрут к Junior-уровню. В MVP открыт бесплатно.'],
  ['CERTIFICATE', 'Сертификат за результат', 'Выдаётся после уроков, задач, проектов, checkpoint и заполненного имени.'],
  ['ROADMAP', 'Middle / Senior далее', 'Будущие уровни показаны как Coming Soon без ложных рабочих маршрутов.'],
]

const roadmap = [
  ['01', 'Free Go Course', 'Бесплатно', 'Установи Go, запусти первую программу и собери 3 стартовых проекта.'],
  ['02', 'Go Trainer', 'Бесплатно', 'Закрепляй темы короткими задачами и возвращайся к слабым местам.'],
  ['03', 'Go Junior Bootcamp', 'MVP Free', 'Собери backend-проекты, пройди checkpoint и открой сертификат.'],
  ['04', 'Go Middle Bootcamp', 'Coming Soon', 'Архитектура, production-практики и более сложные сервисы.'],
  ['05', 'Go Senior Bootcamp', 'Coming Soon', 'Системный дизайн, надежность и инженерное лидерство.'],
]

const projects = [
  ['PROJECT 01', 'CLI Calculator', 'Ввод чисел, операции, обработка ошибок и запуск через go run.'],
  ['PROJECT 02', 'Console To-do', 'Команды add/list/done, хранение в JSON и понятный README.'],
  ['PROJECT 03', 'Mini REST API', 'HTTP endpoints, JSON-ответы, status codes и curl/Postman проверки.'],
]

export default function Home() {
  return (
    <main className="page-shell">
      <ContinueBanner />

      <section className="page-wrap py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <span className="eyebrow">GO DEVELOPER TRACK</span>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#17201d] sm:text-6xl">
              С нуля собери 3 Go-проекта на своём компьютере
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#647067] sm:text-lg">
              Практическая платформа для тех, кто хочет не просто смотреть уроки, а реально научиться писать код,
              запускать проекты и двигаться к уровню Junior.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/guide/atlas-first-day" className="btn-primary">
                Начать Go бесплатно
              </Link>
              <Link href="/go" className="btn-secondary">
                Посмотреть программу
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {['FREE COURSE', '3 PROJECTS', 'GO TRAINER', 'JUNIOR CERTIFICATE'].map((label) => (
                <span key={label} className="mono-chip">{label}</span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bento-card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#dfe6dc] bg-[#f8faf4] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dffbea] font-mono text-sm font-black text-[#087a43]">
                    Go
                  </div>
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#647067]">local workspace</p>
                    <p className="font-semibold text-[#17201d]">main.go · README.md · requests.http</p>
                  </div>
                </div>
                <span className="mono-chip">status: ready</span>
              </div>

              <div className="mt-4 terminal-panel">
                <div className="terminal-bar">
                  <span className="terminal-dot bg-[#ff5f57]" />
                  <span className="terminal-dot bg-[#ffbd2e]" />
                  <span className="terminal-dot bg-[#28c840]" />
                  <span className="ml-2 font-mono text-xs text-slate-400">~/godemy/project-03</span>
                </div>
                <pre className="px-5 py-5 font-mono text-sm leading-7">
                  <code>{`$ go run main.go
server started on localhost:8080
GET /health 200 OK
status: project ready`}</code>
                </pre>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#dfe6dc] bg-white p-4">
                  <span className="mono-chip">PROJECT 03</span>
                  <p className="mt-3 text-lg font-bold text-[#17201d]">Mini REST API</p>
                  <p className="mt-2 text-sm leading-6 text-[#647067]">HTTP, JSON, status codes, curl checks.</p>
                </div>
                <div className="rounded-2xl border border-[#dfe6dc] bg-white p-4">
                  <span className="mono-chip">CHECKPOINT</span>
                  <p className="mt-3 text-lg font-bold text-[#17201d]">Self-check</p>
                  <p className="mt-2 text-sm leading-6 text-[#647067]">GitHub URL, заметка и отметка готовности.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {bentoCards.map(([label, title, text], index) => (
            <article key={title} className={`bento-card p-5 ${index === 0 || index === 3 ? 'md:col-span-2' : ''}`}>
              <span className="mono-chip">{label}</span>
              <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[#17201d]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#647067]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="eyebrow">ROADMAP</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17201d] sm:text-4xl">
              Бесплатный курс → проекты → тренажёр → bootcamp → сертификат
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#647067]">
              GoDemy ведёт пользователя через практику и делает следующий шаг очевидным на каждом экране.
            </p>
          </div>
          <div className="space-y-3">
            {roadmap.map(([step, title, status, text]) => (
              <article key={title} className="bento-card grid gap-4 p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center">
                <div className="font-mono text-2xl font-black text-[#20a865]">{step}</div>
                <div>
                  <h3 className="font-bold text-[#17201d]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#647067]">{text}</p>
                </div>
                <span className="mono-chip">{status}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap pb-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">FREE PROJECTS</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#17201d]">Первые 3 проекта для портфолио</h2>
          </div>
          <Link href="/go" className="btn-secondary">Открыть Go Track</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {projects.map(([label, title, text]) => (
            <article key={title} className="bento-card p-5">
              <span className="mono-chip">{label}</span>
              <h3 className="mt-4 text-xl font-black text-[#17201d]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#647067]">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
