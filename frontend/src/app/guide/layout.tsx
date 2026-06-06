import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Курс Go — интерактивные уроки | Godemy',
  description: 'Изучи Go с нуля: 8 уроков по основам, структурам данных, горутинам и обработке ошибок. Весь прогресс сохраняется.',
  openGraph: {
    title: 'Курс Go — интерактивные уроки | Godemy',
    description: 'Изучи Go с нуля: 8 уроков по основам, структурам данных, горутинам и обработке ошибок.',
    type: 'website',
  },
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
