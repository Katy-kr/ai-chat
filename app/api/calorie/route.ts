import groq, { MODEL } from '@/lib/groq'

const CALORIE_SYSTEM_PROMPT = `당신은 영양 정보 전문가입니다. 사용자가 입력한 음식과 양에 대한 영양 정보를 JSON 형식으로 반환합니다.

반드시 아래 JSON 형식만 반환하고 다른 텍스트는 포함하지 마세요:
{
  "food": "음식 이름 (정규화된 이름)",
  "amount": 숫자,
  "unit": "단위",
  "calories": 숫자 (kcal),
  "protein": 숫자 (g),
  "carbs": 숫자 (g),
  "fat": 숫자 (g),
  "note": "참고사항 (선택, 없으면 null)"
}

모든 수치는 입력된 양 기준으로 계산합니다. 정확한 데이터가 없으면 일반적인 추정값을 사용합니다.`

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const { food, amount, unit } = body ?? {}

  if (!food || typeof food !== 'string' || !amount || !unit) {
    return Response.json({ error: '음식 이름, 양, 단위를 모두 입력해주세요.' }, { status: 400 })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: CALORIE_SYSTEM_PROMPT },
        { role: 'user', content: `음식: ${food}, 양: ${amount}${unit}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const data = JSON.parse(raw)

    return Response.json(data)
  } catch (err) {
    console.error('[Calorie API Error]', err)
    return Response.json({ error: '칼로리 계산 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
