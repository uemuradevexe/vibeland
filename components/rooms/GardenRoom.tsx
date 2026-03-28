'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.garden

// Trees [x, z, trunk-r, height, foliage-r, color]
const TREES: [number, number, number, number, number, string][] = [
  [-8,  -8,  0.25, 3.0, 2.0, '#1a5a18'],
  [ 8,  -8,  0.22, 2.6, 1.8, '#226622'],
  [-8,   8,  0.28, 3.4, 2.2, '#1e6a1a'],
  [ 8,   8,  0.20, 2.8, 1.9, '#1a5a18'],
  [-14,  0,  0.18, 2.4, 1.5, '#226622'],
  [ 14,  0,  0.22, 3.0, 1.8, '#1a5a18'],
  [-5,  14,  0.16, 2.0, 1.4, '#2a7a22'],
  [ 5, -14,  0.18, 2.2, 1.6, '#226622'],
  [-16, -12, 0.14, 1.8, 1.2, '#1e6a1a'],
  [ 16,  12, 0.15, 2.0, 1.3, '#1a5a18'],
]

// Flowers [x, z, color]
const FLOWERS: [number, number, string][] = [
  [-3, -5, '#f472b6'], [3, -5, '#fbbf24'], [-5, 3, '#fb7185'], [5, 3, '#a3e635'],
  [-11, -5, '#f9a8d4'], [11, 5, '#fde68a'], [-5, -11, '#86efac'], [5, 11, '#f472b6'],
  [2, -9, '#fbbf24'], [-2, 9, '#fb7185'], [9, -2, '#a3e635'], [-9, 2, '#f472b6'],
]

export default function GardenRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Grass ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Lighter grass patches */}
      {[[-6, -6], [6, -6], [-6, 6], [6, 6], [0, -12], [0, 12], [-12, 0], [12, 0]].map(([px, pz], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[px, 0.003, pz]}>
          <circleGeometry args={[2.5, 12]} />
          <meshStandardMaterial color="#226622" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Stone path */}
      {[
        [0, -8], [0, -4], [0, 0], [0, 4], [0, 8],
        [-4, 0], [-8, 0], [4, 0], [8, 0],
      ].map(([px, pz], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[px, 0.005, pz]}>
          <circleGeometry args={[1.0, 8]} />
          <meshStandardMaterial color="#2d4a2d" />
        </mesh>
      ))}

      {/* Central pond */}
      <group position={[0, 0, 0]}>
        {/* Pond rim */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[2.9, 3.1, 0.24, 24]} />
          <meshStandardMaterial color="#1a3a1a" />
        </mesh>
        {/* Water surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}>
          <circleGeometry args={[2.7, 28]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.3} toneMapped={false} transparent opacity={0.8} />
        </mesh>
        {/* Lily pad */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.8, 0.28, 0.5]}>
          <circleGeometry args={[0.4, 8]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.6, 0.28, -0.7]}>
          <circleGeometry args={[0.35, 8]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
        {/* Pond light */}
        <pointLight position={[0, 0.5, 0]} color="#0ea5e9" intensity={1.0} distance={6} />
      </group>

      {/* Trees */}
      {TREES.map(([tx, tz, tr, th, fr, fc], i) => (
        <group key={i} position={[tx, 0, tz]}>
          {/* Trunk */}
          <mesh position={[0, th * 0.35, 0]}>
            <cylinderGeometry args={[tr * 0.6, tr, th * 0.7, 7]} />
            <meshStandardMaterial color="#3d2008" />
          </mesh>
          {/* Lower foliage */}
          <mesh position={[0, th * 0.7, 0]}>
            <sphereGeometry args={[fr * 1.1, 8, 8]} />
            <meshStandardMaterial color={fc} />
          </mesh>
          {/* Upper foliage */}
          <mesh position={[0, th * 0.95, 0]}>
            <sphereGeometry args={[fr * 0.75, 8, 8]} />
            <meshStandardMaterial color={fc.replace('#', '#0') + '0'} />
          </mesh>
          {/* Top cluster */}
          <mesh position={[0, th * 1.15, 0]}>
            <sphereGeometry args={[fr * 0.4, 6, 6]} />
            <meshStandardMaterial color="#2a7a22" />
          </mesh>
        </group>
      ))}

      {/* Flower patches */}
      {FLOWERS.map(([fx, fz, fc], i) => (
        <group key={i} position={[fx, 0, fz]}>
          {/* Stem */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 4]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          {/* Bloom */}
          <mesh position={[0, 0.44, 0]}>
            <sphereGeometry args={[0.14, 6, 6]} />
            <meshStandardMaterial color={fc} emissive={fc} emissiveIntensity={0.4} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Garden benches */}
      {[
        [-10, -10, Math.PI / 4],
        [10, -10, -Math.PI / 4],
        [-10, 10, -Math.PI / 4],
        [10, 10, Math.PI / 4],
      ].map(([bx, bz, ry], i) => (
        <group key={i} position={[bx, 0, bz]} rotation={[0, ry, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.4, 0.1, 0.45]} />
            <meshStandardMaterial color="#5c3310" />
          </mesh>
          <mesh position={[0, 0.5, -0.15]}>
            <boxGeometry args={[1.4, 0.4, 0.08]} />
            <meshStandardMaterial color="#5c3310" />
          </mesh>
          {[-0.55, 0.55].map((lx) => (
            <mesh key={lx} position={[lx, 0.15, 0]}>
              <boxGeometry args={[0.08, 0.3, 0.5]} />
              <meshStandardMaterial color="#4a2808" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Fireflies / ambient orbs */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 6 + (i % 3) * 3
        const colors = ['#86efac', '#fbbf24', '#f472b6', '#a3e635']
        const col = colors[i % 4]
        return (
          <group key={i} position={[Math.cos(angle) * r, 1.5 + (i % 3) * 0.4, Math.sin(angle) * r]}>
            <mesh>
              <sphereGeometry args={[0.07, 5, 5]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={3} toneMapped={false} />
            </mesh>
            <pointLight color={col} intensity={0.6} distance={3} />
          </group>
        )
      })}

      {/* Moon */}
      <mesh position={[18, 20, -20]}>
        <sphereGeometry args={[1.2, 14, 14]} />
        <meshStandardMaterial color="#d4e8a8" emissive="#d4e8a8" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      <pointLight position={[18, 20, -20]} color="#d4e8a8" intensity={0.8} distance={80} />

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 2.5) * 26, 10 + Math.cos(i * 1.9) * 5, Math.cos(i * 1.3 + 1) * 26]}>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshStandardMaterial color="#c8f0c8" emissive="#c8f0c8" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
