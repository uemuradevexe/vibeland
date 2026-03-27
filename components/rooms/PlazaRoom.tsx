'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.plaza

export default function PlazaRoom() {
  return (
    <>
      {/* Sky */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={room.skyColor} />
      </mesh>

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 2.3) * 12,
            Math.cos(i * 1.7) * 4 + 4,
            -7.5,
          ]}
        >
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshStandardMaterial color="#c8d8f0" emissive="#c8d8f0" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}

      {/* Moon */}
      <mesh position={[6, 7, -7]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#f0e6c8" emissive="#f0e6c8" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>

      {/* Background buildings */}
      {[
        [-6, 2, -5, 1.4, 4],
        [-3.5, 1.5, -5, 1, 3],
        [4, 2.5, -5, 1.2, 5],
        [7, 1.8, -5, 1.6, 3.6],
      ].map(([bx, by, bz, bw, bh], i) => (
        <mesh key={i} position={[bx, by - 1, bz]}>
          <boxGeometry args={[bw, bh, 0.2]} />
          <meshStandardMaterial color="#243560" />
        </mesh>
      ))}

      {/* Windows on buildings */}
      {[
        [-6.2, 2.5, -4.8], [-5.8, 2.5, -4.8],
        [-6.2, 1.5, -4.8], [-5.8, 1.5, -4.8],
        [3.8, 3, -4.8], [4.2, 3, -4.8],
        [7.2, 2.2, -4.8], [6.8, 2.2, -4.8],
      ].map(([wx, wy, wz], i) => (
        <mesh key={i} position={[wx, wy, wz]}>
          <boxGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#f0c84a' : '#1a2744'}
            emissive={i % 3 === 0 ? '#f0c84a' : '#000'}
            emissiveIntensity={i % 3 === 0 ? 0.8 : 0}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Ground */}
      <mesh position={[0, -2, -1]}>
        <boxGeometry args={[22, 0.3, 4]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Ground accent line */}
      <mesh position={[0, -1.84, 0.5]}>
        <boxGeometry args={[22, 0.05, 0.1]} />
        <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>

      {/* Lamp posts */}
      {[-4, 4].map((lx) => (
        <group key={lx} position={[lx, -1.85, 0.3]}>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.08, 2.4, 0.08]} />
            <meshStandardMaterial color="#2a3a5a" />
          </mesh>
          <mesh position={[0.3, 2.35, 0]}>
            <boxGeometry args={[0.6, 0.06, 0.06]} />
            <meshStandardMaterial color="#2a3a5a" />
          </mesh>
          <mesh position={[0.6, 2.3, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#f0e06a" emissive="#f0e06a" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight position={[0.6, 2.3, 0.5]} color="#f0e06a" intensity={0.8} distance={4} />
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
