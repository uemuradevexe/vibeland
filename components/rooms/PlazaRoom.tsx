'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.plaza

// Building data: [x, z, width, height, color]
const BUILDINGS: [number, number, number, number, string][] = [
  [-10, -10, 3.5, 5, '#1a2d56'],
  [-10, 0,   2.5, 7, '#162245'],
  [-10, 10,  4.0, 4, '#1e3355'],
  [10,  -10, 3.0, 8, '#0f1e3d'],
  [10,  0,   2.8, 5, '#1a2d56'],
  [10,  10,  3.5, 6, '#162245'],
  [-4,  -11, 2.0, 3, '#1e3a6a'],
  [4,   -11, 2.5, 4, '#243560'],
  [-4,  11,  2.0, 3, '#1a2d56'],
  [4,   11,  2.8, 5, '#0f1e3d'],
]

export default function PlazaRoom() {
  return (
    <>
      {/* Sky color */}
      <color attach="background" args={[room.skyColor]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Tile grid lines */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`h${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, (i - 4.5) * 3]}>
          <planeGeometry args={[28, 0.04]} />
          <meshStandardMaterial color="#1a2a50" />
        </mesh>
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`v${i}`} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[(i - 4.5) * 3, 0.005, 0]}>
          <planeGeometry args={[28, 0.04]} />
          <meshStandardMaterial color="#1a2a50" />
        </mesh>
      ))}

      {/* Fountain */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[1.3, 1.5, 0.36, 20]} />
          <meshStandardMaterial color="#1e3a6a" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.38, 0]}>
          <circleGeometry args={[1.1, 24]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.6} toneMapped={false} transparent opacity={0.75} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.07, 0.1, 1.0, 8]} />
          <meshStandardMaterial color="#3d6db5" />
        </mesh>
        <mesh position={[0, 1.45, 0]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.5, 0]} color="#0ea5e9" intensity={0.8} distance={5} />
      </group>

      {/* Buildings */}
      {BUILDINGS.map(([bx, bz, bw, bh, bc], i) => (
        <group key={i} position={[bx, 0, bz]}>
          <mesh position={[0, bh / 2, 0]}>
            <boxGeometry args={[bw, bh, bw]} />
            <meshStandardMaterial color={bc} />
          </mesh>
          {/* Windows */}
          {Array.from({ length: Math.floor(bh / 1.4) }).map((_, wi) => (
            <mesh key={wi} position={[0, 0.8 + wi * 1.4, bw / 2 + 0.02]}>
              <boxGeometry args={[bw * 0.35, 0.35, 0.05]} />
              <meshStandardMaterial
                color={(wi + i) % 3 === 0 ? '#f0c84a' : '#0a1220'}
                emissive={(wi + i) % 3 === 0 ? '#f0c84a' : '#000'}
                emissiveIntensity={(wi + i) % 3 === 0 ? 0.9 : 0}
                toneMapped={false}
              />
            </mesh>
          ))}
          {/* Side windows */}
          {Array.from({ length: Math.floor(bh / 1.4) }).map((_, wi) => (
            <mesh key={`sw${wi}`} position={[bw / 2 + 0.02, 0.8 + wi * 1.4, 0]}>
              <boxGeometry args={[0.05, 0.35, bw * 0.35]} />
              <meshStandardMaterial
                color={(wi + i + 1) % 4 === 0 ? '#a0c0ff' : '#0a1220'}
                emissive={(wi + i + 1) % 4 === 0 ? '#a0c0ff' : '#000'}
                emissiveIntensity={(wi + i + 1) % 4 === 0 ? 0.6 : 0}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Lamp posts at plaza corners */}
      {[[-4, -4], [4, -4], [-4, 4], [4, 4]].map(([lx, lz], i) => (
        <group key={i} position={[lx, 0, lz]}>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 2.6, 6]} />
            <meshStandardMaterial color="#2a3a5a" />
          </mesh>
          <mesh position={[0, 2.65, 0]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial color="#f0e06a" emissive="#f0e06a" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 2.65, 0]} color="#f0e06a" intensity={0.9} distance={6} />
        </group>
      ))}

      {/* Stars in sky */}
      {Array.from({ length: 35 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 2.3) * 18,
            10 + Math.cos(i * 1.7) * 3,
            Math.cos(i * 1.1 + 1) * 18,
          ]}
        >
          <sphereGeometry args={[0.06, 4, 4]} />
          <meshStandardMaterial color="#c8d8f0" emissive="#c8d8f0" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}

      {/* Moon */}
      <mesh position={[-14, 14, -14]}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshStandardMaterial color="#f0e6c8" emissive="#f0e6c8" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}

      <GroundPlane />
    </>
  )
}
