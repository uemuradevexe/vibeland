'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.beach

export default function BeachRoom() {
  return (
    <>
      {/* Sky — deep ocean blue */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={room.skyColor} />
      </mesh>

      {/* Stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 3.1) * 11, Math.cos(i * 2.1) * 3 + 5, -7.5]}>
          <sphereGeometry args={[0.035, 4, 4]} />
          <meshStandardMaterial color="#c8e0f0" emissive="#c8e0f0" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}

      {/* Moon */}
      <mesh position={[-5, 7, -7]}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#f0e6c8" emissive="#f0e6c8" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>

      {/* Ocean background */}
      <mesh position={[0, 0, -4]}>
        <planeGeometry args={[25, 4]} />
        <meshStandardMaterial color="#0a3a6a" />
      </mesh>
      <mesh position={[0, -0.5, -3.5]}>
        <planeGeometry args={[25, 0.15]} />
        <meshStandardMaterial color="#1a6aaa" emissive="#1a6aaa" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>

      {/* Sand ground */}
      <mesh position={[0, -2, -1]}>
        <boxGeometry args={[22, 0.3, 5]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Sand accent */}
      <mesh position={[0, -1.84, 0.5]}>
        <boxGeometry args={[22, 0.04, 0.1]} />
        <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Palm trees */}
      {[-7, 7].map((tx) => (
        <group key={tx} position={[tx, -1.85, 0.5]}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 3, 8]} />
            <meshStandardMaterial color="#6b4a1f" />
          </mesh>
          {/* Leaves */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.8,
                3.2,
                Math.sin((angle * Math.PI) / 180) * 0.3,
              ]}
              rotation={[0.4, (angle * Math.PI) / 180, 0]}
            >
              <boxGeometry args={[1.4, 0.06, 0.3]} />
              <meshStandardMaterial color="#1a6a2a" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Token coins in sand */}
      {[-3, 0, 3].map((cx) => (
        <mesh key={cx} position={[cx, -1.82, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 12]} />
          <meshStandardMaterial color="#f0c840" emissive="#f0c840" emissiveIntensity={0.6} toneMapped={false} />
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
