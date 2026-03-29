'use client'

import { useGameStore } from '@/store/gameStore'
import { dragStateRef } from '@/components/game/GameCanvas'

interface Props {
  position: [number, number, number]
  rotation?: number
  children: React.ReactNode
}

// Invisible clickable area over a sittable object.
// Clicking teleports the player to the seat and triggers a sit emote.
export default function SittableObject({ position, rotation = 0, children }: Props) {
  const setPlayerTarget = useGameStore((s) => s.setPlayerTarget)
  const sendEmote       = useGameStore((s) => s.sendEmote)

  function handleClick(e: { stopPropagation: () => void }) {
    e.stopPropagation()
    if (dragStateRef.current.didDrag) return
    setPlayerTarget(position[0], position[2])
    sendEmote('🪑')
  }

  return (
    <group position={position} rotation={[0, rotation, 0]} onClick={handleClick}>
      {children}
      {/* Invisible click zone */}
      <mesh visible={false}>
        <boxGeometry args={[2.0, 1.5, 1.5]} />
        <meshStandardMaterial />
      </mesh>
    </group>
  )
}
