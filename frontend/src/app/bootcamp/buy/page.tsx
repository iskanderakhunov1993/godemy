import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Go Junior Bootcamp открыт бесплатно | Godemy',
  description: 'В MVP GoDemy весь Go Junior Bootcamp открыт бесплатно. Войдите, чтобы сохранять прогресс и получить сертификат.',
}

export default function BuyPage() {
  return (
    <main className="godemy-light page-shell">
      <section className="page-wrap py-14">
        <Link href="/bootcamp" className="text-sm text-gray-500 transition-colors hover:text-white">
          ← Назад к Bootcamp
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="surface-card rounded-[34px] p-8">
            <span className="eyebrow">MVP-доступ</span>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] text-white">
              Go Junior Bootcamp открыт бесплатно
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
              Подписку подключим позже. Сейчас можно пройти Bootcamp, выполнить проекты, checkpoint и получить Go Junior Certificate без оплаты.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                'HTTP, REST API, PostgreSQL и Docker',
                '4 проекта для портфолио',
                'Финальный checkpoint',
                'Бесплатный сертификат после условий',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-gray-200">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/junior" className="btn-primary justify-center">Начать Bootcamp</Link>
              <Link href="/auth/login?next=/junior" className="btn-secondary justify-center">Войти, чтобы сохранить прогресс</Link>
            </div>
          </section>

          <aside className="surface-card h-fit rounded-[30px] p-6">
            <p className="text-sm font-bold text-cyan-300">Что будет потом</p>
            <p className="mt-3 text-sm leading-7 text-gray-400">
              GoDemy Pro вернётся как подписка на всю платформу: Go, SQL, QA и будущие направления. В этом MVP мы сначала проверяем ценность обучения и проектов.
            </p>
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              Сейчас карту вводить не нужно. Все материалы Go-трека открыты.
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
