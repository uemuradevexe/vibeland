'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/store/gameStore'
import ClaudeOrb from './ClaudeOrb'
import type { HatId, VehicleId } from '@/lib/skins'
import type { AvatarId } from '@/lib/avatars'
import * as THREE from 'three'

function RemotePlayerOrb({
  x,
  z,
  color,
  name,
  chat,
  emote,
  hat,
  vehicle,
  avatar,
  level,
}: {
  x: number
  z: number
  color: string
  name: string
  chat: string | null
  emote: string | null
  hat: HatId
  vehicle: VehicleId
  avatar: AvatarId
  level: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    group.position.x += (x - group.position.x) * Math.min(delta * 12, 1)
    group.position.z += (z - group.position.z) * Math.min(delta * 12, 1)
  })

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      <ClaudeOrb
        x={0}
        z={0}
        color={color}
        name={name}
        chat={chat}
        emote={emote}
        hat={hat}
        vehicle={vehicle}
        avatar={avatar}
        level={level}
      />
    </group>
  )
}

export default function RemotePlayers() {
  const remotePlayers = useGameStore((s) => s.remotePlayers)
  const currentRoom   = useGameStore((s) => s.currentRoom)

  return (
    <>
      {Object.values(remotePlayers)
        .filter((p) => p.room === currentRoom)
        .map((p) => (
          <RemotePlayerOrb
            key={p.id}
            x={p.x}
            z={p.z}
            color={p.color}
            name={p.name}
            chat={p.chat}
            emote={p.emote}
            hat={p.hat as HatId}
            vehicle={p.vehicle as VehicleId}
            avatar={(p.avatar as AvatarId) ?? 'default'}
            level={p.level ?? 1}
          />
        ))}
    </>
  )
}
