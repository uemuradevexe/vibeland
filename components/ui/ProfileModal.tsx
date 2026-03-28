'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { HATS, VEHICLES } from '@/lib/skins'
import { ROOMS } from '@/lib/roomConfig'

interface Props {
  onClose: () => void
}

export default function ProfileModal({ onClose }: Props) {
  const playerName    = useGameStore((s) => s.playerName)
  const playerColor   = useGameStore((s) => s.playerColor)
  const playerHat     = useGameStore((s) => s.playerHat)
  const playerVehicle = useGameStore((s) => s.playerVehicle)
  const tokens        = useGameStore((s) => s.tokens)
  const inventory     = useGameStore((s) => s.inventory)
  const currentRoom   = useGameStore((s) => s.currentRoom)

  const [ghUsername, setGhUsername] = useState('')
  const [ghProfile, setGhProfile] = useState<{ name: string; repos: number; followers: number; avatar: string } | null>(null)
  const [ghLoading, setGhLoading] = useState(false)
  const [ghError, setGhError] = useState('')

  const hatDef     = HATS[playerHat]
  const vehicleDef = VEHICLES[playerVehicle]

  const ownedHats     = inventory.filter((id) => id in HATS)
  const ownedVehicles = inventory.filter((id) => id in VEHICLES)

  async function fetchGitHub() {
    if (!ghUsername.trim()) return
    setGhLoading(true)
    setGhError('')
    try {
      const res = await fetch(`/api/github?user=${encodeURIComponent(ghUsername.trim())}`)
      if (!res.ok) throw new Error('Usuário não encontrado')
      const data = await res.json()
      setGhProfile(data)
    } catch (e) {
      setGhError(e instanceof Error ? e.message : 'Erro ao buscar perfil')
    } finally {
      setGhLoading(false)
    }
  }

  const level = Math.floor(tokens / 100) + 1
  const xpInLevel = tokens % 100
  const xpPercent = xpInLevel

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1b2a] border-2 border-[#2a4a7f] rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-mono font-bold text-[#7a9cc8] text-lg">👤 Perfil</h2>
          <button onClick={onClose} className="text-[#3d6db5] hover:text-white transition-colors text-xl">✕</button>
        </div>

        {/* Avatar + info */}
        <div className="flex items-center gap-4">
          {/* Orb preview */}
          <div
            className="w-16 h-16 rounded-full flex-shrink-0 border-4 border-white/20"
            style={{
              backgroundColor: playerColor,
              boxShadow: `0 0 20px ${playerColor}88`,
            }}
          >
            {hatDef.emoji !== '🚫' && (
              <div className="w-full h-full flex items-center justify-center text-2xl leading-none">
                {hatDef.emoji}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="font-mono font-bold text-white truncate">{playerName || 'Anônimo'}</p>
            <p className="font-mono text-xs text-[#5a7aa8]">{ROOMS[currentRoom].emoji} {ROOMS[currentRoom].name}</p>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-yellow-400">💰 {tokens}</span>
              <span className="font-mono text-xs text-[#3d6db5]">·</span>
              <span className="font-mono text-xs text-[#7a9cc8]">Nível {level}</span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div className="flex justify-between font-mono text-xs text-[#5a7aa8] mb-1">
            <span>XP</span>
            <span>{xpInLevel}/100</span>
          </div>
          <div className="h-2 bg-[#1a2744] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3d6db5] to-[#7a9cc8] rounded-full transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Equipped */}
        <div className="bg-[#111e38] rounded-xl p-3 flex gap-3">
          <div className="flex-1 text-center">
            <p className="font-mono text-xs text-[#5a7aa8] mb-1">Chapéu</p>
            <p className="text-xl">{hatDef.emoji}</p>
            <p className="font-mono text-xs text-white mt-1">{hatDef.name}</p>
          </div>
          <div className="w-px bg-[#2a4a7f]" />
          <div className="flex-1 text-center">
            <p className="font-mono text-xs text-[#5a7aa8] mb-1">Veículo</p>
            <p className="text-xl">{vehicleDef.emoji}</p>
            <p className="font-mono text-xs text-white mt-1">{vehicleDef.name}</p>
          </div>
        </div>

        {/* Inventory summary */}
        <div>
          <p className="font-mono text-xs text-[#5a7aa8] mb-2">Inventário ({inventory.filter(i => i !== 'none').length} itens)</p>
          <div className="flex flex-wrap gap-1.5">
            {ownedHats.filter(id => id !== 'none').map((id) => (
              <span key={id} className="bg-[#1a2744] border border-[#2a4a7f] rounded-lg px-2 py-0.5 font-mono text-xs text-white">
                {HATS[id as keyof typeof HATS]?.emoji} {HATS[id as keyof typeof HATS]?.name}
              </span>
            ))}
            {ownedVehicles.filter(id => id !== 'none').map((id) => (
              <span key={id} className="bg-[#1a2744] border border-[#2a4a7f] rounded-lg px-2 py-0.5 font-mono text-xs text-white">
                {VEHICLES[id as keyof typeof VEHICLES]?.emoji} {VEHICLES[id as keyof typeof VEHICLES]?.name}
              </span>
            ))}
            {inventory.filter(i => i !== 'none').length === 0 && (
              <span className="font-mono text-xs text-[#3d6db5]">Nenhum item ainda</span>
            )}
          </div>
        </div>

        {/* GitHub integration */}
        <div className="border-t border-[#2a4a7f] pt-4">
          <p className="font-mono text-xs text-[#5a7aa8] mb-2">🐙 Conectar GitHub</p>
          {ghProfile ? (
            <div className="flex items-center gap-3 bg-[#111e38] rounded-xl p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ghProfile.avatar} alt={ghProfile.name} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-mono text-sm font-bold text-white">{ghProfile.name}</p>
                <p className="font-mono text-xs text-[#5a7aa8]">
                  📦 {ghProfile.repos} repos · 👥 {ghProfile.followers} seguidores
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={ghUsername}
                onChange={(e) => setGhUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchGitHub()}
                placeholder="seu-username"
                className="flex-1 bg-[#0d1b2a] border border-[#2a4a7f] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#3d6db5] outline-none focus:border-[#3d6db5]"
              />
              <button
                onClick={fetchGitHub}
                disabled={ghLoading}
                className="bg-[#1e3a8a] hover:bg-[#2a4a9a] border border-[#3d6db5] rounded-lg px-3 py-2 text-xs font-mono transition-colors disabled:opacity-50"
              >
                {ghLoading ? '...' : 'Buscar'}
              </button>
            </div>
          )}
          {ghError && <p className="font-mono text-xs text-red-400 mt-1">{ghError}</p>}
        </div>

        <p className="text-[#3d6db5] text-xs font-mono text-center">clique fora para fechar</p>
      </div>
    </div>
  )
}
