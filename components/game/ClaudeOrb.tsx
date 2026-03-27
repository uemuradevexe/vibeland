'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface ClaudeOrbProps {
  x: number
  z?: number
  color: string
  name: string
  chat?: string | null
  emote?: string | null
  isPlayer?: boolean
}

const BASE_Y = 0.55

export default function ClaudeOrb({ x, z = 0, color, name, chat, emote, isPlayer }: ClaudeOrbProps) {
  const groupRef = useRef<THREE.Group>(null)
  const floatOffset = useRef(Math.random() * Math.PI * 2)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.position.y = BASE_Y + Math.sin(clock.elapsedTime * 1.5 + floatOffset.current) * 0.12
  })

  const radius = isPlayer ? 0.45 : 0.38

  return (
    <group ref={groupRef} position={[x, BASE_Y, z]}>
      {/* Glow halo */}
      <Sphere args={[radius * 1.6, 16, 16]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </Sphere>

      {/* Main orb */}
      <Sphere args={[radius, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isPlayer ? 2.5 : 2}
          toneMapped={false}
        />
      </Sphere>

      {/* Eyes — facing toward camera (+X+Z diagonal) */}
      <Sphere args={[0.06, 8, 8]} position={[-0.10, 0.08, radius * 0.85]}>
        <meshStandardMaterial color="#1a0a00" />
      </Sphere>
      <Sphere args={[0.06, 8, 8]} position={[0.10, 0.08, radius * 0.85]}>
        <meshStandardMaterial color="#1a0a00" />
      </Sphere>

      {/* Floating particles */}
      {(
        [[-0.5, 0.5, 0.1], [0.55, 0.2, 0.05], [-0.3, -0.4, 0.08]] as [number, number, number][]
      ).map(([px, py, pz], i) => (
        <Sphere key={i} args={[0.05, 6, 6]} position={[px, py, pz]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
        </Sphere>
      ))}

      {/* Ground shadow — stays near y=0 in local coords */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BASE_Y + 0.02, 0]}>
        <circleGeometry args={[radius * 0.9, 16]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Name tag */}
      <Html
        position={[0, radius + 0.55, 0]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            background: isPlayer ? '#1e3a8a' : '#1a2744',
            border: `1px solid ${isPlayer ? '#3d6db5' : '#2a3a5a'}`,
            borderRadius: 4,
            padding: '1px 7px',
            fontSize: 10,
            color: 'white',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
        >
          {isPlayer ? `${name} ✦` : name}
        </div>
      </Html>

      {/* Chat bubble */}
      {chat && (
        <Html position={[0, radius + 1.0, 0]} center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'white',
              color: '#1a1a2e',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              maxWidth: 180,
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {chat}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '7px solid white',
              }}
            />
          </div>
        </Html>
      )}

      {/* Emote */}
      {emote && (
        <Html position={[0.5, radius + 0.7, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ fontSize: 20, animation: 'floatUp 2s ease-out forwards' }}>
            {emote}
          </div>
        </Html>
      )}
    </group>
  )
}
