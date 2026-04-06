import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '핏봇 - AI 피트니스 트레이너',
  description: 'AI 피트니스 트레이너 핏봇과 함께 운동 목표를 달성하세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[#B2C7D9] text-gray-900 antialiased">{children}</body>
    </html>
  )
}
