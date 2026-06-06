import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Купить Bootcamp Junior — Godemy',
  description: 'Полный доступ к Bootcamp Junior Godemy на 2 месяца. 5 реальных проектов, авто-проверка кода, сертификаты PDF. 4 990 ₽.',
}

const included = [
  'Безлимитные задачи тренажёра',
  'Сертификаты в PDF (скачать)',
  'Доступ к заданиям с собеседований',
  'Доступ к эталонным решениям',
  'Доступ к Bootcamp Junior (5 проектов)',
  '2 месяца полного доступа',
]

export default function BuyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <Link
        href="/bootcamp"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors"
      >
        ← Назад к Bootcamp
      </Link>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left — value proposition */}
        <div>
          {/* Hero */}
          <div className="rounded-[28px] bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border border-cyan-500/20 px-8 py-8 mb-6">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">AI-помощник включён</p>
            <h1 className="text-3xl font-black text-white mb-3 leading-tight">
              Перестань тратить<br />часы на одну задачу
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              AI-помощник объясняет ошибки и подсказывает решения — ты учишься быстрее
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Card 1 */}
            <div className="rounded-2xl border border-gray-700/60 bg-gray-900/60 p-5">
              <h3 className="font-bold text-white mb-2">Готовься к реальным собеседованиям</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Решай задачи, которые действительно спрашивают крупные компании
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Alfa-Bank', 'МТС', 'Spotify', 'VK', 'Microsoft', 'Сбер'].map((c) => (
                  <span key={c} className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-gray-700/60 bg-gray-900/60 p-5">
              <h3 className="font-bold text-white mb-2">Докажи свои навыки работодателю</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Получи сертификат после 50+ успешно решённых задач
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
                <span className="text-amber-400 text-lg">🎓</span>
                <span className="text-xs text-amber-300 font-semibold">Godemy Certificate</span>
              </div>
            </div>
          </div>

          {/* Access to reference solutions */}
          <div className="rounded-2xl border border-gray-700/60 bg-gray-900/60 p-5">
            <h3 className="font-bold text-white mb-1">Доступ к эталонному решению</h3>
            <p className="text-sm text-gray-400">
              Решил, но не уверен что оптимально? Мы покажем образцовое решение
            </p>
          </div>
        </div>

        {/* Right — payment card (sticky) */}
        <div className="lg:sticky lg:top-20">
          <div className="rounded-[28px] border border-gray-700/60 bg-gray-900 overflow-hidden shadow-2xl">
            <div className="px-6 pt-6 pb-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Разблокируй полный доступ</h2>
              <ul className="space-y-2.5">
                {included.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-5">
              {/* Payment method toggle */}
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Способ оплаты</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="bg-cyan-500/10 border-2 border-cyan-500/50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <span className="text-xs font-semibold text-cyan-300">Российская карта / СБП</span>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <span className="text-xs text-gray-400">Банковская карта</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-5xl font-black text-white">4 990</span>
                <span className="text-2xl text-gray-400 mb-1">₽</span>
              </div>
              <p className="text-sm text-gray-500 mb-5">Доступ на 2 месяца, без автопродления</p>

              {/* Payment details */}
              <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Перевод по СБП / карта</p>
                <p className="text-white font-mono text-lg font-bold tracking-widest select-all">+7 (996) 336-16-89</p>
                <p className="text-gray-500 text-xs mt-0.5">Получатель: Искандер А.</p>
              </div>

              <div className="text-sm text-gray-400 space-y-1 mb-4">
                <p>1. Переведи <span className="text-white font-semibold">4 990 ₽</span> по номеру</p>
                <p>2. В комментарии укажи email с регистрации</p>
                <p>3. Напиши в Telegram — доступ откроем за час</p>
              </div>

              <a
                href="https://t.me/golangacademy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-5 py-3.5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.08 13.99l-2.98-.924c-.648-.204-.66-.648.136-.961l11.647-4.49c.54-.194 1.016.131.84.96l.17-.354z" />
                </svg>
                Войти и оплатить
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-4 space-y-3 text-sm text-gray-500 px-1">
            <p>
              <span className="text-gray-300 font-semibold">Когда откроется доступ?</span>{' '}
              В течение 1 часа в рабочее время (9:00–22:00 МСК).
            </p>
            <p>
              <span className="text-gray-300 font-semibold">Есть ли возврат?</span>{' '}
              Да, в течение 3 дней если не начал обучение.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

