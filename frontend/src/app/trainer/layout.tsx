import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Практика Go — темы и упражнения | Godemy',
  description: 'Закрепляй Go прямо в браузере: короткие темы, примеры, подсказки и упражнения с проверкой. Бесплатно.',
  openGraph: {
    title: 'Практика Go — темы и упражнения | Godemy',
    description: 'Закрепляй Go прямо в браузере: короткие темы, примеры, подсказки и упражнения с проверкой.',
    type: 'website',
  },
}

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
