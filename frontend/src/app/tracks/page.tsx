import Link from 'next/link'

const tracks = [
  {
    title: 'Go Developer Track',
    href: '/go',
    status: 'Открыт',
    description: 'Бесплатный путь от первого запуска Go до Junior Bootcamp, проектов и сертификата.',
  },
  {
    title: 'SQL',
    href: '#',
    status: 'Coming Soon',
    description: 'Запросы, проектирование данных и практика для backend-разработчиков.',
  },
  {
    title: 'QA',
    href: '#',
    status: 'Coming Soon',
    description: 'Тест-дизайн, чек-листы, API-проверки и работа с багами.',
  },
]

export default function TracksPage() {
  return (
    <main className="page-shell">
      <section className="page-wrap py-12">
        <span className="eyebrow">Направления</span>
        <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] text-white">Каталог GoDemy</h1>
        <p className="mt-4 max-w-2xl text-slate-400 leading-8">
          В MVP полноценно открыт Go Developer Track. Остальные направления показаны как будущие ветки платформы.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {tracks.map((track) => (
            <article key={track.title} className="surface-card rounded-[28px] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-white">{track.title}</h2>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                  {track.status}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-400">{track.description}</p>
              {track.href === '#' ? (
                <button disabled className="mt-6 rounded-xl border border-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-500">
                  Скоро
                </button>
              ) : (
                <Link href={track.href} className="btn-primary mt-6 inline-flex text-sm">
                  Открыть направление
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
