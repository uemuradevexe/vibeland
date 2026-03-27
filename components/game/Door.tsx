'use client'

import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'
import type { Door as DoorConfig } from '@/lib/roomConfig'

interface DoorProps {
  config: DoorConfig
  accentColor: string
}

export default function Door({ config, accentColor }: DoorProps) {
  const [hovered, setHovered] = useState(false)
  const changeRoom = useGameStore((s) => s.changeRoom)
  const x = config.side === 'left' ? -9.5 : 9.5

  return (
    <group position={[x, -0.5, 0.2]}>
      {/* Door frame */}
      <mesh
        onClick={() => changeRoom(config.leadsTo)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[1.2, 2.4, 0.1]} />
        <meshStandardMaterial
          color={hovered ? accentColor : '#0a1525'}
          emissive={hovered ? accentColor : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      {/* Door label emoji */}
      <Html position={[0, 1.6, 0.1]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          fontSize: 20,
          filter: hovered ? 'drop-shadow(0 0 6px white)' : 'none',
          transition: 'filter 0.2s',
          cursor: 'pointer',
        }}>
          {config.emoji}
        </div>
      </Html>
      <Html position={[0, -1.4, 0.1]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: '#7a9cc8',
          fontSize: 9,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          {config.label}
        </div>
      </Html>
    </group>
  )
}
