'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.cafe

export default function CafeRoom() {
  return (
    <>
      {/* Sky — warm dark brown */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={room.skyColor} />
      </mesh>

      {/* Cafe window glow on background */}
      <mesh position={[-3, 2, -6]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#f0c060" emissive="#f0c060" emissiveIntensity={0.15} toneMapped={false} />
      </mesh>
      <mesh position={[3, 2, -6]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#f0c060" emissive="#f0c060" emissiveIntensity={0.12} toneMapped={false} />
      </mesh>

      {/* Ground — wooden floor */}
      <mesh position={[0, -2, -1]}>
        <boxGeometry args={[22, 0.3, 4]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Ground accent */}
      <mesh position={[0, -1.84, 0.5]}>
        <boxGeometry args={[22, 0.05, 0.1]} />
        <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={0.3} toneMapped={false} />
      </mesh>

      {/* Tables */}
      {[-4, 0, 4].map((tx) => (
        <group key={tx} position={[tx, -1.85, 0.5]}>
          {/* Table top */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.6, 0.08, 0.8]} />
            <meshStandardMaterial color="#6b3a1f" />
          </mesh>
          {/* Table leg */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color="#4a2a12" />
          </mesh>
          {/* Coffee cup */}
          <mesh position={[0.3, 0.6, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.18, 8]} />
            <meshStandardMaterial color="#f0c060" emissive="#f0c060" emissiveIntensity={0.2} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Warm ceiling lights */}
      {[-5, 0, 5].map((lx) => (
        <group key={lx} position={[lx, 2.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#f0c060" emissive="#f0c060" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight color="#f0c060" intensity={0.6} distance={5} />
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
