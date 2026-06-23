'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api, Lesson } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type Sprint17Question = {
  question: string
  answers: string[]
}

type Sprint17Marks = Record<string, 'ok' | 'repeat'>

type Sprint17PersistedState = {
  openedQuestions: number[]
  quizQuestionKeys: string[]
  revealedQuiz: Record<string, boolean>
  quizMarks: Sprint17Marks
}

const sprint17StorageKey = 'junior-sprint1-7-interview-state-v1'

const sprint17Questions: Sprint17Question[] = [
  {
    question: '1. Что такое handler в Go HTTP-сервере?',
    answers: [
      'Это функция, которая принимает HTTP-запрос и формирует HTTP-ответ.',
      'Она читает входные данные из http.Request.',
      'Она записывает статус, headers и body через http.ResponseWriter.',
      'Именно в handler обычно находится прикладная логика endpoint.',
    ],
  },
  {
    question: '2. Как запрос попадает в нужный handler?',
    answers: [
      'Сервер принимает запрос на открытом порту.',
      'Роутер (или mux) сравнивает путь и метод запроса.',
      'После совпадения route вызывает привязанный handler.',
    ],
  },
  {
    question: '3. Что такое http.Request и http.ResponseWriter?',
    answers: [
      'http.Request содержит method, path, headers, query и body.',
      'http.ResponseWriter используется для записи ответа клиенту.',
      'Коротко: request читаем, response формируем.',
    ],
  },
  {
    question: '4. Зачем нужен endpoint /health?',
    answers: [
      'Чтобы быстро проверить, что сервис жив.',
      'Его используют мониторинг, оркестрация и балансировщики.',
      'Он должен быть легким и быстрым без тяжелой бизнес-логики.',
    ],
  },
  {
    question: '5. В чем разница между GET и POST?',
    answers: [
      'GET обычно получает данные, POST обычно создает или отправляет данные на обработку.',
      'У POST чаще есть body.',
      'GET по идее должен быть безопасным и без побочных эффектов.',
    ],
  },
  {
    question: '6. Когда возвращать 200, а когда 201?',
    answers: [
      '200 OK: запрос успешно обработан.',
      '201 Created: успешно создан новый ресурс.',
      'Для create endpoint корректнее отдавать 201.',
    ],
  },
  {
    question: '7. Что означают 400, 401, 403, 404 и 500?',
    answers: [
      '400: некорректный запрос.',
      '401: пользователь не аутентифицирован.',
      '403: доступ запрещен.',
      '404: ресурс не найден.',
      '500: внутренняя ошибка сервера.',
    ],
  },
  {
    question: '8. Почему JSON так часто используется в API?',
    answers: [
      'Он простой, читаемый и универсальный.',
      'Его легко сериализовать в большинстве языков.',
      'Это стандартный формат общения frontend и backend.',
    ],
  },
  {
    question: '9. Зачем выставлять Content-Type: application/json?',
    answers: [
      'Клиенту нужен явный сигнал о формате ответа.',
      'Это делает контракт API предсказуемым.',
      'Без корректного Content-Type клиент может разобрать body неверно.',
    ],
  },
  {
    question: '10. Что обычно находится в body POST-запроса?',
    answers: [
      'Данные для создания или изменения сущности.',
      'Например title, description, status.',
      'Эти данные нужно валидировать на сервере.',
    ],
  },
  {
    question: '11. Почему handler лучше делать коротким?',
    answers: [
      'Код проще читать и тестировать.',
      'Проще разделять transport-слой и бизнес-логику.',
      'Короткий handler проще поддерживать в команде.',
    ],
  },
  {
    question: '12. Что важно валидировать в первом API?',
    answers: [
      'Обязательные поля.',
      'Пустые или некорректные значения.',
      'Корректность JSON и допустимые форматы.',
    ],
  },
  {
    question: '13. Чем route отличается от endpoint?',
    answers: [
      'Route обычно про внутреннее правило маршрутизации в коде.',
      'Endpoint обычно про внешний API-адрес для клиента.',
      'В разговоре часто используются почти как синонимы.',
    ],
  },
  {
    question: '14. Почему нельзя отвечать 200 на все запросы?',
    answers: [
      'Клиент не сможет понять итог операции.',
      'Правильные status code упрощают отладку и тесты.',
      'Наблюдаемость и мониторинг становятся точнее.',
    ],
  },
  {
    question: '15. Как кратко описать путь запроса через сервер?',
    answers: [
      'Клиент отправляет HTTP-запрос.',
      'Сервер принимает запрос на порту.',
      'Роутер выбирает handler по path и method.',
      'Handler выполняет логику и формирует response.',
      'Сервер отправляет status code, headers и body обратно клиенту.',
    ],
  },
]

function pickRandomQuestions(count: number): Sprint17Question[] {
  const pool = [...sprint17Questions]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}

function readSprint17State(): Sprint17PersistedState | null {
  if (typeof window === 'undefined') return null

  const rawState = localStorage.getItem(sprint17StorageKey)
  if (!rawState) return null

  try {
    return JSON.parse(rawState) as Sprint17PersistedState
  } catch {
    return null
  }
}

