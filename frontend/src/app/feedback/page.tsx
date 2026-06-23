'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const TELEGRAM_LINK = 'https://t.me/golangacademy'
const EMAIL = 'golangeracademy@gmail.com'
const DONATE_PHONE = '+7 (996) 336-16-89'

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={`text-xs px-3 py-1 rounded-lg border transition-all font-medium ${
        copied
          ? 'border-emerald-500/40 bg-[#FFD60A]/10 text-[#FFD60A]'
          : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
      }`}
    >
      {copied ? '✓ Скопировано' : (label ?? 'Копировать')}
    </button>
  )
}

export default function FeedbackPage() {
  // Scroll to hash anchor on load
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const el = document.querySelector(hash)
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
          ← Назад к профилю
        </Link>
        <h1 className="text-4xl font-black text-white mb-3">Обратная связь</h1>
        <p className="text-gray-400 leading-relaxed">
          Мы рады любым сообщениям — вопросам, идеям или сообщениям об ошибках.
          Это помогает делать платформу лучше для всех.
        </p>
      </div>

      <div className="space-y-6">

        {/* 1 — General questions */}
        <section id="questions" className="rounded-[28px] border border-gray-800 bg-[#111315] p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl flex-shrink-0">
              ✉️
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Вопросы и помощь</h2>
              <p className="text-sm text-gray-500">Не можешь решить задачу? Есть вопрос по курсу? Напиши нам.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700/60 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-white font-mono text-sm select-all">{EMAIL}</p>
              </div>
              <CopyButton text={EMAIL} />
            </div>

            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-gray-800/50 border border-gray-700/60 hover:border-cyan-500/30 rounded-xl px-4 py-3 transition-colors group"
            >
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Telegram</p>
                <p className="text-white text-sm font-medium group-hover:text-[#FFD60A] transition-colors">@golangacademy</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-[#FFD60A] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.08 13.99l-2.98-.924c-.648-.204-.66-.648.136-.961l11.647-4.49c.54-.194 1.016.131.84.96l.17-.354z"/>
              </svg>
            </a>
          </div>
        </section>

        {/* 2 — Bug report */}
        <section id="bug" className="rounded-[28px] border border-gray-800 bg-[#111315] p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-2xl flex-shrink-0">
              🐛
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Нашёл ошибку</h2>
              <p className="text-sm text-gray-500">Баг в задаче, опечатка в тексте, неправильный ответ? Расскажи нам — мы исправим.</p>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-700/40 rounded-2xl p-4 mb-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-white font-semibold">Как сообщить об ошибке:</span><br />
              Напиши в Telegram или на email с пометкой <span className="text-rose-400 font-mono text-xs bg-rose-500/10 px-1.5 py-0.5 rounded">[BUG]</span> в начале — Например:{' '}
              <span className="text-gray-300 text-xs font-mono">[BUG] Задача #42 — неверный ожидаемый вывод</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:${EMAIL}?subject=[BUG] Описание ошибки`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-sm text-gray-300 hover:text-white hover:border-rose-500/30 transition-colors"
            >
              ✉️ Написать на email
            </a>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-sm text-gray-300 hover:text-white hover:border-rose-500/30 transition-colors"
            >
              ✈️ Написать в Telegram
            </a>
          </div>
        </section>

        {/* 3 — Ideas */}
        <section id="ideas" className="rounded-[28px] border border-gray-800 bg-[#111315] p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
              💡
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Идеи для платформы</h2>
              <p className="text-sm text-gray-500">Хочешь новую тему, другой формат или видишь что можно улучшить? Мы читаем все идеи.</p>
            </div>
          </div>

          <div className="space-y-2 mb-5 text-sm text-gray-400">
            {[
              'Новые темы и задачи в тренажёре',
              'Улучшения интерфейса',
              'Новые форматы обучения',
              'Интеграции и экспорт',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:${EMAIL}?subject=[IDEA] Моя идея для платформы`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-sm text-gray-300 hover:text-white hover:border-amber-500/30 transition-colors"
            >
              ✉️ Предложить по email
            </a>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-sm text-gray-300 hover:text-white hover:border-amber-500/30 transition-colors"
            >
              ✈️ Написать в Telegram
            </a>
          </div>
        </section>

        {/* 4 — Donate */}
        <section id="donate" className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-amber-900/10 to-orange-900/10 p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl flex-shrink-0">
              ☕
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Поддержать проект</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Godemy — это независимый проект, созданный по любви к Go и обучению.
                Если платформа помогла тебе — можешь угостить нас кофе. Это мотивирует делать больше.
              </p>
            </div>
          </div>

          {/* What donations go to */}
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {[
              { icon: '🖥️', label: 'Серверы', desc: 'Хостинг и инфраструктура' },
              { icon: '✍️', label: 'Контент', desc: 'Новые задачи и уроки' },
              { icon: '⚡', label: 'Развитие', desc: 'Новые фичи платформы' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Payment details */}
          <div className="bg-gray-900/80 border border-amber-500/20 rounded-2xl p-5 mb-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Способы перевода</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">СБП / Карта (Россия)</p>
                  <p className="text-white font-mono text-base font-bold tracking-widest select-all">{DONATE_PHONE}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Получатель: Искандер А.</p>
                </div>
                <CopyButton text={DONATE_PHONE} label="Скопировать" />
              </div>

              <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email получателя</p>
                  <p className="text-white text-sm select-all">{EMAIL}</p>
                </div>
                <CopyButton text={EMAIL} />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed mb-5">
            Любая сумма — от 100 ₽ — уже помогает. Укажи «донат» в комментарии к переводу.
            Если хочешь, чтобы мы поблагодарили тебя публично — напиши своё имя или ник.
          </p>

          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold px-5 py-3 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.08 13.99l-2.98-.924c-.648-.204-.66-.648.136-.961l11.647-4.49c.54-.194 1.016.131.84.96l.17-.354z"/>
            </svg>
            Написать после перевода
          </a>
        </section>

      </div>
    </div>
  )
}
