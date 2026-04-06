'use client'

interface StreamingMessageProps {
  content: string
  isStreaming?: boolean
}

export default function StreamingMessage({ content, isStreaming = false }: StreamingMessageProps) {
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
      {content}
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-600 align-text-bottom" />
      )}
    </div>
  )
}
