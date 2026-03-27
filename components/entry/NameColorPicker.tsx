'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { ORB_COLORS } from '@/lib/orbColors'

export default function NameColorPicker() {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#ea580c')
  const setPlayer = useGameStore((s) => s.setPlayer)
  const router = useRouter()

  function handleEnter() {
    const finalName = name.trim() || `claude_${Math.floor(Math.random() * 9999)}`
    setPlayer(finalName, selectedColor)
    router.push('/game')
  }

  return (
    <div className="w-screen h-screen bg-[#0d1b2a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 p-10 bg-[#1a2744] border-2 border-[#2a4a7f] rounded-xl w-80">
        {/* Orb preview */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center relative"
          style={{
            backgroundColor: selectedColor,
            boxShadow: `0 0 24px ${selectedColor}, 0 0 48px ${selectedColor}88`,
          }}
        >
          <div className="absolute flex gap-3 top-6">
            <div className="w-3 h-3 rounded-full bg-[#1a0a00]" />
            <div className="w-3 h-3 rounded-full bg-[#1a0a00]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Claudeland</h1>

        {/* Name input */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs text-[#7a9cc8] font-mono uppercase tracking-widest">Seu nome</label>
          <input
            className="w-full bg-[#0d1b2a] border-2 border-[#2a4a7f] rounded-lg px-4 py-2 text-white font-mono text-sm outline-none focus:border-[#3d6db5]"
            placeholder="claude_..."
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
          />
        </div>

        {/* Color picker */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs text-[#7a9cc8] font-mono uppercase tracking-widest">Cor da orbe</label>
          <div className="grid grid-cols-4 gap-2">
            {ORB_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(c.value)}
                className="w-full aspect-square rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c.value,
                  borderColor: selectedColor === c.value ? 'white' : 'transparent',
                  boxShadow: selectedColor === c.value ? `0 0 10px ${c.value}` : 'none',
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          className="w-full py-3 rounded-lg font-mono font-bold text-sm tracking-widest transition-all bg-[#ea580c] hover:bg-[#f97316] text-white"
          style={{ boxShadow: `0 0 16px #ea580c88` }}
        >
          ENTRAR ✦
        </button>
      </div>
    </div>
  )
}
