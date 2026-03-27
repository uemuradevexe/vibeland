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
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Ocean — fills north half (z < -4) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -9]}>
        <planeGeometry args={[28, 10]} />
        <meshStandardMaterial color="#0a3a6a" emissive="#0a3a6a" emissiveIntensity={0.15} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      {/* Wave line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, -4]}>
        <planeGeometry args={[28, 0.3]} />
        <meshStandardMaterial color="#1a8acc" emissive="#1a8acc" emissiveIntensity={0.8} toneMapped={false} transparent opacity={0.9} />
      </mesh>

      {/* Moon */}
      <mesh position={[-10, 12, -10]}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshStandardMaterial color="#f0e6c8" emissive="#f0e6c8" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Stars */}
      {Array.from({ length: 35 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 3.1) * 16,
            9 + Math.cos(i * 2.1) * 3,
            Math.cos(i * 1.3) * 16,
          ]}
        >
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshStandardMaterial color="#c8e0f0" emissive="#c8e0f0" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}

      {/* Palm trees */}
      {[[-6, -2], [6, 2], [-5, 5]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          {/* Trunk — leans slightly */}
          <mesh position={[0.2, 2, 0]} rotation={[0, 0, 0.08 * (i % 2 === 0 ? 1 : -1)]}>
            <cylinderGeometry args={[0.12, 0.2, 4, 8]} />
            <meshStandardMaterial color="#6b4a1f" />
          </mesh>
          {/* Palm leaves */}
          {[0, 60, 120, 180, 240, 300].map((angle, li) => (
            <mesh
              key={li}
              position={[
                Math.cos((angle * Math.PI) / 180) * 1.0 + 0.2,
                4.1,
                Math.sin((angle * Math.PI) / 180) * 1.0,
              ]}
              rotation={[0.5, (angle * Math.PI) / 180, 0]}
            >
              <boxGeometry args={[1.6, 0.06, 0.35]} />
              <meshStandardMaterial color="#1a6a2a" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Token coins on beach */}
      {[[-3, 1], [0, 3], [3, 0], [-1, -2], [2, -1]].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0.03, cz]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.06, 14]} />
            <meshStandardMaterial color="#f0c840" emissive="#f0c840" emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0.3, 0]} color="#f0c840" intensity={0.3} distance={2} />
        </group>
      ))}

      {/* Beach umbrellas */}
      {[[-4, -1], [4, 2]].map(([ux, uz], i) => (
        <group key={i} position={[ux, 0, uz]}>
          {/* Pole */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.4, 6]} />
            <meshStandardMaterial color="#c8a060" />
          </mesh>
          {/* Canopy — cone shape approximated with cylinder */}
          <mesh position={[0, 2.4, 0]}>
            <coneGeometry args={[1.2, 0.5, 10]} />
            <meshStandardMaterial color={i === 0 ? '#e05050' : '#4080c0'} />
          </mesh>
          <mesh position={[0, 2.15, 0]}>
            <cylinderGeometry args={[1.2, 1.0, 0.06, 10]} />
            <meshStandardMaterial color={i === 0 ? '#c03030' : '#2060a0'} />
          </mesh>
        </group>
      ))}

      {/* Moonlight on water */}
      <pointLight position={[-10, 8, -12]} color="#d0e8ff" intensity={0.6} distance={20} />

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
