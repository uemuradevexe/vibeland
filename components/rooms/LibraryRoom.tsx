'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.library
const BOOK_COLORS = ['#7c3aed', '#ec4899', '#0ea5e9', '#059669', '#f59e0b', '#f43f5e', '#06b6d4'] as const

export default function LibraryRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Dark stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>
      {/* Floor pattern — subtle diamond tiles */}
      {Array.from({ length: 8 }).map((_, i) =>
        Array.from({ length: 8 }).map((_, j) => (
          <mesh key={`${i}-${j}`} rotation={[-Math.PI / 2, Math.PI / 4, 0]} position={[(i - 3.5) * 3.2, 0.003, (j - 3.5) * 3.2]}>
            <planeGeometry args={[1.4, 1.4]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? '#200840' : '#2a1a50'} />
          </mesh>
        ))
      )}

      {/* Walls */}
      <mesh position={[0, 4, -9]}>
        <boxGeometry args={[20, 8, 0.3]} />
        <meshStandardMaterial color="#180630" />
      </mesh>
      <mesh position={[-9, 4, 0]}>
        <boxGeometry args={[0.3, 8, 20]} />
        <meshStandardMaterial color="#180630" />
      </mesh>
      <mesh position={[9, 4, 0]}>
        <boxGeometry args={[0.3, 8, 20]} />
        <meshStandardMaterial color="#150528" />
      </mesh>

      {/* Bookshelves — along back wall and sides */}
      {[
        // Back wall shelves
        [-6, -8.5, 0],
        [-2, -8.5, 0],
        [2, -8.5, 0],
        [6, -8.5, 0],
        // Left wall shelves
        [-8.5, -4, Math.PI / 2],
        [-8.5, 2, Math.PI / 2],
        // Right wall shelves
        [8.5, -4, -Math.PI / 2],
        [8.5, 2, -Math.PI / 2],
      ].map(([sx, sz, ry], idx) => (
        <group key={idx} position={[sx as number, 0, sz as number]} rotation={[0, ry as number, 0]}>
          {/* Shelf frame */}
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[2.8, 4.4, 0.5]} />
            <meshStandardMaterial color="#1a0e30" />
          </mesh>
          {/* Shelf planks */}
          {[0.6, 1.6, 2.6, 3.6].map((sy, si) => (
            <mesh key={si} position={[0, sy, 0.26]}>
              <boxGeometry args={[2.8, 0.06, 0.06]} />
              <meshStandardMaterial color="#2a1a4e" />
            </mesh>
          ))}
          {/* Books */}
          {[0, 1, 2, 3].map((row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <mesh
                key={`${row}-${col}`}
                position={[col * 0.42 - 1.05, 0.35 + row * 1.0, 0.28]}
              >
                <boxGeometry args={[0.35, 0.75, 0.22]} />
                <meshStandardMaterial
                  color={BOOK_COLORS[(row * 6 + col + idx) % BOOK_COLORS.length]}
                  emissive={BOOK_COLORS[(row * 6 + col + idx) % BOOK_COLORS.length]}
                  emissiveIntensity={0.15}
                  toneMapped={false}
                />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* Central reading desk */}
      <group position={[0, 0, 1]}>
        {/* Desk top */}
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[2.8, 0.1, 1.4]} />
          <meshStandardMaterial color="#3d2a6b" />
        </mesh>
        {/* Legs */}
        {[[-1.2, -0.55], [1.2, -0.55], [-1.2, 0.55], [1.2, 0.55]].map(([lx, lz], li) => (
          <mesh key={li} position={[lx, 0.36, lz]}>
            <cylinderGeometry args={[0.06, 0.06, 0.72, 6]} />
            <meshStandardMaterial color="#2a1a4e" />
          </mesh>
        ))}
        {/* Glowing book on desk */}
        <mesh position={[0, 0.8, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[1.0, 0.07, 0.75]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
        {/* Open book pages */}
        <mesh position={[0, 0.84, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.95, 0.01, 0.7]} />
          <meshStandardMaterial color="#e8ddf8" emissive="#8b5cf6" emissiveIntensity={0.2} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.5, 0]} color="#8b5cf6" intensity={0.8} distance={5} />
      </group>

      {/* Floating magical orbs / candles */}
      {[
        [-4, 3.5, -3], [4, 3.5, -3],
        [-4, 3.5, 4], [4, 3.5, 4],
        [0, 4.5, -5],
      ].map(([cx, cy, cz], i) => (
        <group key={i} position={[cx, cy, cz]}>
          <mesh>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color={BOOK_COLORS[i % BOOK_COLORS.length]}
              emissive={BOOK_COLORS[i % BOOK_COLORS.length]}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
          <pointLight color={BOOK_COLORS[i % BOOK_COLORS.length]} intensity={0.5} distance={5} />
        </group>
      ))}

      {/* Tall candle stands */}
      {[[-5, -5], [5, -5], [-5, 5], [5, 5]].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 2.0, 6]} />
            <meshStandardMaterial color="#2a1a4e" />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 6]} />
            <meshStandardMaterial color="#e8e0c0" />
          </mesh>
          <mesh position={[0, 2.28, 0]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 2.5, 0]} color="#ec4899" intensity={0.4} distance={4} />
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