function restoreQuizQuestions(keys: string[] | undefined): Sprint17Question[] {
  if (!keys || keys.length === 0) return pickRandomQuestions(5)

  const questionsByKey = new Map(sprint17Questions.map((item) => [item.question, item]))
  const restoredQuiz = keys
    .map((key) => questionsByKey.get(key))
    .filter((item): item is Sprint17Question => Boolean(item))

  return restoredQuiz.length > 0 ? restoredQuiz : pickRandomQuestions(5)
}

function Sprint17InterviewContent() {
  const [persistedState] = useState<Sprint17PersistedState | null>(() => readSprint17State())
  const [openedQuestions, setOpenedQuestions] = useState<number[]>(() => persistedState?.openedQuestions || [])
  const [quizQuestions, setQuizQuestions] = useState<Sprint17Question[]>(() =>
    restoreQuizQuestions(persistedState?.quizQuestionKeys)
  )
  const [revealedQuiz, setRevealedQuiz] = useState<Record<string, boolean>>(
    () => persistedState?.revealedQuiz || {}
  )
  const [quizMarks, setQuizMarks] = useState<Sprint17Marks>(() => persistedState?.quizMarks || {})

  useEffect(() => {
    const payload: Sprint17PersistedState = {
      openedQuestions,
      quizQuestionKeys: quizQuestions.map((item) => item.question),
      revealedQuiz,
      quizMarks,
    }

    localStorage.setItem(sprint17StorageKey, JSON.stringify(payload))
  }, [openedQuestions, quizQuestions, revealedQuiz, quizMarks])

  const openedCount = openedQuestions.length
  const totalQuestions = sprint17Questions.length
  const allOpened = openedCount === totalQuestions

  const answeredCount = Object.keys(quizMarks).length
  const confidentCount = Object.values(quizMarks).filter((mark) => mark === 'ok').length

  const toggleQuestion = (index: number) => {
    setOpenedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const openAllQuestions = () => {
    setOpenedQuestions(sprint17Questions.map((_, index) => index))
  }

  const collapseAllQuestions = () => {
    setOpenedQuestions([])
  }

  const regenerateQuiz = () => {
    setQuizQuestions(pickRandomQuestions(5))
    setRevealedQuiz({})
    setQuizMarks({})
  }

  const toggleQuizAnswer = (question: string) => {
    setRevealedQuiz((prev) => ({ ...prev, [question]: !prev[question] }))
  }

  const markQuiz = (question: string, mark: 'ok' | 'repeat') => {
    setQuizMarks((prev) => ({ ...prev, [question]: mark }))
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#FFD60A] mb-2">Sprint 1.7</div>
        <h2 className="text-2xl font-bold text-white mb-3">Вопросы с собеседований</h2>
        <p className="text-sm text-[#FFE44D]/90 leading-relaxed">
          Здесь не нужно зубрить длинные ответы. Работай по схеме интервального повторения: короткие подходы,
          частое возвращение к сложным вопросам, пересказ своими словами.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Как запоминать по методу повтора</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            'Сразу после чтения: дай ответ своими словами без подсказки.',
            'Через 15 минут: снова ответь на 3-5 вопросов, где сомневался.',
            'В конце дня: повтори все сложные пункты коротко и вслух.',
            'На 1, 3 и 7 день: возвращайся только к ошибкам и неуверенным темам.',
          ].map((step) => (
            <div key={step} className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-300">
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Что помнить в первую очередь</h3>
        <div className="flex flex-wrap gap-2">
          {['handler', 'route -> handler', 'GET vs POST', 'status code', 'JSON контракт'].map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-[#FFD60A]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Топ-15 вопросов</h3>
            <p className="text-sm text-gray-400 mt-1">
              Прогресс раскрытия: <span className="text-[#FFD60A] font-semibold">{openedCount}/{totalQuestions}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {allOpened ? (
              <button
                onClick={collapseAllQuestions}
                className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
              >
                Свернуть все
              </button>
            ) : (
              <button
                onClick={openAllQuestions}
                className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-[#FFD60A] hover:bg-cyan-500/20 transition-colors"
              >
                Раскрыть все
              </button>
            )}
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden mb-2">
          <div
            className="h-full bg-cyan-500"
            style={{ width: `${(openedCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {sprint17Questions.map((item, index) => {
          const isOpen = openedQuestions.includes(index)
          return (
          <div
            key={item.question}
            className={`group rounded-2xl border bg-gray-900 transition-colors ${isOpen ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-gray-800'}`}
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-5 py-4 text-left text-base font-semibold text-white flex items-center justify-between gap-4"
            >
              <span>{item.question}</span>
              <span className={`text-[#FFD60A] transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-gray-800/80">
                <ul className="space-y-2">
                  {item.answers.map((answer) => (
                    <li key={answer} className="text-sm text-gray-300 leading-relaxed flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FFD60A] flex-shrink-0" />
                      <span>{answer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Мини-квиз: 5 случайных вопросов</h3>
            <p className="text-sm text-gray-400 mt-1">
              Самооценка: <span className="text-[#FFD60A] font-semibold">{answeredCount}/5</span>,
              уверенно ответил: <span className="text-[#FFD60A] font-semibold"> {confidentCount}</span>
            </p>
          </div>
          <button
            onClick={regenerateQuiz}
            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-[#FFD60A] hover:bg-cyan-500/20 transition-colors"
          >
            Новый набор
          </button>
        </div>

        <div className="space-y-3">
          {quizQuestions.map((item, index) => {
            const isRevealed = Boolean(revealedQuiz[item.question])
            const mark = quizMarks[item.question]

            return (
              <div key={item.question} className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                <div className="text-sm font-semibold text-white mb-2">
                  Вопрос {index + 1}: {item.question.replace(/^\d+\.\s*/, '')}
                </div>

                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => toggleQuizAnswer(item.question)}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
                  >
                    {isRevealed ? 'Скрыть ответ' : 'Показать ответ'}
                  </button>
                  <button
                    onClick={() => markQuiz(item.question, 'ok')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${mark === 'ok' ? 'bg-[#FFD60A]/20 text-[#FFD60A] border border-emerald-500/30' : 'border border-gray-700 bg-gray-900 text-gray-300 hover:text-white'}`}
                  >
                    Ответил уверенно
                  </button>
                  <button
                    onClick={() => markQuiz(item.question, 'repeat')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${mark === 'repeat' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'border border-gray-700 bg-gray-900 text-gray-300 hover:text-white'}`}
                  >
                    Повторить позже
                  </button>
                </div>

                {isRevealed && (
                  <ul className="space-y-2">
                    {item.answers.map((answer) => (
                      <li key={answer} className="text-sm text-gray-300 leading-relaxed flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FFD60A] flex-shrink-0" />
                        <span>{answer}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function JuniorLessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const { token, isCompleted, loadProgress } = useAuthStore()

  useEffect(() => {
    Promise.all([
      api.getLesson(slug, { module: 'bootcamp' }),
      api.getLessons({ module: 'bootcamp' }),
    ])
      .then(([l, all]) => {
        setLesson(l)
        setAllLessons(all)
      })
      .catch(() => router.push('/junior/guide'))
      .finally(() => setLoading(false))
    if (token) loadProgress()
  }, [slug, token, router, loadProgress])

  const markComplete = async () => {
    if (!token || !lesson) return
    await api.updateProgress('lesson', lesson.id, 'completed')
    await loadProgress()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-8 bg-gray-800 rounded w-1/3 animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-gray-800 rounded animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!lesson) return null

  const orderedLessons = [...allLessons].sort((a, b) => a.order - b.order)
  const currentIndex = orderedLessons.findIndex((l) => l.slug === slug)
  const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < orderedLessons.length - 1 ? orderedLessons[currentIndex + 1] : null
  const completed = isCompleted('lesson', lesson.id)
  const isSprint17 = lesson.slug === 'junior-sprint1-interview-questions'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/junior" className="hover:text-[#FFD60A] transition-colors">Junior</Link>
        <span>/</span>
        <Link href="/junior/guide" className="hover:text-[#FFD60A] transition-colors">Курс</Link>
        <span>/</span>
        <span className="text-gray-300">{lesson.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 order-2 lg:order-1">
          <div className="sticky top-20">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Roadmap</h3>
            <div className="space-y-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2 px-1">{lesson.category}</div>
                <nav className="space-y-1">
                  {orderedLessons
                    .filter((l) => l.category === lesson.category)
                    .map((l) => {
                      const done = isCompleted('lesson', l.id)
                      return (
                        <Link
                          key={l.slug}
                          href={`/junior/guide/${l.slug}`}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${l.slug === slug ? 'bg-cyan-500/10 text-[#FFD60A] border border-cyan-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${done ? 'bg-[#FFD60A] border-emerald-500' : 'border-gray-600'}`}>
                            {done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="truncate">{l.title}</span>
                        </Link>
                      )
                    })}
                </nav>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3 order-1 lg:order-2">
          {isSprint17 ? (
            <Sprint17InterviewContent />
          ) : (
            <div className="prose-go">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {lesson.content}
              </ReactMarkdown>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {token ? (
              completed ? (
                <div className="flex items-center gap-2 text-[#FFD60A]">Урок пройден</div>
              ) : (
                <button onClick={markComplete} className="btn-primary">
                  Отметить как пройденный ✓
                </button>
              )
            ) : (
              <Link href="/auth/login" className="text-sm text-gray-400 hover:text-[#FFD60A] transition-colors">
                Войди чтобы сохранить прогресс →
              </Link>
            )}

            <div className="flex items-center gap-3">
              {prevLesson && (
                <Link href={`/junior/guide/${prevLesson.slug}`} className="btn-secondary text-sm px-4 py-2">
                  ← Предыдущий
                </Link>
              )}
              {nextLesson && (
                <Link href={`/junior/guide/${nextLesson.slug}`} className="btn-primary text-sm px-4 py-2">
                  Следующий →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
