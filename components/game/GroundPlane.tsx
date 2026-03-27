'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

// Invisible horizontal plane — click to walk in XZ
export default function GroundPlane() {
  const planeRef = useRef<THREE.Mesh>(null)
  const setPlayerTarget = useGameStore((s) => s.setPlayerTarget)

  function handleClick(e: { point: THREE.Vector3; stopPropagation: () => void }) {
    e.stopPropagation()
    const targetX = Math.max(-7, Math.min(7, e.point.x))
    const targetZ = Math.max(-7, Math.min(7, e.point.z))
    setPlayerTarget(targetX, targetZ)
  }

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
    >
      <planeGeometry args={[24, 24]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  )
}
