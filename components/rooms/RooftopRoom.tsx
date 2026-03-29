'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.rooftop

// City skyline buildings: [x, z, width, height, color]
const BUILDINGS: [number, number, number, number, string][] = [
  [-24, -24, 4, 16, '#0a0a18'],
  [-20, -26, 5, 12, '#0c0c20'],
  [-16, -25, 3, 20, '#08081a'],
  [-10, -26, 4, 14, '#0b0b1e'],
  [-4, -28, 5, 18, '#090918'],
  [2, -26, 4, 10, '#0c0c22'],
  [8, -27, 3, 22, '#07071a'],
  [14, -25, 5, 13, '#0a0a1c'],
  [20, -26, 4, 17, '#0b0b20'],
  [26, -24, 3, 11, '#0c0c1e'],
]

export default function RooftopRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Concrete rooftop floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>
      {/* Darker edges */}
      {[
        [0, -28, 60, 4],
        [0, 28, 60, 4],
        [-28, 0, 4, 60],
        [28, 0, 4, 60],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.003, z]}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#1a1a28" />
        </mesh>
      ))}

      {/* HVAC Unit 1 */}
      <group position={[-10, 0, -10]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[4, 2.4, 3]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Fan grille */}
        <mesh position={[0, 2.45, 0]}>
          <cylinderGeometry args={[1.0, 1.0, 0.1, 16]} />
          <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* HVAC Unit 2 */}
      <group position={[10, 0, -12]}>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[3, 2.0, 3]} />
          <meshStandardMaterial color="#505060" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.05, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
          <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Water Tower */}
      <group position={[0, 0, 12]}>
        {/* Legs */}
        {[[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 1.5, lz]}>
            <cylinderGeometry args={[0.08, 0.08, 3, 6]} />
            <meshStandardMaterial color="#5a5a6a" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Tank */}
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 2.0, 12]} />
          <meshStandardMaterial color="#3a3a4a" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Cone top */}
        <mesh position={[0, 4.8, 0]}>
          <coneGeometry args={[1.2, 0.8, 12]} />
          <meshStandardMaterial color="#3a3a4a" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Rooftop railing along edges */}
      {[
        [0, -18, 36, 0.1, 1.0],
        [0, 18, 36, 0.1, 1.0],
        [-18, 0, 0.1, 36, 1.0],
        [18, 0, 0.1, 36, 1.0],
      ].map(([x, z, w, d, h], i) => (
        <mesh key={i} position={[x, h / 2, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#3a3a4a" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Antenna / satellite dish */}
      <group position={[16, 0, -16]}>
        {/* Pole */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 5, 6]} />
          <meshStandardMaterial color="#5a5a6a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Dish */}
        <mesh position={[0, 4.5, 0]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.8, 0.3, 12]} />
          <meshStandardMaterial color="#6a6a7a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Blinking light */}
        <mesh position={[0, 5.1, 0]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>

      {/* Neon sign */}
      <group position={[-12, 0, -14]}>
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[4, 1.2, 0.2]} />
          <meshStandardMaterial
            color="#ff6b35"
            emissive="#ff6b35"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
        <pointLight position={[0, 3.5, 1]} color="#ff6b35" intensity={2} distance={10} />
      </group>

      {/* Vent pipes */}
      {[
        [-14, 5],
        [14, -5],
        [-6, 16],
        [8, 14],
      ].map(([vx, vz], i) => (
        <mesh key={i} position={[vx, 0.6, vz]}>
          <cylinderGeometry args={[0.3, 0.3, 1.2, 8]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* City skyline buildings in background */}
      {BUILDINGS.map(([bx, bz, bw, bh, bc], i) => (
        <group key={i} position={[bx, -8, bz]}>
          <mesh position={[0, bh / 2, 0]}>
            <boxGeometry args={[bw, bh, bw]} />
            <meshStandardMaterial color={bc} />
          </mesh>
          {/* Glowing windows */}
          {Array.from({ length: Math.floor(bh / 1.4) }).map((_, wi) => (
            <mesh key={wi} position={[0, 0.9 + wi * 1.4, bw / 2 + 0.02]}>
              <boxGeometry args={[bw * 0.4, 0.38, 0.05]} />
              <meshStandardMaterial
                color={(wi + i) % 3 === 0 ? '#f0c84a' : '#0a0a14'}
                emissive={(wi + i) % 3 === 0 ? '#f0c84a' : '#000'}
                emissiveIntensity={(wi + i) % 3 === 0 ? 0.9 : 0}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Moon */}
      <mesh position={[20, 16, -20]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color="#e8e0d0" emissive="#e8e0d0" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 2.3) * 30, 10 + Math.cos(i * 1.7) * 5, Math.cos(i * 1.1 + 1) * 30]}>
          <sphereGeometry args={[0.06, 4, 4]} />
          <meshStandardMaterial color="#c8d8f0" emissive="#c8d8f0" emissiveIntensity={1} toneMapped={false} />
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
