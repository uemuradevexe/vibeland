'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'
import { ROOMS } from '@/lib/roomConfig'
import { resolvePosition } from '@/lib/collision'

// Invisible horizontal plane — click to walk in XZ
export default function GroundPlane() {
  const planeRef = useRef<THREE.Mesh>(null)
  const setPlayerTarget = useGameStore((s) => s.setPlayerTarget)

  function handleClick(e: { point: THREE.Vector3; stopPropagation: () => void }) {
    e.stopPropagation()
    let x = Math.max(-17, Math.min(17, e.point.x))
    let z = Math.max(-17, Math.min(17, e.point.z))
    const { currentRoom } = useGameStore.getState()
    ;[x, z] = resolvePosition(x, z, ROOMS[currentRoom].colliders)
    setPlayerTarget(x, z)
  }

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  )
}
