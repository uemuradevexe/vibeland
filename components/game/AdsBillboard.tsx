'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ADS = [
  { line1: '🏖️ PRAIA', line2: 'tokens aguardam!', color: '#f0c060', bg: '#0c2a4a' },
  { line1: '☕ CAFÉ', line2: 'venha relaxar', color: '#f59e0b', bg: '#1a0e05' },
  { line1: '🎮 ARCADE', line2: 'jogos épicos', color: '#f000ff', bg: '#0a0018' },
  { line1: '🌿 JARDIM', line2: 'paz e natureza', color: '#22c55e', bg: '#0a1a0a' },
]

interface Props {
  position?: [number, number, number]
  rotateSpeed?: number
}

export default function AdsBillboard({ position = [0, 0, 0], rotateSpeed = 0.3 }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const adIndex  = useRef(0)
  const elapsed  = useRef(0)
  const adTimer  = useRef(0)
  const panelRef = useRef<THREE.Mesh>(null)
  const mat1Ref  = useRef<THREE.MeshStandardMaterial>(null)
  const mat2Ref  = useRef<THREE.MeshStandardMaterial>(null)

  // Cycle through ads every 5 seconds
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotateSpeed * delta
    }
    elapsed.current += delta
    adTimer.current += delta
    if (adTimer.current >= 5) {
      adTimer.current = 0
      adIndex.current = (adIndex.current + 1) % ADS.length
      const ad = ADS[adIndex.current]
      if (mat1Ref.current) {
        const c = new THREE.Color(ad.color)
        mat1Ref.current.emissive = c
        mat1Ref.current.color = c
      }
      if (mat2Ref.current) {
        mat2Ref.current.color = new THREE.Color(ad.bg)
      }
    }
  })

  const ad = ADS[0]

  return (
    <group ref={groupRef} position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 4, 8]} />
        <meshStandardMaterial color="#2a3a5a" />
      </mesh>

      {/* Billboard panel — back */}
      <mesh ref={panelRef} position={[0, 4.5, 0]}>
        <boxGeometry args={[3.6, 1.8, 0.15]} />
        <meshStandardMaterial ref={mat2Ref} color={ad.bg} />
      </mesh>

      {/* Billboard face — emissive glow strip */}
      <mesh position={[0, 4.5, 0.09]}>
        <boxGeometry args={[3.4, 1.6, 0.02]} />
        <meshStandardMaterial ref={mat1Ref} color={ad.color} emissive={ad.color} emissiveIntensity={1.0} toneMapped={false} transparent opacity={0.3} />
      </mesh>

      {/* Neon border */}
      {[
        [0,  0.88, 0.11, 3.6, 0.06, 0.06] as const,
        [0, -0.88, 0.11, 3.6, 0.06, 0.06] as const,
        [-1.78, 0, 0.11, 0.06, 1.8, 0.06] as const,
        [ 1.78, 0, 0.11, 0.06, 1.8, 0.06] as const,
      ].map(([ox, oy, oz, bx, by, bz], i) => (
        <mesh key={i} position={[ox, 4.5 + oy, oz]}>
          <boxGeometry args={[bx, by, bz]} />
          <meshStandardMaterial color={ad.color} emissive={ad.color} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}

      {/* Spotlight under billboard */}
      <pointLight position={[0, 4.5, 0.5]} color={ad.color} intensity={2} distance={8} />
    </group>
  )
}
