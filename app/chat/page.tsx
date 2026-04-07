'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import Link from 'next/link'
import StreamingMessage from '@/components/chat/StreamingMessage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_SUGGESTIONS = [
  '초보자 운동 루틴 짜줘',
  '단백질 섭취량 계산해줘',
  '홈트레이닝 추천해줘',
  '다이어트 식단 알려줘',
  '오늘 먹은 음식 칼로리 계산해줘',
  '체중 감량 위한 하루 칼로리는?',
]

function BotAvatar() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE500] shadow-sm text-xl">
      💪
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    const next: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'
    }
    setIsStreaming(true)
    setStreamingContent('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      if (!res.ok || !res.body) throw new Error()

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        setStreamingContent(fullText)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullText }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      ])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleReset = () => {
    if (isStreaming) return
    setMessages([])
    setStreamingContent('')
  }

  return (
    <div className="flex h-screen flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between bg-[#FEE500] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <div>
            <h1 className="text-base font-bold text-[#3C1E1E]">핏봇 FitBot</h1>
            <p className="text-xs text-[#3C1E1E]/60">AI 피트니스 트레이너</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/calorie"
            className="rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-[#3C1E1E] hover:bg-black/20 transition-colors"
          >
            🍽️ 칼로리 계산
          </Link>
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              disabled={isStreaming}
              className="rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-[#3C1E1E] hover:bg-black/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              대화 초기화
            </button>
          )}
        </div>
      </header>

      {/* 메시지 목록 */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">

        {/* 웰컴 메시지 */}
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEE500] shadow-md text-4xl">
                💪
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">안녕하세요! 핏봇이에요 🏋️</h2>
                <p className="mt-1 text-sm text-gray-600">
                  운동, 식단, 다이어트 무엇이든 물어보세요!
                </p>
              </div>
            </div>

            {/* 빠른 질문 버튼 */}
            <div className="w-full max-w-sm">
              <p className="mb-2 text-center text-xs font-medium text-gray-500">빠른 질문</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-2xl bg-white px-3 py-2.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-[#FEE500] hover:text-[#3C1E1E] transition-colors border border-white hover:border-[#FEE500]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <Link
                href="/calorie"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-[#FEE500] hover:text-[#3C1E1E] transition-colors border border-white hover:border-[#FEE500]"
              >
                🍽️ 음식 칼로리 직접 계산하기
              </Link>
            </div>
          </div>
        )}

        {/* 메시지 목록 */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && <BotAvatar />}

            <div className="flex flex-col gap-1 max-w-[75%]">
              {msg.role === 'assistant' && (
                <span className="ml-1 text-xs font-medium text-gray-600">핏봇</span>
              )}
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-[#FEE500] text-[#3C1E1E]'
                    : 'rounded-bl-sm bg-white text-gray-800'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <StreamingMessage content={msg.content as string} />
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content as string}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 스트리밍 중 */}
        {isStreaming && (
          <div className="flex items-end gap-2 justify-start">
            <BotAvatar />
            <div className="flex flex-col gap-1 max-w-[75%]">
              <span className="ml-1 text-xs font-medium text-gray-600">핏봇</span>
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                {streamingContent ? (
                  <StreamingMessage content={streamingContent} isStreaming />
                ) : (
                  <div className="flex items-center gap-1 py-1">
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="bg-[#B2C7D9] px-4 pb-5 pt-2">
        <div className="flex items-end gap-2 rounded-3xl bg-white px-4 py-2 shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none bg-transparent py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEE500] text-[#3C1E1E] shadow-sm transition-all hover:bg-[#FFD600] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-500">Enter 전송 · Shift+Enter 줄바꿈</p>
      </div>
    </div>
  )
}
