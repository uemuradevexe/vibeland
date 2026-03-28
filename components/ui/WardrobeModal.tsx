'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { HATS, VEHICLES, type HatId, type VehicleId } from '@/lib/skins'

interface WardrobeModalProps {
  onClose: () => void
}

type Tab = 'hats' | 'vehicles'

export default function WardrobeModal({ onClose }: WardrobeModalProps) {
  const [tab, setTab] = useState<Tab>('hats')
  const [feedback, setFeedback] = useState<string | null>(null)

  const tokens        = useGameStore((s) => s.tokens)
  const inventory     = useGameStore((s) => s.inventory)
  const playerHat     = useGameStore((s) => s.playerHat)
  const playerVehicle = useGameStore((s) => s.playerVehicle)
  const equipHat      = useGameStore((s) => s.equipHat)
  const equipVehicle  = useGameStore((s) => s.equipVehicle)
  const buyItem       = useGameStore((s) => s.buyItem)

  function handleSelect(id: string, cost: number, type: 'hat' | 'vehicle') {
    if (!inventory.includes(id) && cost > 0) {
      const ok = buyItem(id, cost)
      if (!ok) {
        setFeedback('Not enough tokens ✗')
        setTimeout(() => setFeedback(null), 2000)
        return
      }
      setFeedback(`Unlocked! ✦`)
      setTimeout(() => setFeedback(null), 2000)
    }
    if (type === 'hat') equipHat(id as HatId)
    else equipVehicle(id as VehicleId)
  }

  const items = tab === 'hats' ? Object.values(HATS) : Object.values(VEHICLES)
  const equippedId = tab === 'hats' ? playerHat : playerVehicle

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-5 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono font-bold text-[#7a9cc8]">👕 Wardrobe</h2>
          <div className="font-mono text-sm text-yellow-400">💰 {tokens} tokens</div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['hats', 'vehicles'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg font-mono text-xs transition-all ${
                tab === t
                  ? 'bg-[#1e3a8a] border border-[#3d6db5] text-white'
                  : 'bg-[#1a2744] text-[#7a9cc8] border border-transparent hover:bg-[#243060]'
              }`}
            >
              {t === 'hats' ? '🎩 Hats' : '🛹 Vehicles'}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="mb-3 text-center font-mono text-xs text-green-400">{feedback}</div>
        )}

        {/* Items grid */}
        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {items.map((item) => {
            const owned = inventory.includes(item.id) || item.cost === 0
            const equipped = item.id === equippedId
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id, item.cost, tab === 'hats' ? 'hat' : 'vehicle')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  equipped
                    ? 'border-[#3d6db5] bg-[#1e3a8a]'
                    : owned
                    ? 'border-[#2a4a7f] bg-[#1a2744] hover:bg-[#243060]'
                    : 'border-[#1a2744] bg-[#0d1b2a] hover:border-[#2a4a7f] opacity-80'
                }`}
                title={owned ? item.name : `${item.name} — ${item.cost} tokens`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-mono text-[9px] text-[#7a9cc8] truncate w-full text-center">
                  {item.name}
                </span>
                {!owned && item.cost > 0 && (
                  <span className="font-mono text-[9px] text-yellow-400">{item.cost}🪙</span>
                )}
                {equipped && (
                  <span className="font-mono text-[8px] text-[#3d6db5]">equipped</span>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-[#3d6db5] text-xs font-mono text-center mt-3">
          click outside to close
        </p>
      </div>
    </div>
  )
}
