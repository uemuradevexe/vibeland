'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.beach

export default function BeachRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Sand ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Ocean — north half (z < -6) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -20]}>
        <planeGeometry args={[60, 28]} />
        <meshStandardMaterial color="#083060" emissive="#0a3a6a" emissiveIntensity={0.1} toneMapped={false} transparent opacity={0.95} />
      </mesh>
      {/* Wave shimmer lines */}
      {[0, 1.5, 3].map((wz) => (
        <mesh key={wz} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -6 - wz]}>
          <planeGeometry args={[60, 0.35]} />
          <meshStandardMaterial color="#1a8acc" emissive="#1a8acc" emissiveIntensity={0.9} toneMapped={false} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Pier extending into ocean */}
      <group position={[0, 0, -6]}>
        {/* Deck */}
        <mesh position={[0, 0.08, -7]}>
          <boxGeometry args={[3, 0.16, 14]} />
          <meshStandardMaterial color="#6b4a1f" />
        </mesh>
        {/* Deck planks */}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.17, -i + 6]}>
            <planeGeometry args={[3, 0.06]} />
            <meshStandardMaterial color="#7a5a2a" />
          </mesh>
        ))}
        {/* Pier posts */}
        {[-1, 1].map((px) =>
          [-2, -5, -8, -11].map((pz) => (
            <mesh key={`${px}-${pz}`} position={[px, -0.5, pz]}>
              <cylinderGeometry args={[0.1, 0.1, 1.4, 6]} />
              <meshStandardMaterial color="#5c3a1a" />
            </mesh>
          ))
        )}
        {/* Pier lamps */}
        {[-3, -8].map((lz) => (
          <group key={lz} position={[0, 0.16, lz]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.04, 0.06, 1.6, 5]} />
              <meshStandardMaterial color="#2a3a5a" />
            </mesh>
            <mesh position={[0, 1.65, 0]}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshStandardMaterial color="#f0e06a" emissive="#f0e06a" emissiveIntensity={3} toneMapped={false} />
            </mesh>
            <pointLight position={[0, 1.65, 0]} color="#f0e06a" intensity={0.8} distance={5} />
          </group>
        ))}
      </group>

      {/* Moon */}
      <mesh position={[-18, 16, -18]}>
        <sphereGeometry args={[1.4, 16, 16]} />
        <meshStandardMaterial color="#f0e6c8" emissive="#f0e6c8" emissiveIntensity={0.55} toneMapped={false} />
      </mesh>
      <pointLight position={[-18, 16, -18]} color="#d0e8ff" intensity={0.5} distance={60} />

      {/* Stars */}
      {Array.from({ length: 55 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 3.1) * 26, 11 + Math.cos(i * 2.1) * 4, Math.cos(i * 1.3) * 26]}>
          <sphereGeometry args={[0.06, 4, 4]} />
          <meshStandardMaterial color="#c8e0f0" emissive="#c8e0f0" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}

      {/* Palm trees */}
      {[[-10, -2], [10, 2], [-7, 7], [7, -4], [-14, 6], [14, 0], [-4, 10], [4, 12]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0.25 * (i % 2 === 0 ? 1 : -1), 2.5, 0]} rotation={[0, 0, 0.1 * (i % 2 === 0 ? 1 : -1)]}>
            <cylinderGeometry args={[0.13, 0.22, 5, 8]} />
            <meshStandardMaterial color="#6b4a1f" />
          </mesh>
          {[0, 60, 120, 180, 240, 300].map((angle, li) => (
            <mesh
              key={li}
              position={[
                Math.cos((angle * Math.PI) / 180) * 1.3 + 0.25 * (i % 2 === 0 ? 1 : -1),
                5.2,
                Math.sin((angle * Math.PI) / 180) * 1.3,
              ]}
              rotation={[0.55, (angle * Math.PI) / 180, 0]}
            >
              <boxGeometry args={[2.0, 0.06, 0.4]} />
              <meshStandardMaterial color="#1a6a2a" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Token coins scattered on beach */}
      {[
        [-5, 2], [-2, 4], [1, 1], [4, 3], [-1, 7],
        [7, 5], [-7, 9], [3, 10], [-3, -2], [6, -3],
      ].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0.03, cz]}>
          <mesh rotation={[-Math.PI / 2, 0, i * 0.4]}>
            <cylinderGeometry args={[0.26, 0.26, 0.07, 14]} />
            <meshStandardMaterial color="#f0c840" emissive="#f0c840" emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0.3, 0]} color="#f0c840" intensity={0.25} distance={2.5} />
        </group>
      ))}

      {/* Beach umbrellas + towels */}
      {[[-6, -1], [6, 3], [-11, 4], [11, -2], [0, 8]].map(([ux, uz], i) => (
        <group key={i} position={[ux, 0, uz]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.8, 6]} />
            <meshStandardMaterial color="#c8a060" />
          </mesh>
          <mesh position={[0, 2.8, 0]}>
            <coneGeometry args={[1.4, 0.55, 10]} />
            <meshStandardMaterial color={['#e05050', '#4080c0', '#50c050', '#c050c0', '#c0a030'][i % 5]} />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[1.4, 1.2, 0.07, 10]} />
            <meshStandardMaterial color={['#c03030', '#2060a0', '#308030', '#903090', '#906020'][i % 5]} />
          </mesh>
          {/* Towel on sand */}
          <mesh rotation={[-Math.PI / 2, 0, i * 0.6]} position={[0.5, 0.01, 0.5]}>
            <planeGeometry args={[1.4, 0.7]} />
            <meshStandardMaterial color={['#e07070', '#7090e0', '#70c070', '#c070c0', '#e0c070'][i % 5]} />
          </mesh>
        </group>
      ))}

      {/* Volleyball net */}
      <group position={[-5, 0, 12]}>
        {[-2, 2].map((px) => (
          <mesh key={px} position={[px, 1.1, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 2.2, 6]} />
            <meshStandardMaterial color="#c8a060" />
          </mesh>
        ))}
        <mesh position={[0, 2.1, 0]}>
          <boxGeometry args={[4, 0.08, 0.06]} />
          <meshStandardMaterial color="#c8a060" />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-1.75 + i * 0.5, 1.7, 0]}>
            <boxGeometry args={[0.03, 0.8, 0.03]} />
            <meshStandardMaterial color="#e0d0b0" />
          </mesh>
        ))}
        {/* Ball in sand */}
        <mesh position={[1.5, 0.2, 1.5]}>
          <sphereGeometry args={[0.2, 10, 10]} />
          <meshStandardMaterial color="#e8e0a0" />
        </mesh>
      </group>

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
