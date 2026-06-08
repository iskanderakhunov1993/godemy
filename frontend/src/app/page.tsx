import Link from 'next/link'
import ContinueBanner from '@/components/ContinueBanner'
import { FadeInSection } from '@/components/ScrollEffects'

const topics = [
  { title: 'Введение в Go', category: 'Основы' },
  { title: 'Переменные и типы', category: 'Основы' },
  { title: 'Функции', category: 'Основы' },
  { title: 'Управляющие конструкции', category: 'Основы' },
  { title: 'Массивы, срезы, карты', category: 'Структуры данных' },
  { title: 'Структуры и интерфейсы', category: 'ООП в Go' },
  { title: 'Горутины и каналы', category: 'Конкурентность' },
  { title: 'Обработка ошибок', category: 'Продвинутое' },
]

const audience = [
  {
    icon: '🚀',
    title: 'Для новичков',
    desc: 'Начните с нуля и освойте Go — один из самых востребованных языков бэкенда — через практику, а не скучные лекции',
  },
  {
    icon: '</>',
    title: 'Для разработчиков',
    desc: 'Добавьте Go в свой стек. Научитесь писать быстрые, эффективные сервисы и сразу закрепите знания в тренажёре',
    mono: true,
  },
  {
    icon: '🧪',
    title: 'Для тестировщиков',
    desc: 'Разберитесь в логике Go-кода, чтобы писать более точные тест-кейсы и лучше понимать архитектуру сервисов',
  },
  {
    icon: '🎓',
    title: 'Для студентов',
    desc: 'Получите практические навыки, которые ценят работодатели. Решайте задачи уровня реальных собеседований',
  },
]

const reviews = [
  {
    name: 'Алексей М.',
    role: 'Junior Backend Developer',
    text: 'Спасибо огромное за курс! После двух недель практики в тренажёре я уверенно прошёл техническое собеседование в стартап и получил оффер. Задачи действительно похожи на то, что спрашивают в реальных интервью.',
    initials: 'АМ',
  },
  {
    name: 'Дарья К.',
    role: 'Python-разработчик',
    text: 'Хотела освоить Go после Python — и это лучшее, что я нашла. Объяснение горутин и каналов просто шикарное, сразу понятно зачем их использовать. Уже применяю в рабочем проекте!',
    initials: 'ДК',
  },
  {
    name: 'Тимур Н.',
    role: 'Frontend разработчик',
    text: 'Решил разобраться в бэкенде, начал с этого курса. Понравилось, что можно писать код прямо в браузере — не нужно ничего устанавливать. Прогресс сохраняется, можно учиться в любое время. Устроился на работу Go-разработчиком!',
    initials: 'ТН',
  },
  {
    name: 'Светлана В.',
    role: 'QA Engineer',
    text: 'Отличный курс для понимания того, как работает Go изнутри. Теперь гораздо лучше понимаю код коллег и могу писать более точные баг-репорты. Спасибо, очень структурировано и без лишней воды!',
    initials: 'СВ',
  },
  {
    name: 'Роман П.',
    role: 'Студент МГТУ',
    text: 'Готовился к стажировке в крупную IT-компанию, прошёл курс за 3 недели. На собеседовании спросили про горутины — отвечал уверенно, именно так, как объяснялось здесь. Взяли! Рекомендую всем студентам.',
    initials: 'РП',
  },
]

const faq = [
  {
    q: 'Нужно ли знать программирование заранее?',
    a: 'Необязательно. Курс начинается с самых основ — переменных, типов и синтаксиса. Если вы уже знаете любой другой язык, освоите Go ещё быстрее.',
  },
  {
    q: 'Сколько времени нужно уделять обучению?',
    a: 'Это зависит только от вас. При занятиях по 5 часов в неделю курс можно пройти за 2–3 недели. При интенсивной подготовке к собеседованию — за несколько дней.',
  },
  {
    q: 'Когда можно начать обучение?',
    a: 'Прямо сейчас. Курс полностью онлайн и доступен 24/7. Регистрация не обязательна для старта — просто открой первый урок.',
  },
  {
    q: 'Сохраняется ли мой прогресс?',
    a: 'Да. После регистрации весь прогресс по урокам и задачам сохраняется в вашем профиле. Можете учиться с любого устройства.',
  },
  {
    q: 'Есть ли подготовка к собеседованиям?',
    a: 'Да. Тренажёр содержит задачи, приближённые к реальным вопросам на Go-интервью: горутины, интерфейсы, обработка ошибок, структуры данных.',
  },
]

