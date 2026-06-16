import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Go с нуля — 3 проекта и понятный план обучения | Godemy',
  description: 'Пройди бесплатный курс Go: простые объяснения, практика по шагам и 3 проекта для первого портфолио.',
  openGraph: {
    title: 'Go с нуля — 3 проекта и понятный план обучения | Godemy',
    description: 'Бесплатный Go-курс с простыми объяснениями, практикой и тремя проектами для первого портфолио.',
    type: 'website',
  },
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
