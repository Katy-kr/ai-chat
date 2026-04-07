'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

interface FoodEntry {
  id: number
  food: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  note: string | null
}

interface CalorieResult {
  food: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  note: string | null
  error?: string
}

const UNITS = ['g', 'ml', '개', '공기', '인분', '조각', '컵', '큰술', '작은술']

export default function CaloriePage() {
  const [food, setFood] = useState('')
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState('g')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [nextId, setNextId] = useState(1)

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedFood = food.trim()
    const parsedAmount = parseFloat(amount)

    if (!trimmedFood || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('음식 이름과 양을 올바르게 입력해주세요.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/calorie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food: trimmedFood, amount: parsedAmount, unit }),
      })

      const data: CalorieResult = await res.json()

      if (!res.ok || data.error) {
        setError(data.error ?? '계산 중 오류가 발생했습니다.')
        return
      }

      setEntries(prev => [
        ...prev,
        {
          id: nextId,
          food: data.food,
          amount: data.amount,
          unit: data.unit,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          note: data.note,
        },
      ])
      setNextId(prev => prev + 1)
      setFood('')
      setAmount('')
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const removeEntry = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="flex h-screen flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between bg-[#FEE500] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <div>
            <h1 className="text-base font-bold text-[#3C1E1E]">칼로리 계산기</h1>
            <p className="text-xs text-[#3C1E1E]/60">음식별 영양 정보 조회</p>
          </div>
        </div>
        <Link
          href="/chat"
          className="rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-[#3C1E1E] hover:bg-black/20 transition-colors"
        >
          핏봇 채팅
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">음식 추가</p>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={food}
              onChange={e => setFood(e.target.value)}
              placeholder="음식 이름 (예: 흰쌀밥, 닭가슴살)"
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#FEE500] focus:ring-2 focus:ring-[#FEE500]/30 disabled:bg-gray-50"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="양"
                min="0.1"
                step="any"
                disabled={isLoading}
                className="w-28 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#FEE500] focus:ring-2 focus:ring-[#FEE500]/30 disabled:bg-gray-50"
              />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#FEE500] focus:ring-2 focus:ring-[#FEE500]/30 disabled:bg-gray-50"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isLoading || !food.trim() || !amount}
                className="flex items-center gap-1.5 rounded-xl bg-[#FEE500] px-4 py-2.5 text-sm font-semibold text-[#3C1E1E] shadow-sm transition-all hover:bg-[#FFD600] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3C1E1E] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3C1E1E] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3C1E1E] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  '계산'
                )}
              </button>
            </div>
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </form>

        {/* 결과 목록 */}
        {entries.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-700">추가된 음식</p>
            {entries.map(entry => (
              <div key={entry.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {entry.food}{' '}
                      <span className="text-sm font-normal text-gray-500">
                        {entry.amount}{entry.unit}
                      </span>
                    </p>
                    {entry.note && (
                      <p className="mt-0.5 text-xs text-gray-400">{entry.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="mt-0.5 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                    aria-label="삭제"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <NutrientBadge label="칼로리" value={`${Math.round(entry.calories)}`} unit="kcal" highlight />
                  <NutrientBadge label="단백질" value={`${entry.protein.toFixed(1)}`} unit="g" />
                  <NutrientBadge label="탄수화물" value={`${entry.carbs.toFixed(1)}`} unit="g" />
                  <NutrientBadge label="지방" value={`${entry.fat.toFixed(1)}`} unit="g" />
                </div>
              </div>
            ))}

            {/* 합계 */}
            <div className="rounded-2xl bg-[#FEE500] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[#3C1E1E]">총 합계</p>
                <button
                  onClick={() => setEntries([])}
                  className="text-xs text-[#3C1E1E]/60 hover:text-[#3C1E1E] transition-colors"
                >
                  전체 삭제
                </button>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <NutrientBadge label="칼로리" value={`${Math.round(totals.calories)}`} unit="kcal" highlight total />
                <NutrientBadge label="단백질" value={`${totals.protein.toFixed(1)}`} unit="g" total />
                <NutrientBadge label="탄수화물" value={`${totals.carbs.toFixed(1)}`} unit="g" total />
                <NutrientBadge label="지방" value={`${totals.fat.toFixed(1)}`} unit="g" total />
              </div>
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {entries.length === 0 && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="text-5xl">🥗</span>
            <p className="text-sm text-gray-500">
              음식 이름과 양을 입력하면<br />칼로리와 영양 정보를 알려드려요
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function NutrientBadge({
  label,
  value,
  unit,
  highlight,
  total,
}: {
  label: string
  value: string
  unit: string
  highlight?: boolean
  total?: boolean
}) {
  return (
    <div className={`rounded-xl p-2 text-center ${total ? 'bg-white/60' : 'bg-gray-50'}`}>
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-[#3C1E1E]' : 'text-gray-800'}`}>
        {value}
      </p>
      <p className="text-[10px] text-gray-400">{unit}</p>
    </div>
  )
}
