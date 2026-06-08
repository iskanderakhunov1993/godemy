import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Godemy Pro — подписка на Bootcamp',
  description: 'Подписка на практический Bootcamp Go: уровни Junior, Middle и Senior, проекты, тренажёр и сертификаты.',
}

const included = [
  'Уровни Junior, Middle и Senior',
  'Практические проекты для портфолио',
  'Все задачи Bootcamp в тренажёре',
  'Проверка прогресса по каждому уровню',
  'PDF-сертификаты без доплаты',
]

export default function BuyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <Link href="/bootcamp" className="text-sm text-gray-500 transition-colors hover:text-white">
        ← Назад к Bootcamp
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]">
        <section>
          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-300">
            Godemy Pro
          </span>
          <h1 className="mt-6 text-4xl font-black text-white sm:text-5xl">
            Один понятный доступ
            <span className="block text-violet-400">для профессионального роста</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-400">
            Бесплатный курс и основной тренажёр остаются доступны всем.
            Подписка открывает Bootcamp, проекты уровней и сертификаты.
          </p>

          <div className="mt-10 space-y-3">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-300">✓</span>
                <span className="text-gray-200">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <p className="font-semibold text-cyan-200">Сначала хочешь проверить платформу?</p>
            <p className="mt-2 text-sm text-gray-400">
              Пройди бесплатный путь и собери три проекта. Подписка понадобится только для следующего уровня.
            </p>
            <Link href="/guide" className="mt-4 inline-flex text-sm font-bold text-cyan-300 hover:text-cyan-200">
              Начать бесплатно →
            </Link>
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-violet-500/30 bg-gray-900 p-6 shadow-2xl">
          <p className="text-sm font-bold text-violet-300">Подписка Godemy Pro</p>
          <div className="mt-5 flex items-end gap-2">
            <span className="text-5xl font-black text-white">2 490 ₽</span>
            <span className="mb-1 text-gray-500">/ месяц</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Отменить можно в любой момент.</p>

          <div className="my-6 border-t border-gray-800" />

          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Запуск оплаты</p>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Онлайн-оплата ещё подключается. Оставь заявку в Telegram — мы активируем доступ вручную и поможем начать.
          </p>
          <a
            href="https://t.me/golangacademy"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-violet-500 px-5 py-3.5 font-bold text-white transition-colors hover:bg-violet-400"
          >
            Оставить заявку
          </a>
          <p className="mt-4 text-center text-xs text-gray-600">Не вводи данные карты на сайте — оплата пока проходит вручную.</p>
        </aside>
      </div>
    </main>
  )
}
