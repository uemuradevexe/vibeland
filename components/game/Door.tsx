'use client'

import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'
import { dragStateRef } from '@/components/game/GameCanvas'
import type { Door as DoorConfig } from '@/lib/roomConfig'

interface DoorProps {
  config: DoorConfig
  accentColor: string
}

export default function Door({ config, accentColor }: DoorProps) {
  const [hovered, setHovered] = useState(false)
  const changeRoom = useGameStore((s) => s.changeRoom)

  const doorX = config.side === 'left' ? -17 : 17
  const pillarColor = hovered ? accentColor : '#2a3a5a'

  return (
    <group position={[doorX, 0, 0]}>
      {/* Invisible click zone */}
      <mesh
        position={[0, 1.2, 0]}
        onClick={(e) => { e.stopPropagation(); if (!dragStateRef.current.didDrag) changeRoom(config.leadsTo) }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[1.5, 2.4, 0.6]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Glow pad on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.85, 24]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={hovered ? 2.0 : 0.3}
          toneMapped={false}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Left pillar */}
      <mesh position={[-0.5, 1.2, 0]}>
        <boxGeometry args={[0.14, 2.4, 0.14]} />
        <meshStandardMaterial color={pillarColor} emissive={hovered ? accentColor : '#000'} emissiveIntensity={hovered ? 0.4 : 0} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[0.5, 1.2, 0]}>
        <boxGeometry args={[0.14, 2.4, 0.14]} />
        <meshStandardMaterial color={pillarColor} emissive={hovered ? accentColor : '#000'} emissiveIntensity={hovered ? 0.4 : 0} />
      </mesh>
      {/* Top arch */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[1.2, 0.22, 0.14]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={hovered ? 1.5 : 0.4}
          toneMapped={false}
        />
      </mesh>

      {/* Label */}
      <Html position={[0, 3.0, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          textAlign: 'center',
          cursor: 'pointer',
        }}>
          <div style={{
            fontSize: 22,
            filter: hovered ? 'drop-shadow(0 0 8px white)' : 'none',
            transition: 'filter 0.2s',
          }}>{config.emoji}</div>
          <div style={{
            fontSize: 9,
            color: hovered ? 'white' : '#7a9cc8',
            fontFamily: 'monospace',
            marginTop: 2,
          }}>{config.label}</div>
        </div>
      </Html>
    </group>
  )
}
