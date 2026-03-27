'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.cafe

const TABLES: [number, number][] = [[-3, -3], [0, 2], [3, -2], [-3, 4]]
const BOOK_COLORS = ['#7c3aed', '#ec4899', '#0ea5e9', '#059669', '#f59e0b'] as const

export default function CafeRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Wooden floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>
      {/* Floor planks */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -7 + i]}>
          <planeGeometry args={[28, 0.04]} />
          <meshStandardMaterial color="#3a2408" />
        </mesh>
      ))}

      {/* Walls */}
      <mesh position={[0, 3.5, -9]}>
        <boxGeometry args={[20, 7, 0.3]} />
        <meshStandardMaterial color="#2a1505" />
      </mesh>
      <mesh position={[-9, 3.5, 0]}>
        <boxGeometry args={[0.3, 7, 20]} />
        <meshStandardMaterial color="#2a1505" />
      </mesh>
      <mesh position={[9, 3.5, 0]}>
        <boxGeometry args={[0.3, 7, 20]} />
        <meshStandardMaterial color="#241204" />
      </mesh>

      {/* Counter along back wall */}
      <group position={[0, 0, -7]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[8, 1.0, 1.5]} />
          <meshStandardMaterial color="#5c3310" />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[8.2, 0.08, 1.7]} />
          <meshStandardMaterial color="#7a4a1a" />
        </mesh>
        {/* Coffee machine */}
        <mesh position={[-2, 1.4, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.7]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-2, 1.85, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>

      {/* Window wall with warm glow — right side */}
      {[-3, 0, 3].map((wz, i) => (
        <group key={i} position={[8.9, 2.5, wz]}>
          <mesh>
            <boxGeometry args={[0.1, 2.0, 1.4]} />
            <meshStandardMaterial color="#f0a030" emissive="#f0a030" emissiveIntensity={0.5} toneMapped={false} transparent opacity={0.4} />
          </mesh>
          <pointLight position={[0, 0, 0]} color="#f59e0b" intensity={0.6} distance={6} />
        </group>
      ))}

      {/* Tables with chairs and cups */}
      {TABLES.map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          {/* Table top */}
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.6, 0.55, 0.08, 16]} />
            <meshStandardMaterial color="#7a4a1a" />
          </mesh>
          {/* Table leg */}
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.75, 6]} />
            <meshStandardMaterial color="#5c3310" />
          </mesh>
          {/* Coffee cup + saucer */}
          <mesh position={[0.15, 0.85, 0.1]}>
            <cylinderGeometry args={[0.1, 0.08, 0.18, 8]} />
            <meshStandardMaterial color="#e8e0d0" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.15, 0.94, 0.1]}>
            <circleGeometry args={[0.08, 8]} />
            <meshStandardMaterial color="#3a1a05" emissive="#3a1a05" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.15, 0.82, 0.1]}>
            <cylinderGeometry args={[0.14, 0.14, 0.03, 12]} />
            <meshStandardMaterial color="#e8e0d0" />
          </mesh>
          {/* Chairs */}
          {[0, Math.PI].map((angle, ci) => (
            <group key={ci} position={[Math.sin(angle) * 0.9, 0, Math.cos(angle) * 0.9]} rotation={[0, angle, 0]}>
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.28, 0.25, 0.05, 8]} />
                <meshStandardMaterial color="#5c3310" />
              </mesh>
              {[-0.18, 0.18].map((lx, li) => (
                <mesh key={li} position={[lx, 0.11, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.22, 4]} />
                  <meshStandardMaterial color="#4a2808" />
                </mesh>
              ))}
              <mesh position={[0, 0.5, 0.2]}>
                <boxGeometry args={[0.5, 0.5, 0.05]} />
                <meshStandardMaterial color="#5c3310" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Ceiling warm lights */}
      {[[-3, -3], [3, -3], [0, 1], [-3, 4], [3, 4]].map(([lx, lz], i) => (
        <group key={i} position={[lx, 4, lz]}>
          <mesh>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.3, 0]} color="#f59e0b" intensity={1.0} distance={6} />
        </group>
      ))}

      {/* Corner plants */}
      {[[-6, -6], [6, -6]].map(([px, pz], i) => (
        <group key={i} position={[px, 0, pz]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.6, 8]} />
            <meshStandardMaterial color="#3d2310" />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <sphereGeometry args={[0.45, 8, 8]} />
            <meshStandardMaterial color="#1a4a10" />
          </mesh>
        </group>
      ))}

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
