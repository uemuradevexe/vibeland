'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'
import { ROOMS } from '@/lib/roomConfig'
import { resolvePosition } from '@/lib/collision'

const SPEED = 5          // units per second
const BOUNDS = 17        // ±17 units

const KEYS: Record<string, [number, number]> = {
  KeyW: [0, -1], ArrowUp: [0, -1],
  KeyS: [0,  1], ArrowDown: [0,  1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1,  0], ArrowRight: [1,  0],
}

export default function KeyboardInput() {
  const held = useRef<Set<string>>(new Set())
  const setPlayerTarget = useGameStore((s) => s.setPlayerTarget)
  const { camera } = useThree()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (KEYS[e.code]) { e.preventDefault(); held.current.add(e.code) }
    }
    const up = (e: KeyboardEvent) => held.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((_, delta) => {
    if (held.current.size === 0) return

    // Compute camera's horizontal forward/right vectors (projected onto XZ plane)
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    let mx = 0
    let mz = 0
    for (const code of held.current) {
      const dir = KEYS[code]
      if (!dir) continue
      // dir[0] = local X (right), dir[1] = local Z (forward)
      mx += right.x * dir[0] + forward.x * dir[1]
      mz += right.z * dir[0] + forward.z * dir[1]
    }

    if (mx === 0 && mz === 0) return

    // Normalise so diagonals aren't faster
    const len = Math.sqrt(mx * mx + mz * mz)
    const step = (SPEED * delta) / len

    const store = useGameStore.getState()
    let nx = Math.max(-BOUNDS, Math.min(BOUNDS, store.playerTargetX + mx * step))
    let nz = Math.max(-BOUNDS, Math.min(BOUNDS, store.playerTargetZ + mz * step))
    ;[nx, nz] = resolvePosition(nx, nz, ROOMS[store.currentRoom].colliders)
    setPlayerTarget(nx, nz)
  })

  return null
}
