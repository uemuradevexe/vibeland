'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { HATS, VEHICLES, type HatId, type VehicleId } from '@/lib/skins'
import { AVATARS, type AvatarId } from '@/lib/avatars'
import { LEVEL_COLORS, AURA_CONFIGS } from '@/lib/githubLevel'

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
  avatar?: AvatarId
  level?: number
  isFriend?: boolean
  onAddFriend?: () => void
  onRemoveFriend?: () => void
}

function darkenHex(hex: string, amount = 0.62): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const d = (v: number) => Math.round(v * amount).toString(16).padStart(2, '0')
  return `#${d(r)}${d(g)}${d(b)}`
}

export default function ClaudeOrb({
  x, z = 0, color, name, chat, emote,
  isPlayer, hat = 'none', vehicle = 'none',
  avatar = 'default', level = 1,
  isFriend = false, onAddFriend, onRemoveFriend,
}: ClaudeOrbProps) {
  const avatarDef  = AVATARS[avatar] ?? AVATARS.default
  const hatDef     = HATS[hat]     ?? HATS.none
  const vehicleDef = VEHICLES[vehicle] ?? VEHICLES.none
  const clampedLevel = Math.max(1, Math.min(10, level))
  const auraConfig = AURA_CONFIGS[clampedLevel]
  const auraColor  = LEVEL_COLORS[clampedLevel]

  const bodyRef      = useRef<THREE.Group>(null)
  const floatRef     = useRef<THREE.Group>(null)
  const leftArmRef   = useRef<THREE.Mesh>(null)
  const rightArmRef  = useRef<THREE.Mesh>(null)
  const auraRingRef  = useRef<THREE.Mesh>(null)
  const auraRing2Ref = useRef<THREE.Mesh>(null)
  const auraGroupRef = useRef<THREE.Group>(null)

  const prevPos    = useRef({ x, z })
  const targetRotY = useRef(0)
  const walkPhase  = useRef(0)
  const idlePhase  = useRef(0)

  const limbColor = darkenHex(color)
  const scale = isPlayer ? 1.1 : 1.0
  const headTop = avatarDef.headTopY
  const isDefault = avatar === 'default' || avatarDef.pieces.length === 0
  const hasFriendAction = !isPlayer && (Boolean(onAddFriend) || Boolean(onRemoveFriend))

  const levelColor = LEVEL_COLORS[clampedLevel] ?? '#9E9E9E'

  useEffect(() => {
    walkPhase.current = Math.random() * Math.PI * 2
    idlePhase.current = Math.random() * Math.PI * 2
  }, [])

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
      if (isDefault) {
        if (leftArmRef.current)  leftArmRef.current.rotation.x  = -swing * 0.45
        if (rightArmRef.current) rightArmRef.current.rotation.x  =  swing * 0.45
      } else {
        floatRef.current.rotation.z = Math.sin(walkPhase.current) * 0.06
      }
    } else {
      if (isDefault) {
        if (leftArmRef.current)  leftArmRef.current.rotation.x  *= 0.85
        if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.85
      } else {
        floatRef.current.rotation.z *= 0.85
      }
      idlePhase.current += delta * 1.4
      floatRef.current.position.y = Math.sin(idlePhase.current) * 0.018
    }

    const diff = targetRotY.current - bodyRef.current.rotation.y
    const wrapped = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI
    bodyRef.current.rotation.y += wrapped * Math.min(delta * 14, 1)

    // Aura animations
    if (auraRingRef.current && clampedLevel >= 3) {
      auraRingRef.current.rotation.z += delta * auraConfig.speed
    }
    if (auraRing2Ref.current && clampedLevel >= 6) {
      auraRing2Ref.current.rotation.x += delta * auraConfig.speed * 0.7
    }
    if (auraGroupRef.current && clampedLevel >= 2) {
      auraGroupRef.current.rotation.y += delta * auraConfig.speed * 0.6
    }

    prevPos.current = { x, z }
  })

  // Generate static particle positions — orbiting via group rotation
  const particleCount = Math.min(auraConfig.particleCount, 20)
  const particles = useMemo(() => Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2
    const r = 0.75 + (i % 3) * 0.15
    const py = 0.8 + (i % 5) * 0.22
    return (
      <mesh key={i} position={[Math.cos(angle) * r, py, Math.sin(angle) * r]}>
        <boxGeometry args={[0.055, 0.055, 0.055]} />
        <meshStandardMaterial color={auraColor} emissive={auraColor} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    )
  }), [particleCount, auraColor])

  return (
    <group position={[x, 0, z]} scale={[scale, scale, scale]}>
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      {/* Aura rings — behind body */}
      {clampedLevel >= 3 && (
        <mesh ref={auraRingRef} position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.04, 8, 32]} />
          <meshStandardMaterial color={auraColor} emissive={auraColor} emissiveIntensity={1.8} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      )}
      {clampedLevel >= 6 && (
        <mesh ref={auraRing2Ref} position={[0, 1.0, 0]}>
          <torusGeometry args={[0.85, 0.03, 8, 32]} />
          <meshStandardMaterial color={auraColor} emissive={auraColor} emissiveIntensity={1.5} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      )}
      {clampedLevel >= 2 && (
        <group ref={auraGroupRef}>
          {particles}
        </group>
      )}

      {/* Body group */}
      <group
        ref={bodyRef}
        onClick={(e) => {
          if (!hasFriendAction) return
          e.stopPropagation()
          setShowFriendAction((value) => !value)
        }}
      >
        <group ref={floatRef}>

          {isDefault ? (
            // ── Block head + thin arms ─────────────────────────────────────
            <>
              {/* Big square head — doubles as body */}
              <mesh position={[0, 0.95, 0]}>
                <boxGeometry args={[0.70, 0.70, 0.70]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isPlayer ? 0.28 : 0.12} toneMapped={false} />
              </mesh>
              {/* Eyes */}
              <mesh position={[-0.13, 0.99, 0.36]}>
                <boxGeometry args={[0.10, 0.10, 0.02]} />
                <meshStandardMaterial color="#1a0a00" />
              </mesh>
              <mesh position={[0.13, 0.99, 0.36]}>
                <boxGeometry args={[0.10, 0.10, 0.02]} />
                <meshStandardMaterial color="#1a0a00" />
              </mesh>
              {/* Left arm — pivot at shoulder */}
              <group position={[-0.41, 1.04, 0]}>
                <mesh ref={leftArmRef} position={[0, -0.19, 0]}>
                  <boxGeometry args={[0.12, 0.38, 0.12]} />
                  <meshStandardMaterial color={limbColor} />
                </mesh>
              </group>
              {/* Right arm */}
              <group position={[0.41, 1.04, 0]}>
                <mesh ref={rightArmRef} position={[0, -0.19, 0]}>
                  <boxGeometry args={[0.12, 0.38, 0.12]} />
                  <meshStandardMaterial color={limbColor} />
                </mesh>
              </group>
            </>
          ) : (
            // ── Animal avatar ─────────────────────────────────────────────
            <>
              {avatarDef.pieces.map((piece, i) => (
                <mesh key={i} position={piece.position}>
                  <boxGeometry args={piece.size} />
                  <meshStandardMaterial
                    color={piece.color}
                    emissive={piece.emissive ?? '#000000'}
                    emissiveIntensity={piece.emissiveIntensity ?? 0}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </>
          )}

          {/* HAT */}
          {hatDef.pieces.length > 0 && (
            <group position={[0, headTop, 0]}>
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

          {/* VEHICLE */}
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

        </group>

        {/* Player crown (default avatar only, no hat) */}
        {isPlayer && hat === 'none' && isDefault && (
          <>
            <mesh position={[-0.13, headTop + 0.07, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
            <mesh position={[0, headTop + 0.12, 0]}>
              <boxGeometry args={[0.12, 0.18, 0.12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
            <mesh position={[0.13, headTop + 0.07, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
          </>
        )}

        {/* Name tag */}
        <Html position={[0, headTop + 0.25, 0]} center style={{ pointerEvents: hasFriendAction ? 'auto' : 'none', userSelect: 'none' }}>
          <div style={{
            background: isPlayer ? '#1e3a8a' : '#1a2744',
            border: `1px solid ${isPlayer ? '#3d6db5' : '#2a3a5a'}`,
            borderRadius: 4,
            padding: '1px 7px',
            fontSize: 10,
            color: 'white',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: hasFriendAction ? 'pointer' : 'default',
          }}>
            <span
              onClick={(e) => {
                if (!hasFriendAction) return
                e.stopPropagation()
                setShowFriendAction((value) => !value)
              }}
            >
              {isPlayer ? `${name} ✦` : name}
            </span>
            {clampedLevel >= 2 && (
              <span style={{ color: levelColor, fontSize: 9, fontWeight: 'bold' }}>Lv.{clampedLevel}</span>
            )}
          </div>
        </Html>

        {hasFriendAction && showFriendAction && (
          <Html position={[0, headTop + 0.48, 0]} center style={{ pointerEvents: 'auto', userSelect: 'none' }}>
            <div
              style={{
                background: '#0d1b2a',
                border: '1px solid #2a4a7f',
                borderRadius: 8,
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                minWidth: 120,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ color: '#7a9cc8', fontFamily: 'monospace', fontSize: 11 }}>{name}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (isFriend) onRemoveFriend?.()
                  else onAddFriend?.()
                  setShowFriendAction(false)
                }}
                style={{
                  background: isFriend ? '#5a1f1f' : '#1e3a8a',
                  border: `1px solid ${isFriend ? '#a85555' : '#3d6db5'}`,
                  borderRadius: 6,
                  padding: '5px 8px',
                  color: 'white',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {isFriend ? 'Remove Friend' : '+ Add Friend'}
              </button>
            </div>
          </Html>
        )}

        {/* Chat bubble */}
        {chat && (
          <Html position={[0, headTop + 0.6, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'white', color: '#1a1a2e', borderRadius: 8,
              padding: '4px 10px', fontSize: 11, fontFamily: 'monospace',
              whiteSpace: 'nowrap', maxWidth: 200, position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            }}>
              {chat}
              <div style={{
                position: 'absolute', bottom: -6, left: '50%',
                transform: 'translateX(-50%)', width: 0, height: 0,
                borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                borderTop: '7px solid white',
              }} />
            </div>
          </Html>
        )}

        {/* Emote */}
        {emote && (
          <Html position={[0.45, headTop + 0.45, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{ fontSize: 20, animation: 'floatUp 2s ease-out forwards' }}>{emote}</div>
          </Html>
        )}

      </group>
    </group>
  )
}
