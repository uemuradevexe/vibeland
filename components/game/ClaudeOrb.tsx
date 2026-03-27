'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { HATS, VEHICLES, type HatId, type VehicleId } from '@/lib/skins'

interface ClaudeOrbProps {
  x: number
  z?: number
  color: string
  name: string
  chat?: string | null
  emote?: string | null
  isPlayer?: boolean
  hat?: HatId
  vehicle?: VehicleId
}

// Slightly darker shade for limbs
function darkenHex(hex: string, amount = 0.62): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const d = (v: number) => Math.round(v * amount).toString(16).padStart(2, '0')
  return `#${d(r)}${d(g)}${d(b)}`
}

// Minecraft-style proportions (total height ~2 units, feet at y=0):
//   Legs   : 0.25 × 0.75 × 0.25   pivot at hip y=0.75, x=±0.125
//   Torso  : 0.50 × 0.75 × 0.25   center y=1.125
//   Arms   : 0.25 × 0.75 × 0.25   pivot at shoulder y=1.50, x=±0.375
//   Head   : 0.50 × 0.50 × 0.50   center y=1.75
export default function ClaudeOrb({ x, z = 0, color, name, chat, emote, isPlayer, hat = 'none', vehicle = 'none' }: ClaudeOrbProps) {
  const hatDef     = HATS[hat]     ?? HATS.none
  const vehicleDef = VEHICLES[vehicle] ?? VEHICLES.none
  const rootRef   = useRef<THREE.Group>(null)
  const bodyRef   = useRef<THREE.Group>(null)   // Y rotation (faces direction)
  const floatRef  = useRef<THREE.Group>(null)   // idle bob
  const leftArmRef  = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const leftLegRef  = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)

  const prevPos    = useRef({ x, z })
  const targetRotY = useRef(0)
  const walkPhase  = useRef(Math.random() * Math.PI * 2)
  const idlePhase  = useRef(Math.random() * Math.PI * 2)

  const limbColor = darkenHex(color)
  const scale = isPlayer ? 1.1 : 1.0

  useFrame((_, delta) => {
    if (!bodyRef.current || !floatRef.current) return

    const dx = x - prevPos.current.x
    const dz = z - prevPos.current.z
    const speed = Math.sqrt(dx * dx + dz * dz)
    const isMoving = speed > 0.002

    if (isMoving) {
      targetRotY.current = Math.atan2(dx, dz)
      walkPhase.current += delta * 7
      const swing = Math.sin(walkPhase.current)
      if (leftLegRef.current)   leftLegRef.current.rotation.x  =  swing * 0.6
      if (rightLegRef.current)  rightLegRef.current.rotation.x = -swing * 0.6
      if (leftArmRef.current)   leftArmRef.current.rotation.x  = -swing * 0.45
      if (rightArmRef.current)  rightArmRef.current.rotation.x  =  swing * 0.45
    } else {
      if (leftLegRef.current)   leftLegRef.current.rotation.x  *= 0.85
      if (rightLegRef.current)  rightLegRef.current.rotation.x *= 0.85
      if (leftArmRef.current)   leftArmRef.current.rotation.x  *= 0.85
      if (rightArmRef.current)  rightArmRef.current.rotation.x *= 0.85

      // Idle bob on whole character
      idlePhase.current += delta * 1.4
      floatRef.current.position.y = Math.sin(idlePhase.current) * 0.018
    }

    // Smooth Y rotation toward movement direction
    const diff = targetRotY.current - bodyRef.current.rotation.y
    const wrapped = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI
    bodyRef.current.rotation.y += wrapped * Math.min(delta * 14, 1)

    prevPos.current = { x, z }
  })

  return (
    <group ref={rootRef} position={[x, 0, z]} scale={[scale, scale, scale]}>
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      {/* Body group — rotates to face direction */}
      <group ref={bodyRef}>
        {/* Float group — idle bob offset */}
        <group ref={floatRef}>

          {/* LEGS — pivot at hip */}
          <group position={[-0.125, 0.75, 0]}>
            <mesh ref={leftLegRef} position={[0, -0.375, 0]}>
              <boxGeometry args={[0.25, 0.75, 0.25]} />
              <meshStandardMaterial color={limbColor} />
            </mesh>
          </group>
          <group position={[0.125, 0.75, 0]}>
            <mesh ref={rightLegRef} position={[0, -0.375, 0]}>
              <boxGeometry args={[0.25, 0.75, 0.25]} />
              <meshStandardMaterial color={limbColor} />
            </mesh>
          </group>

          {/* TORSO */}
          <mesh position={[0, 1.125, 0]}>
            <boxGeometry args={[0.5, 0.75, 0.25]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isPlayer ? 0.22 : 0.1}
              toneMapped={false}
            />
          </mesh>

          {/* ARMS — pivot at shoulder */}
          <group position={[-0.375, 1.5, 0]}>
            <mesh ref={leftArmRef} position={[0, -0.375, 0]}>
              <boxGeometry args={[0.25, 0.75, 0.25]} />
              <meshStandardMaterial color={limbColor} />
            </mesh>
          </group>
          <group position={[0.375, 1.5, 0]}>
            <mesh ref={rightArmRef} position={[0, -0.375, 0]}>
              <boxGeometry args={[0.25, 0.75, 0.25]} />
              <meshStandardMaterial color={limbColor} />
            </mesh>
          </group>

          {/* HEAD */}
          <mesh position={[0, 1.75, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isPlayer ? 0.28 : 0.13}
              toneMapped={false}
            />
          </mesh>

          {/* Eyes — front face */}
          <mesh position={[-0.12, 1.79, 0.26]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
            <meshStandardMaterial color="#1a0a00" />
          </mesh>
          <mesh position={[0.12, 1.79, 0.26]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
            <meshStandardMaterial color="#1a0a00" />
          </mesh>

          {/* HAT — pieces positioned relative to top of head (y=2.0) */}
          {hatDef.pieces.length > 0 && (
            <group position={[0, 2.0, 0]}>
              {hatDef.pieces.map((piece, i) => (
                <mesh key={i} position={piece.position}>
                  <boxGeometry args={piece.size} />
                  <meshStandardMaterial
                    color={piece.color}
                    emissive={piece.emissive ?? piece.color}
                    emissiveIntensity={piece.emissiveIntensity ?? 0}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          )}

          {/* VEHICLE — pieces rendered below feet */}
          {vehicleDef.pieces.length > 0 && (
            <group>
              {vehicleDef.pieces.map((piece, i) => (
                <mesh key={i} position={piece.position}>
                  <boxGeometry args={piece.size} />
                  <meshStandardMaterial color={piece.color} />
                </mesh>
              ))}
            </group>
          )}

        </group>{/* /floatRef */}

        {/* Player crown — hidden when a hat is equipped */}
        {isPlayer && hat === 'none' && (
          <>
            <mesh position={[-0.13, 2.07, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
            <mesh position={[0, 2.12, 0]}>
              <boxGeometry args={[0.12, 0.18, 0.12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
            <mesh position={[0.13, 2.07, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
          </>
        )}

        {/* Name tag */}
        <Html
          position={[0, 2.22, 0]}
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
          <Html position={[0, 2.55, 0]} center style={{ pointerEvents: 'none' }}>
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
          <Html position={[0.45, 2.4, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{ fontSize: 20, animation: 'floatUp 2s ease-out forwards' }}>
              {emote}
            </div>
          </Html>
        )}

      </group>{/* /bodyRef */}
    </group>
  )
}
