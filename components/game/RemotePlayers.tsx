'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/store/gameStore'
import ClaudeOrb from './ClaudeOrb'
import type { HatId, VehicleId } from '@/lib/skins'
import type { AvatarId } from '@/lib/avatars'

export default function RemotePlayers() {
  const remotePlayers = useGameStore((s) => s.remotePlayers)
  const currentRoom   = useGameStore((s) => s.currentRoom)

  // Interpolation: store target positions separately
  const interpRef = useRef<Record<string, { x: number; z: number }>>({})

  useFrame((_, delta) => {
    const store = useGameStore.getState()
    for (const [id, p] of Object.entries(store.remotePlayers)) {
      if (p.room !== store.currentRoom) continue
      const interp = interpRef.current[id] ?? { x: p.x, z: p.z }
      interp.x += (p.x - interp.x) * Math.min(delta * 12, 1)
      interp.z += (p.z - interp.z) * Math.min(delta * 12, 1)
      interpRef.current[id] = interp
    }
    // Remove stale interp entries for players who have left
    for (const id of Object.keys(interpRef.current)) {
      if (!store.remotePlayers[id]) delete interpRef.current[id]
    }
  })

  return (
    <>
      {Object.values(remotePlayers)
        .filter((p) => p.room === currentRoom)
        .map((p) => {
          const interp = interpRef.current[p.id] ?? { x: p.x, z: p.z }
          return (
            <ClaudeOrb
              key={p.id}
              x={interp.x}
              z={interp.z}
              color={p.color}
              name={p.name}
              chat={p.chat}
              emote={p.emote}
              hat={p.hat as HatId}
              vehicle={p.vehicle as VehicleId}
              avatar={(p.avatar as AvatarId) ?? 'default'}
              level={p.level ?? 1}
            />
          )
        })}
    </>
  )
}
