'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface StreamingMessageProps {
  content: string
  isStreaming?: boolean
}

export default function StreamingMessage({ content, isStreaming = false }: StreamingMessageProps) {
  return (
    <div className="text-sm leading-relaxed text-gray-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="mb-2 text-base font-bold text-gray-900">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-1.5 text-sm font-bold text-gray-900">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold text-gray-900">{children}</h3>,
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            return isBlock ? (
              <pre className="my-2 overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs">
                <code>{children}</code>
              </pre>
            ) : (
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">{children}</code>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-4 border-yellow-400 pl-3 text-gray-600">{children}</blockquote>
          ),
          hr: () => <hr className="my-2 border-gray-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-blink bg-gray-500 align-text-bottom" />
      )}
    </div>
  )
}
