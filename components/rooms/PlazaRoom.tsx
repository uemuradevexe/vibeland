'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.plaza

// [x, z, width, height, color]
const BUILDINGS: [number, number, number, number, string][] = [
  // Far corners — tall skyscrapers
  [-20, -20, 5, 10, '#1a2d56'], [-20, -20, 3, 14, '#0f1e3d'],
  [20,  -20, 4,  9, '#162245'], [20,  -20, 3, 12, '#1e3355'],
  [-20,  20, 5,  8, '#1a2d56'], [-20,  20, 2, 11, '#0f1e3d'],
  [20,   20, 4, 10, '#162245'], [20,   20, 3,  7, '#243560'],
  // Mid blocks
  [-13, -10, 4, 6, '#1a2d56'], [-13,  10, 3, 5, '#162245'],
  [13,  -10, 3, 8, '#243560'], [13,   10, 4, 4, '#1e3355'],
  [-8,  -16, 3, 5, '#1a2d56'], [8,   -16, 4, 7, '#0f1e3d'],
  [-8,   16, 4, 4, '#162245'], [8,    16, 3, 6, '#243560'],
]

export default function PlazaRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Roads — cross through the plaza */}
      {/* Horizontal road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[60, 4]} />
        <meshStandardMaterial color="#111a2e" />
      </mesh>
      {/* Vertical road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[4, 60]} />
        <meshStandardMaterial color="#111a2e" />
      </mesh>
      {/* Road centre lines */}
      {[-12, -4, 4, 12].map((ox) => (
        <mesh key={ox} rotation={[-Math.PI / 2, 0, 0]} position={[ox, 0.006, 0]}>
          <planeGeometry args={[0.18, 60]} />
          <meshStandardMaterial color="#f0c84a" emissive="#f0c84a" emissiveIntensity={0.3} toneMapped={false} />
        </mesh>
      ))}
      {[-12, -4, 4, 12].map((oz) => (
        <mesh key={oz} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, oz]}>
          <planeGeometry args={[60, 0.18]} />
          <meshStandardMaterial color="#f0c84a" emissive="#f0c84a" emissiveIntensity={0.3} toneMapped={false} />
        </mesh>
      ))}

      {/* Tile grid on sidewalks */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={`h${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, (i - 6.5) * 4]}>
          <planeGeometry args={[60, 0.04]} />
          <meshStandardMaterial color="#1a2a50" />
        </mesh>
      ))}

      {/* Fountain */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[2.0, 2.3, 0.44, 24]} />
          <meshStandardMaterial color="#1e3a6a" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.46, 0]}>
          <circleGeometry args={[1.8, 28]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.6} toneMapped={false} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
          <meshStandardMaterial color="#3d6db5" />
        </mesh>
        <mesh position={[0, 2.0, 0]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.6, 0]} color="#0ea5e9" intensity={1.2} distance={7} />
      </group>

      {/* Park benches */}
      {[
        [-4, -4, 0], [4, -4, Math.PI / 2], [-4, 4, Math.PI], [4, 4, -Math.PI / 2],
        [-10, 0, 0], [10, 0, Math.PI], [0, -10, Math.PI / 2], [0, 10, -Math.PI / 2],
      ].map(([bx, bz, ry], i) => (
        <group key={i} position={[bx, 0, bz]} rotation={[0, ry, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.4, 0.1, 0.45]} />
            <meshStandardMaterial color="#5c3310" />
          </mesh>
          <mesh position={[0, 0.5, -0.15]}>
            <boxGeometry args={[1.4, 0.4, 0.08]} />
            <meshStandardMaterial color="#5c3310" />
          </mesh>
          {[-0.55, 0.55].map((lx) => (
            <mesh key={lx} position={[lx, 0.15, 0]}>
              <boxGeometry args={[0.08, 0.3, 0.5]} />
              <meshStandardMaterial color="#4a2808" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Buildings */}
      {BUILDINGS.map(([bx, bz, bw, bh, bc], i) => (
        <group key={i} position={[bx, 0, bz]}>
          <mesh position={[0, bh / 2, 0]}>
            <boxGeometry args={[bw, bh, bw]} />
            <meshStandardMaterial color={bc} />
          </mesh>
          {Array.from({ length: Math.floor(bh / 1.4) }).map((_, wi) => (
            <mesh key={wi} position={[0, 0.9 + wi * 1.4, bw / 2 + 0.02]}>
              <boxGeometry args={[bw * 0.4, 0.38, 0.05]} />
              <meshStandardMaterial
                color={(wi + i) % 3 === 0 ? '#f0c84a' : '#0a1220'}
                emissive={(wi + i) % 3 === 0 ? '#f0c84a' : '#000'}
                emissiveIntensity={(wi + i) % 3 === 0 ? 0.9 : 0}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Street lamps — along roads */}
      {[
        [-6, -6], [6, -6], [-6, 6], [6, 6],
        [-14, -6], [14, -6], [-14, 6], [14, 6],
        [-6, -14], [6, -14], [-6, 14], [6, 14],
      ].map(([lx, lz], i) => (
        <group key={i} position={[lx, 0, lz]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 3, 6]} />
            <meshStandardMaterial color="#2a3a5a" />
          </mesh>
          <mesh position={[0, 3.1, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#f0e06a" emissive="#f0e06a" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 3.1, 0]} color="#f0e06a" intensity={1.2} distance={8} />
        </group>
      ))}

      {/* Trees in plaza */}
      {[[-7, -7], [7, -7], [-7, 7], [7, 7], [-12, 0], [12, 0], [0, -12], [0, 12]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 2.0, 6]} />
            <meshStandardMaterial color="#3d2008" />
          </mesh>
          <mesh position={[0, 2.6, 0]}>
            <coneGeometry args={[1.2, 2.4, 7]} />
            <meshStandardMaterial color="#1a5a18" />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <coneGeometry args={[1.5, 1.8, 7]} />
            <meshStandardMaterial color="#226622" />
          </mesh>
        </group>
      ))}

      {/* Moon + stars */}
      <mesh position={[-22, 18, -22]}>
        <sphereGeometry args={[1.4, 16, 16]} />
        <meshStandardMaterial color="#f0e6c8" emissive="#f0e6c8" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 2.3) * 28, 12 + Math.cos(i * 1.7) * 4, Math.cos(i * 1.1 + 1) * 28]}>
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
