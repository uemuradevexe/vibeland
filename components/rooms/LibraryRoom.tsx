'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.library

export default function LibraryRoom() {
  return (
    <>
      {/* Sky — deep purple/navy */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={room.skyColor} />
      </mesh>

      {/* Ground */}
      <mesh position={[0, -2, -1]}>
        <boxGeometry args={[22, 0.3, 4]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Ground accent */}
      <mesh position={[0, -1.84, 0.5]}>
        <boxGeometry args={[22, 0.05, 0.1]} />
        <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>

      {/* Bookshelves */}
      {[-7, -3.5, 3.5, 7].map((sx) => (
        <group key={sx} position={[sx, -0.5, -2]}>
          {/* Shelf frame */}
          <mesh>
            <boxGeometry args={[2.5, 5, 0.3]} />
            <meshStandardMaterial color="#2a1a4e" />
          </mesh>
          {/* Colorful books */}
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <mesh
                key={`${row}-${col}`}
                position={[col * 0.42 - 0.85, row * 1.0 - 1.8, 0.2]}
              >
                <boxGeometry args={[0.35, 0.85, 0.2]} />
                <meshStandardMaterial
                  color={(['#7c3aed', '#ec4899', '#0ea5e9', '#059669', '#f59e0b'] as const)[(row * 5 + col) % 5]}
                  emissive={(['#7c3aed', '#ec4899', '#0ea5e9', '#059669', '#f59e0b'] as const)[(row * 5 + col) % 5]}
                  emissiveIntensity={0.2}
                  toneMapped={false}
                />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* Reading desk */}
      <group position={[0, -1.85, 0.5]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[3, 0.1, 1]} />
          <meshStandardMaterial color="#3d2a6b" />
        </mesh>
        <mesh position={[-0.7, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#2a1a4e" />
        </mesh>
        <mesh position={[0.7, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#2a1a4e" />
        </mesh>
        {/* Glowing book on desk */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.9]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.2, 0.5]} color="#8b5cf6" intensity={0.6} distance={4} />
      </group>

      {/* Candle-style ceiling lights */}
      {[-5, 0, 5].map((lx) => (
        <group key={lx} position={[lx, 2.5, 0.5]}>
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight color="#ec4899" intensity={0.4} distance={4} />
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
