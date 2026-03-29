'use client'

import { useGameStore } from '@/store/gameStore'
import { FURNITURE_DEFS, FURNITURE_IDS, furnitureInventoryKey } from '@/lib/furniture'

interface Props {
  onClose: () => void
}

export default function FurnitureShopModal({ onClose }: Props) {
  const tokens   = useGameStore((s) => s.tokens)
  const inventory = useGameStore((s) => s.inventory)
  const buyItem  = useGameStore((s) => s.buyItem)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1a2640] border border-[#3a5a8a] rounded-xl p-5 w-80 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg leading-none"
        >
          ✕
        </button>

        <h2 className="text-white font-bold text-base mb-1">Loja de Móveis 🛒</h2>
        <p className="text-[#7a9cc8] text-xs mb-4">
          Saldo: <span className="text-yellow-400 font-bold">{tokens}</span> tokens
        </p>

        <div className="flex flex-col gap-2">
          {FURNITURE_IDS.map((id) => {
            const def = FURNITURE_DEFS[id]
            const key = furnitureInventoryKey(id)
            const owned = inventory.includes(key)
            const canAfford = tokens >= def.cost

            return (
              <div
                key={id}
                className="flex items-center gap-3 bg-[#0e1a2e] border border-[#2a4a6a] rounded-lg px-3 py-2"
              >
                <span className="text-2xl">{def.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{def.name}</div>
                  <div className="text-yellow-400 text-xs">{def.cost} tokens</div>
                </div>
                {owned ? (
                  <span className="text-green-400 text-xs font-medium">✓ Possui</span>
                ) : (
                  <button
                    onClick={() => buyItem(key, def.cost)}
                    disabled={!canAfford}
                    className="text-xs px-3 py-1 rounded-md font-medium transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed
                      bg-yellow-500 hover:bg-yellow-400 text-black
                      disabled:bg-[#3a5a6a]"
                  >
                    Comprar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
