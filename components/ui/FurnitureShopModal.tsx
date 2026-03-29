'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { FURNITURE } from '@/lib/furniture'

interface Props {
  onClose: () => void
}

export default function FurnitureShopModal({ onClose }: Props) {
  const tokens = useGameStore((s) => s.tokens)
  const inventory = useGameStore((s) => s.inventory)
  const buyItem = useGameStore((s) => s.buyItem)
  const [feedback, setFeedback] = useState<string | null>(null)

  function handleBuy(id: keyof typeof FURNITURE, cost: number) {
    if (inventory.includes(id)) {
      setFeedback('Already owned')
      setTimeout(() => setFeedback(null), 1500)
      return
    }
    const ok = buyItem(id, cost)
    setFeedback(ok ? 'Unlocked!' : 'Not enough tokens')
    setTimeout(() => setFeedback(null), 1500)
  }

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-5 w-[28rem] max-w-[calc(100vw-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono font-bold text-[#7a9cc8]">🛋️ Furniture Shop</h2>
          <div className="font-mono text-sm text-yellow-400">💰 {tokens}</div>
        </div>

        {feedback && (
          <div className="mb-3 text-center font-mono text-xs text-green-400">{feedback}</div>
        )}

        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {Object.values(FURNITURE).map((item) => {
            const owned = inventory.includes(item.id)
            return (
              <div key={item.id} className="bg-[#0d1b2a] border border-[#2a4a7f] rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-white">{item.emoji} {item.name}</div>
                  <div className="font-mono text-xs text-yellow-400">{item.cost}🪙</div>
                </div>
                <div className="font-mono text-[10px] text-[#5a7aa8]">
                  {item.size.join(' × ')}
                </div>
                <button
                  onClick={() => handleBuy(item.id, item.cost)}
                  disabled={owned}
                  className="bg-[#1e3a8a] hover:bg-[#2a4a9a] disabled:bg-[#1a2744] disabled:text-[#4c6488] border border-[#3d6db5] rounded-lg px-3 py-2 text-xs font-mono font-bold transition-colors"
                >
                  {owned ? 'Owned' : 'Buy'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
