import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI 고객 지원 챗봇',
  description: 'Claude 기반 고객 지원 챗봇',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
