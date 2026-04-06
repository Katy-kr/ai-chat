'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import type { MessageParam } from '@anthropic-ai/sdk/resources'
import StreamingMessage from '@/components/chat/StreamingMessage'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageParam[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    const next: MessageParam[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
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
      handleSend()
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
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h1 className="text-base font-semibold text-gray-900">AI 고객 지원</h1>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            disabled={isStreaming}
            className="text-xs text-gray-400 hover:text-gray-700 disabled:cursor-not-allowed"
          >
            대화 초기화
          </button>
        )}
      </header>

      {/* 메시지 목록 */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-blue-50 p-4">
              <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-gray-500">무엇이든 물어보세요.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {msg.role === 'assistant' ? (
                <StreamingMessage content={msg.content as string} />
              ) : (
                <p className="text-sm leading-relaxed">{msg.content as string}</p>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-3">
              {streamingContent ? (
                <StreamingMessage content={streamingContent} isStreaming />
              ) : (
                <Spinner size="sm" className="text-gray-400" />
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요... (Shift+Enter: 줄바꿈)"
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />
          <Button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            size="sm"
            className="shrink-0"
          >
            전송
          </Button>
        </div>
      </div>
    </div>
  )
}
