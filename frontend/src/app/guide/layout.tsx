import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Стажировка Go — 3 проекта, спринты и реальная IT-команда | Godemy',
  description: 'Пройди сюжетный курс-стажировку: Jira, стендапы, ревью и 3 настоящих Go-проекта от CLI до API и data flows.',
  openGraph: {
    title: 'Стажировка Go — 3 проекта, спринты и реальная IT-команда | Godemy',
    description: 'Сюжетный Go-курс в формате стажировки: Number Guessing Game, Weather API Wrapper Service и Expense Tracker.',
    type: 'website',
  },
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
