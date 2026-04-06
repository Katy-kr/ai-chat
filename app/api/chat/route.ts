import type { MessageParam } from '@anthropic-ai/sdk/resources'
import anthropic, { SYSTEM_PROMPT } from '@/lib/anthropic'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const messages: MessageParam[] = body?.messages

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: '잘못된 요청입니다.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages,
        })

        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } catch {
        controller.enqueue(encoder.encode('오류가 발생했습니다. 잠시 후 다시 시도해주세요.'))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
