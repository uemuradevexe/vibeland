'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.dungeon

export default function DungeonRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Floor cracks — dark lines */}
      {[
        [-5, -3, 8, 0.06],
        [3, 5, 6, 0.06],
        [-2, -8, 0.06, 5],
        [7, 2, 0.06, 7],
        [-10, 6, 4, 0.06],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, z]}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#0a0804" />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, 4, -16]}>
        <boxGeometry args={[32, 8, 1.6]} />
        <meshStandardMaterial color="#1a1008" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-16, 4, 0]}>
        <boxGeometry args={[1.6, 8, 32]} />
        <meshStandardMaterial color="#1a1008" />
      </mesh>

      {/* Right wall */}
      <mesh position={[16, 4, 0]}>
        <boxGeometry args={[1.6, 8, 32]} />
        <meshStandardMaterial color="#1a1008" />
      </mesh>

      {/* Stone pillars */}
      {[[-8, -8], [8, -8], [-8, 8], [8, 8]].map(([px, pz], i) => (
        <group key={i} position={[px, 0, pz]}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.8, 1.0, 6, 8]} />
            <meshStandardMaterial color="#2a1a10" />
          </mesh>
          {/* Pillar base */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.4, 8]} />
            <meshStandardMaterial color="#1e1208" />
          </mesh>
        </group>
      ))}

      {/* Wall torches with flame glow */}
      {[
        // Back wall torches
        [-10, 3, -15.0],
        [-4, 3, -15.0],
        [4, 3, -15.0],
        [10, 3, -15.0],
        // Left wall torches
        [-15.0, 3, -8],
        [-15.0, 3, 8],
        // Right wall torches
        [15.0, 3, -8],
        [15.0, 3, 8],
      ].map(([tx, ty, tz], i) => (
        <group key={i} position={[tx, ty, tz]}>
          {/* Torch bracket */}
          <mesh>
            <cylinderGeometry args={[0.06, 0.08, 0.6, 6]} />
            <meshStandardMaterial color="#4a3020" />
          </mesh>
          {/* Flame */}
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.15, 6, 6]} />
            <meshStandardMaterial
              color="#ff8c00"
              emissive="#ff8c00"
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
          <pointLight position={[0, 0.4, 0]} color="#ff8c00" intensity={1.5} distance={8} />
        </group>
      ))}

      {/* Central treasure chest */}
      <group position={[0, 0, 0]}>
        {/* Chest body */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.0, 1.0, 1.4]} />
          <meshStandardMaterial color="#8B6914" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Chest lid */}
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[2.1, 0.3, 1.5]} />
          <meshStandardMaterial color="#9B7924" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Lock */}
        <mesh position={[0, 0.7, 0.72]}>
          <boxGeometry args={[0.3, 0.3, 0.1]} />
          <meshStandardMaterial color="#c8a000" emissive="#c8a000" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* Scattered bones */}
      {[
        [-4, 0.08, -4, 0],
        [5, 0.08, 3, Math.PI / 4],
        [-6, 0.08, 6, Math.PI / 3],
        [3, 0.08, -6, Math.PI / 6],
        [-3, 0.08, 10, Math.PI / 2],
      ].map(([bx, by, bz, ry], i) => (
        <mesh key={i} position={[bx, by, bz]} rotation={[0, ry, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 4]} />
          <meshStandardMaterial color="#d0c8b0" />
        </mesh>
      ))}

      {/* Chains hanging from ceiling */}
      {[
        [-5, -5],
        [5, -5],
        [-5, 5],
        [5, 5],
        [0, -10],
        [0, 10],
      ].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          {Array.from({ length: 6 }).map((_, ci) => (
            <mesh key={ci} position={[0, 7.5 - ci * 0.5, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.4, 4]} />
              <meshStandardMaterial color="#4a4040" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Cobweb corners — thin transparent triangles */}
      {[
        [-15.5, 7, -15.5, 0],
        [15.5, 7, -15.5, Math.PI / 2],
        [-15.5, 7, 15.5, -Math.PI / 2],
        [15.5, 7, 15.5, Math.PI],
      ].map(([wx, wy, wz, ry], i) => (
        <mesh key={i} position={[wx, wy, wz]} rotation={[0, ry, 0]}>
          <planeGeometry args={[3, 3]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.08} side={2} />
        </mesh>
      ))}

      {/* Ceiling — enclosed space */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#0e0804" />
      </mesh>

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