export default function Home() {
  return (
    <main>
      <ContinueBanner />
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/5 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite_2s]" />
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-3xl animate-[pulse_7s_ease-in-out_infinite_1s]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-28 text-center w-full">
          {/* Social proof bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-sm text-cyan-400">
              <span>🏆</span>
              <span>Курс, тренажёр и bootcamp в одном месте</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-sm text-emerald-300">
              <span>✓</span>
              <span>Прогресс сохраняется в аккаунте</span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-gray-100 mb-8 leading-[1.1] tracking-tight">
            Освойте{' '}
            <span className="text-cyan-400 relative">
              Go
              <span className="absolute -inset-x-2 -bottom-1 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
            </span>
            {', '}
            <br className="hidden sm:block" />
            практикуясь на реальных задачах
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Интерактивный курс с теорией, тренажёром и подготовкой к собеседованию.
            Пишите и запускайте код прямо в браузере — без установки.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/guide" className="btn-primary text-base px-8 py-3.5">
              Начать курс →
            </Link>
            <Link href="/trainer" className="btn-secondary text-base px-8 py-3.5">
              Открыть тренажёр
            </Link>
          </div>
          <p className="mt-7 text-sm text-gray-500">
            Бесплатно · Без регистрации для старта · Прогресс сохраняется
          </p>
        </div>
      </section>

      {/* Companies */}
      <section className="border-y border-gray-800/60 py-12 overflow-hidden">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 mb-8">
          Наши ученики работают в
        </p>
        {/* marquee wrapper */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />
          <div className="flex gap-14 items-center animate-[marquee_28s_linear_infinite] w-max">
            {[
              { name: 'Сбертех', svg: <svg viewBox="0 0 80 28" fill="none" className="h-6"><rect x="2" y="2" width="24" height="24" rx="5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 14h12M14 8v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><text x="32" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">СберТех</text></svg> },
              { name: 'Т-Банк', svg: <svg viewBox="0 0 60 28" fill="none" className="h-6"><rect x="2" y="2" width="24" height="24" rx="12" stroke="currentColor" strokeWidth="1.5"/><text x="6" y="19" fontSize="12" fontFamily="sans-serif" fontWeight="700" fill="currentColor">Т</text><text x="31" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Банк</text></svg> },
              { name: 'PLATA', svg: <svg viewBox="0 0 64 28" fill="none" className="h-6"><path d="M4 22V6h8a6 6 0 010 12H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><text x="22" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor" letterSpacing="1">PLATA</text></svg> },
              { name: 'IBM', svg: <svg viewBox="0 0 46 28" fill="none" className="h-6"><text x="4" y="20" fontSize="18" fontFamily="sans-serif" fontWeight="800" fill="currentColor" letterSpacing="2">IBM</text></svg> },
              { name: 'Apple', svg: <svg viewBox="0 0 64 28" fill="none" className="h-6"><path d="M18 7c-1.5 0-3 .8-4 2.1-1 1.2-1.5 2.8-1.3 4.4.1 1.5.7 3 1.7 4 .9 1 2.1 1.5 3.3 1.5.6 0 1.2-.2 1.7-.4.4-.2.7-.3 1.1-.3.4 0 .7.1 1.1.3.5.2 1.1.4 1.7.4 1.2 0 2.4-.5 3.3-1.5 1-1 1.6-2.5 1.7-4 .2-1.6-.3-3.2-1.3-4.4-1-1.3-2.5-2.1-4-2.1-.5 0-1 .2-1.4.4-.3.2-.6.3-1.1.3-.5 0-.8-.1-1.1-.3C19 7.2 18.5 7 18 7z" stroke="currentColor" strokeWidth="1.3"/><path d="M20 4.5c.4-.5.7-1.1.8-1.7-.6 0-1.3.3-1.8.8-.4.5-.8 1.1-.8 1.7.6 0 1.3-.3 1.8-.8z" fill="currentColor"/><text x="32" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Apple</text></svg> },
              { name: 'Revolut', svg: <svg viewBox="0 0 76 28" fill="none" className="h-6"><rect x="2" y="4" width="18" height="20" rx="4" stroke="currentColor" strokeWidth="1.5"/><path d="M6 12h6a3 3 0 010 6H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M12 18l4 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><text x="26" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Revolut</text></svg> },
              { name: 'ЮMoney', svg: <svg viewBox="0 0 80 28" fill="none" className="h-6"><circle cx="13" cy="14" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M9 14l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><text x="28" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">ЮMoney</text></svg> },
              { name: 'QIWI', svg: <svg viewBox="0 0 58 28" fill="none" className="h-6"><circle cx="13" cy="14" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11a4 4 0 015 5.5L18 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><text x="28" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor" letterSpacing="1">QIWI</text></svg> },
              { name: 'VK', svg: <svg viewBox="0 0 42 28" fill="none" className="h-6"><rect x="2" y="2" width="38" height="24" rx="8" stroke="currentColor" strokeWidth="1.5"/><text x="9" y="20" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor" letterSpacing="1">VK</text></svg> },
              { name: 'Wildberries', svg: <svg viewBox="0 0 96 28" fill="none" className="h-6"><path d="M4 8l4 12 4-8 4 8 4-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><text x="26" y="19" fontSize="11" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Wildberries</text></svg> },
              { name: 'Ozon', svg: <svg viewBox="0 0 58 28" fill="none" className="h-6"><circle cx="13" cy="14" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M9 14h8M13 10v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><text x="27" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor">Ozon</text></svg> },
              { name: 'Yandex', svg: <svg viewBox="0 0 74 28" fill="none" className="h-6"><text x="4" y="20" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor">Яндекс</text></svg> },
              { name: 'Benzuber', svg: <svg viewBox="0 0 82 28" fill="none" className="h-6"><path d="M4 20V8h6a4 4 0 010 8H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><text x="18" y="19" fontSize="11" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Benzuber</text></svg> },
            ].concat([
              { name: 'Сбертех', svg: <svg viewBox="0 0 80 28" fill="none" className="h-6"><rect x="2" y="2" width="24" height="24" rx="5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 14h12M14 8v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><text x="32" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">СберТех</text></svg> },
              { name: 'Т-Банк-2', svg: <svg viewBox="0 0 60 28" fill="none" className="h-6"><rect x="2" y="2" width="24" height="24" rx="12" stroke="currentColor" strokeWidth="1.5"/><text x="6" y="19" fontSize="12" fontFamily="sans-serif" fontWeight="700" fill="currentColor">Т</text><text x="31" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Банк</text></svg> },
              { name: 'PLATA-2', svg: <svg viewBox="0 0 64 28" fill="none" className="h-6"><path d="M4 22V6h8a6 6 0 010 12H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><text x="22" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor" letterSpacing="1">PLATA</text></svg> },
              { name: 'IBM-2', svg: <svg viewBox="0 0 46 28" fill="none" className="h-6"><text x="4" y="20" fontSize="18" fontFamily="sans-serif" fontWeight="800" fill="currentColor" letterSpacing="2">IBM</text></svg> },
              { name: 'Apple-2', svg: <svg viewBox="0 0 64 28" fill="none" className="h-6"><path d="M18 7c-1.5 0-3 .8-4 2.1-1 1.2-1.5 2.8-1.3 4.4.1 1.5.7 3 1.7 4 .9 1 2.1 1.5 3.3 1.5.6 0 1.2-.2 1.7-.4.4-.2.7-.3 1.1-.3.4 0 .7.1 1.1.3.5.2 1.1.4 1.7.4 1.2 0 2.4-.5 3.3-1.5 1-1 1.6-2.5 1.7-4 .2-1.6-.3-3.2-1.3-4.4-1-1.3-2.5-2.1-4-2.1-.5 0-1 .2-1.4.4-.3.2-.6.3-1.1.3-.5 0-.8-.1-1.1-.3C19 7.2 18.5 7 18 7z" stroke="currentColor" strokeWidth="1.3"/><path d="M20 4.5c.4-.5.7-1.1.8-1.7-.6 0-1.3.3-1.8.8-.4.5-.8 1.1-.8 1.7.6 0 1.3-.3 1.8-.8z" fill="currentColor"/><text x="32" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Apple</text></svg> },
              { name: 'Revolut-2', svg: <svg viewBox="0 0 76 28" fill="none" className="h-6"><rect x="2" y="4" width="18" height="20" rx="4" stroke="currentColor" strokeWidth="1.5"/><path d="M6 12h6a3 3 0 010 6H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M12 18l4 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><text x="26" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Revolut</text></svg> },
              { name: 'ЮMoney-2', svg: <svg viewBox="0 0 80 28" fill="none" className="h-6"><circle cx="13" cy="14" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M9 14l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><text x="28" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="600" fill="currentColor">ЮMoney</text></svg> },
              { name: 'QIWI-2', svg: <svg viewBox="0 0 58 28" fill="none" className="h-6"><circle cx="13" cy="14" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11a4 4 0 015 5.5L18 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><text x="28" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor" letterSpacing="1">QIWI</text></svg> },
              { name: 'VK-2', svg: <svg viewBox="0 0 42 28" fill="none" className="h-6"><rect x="2" y="2" width="38" height="24" rx="8" stroke="currentColor" strokeWidth="1.5"/><text x="9" y="20" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor" letterSpacing="1">VK</text></svg> },
              { name: 'Wildberries-2', svg: <svg viewBox="0 0 96 28" fill="none" className="h-6"><path d="M4 8l4 12 4-8 4 8 4-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><text x="26" y="19" fontSize="11" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Wildberries</text></svg> },
              { name: 'Ozon-2', svg: <svg viewBox="0 0 58 28" fill="none" className="h-6"><circle cx="13" cy="14" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M9 14h8M13 10v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><text x="27" y="19" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor">Ozon</text></svg> },
              { name: 'Yandex-2', svg: <svg viewBox="0 0 74 28" fill="none" className="h-6"><text x="4" y="20" fontSize="13" fontFamily="sans-serif" fontWeight="700" fill="currentColor">Яндекс</text></svg> },
              { name: 'Benzuber-2', svg: <svg viewBox="0 0 82 28" fill="none" className="h-6"><path d="M4 20V8h6a4 4 0 010 8H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><text x="18" y="19" fontSize="11" fontFamily="sans-serif" fontWeight="600" fill="currentColor">Benzuber</text></svg> },
            ]).map((c) => (
              <div key={c.name} className="flex items-center text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
                {c.svg}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us — practice stats */}
      <FadeInSection>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-cyan-400 font-semibold uppercase tracking-wider text-sm mb-3">Только практика</p>
              <h2 className="text-4xl font-bold text-gray-100 mb-6 leading-tight">
                Практика, которая <span className="text-cyan-400">эффективнее</span> на 90% других курсов
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Мы убрали долгие видео и пассивное чтение. Вместо этого — код, задачи, мгновенная обратная связь.
                Именно так запоминается язык.
              </p>
              <div className="space-y-4">
                {[
                  { icon: '🎯', text: 'Тренажёр с задачами, как на реальных собеседованиях' },
                  { icon: '📚', text: 'Курс с теорией и примерами из практики' },
                  { icon: '💼', text: 'Подготовка к собеседованию по Go' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trainer mockup */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-900/80">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <div className="ml-3 flex gap-4 text-xs text-gray-500">
                  <span className="text-gray-100 font-medium">Задание</span>
                  <span>Отправки</span>
                  <span>Решение</span>
                </div>
                <span className="ml-auto text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Go 1.22</span>
              </div>
              {/* Task panel */}
              <div className="grid grid-cols-2">
                <div className="p-4 border-r border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">ЗАДАНИЕ #42</div>
                  <div className="font-semibold text-gray-100 mb-2 text-sm">Конкурентный счётчик</div>
                  <div className="inline-block text-xs bg-amber-500/20 text-amber-400 rounded px-2 py-0.5 mb-3">средний</div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Напишите потокобезопасный счётчик с использованием горутин и каналов.
                    Все горутины должны завершиться до вывода результата.
                  </p>
                  <div className="mt-3 text-xs text-gray-500">Ожидаемый вывод:</div>
                  <div className="mt-1 bg-gray-950 rounded px-2 py-1 text-xs font-mono text-emerald-400">Count: 1000</div>
                </div>
                <div className="p-0 flex flex-col">
                  <pre className="p-4 text-xs font-mono text-gray-300 flex-1 overflow-hidden leading-relaxed">
                    <span className="text-blue-400">func</span>
                    <span className="text-cyan-400"> main</span>
                    <span>{`() {`}</span>
                    {'\n'}
                    <span>{`  ch := `}</span>
                    <span className="text-cyan-400">make</span>
                    <span>{`(chan int)`}</span>
                    {'\n'}
                    <span>{`  `}</span>
                    <span className="text-blue-400">var</span>
                    <span>{` wg sync.`}</span>
                    <span className="text-cyan-400">WaitGroup</span>
                    {'\n'}
                    <span className="text-gray-600">{`  // ваш код`}</span>
                    {'\n'}
                    <span>{`}`}</span>
                  </pre>
                  <div className="border-t border-gray-700 px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">$</span>
                    <button className="text-xs bg-cyan-500 text-gray-950 font-semibold px-3 py-1 rounded">
                      Запустить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
            {[
              { stat: '100+', label: 'Заданий, приближённых к реальным задачам' },
              { stat: '3', label: 'Уровня сложности — от простого до сложного' },
              { stat: '100%', label: 'Прогресс сохраняется после каждого задания' },
            ].map((item) => (
              <div key={item.stat} className="text-center bg-gray-900 border border-gray-800 rounded-xl px-6 py-8">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{item.stat}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeInSection>

      {/* For whom */}
      <FadeInSection>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Для кого подойдёт курс</h2>
        <p className="text-gray-400 mb-8">Курс подходит всем, кто хочет освоить Go на практике</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {audience.map((a) => (
            <div key={a.title} className="card hover:border-gray-700 transition-colors">
              <div className="mb-3">
                {a.mono ? (
                  <span className="text-2xl font-mono font-bold text-cyan-400">{a.icon}</span>
                ) : (
                  <span className="text-3xl">{a.icon}</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">{a.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
        {/* Corporate row */}
        <div className="card hover:border-gray-700 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="text-3xl flex-shrink-0">🏢</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-100 mb-1">Для корпоративных клиентов</h3>
            <p className="text-sm text-gray-400">
              Профессиональная подготовка команды к работе с Go, контроль прогресса каждого сотрудника и готовые учебные программы под ваши задачи
            </p>
          </div>
          <Link href="/guide" className="btn-secondary flex-shrink-0 text-sm">
            Подробнее →
          </Link>
        </div>
      </section>
      </FadeInSection>

      {/* Course topics */}
      <FadeInSection>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Программа курса</h2>
        <p className="text-gray-400 mb-8">8 тем — от Hello World до конкурентности</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {topics.map((t, i) => (
            <Link
              key={t.title}
              href="/guide"
              className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 py-3 transition-colors group"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-mono font-bold">
                {i + 1}
              </span>
              <div>
                <div className="font-medium text-gray-100 group-hover:text-cyan-400 transition-colors">
                  {t.title}
                </div>
                <div className="text-xs text-gray-500">{t.category}</div>
              </div>
              <span className="ml-auto text-gray-600 group-hover:text-gray-400">→</span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/guide" className="btn-primary">
            Начать обучение
          </Link>
        </div>
      </section>
      </FadeInSection>

      {/* Code demo */}
      <FadeInSection>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Пиши код прямо в браузере
            </h2>
            <p className="text-gray-400 mb-6">
              Встроенный редактор с подсветкой синтаксиса Go. Запускай код и мгновенно
              видь результат. Решай задачи и получай автоматическую проверку с подсказками.
            </p>
            <Link href="/trainer" className="btn-primary inline-block">
              Открыть тренажёр
            </Link>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-700 bg-gray-900/50">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-xs text-gray-500 font-mono">main.go</span>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto">
              <code>
                <span className="text-blue-400">package</span>
                <span className="text-gray-300"> main</span>
                {'\n\n'}
                <span className="text-blue-400">import</span>
                <span className="text-gray-300"> </span>
                <span className="text-amber-300">&quot;fmt&quot;</span>
                {'\n\n'}
                <span className="text-blue-400">func</span>
                <span className="text-cyan-400"> main</span>
                <span className="text-gray-300">() {'{'}</span>
                {'\n'}
                <span className="text-gray-300">    fmt.</span>
                <span className="text-cyan-400">Println</span>
                <span className="text-gray-300">(</span>
                <span className="text-emerald-400">&quot;Hello, Gopher!&quot;</span>
                <span className="text-gray-300">)</span>
                {'\n'}
                <span className="text-gray-300">{'}'}</span>
              </code>
            </pre>
            <div className="border-t border-gray-700 px-4 py-2 bg-gray-950/50">
              <span className="text-xs text-gray-500 font-mono">$ </span>
              <span className="text-xs text-emerald-400 font-mono">Hello, Gopher!</span>
            </div>
          </div>
        </div>
      </section>
      </FadeInSection>

      {/* Salaries & Vacancies */}
      <FadeInSection>
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Перспективы Go-разработчика</h2>
          <p className="text-gray-400 mb-10">Рыночные зарплаты и количество открытых вакансий — данные за 2024–2025 гг.</p>

          {/* Salaries */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Russia */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🇷🇺</span>
                <span className="font-semibold text-gray-100 text-lg">Россия</span>
                <span className="ml-auto text-xs text-gray-500">в месяц, ₽</span>
              </div>
              <div className="space-y-4">
                {[
                  { level: 'Junior', range: '80 000 – 130 000 ₽', bar: 25, color: 'bg-blue-500' },
                  { level: 'Middle', range: '180 000 – 280 000 ₽', bar: 60, color: 'bg-cyan-500' },
                  { level: 'Senior', range: '300 000 – 500 000+ ₽', bar: 100, color: 'bg-emerald-500' },
                ].map((s) => (
                  <div key={s.level}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-300">{s.level}</span>
                      <span className="text-sm font-semibold text-gray-100">{s.range}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.bar}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4">По данным hh.ru, Habr Career, 2024–2025</p>
            </div>

            {/* USA */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">🇺🇸</span>
                <span className="font-semibold text-gray-100 text-lg">США</span>
                <span className="ml-auto text-xs text-gray-500">в год, $</span>
              </div>
              <div className="space-y-4">
                {[
                  { level: 'Junior', range: '$80 000 – $110 000', bar: 28, color: 'bg-blue-500' },
                  { level: 'Middle', range: '$130 000 – $180 000', bar: 62, color: 'bg-cyan-500' },
                  { level: 'Senior', range: '$200 000 – $300 000+', bar: 100, color: 'bg-emerald-500' },
                ].map((s) => (
                  <div key={s.level}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-300">{s.level}</span>
                      <span className="text-sm font-semibold text-gray-100">{s.range}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.bar}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4">По данным Glassdoor, Levels.fyi, 2024–2025</p>
            </div>
          </div>

          {/* Vacancies */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-100 font-semibold text-lg mb-1">Открытые вакансии Go-разработчиков</h3>
                <p className="text-sm text-gray-500">Актуальные данные крупнейших платформ по найму</p>
              </div>
              <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1 rounded-full">2025</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { flag: '🇷🇺', country: 'Россия', platform: 'hh.ru', count: '1 800+', trend: '+18% за год', trendUp: true },
                { flag: '🇺🇸', country: 'США', platform: 'LinkedIn', count: '12 000+', trend: '+22% за год', trendUp: true },
                { flag: '🇩🇪', country: 'Германия', platform: 'LinkedIn', count: '3 500+', trend: '+15% за год', trendUp: true },
                { flag: '🌍', country: 'Удалённо', platform: 'Remote OK', count: '5 000+', trend: '+35% за год', trendUp: true },
              ].map((v) => (
                <div key={v.country} className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{v.flag}</div>
                  <div className="text-gray-100 font-bold text-xl mb-0.5">{v.count}</div>
                  <div className="text-sm text-gray-400 mb-1">{v.country}</div>
                  <div className="text-xs text-gray-600 mb-2">{v.platform}</div>
                  <div className={`text-xs font-medium ${v.trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {v.trendUp ? '↑' : '↓'} {v.trend}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-5">
              Go входит в топ-10 самых востребованных языков для бэкенда и DevOps. Язык активно используют Google, Uber, Twitch, Wildberries, Яндекс и VK.
            </p>
          </div>
        </div>
      </section>
      </FadeInSection>

      {/* Reviews */}
      <FadeInSection>
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Отзывы учеников</h2>
          <p className="text-gray-400 mb-10">Что говорят те, кто уже прошёл курс</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.slice(0, 3).map((r) => (
              <div key={r.name} className="card flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">
                    {r.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-100 text-sm">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.role}</div>
                  </div>
                  <div className="ml-auto text-amber-400 text-sm">★★★★★</div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed flex-1">{r.text}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {reviews.slice(3).map((r) => (
              <div key={r.name} className="card flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">
                    {r.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-100 text-sm">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.role}</div>
                  </div>
                  <div className="ml-auto text-amber-400 text-sm">★★★★★</div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeInSection>

      {/* FAQ */}
      <FadeInSection>
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-100 mb-10 text-center">FAQ</h2>
          <div className="space-y-0 divide-y divide-gray-800">
            {faq.map((item) => (
              <details key={item.q} className="group py-5 cursor-pointer">
                <summary className="flex items-center justify-between gap-4 text-gray-100 font-medium text-lg list-none">
                  {item.q}
                  <span className="flex-shrink-0 text-gray-500 group-open:rotate-180 transition-transform text-xl">∨</span>
                </summary>
                <p className="mt-3 text-gray-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      </FadeInSection>
    </main>
  )
}
