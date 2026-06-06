'use client'

import Link from 'next/link'

export default function AdminTrainerPage() {
  const modules = [
    {
      id: 'syntax',
      title: 'Редактор разбора кода',
      description: 'Управление материалами по синтаксису и примерами кода',
      icon: '📚',
      href: '/admin/trainer/syntax',
    },
    {
      id: 'prakter',
      title: 'Редактор практера',
      description: 'Создание и редактирование практических упражнений в стиле Exercism',
      icon: '🧩',
      href: '/admin/trainer/prakter',
    },
    {
      id: 'questions',
      title: 'Редактор вопросов',
      description: 'Добавление и удаление вопросов для собеседования',
      icon: '❓',
      href: '/admin/trainer/questions',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Тренажер</h1>
        <p className="text-gray-400">Управление всеми модулями обучающей платформы</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link
            key={module.id}
            href={module.href}
            className="group rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 hover:border-cyan-500/60 p-6 transition-all"
          >
            <div className="text-4xl mb-3">{module.icon}</div>
            <h2 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors mb-2">
              {module.title}
            </h2>
            <p className="text-sm text-gray-400 mb-4">{module.description}</p>
            <span className="text-cyan-400 text-sm font-medium group-hover:translate-x-1 inline-block transition-transform">
              Открыть →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
