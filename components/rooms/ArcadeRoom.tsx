'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.arcade

// Arcade cabinet positions [x, z]
const CABINET_POSITIONS: [number, number][] = [
  [-12, -14], [-8, -14], [-4, -14], [0, -14], [4, -14], [8, -14], [12, -14],
]

// Neon strip light positions [x, y, z, axis, length, color]
const NEON_STRIPS: [number, number, number, 'x' | 'z', number, string][] = [
  [-17, 3, 0,   'z', 34, '#f000ff'],
  [17,  3, 0,   'z', 34, '#00ffff'],
  [0,   3, -17, 'x', 34, '#ffff00'],
  [0,   3, 17,  'x', 34, '#f000ff'],
]

export default function ArcadeRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Ground — dark with neon grid lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Neon floor grid */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`gx${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 4.5) * 4, 0.003, 0]}>
          <planeGeometry args={[0.06, 40]} />
          <meshStandardMaterial color="#f000ff" emissive="#f000ff" emissiveIntensity={0.5} toneMapped={false} transparent opacity={0.4} />
        </mesh>
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`gz${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, (i - 4.5) * 4]}>
          <planeGeometry args={[40, 0.06]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} toneMapped={false} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, 5, -20]}>
        <boxGeometry args={[40, 10, 0.4]} />
        <meshStandardMaterial color="#0d0020" />
      </mesh>
      {/* Side walls */}
      <mesh position={[-20, 5, 0]}>
        <boxGeometry args={[0.4, 10, 40]} />
        <meshStandardMaterial color="#0d0020" />
      </mesh>
      <mesh position={[20, 5, 0]}>
        <boxGeometry args={[0.4, 10, 40]} />
        <meshStandardMaterial color="#0d0020" />
      </mesh>

      {/* Neon wall strips */}
      {NEON_STRIPS.map(([nx, ny, nz, axis, len, col], i) => (
        <group key={i} position={[nx, ny, nz]}>
          <mesh rotation={axis === 'z' ? [0, Math.PI / 2, 0] : [0, 0, 0]}>
            <boxGeometry args={axis === 'x' ? [len, 0.1, 0.1] : [0.1, 0.1, len]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={4} toneMapped={false} />
          </mesh>
          <pointLight color={col} intensity={2} distance={12} />
        </group>
      ))}

      {/* Arcade cabinets — back row */}
      {CABINET_POSITIONS.map(([cx, cz], i) => {
        const screenColor = ['#ff00ff', '#00ffff', '#ffff00', '#ff4400', '#00ff88', '#8800ff', '#ff0088'][i % 7]
        return (
          <group key={i} position={[cx, 0, cz]}>
            {/* Cabinet body */}
            <mesh position={[0, 1.0, 0]}>
              <boxGeometry args={[1.2, 2.0, 0.7]} />
              <meshStandardMaterial color="#1a0a30" />
            </mesh>
            {/* Screen */}
            <mesh position={[0, 1.3, 0.36]}>
              <boxGeometry args={[0.8, 0.7, 0.05]} />
              <meshStandardMaterial color={screenColor} emissive={screenColor} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
            {/* Screen glow */}
            <pointLight position={[0, 1.3, 0.5]} color={screenColor} intensity={1.5} distance={4} />
            {/* Control panel */}
            <mesh position={[0, 0.75, 0.3]} rotation={[-0.4, 0, 0]}>
              <boxGeometry args={[1.0, 0.05, 0.45]} />
              <meshStandardMaterial color="#0d0020" />
            </mesh>
            {/* Joystick */}
            <mesh position={[-0.2, 0.82, 0.18]}>
              <cylinderGeometry args={[0.04, 0.04, 0.2, 6]} />
              <meshStandardMaterial color="#888" />
            </mesh>
            {/* Buttons */}
            {[0.1, 0.22, 0.34].map((bx, bi) => (
              <mesh key={bi} position={[bx, 0.82, 0.16]}>
                <cylinderGeometry args={[0.04, 0.04, 0.06, 8]} />
                <meshStandardMaterial color={['#ff0000', '#00ff00', '#0000ff'][bi]} emissive={['#ff0000', '#00ff00', '#0000ff'][bi]} emissiveIntensity={1} toneMapped={false} />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Centre cabinet island */}
      <group position={[0, 0, -4]}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[4.0, 1.6, 2.0]} />
          <meshStandardMaterial color="#150830" />
        </mesh>
        {/* Top screen */}
        <mesh position={[0, 1.65, 0]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[3.2, 0.05, 1.6]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 2, 0]} color="#ff00ff" intensity={3} distance={8} />
      </group>

      {/* Disco ball */}
      <group position={[0, 7, 0]}>
        <mesh>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#888" metalness={1} roughness={0.1} />
        </mesh>
        <pointLight color="#ffffff" intensity={2} distance={20} />
      </group>

      {/* Ceiling lights */}
      {[[-8, -8], [8, -8], [-8, 8], [8, 8]].map(([lx, lz], i) => {
        const col = ['#ff00ff', '#00ffff', '#ffff00', '#ff4488'][i]
        return (
          <group key={i} position={[lx, 8, lz]}>
            <mesh>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={4} toneMapped={false} />
            </mesh>
            <pointLight color={col} intensity={2} distance={14} />
          </group>
        )
      })}

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
