import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Тренажёр Go — практические задачи | Godemy',
  description: 'Решай задачи на Go прямо в браузере: авто-проверка кода, хинты, задачи уровня собеседований. Бесплатно.',
  openGraph: {
    title: 'Тренажёр Go — практические задачи | Godemy',
    description: 'Решай задачи на Go прямо в браузере: авто-проверка кода, хинты, задачи уровня собеседований.',
    type: 'website',
  },
}

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
