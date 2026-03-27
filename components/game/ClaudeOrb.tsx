'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
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

// Derive a slightly darker shade for limbs
function darkenHex(hex: string, amount = 0.6): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const d = (v: number) => Math.round(v * amount).toString(16).padStart(2, '0')
  return `#${d(r)}${d(g)}${d(b)}`
}

export default function ClaudeOrb({ x, z = 0, color, name, chat, emote, isPlayer }: ClaudeOrbProps) {
  const rootRef = useRef<THREE.Group>(null)   // position group
  const bodyRef = useRef<THREE.Group>(null)   // rotates to face direction
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const headRef = useRef<THREE.Mesh>(null)

  const prevPos = useRef({ x, z })
  const targetRotY = useRef(0)
  const walkPhase = useRef(Math.random() * Math.PI * 2)
  const idlePhase = useRef(Math.random() * Math.PI * 2)

  const limbColor = darkenHex(color)
  const scale = isPlayer ? 1.15 : 1.0

  useFrame((_, delta) => {
    if (!rootRef.current || !bodyRef.current) return

    const dx = x - prevPos.current.x
    const dz = z - prevPos.current.z
    const speed = Math.sqrt(dx * dx + dz * dz)
    const isMoving = speed > 0.002

    if (isMoving) {
      // Face direction of movement
      targetRotY.current = Math.atan2(dx, dz)
      walkPhase.current += delta * 7

      const swing = Math.sin(walkPhase.current)
      if (leftLegRef.current)  leftLegRef.current.rotation.x  =  swing * 0.55
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing * 0.55
      if (leftArmRef.current)  leftArmRef.current.rotation.x  = -swing * 0.4
      if (rightArmRef.current) rightArmRef.current.rotation.x  =  swing * 0.4
    } else {
      // Ease limbs back to neutral
      if (leftLegRef.current)  leftLegRef.current.rotation.x  *= 0.85
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.85
      if (leftArmRef.current)  leftArmRef.current.rotation.x  *= 0.85
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.85

      // Idle head bob
      idlePhase.current += delta * 1.2
      if (headRef.current) {
        headRef.current.position.y = 0.85 + Math.sin(idlePhase.current) * 0.015
      }
    }

    // Smooth Y rotation toward target direction
    const diff = targetRotY.current - bodyRef.current.rotation.y
    const wrapped = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI
    bodyRef.current.rotation.y += wrapped * Math.min(delta * 14, 1)

    prevPos.current = { x, z }
  })

  return (
    <group ref={rootRef} position={[x, 0, z]} scale={[scale, scale, scale]}>
      {/* Shadow on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.28, 14]} />
        <meshStandardMaterial color="#000" transparent opacity={0.22} />
      </mesh>

      {/* Character body — rotates to face movement */}
      <group ref={bodyRef}>

        {/* LEGS — pivot from top of leg (hip) */}
        {/* Left leg */}
        <group position={[-0.1, 0.48, 0]}>
          <mesh ref={leftLegRef} position={[0, -0.25, 0]}>
            <boxGeometry args={[0.2, 0.5, 0.2]} />
            <meshStandardMaterial color={limbColor} />
          </mesh>
        </group>
        {/* Right leg */}
        <group position={[0.1, 0.48, 0]}>
          <mesh ref={rightLegRef} position={[0, -0.25, 0]}>
            <boxGeometry args={[0.2, 0.5, 0.2]} />
            <meshStandardMaterial color={limbColor} />
          </mesh>
        </group>

        {/* BODY */}
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[0.42, 0.46, 0.26]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isPlayer ? 0.25 : 0.12}
            toneMapped={false}
          />
        </mesh>

        {/* ARMS — pivot from shoulder */}
        {/* Left arm */}
        <group position={[-0.32, 0.88, 0]}>
          <mesh ref={leftArmRef} position={[0, -0.22, 0]}>
            <boxGeometry args={[0.18, 0.44, 0.18]} />
            <meshStandardMaterial color={limbColor} />
          </mesh>
        </group>
        {/* Right arm */}
        <group position={[0.32, 0.88, 0]}>
          <mesh ref={rightArmRef} position={[0, -0.22, 0]}>
            <boxGeometry args={[0.18, 0.44, 0.18]} />
            <meshStandardMaterial color={limbColor} />
          </mesh>
        </group>

        {/* HEAD */}
        <mesh ref={headRef} position={[0, 1.22, 0]}>
          <boxGeometry args={[0.46, 0.46, 0.46]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isPlayer ? 0.3 : 0.15}
            toneMapped={false}
          />
        </mesh>

        {/* Eyes — on front face of head (z+ face) */}
        <mesh position={[-0.11, 1.25, 0.24]}>
          <boxGeometry args={[0.09, 0.09, 0.02]} />
          <meshStandardMaterial color="#1a0a00" />
        </mesh>
        <mesh position={[0.11, 1.25, 0.24]}>
          <boxGeometry args={[0.09, 0.09, 0.02]} />
          <meshStandardMaterial color="#1a0a00" />
        </mesh>

        {/* Player crown indicator */}
        {isPlayer && (
          <>
            <mesh position={[-0.1, 1.54, 0]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
            </mesh>
            <mesh position={[0, 1.58, 0]}>
              <boxGeometry args={[0.1, 0.14, 0.1]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
            </mesh>
            <mesh position={[0.1, 1.54, 0]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
            </mesh>
          </>
        )}

        {/* Name tag */}
        <Html
          position={[0, 1.8, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            background: isPlayer ? '#1e3a8a' : '#1a2744',
            border: `1px solid ${isPlayer ? '#3d6db5' : '#2a3a5a'}`,
            borderRadius: 4,
            padding: '1px 7px',
            fontSize: 10,
            color: 'white',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}>
            {isPlayer ? `${name} ✦` : name}
          </div>
        </Html>

        {/* Chat bubble */}
        {chat && (
          <Html position={[0, 2.1, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'white',
              color: '#1a1a2e',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              maxWidth: 200,
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            }}>
              {chat}
              <div style={{
                position: 'absolute', bottom: -6, left: '50%',
                transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '7px solid white',
              }} />
            </div>
          </Html>
        )}

        {/* Emote */}
        {emote && (
          <Html position={[0.4, 2.0, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{ fontSize: 20, animation: 'floatUp 2s ease-out forwards' }}>
              {emote}
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}
