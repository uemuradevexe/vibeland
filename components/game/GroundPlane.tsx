'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

// Invisible plane the player clicks to walk
export default function GroundPlane() {
  const planeRef = useRef<THREE.Mesh>(null)
  const setPlayerTargetX = useGameStore((s) => s.setPlayerTargetX)

  function handleClick(e: { point: THREE.Vector3; stopPropagation: () => void }) {
    e.stopPropagation()
    // Clamp to room bounds (-8 to 8)
    const targetX = Math.max(-8, Math.min(8, e.point.x))
    setPlayerTargetX(targetX)
  }

  return (
    <mesh
      ref={planeRef}
      position={[0, -1.2, 0]}
      rotation={[0, 0, 0]}
      onClick={handleClick}
    >
      <planeGeometry args={[20, 2]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  )
}
