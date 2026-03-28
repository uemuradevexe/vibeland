'use client'

import { useGameStore } from '@/store/gameStore'
import ClaudeOrb from './ClaudeOrb'
import type { HatId, VehicleId } from '@/lib/skins'

export default function RemotePlayers() {
  const remotePlayers = useGameStore((s) => s.remotePlayers)
  const currentRoom   = useGameStore((s) => s.currentRoom)

  return (
    <>
      {Object.values(remotePlayers)
        .filter((p) => p.room === currentRoom)
        .map((p) => (
          <ClaudeOrb
            key={p.id}
            x={p.x}
            z={p.z}
            color={p.color}
            name={p.name}
            chat={p.chat}
            emote={p.emote}
            hat={p.hat as HatId}
            vehicle={p.vehicle as VehicleId}
          />
        ))}
    </>
  )
}
