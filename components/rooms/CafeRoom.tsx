'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.cafe

const TABLE_POSITIONS: [number, number][] = [
  [-6, -6], [-2, -6], [2, -6], [6, -6],
  [-6, -1], [-2, -1], [2, -1], [6, -1],
  [-6,  5], [-2,  5], [2,  5], [6,  5],
]

export default function CafeRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Wooden floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>
      {/* Floor planks */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -14 + i]}>
          <planeGeometry args={[60, 0.04]} />
          <meshStandardMaterial color="#3a2408" />
        </mesh>
      ))}

      {/* Outer walls */}
      <mesh position={[0, 4, -18]}>
        <boxGeometry args={[40, 8, 0.4]} />
        <meshStandardMaterial color="#2a1505" />
      </mesh>
      <mesh position={[-18, 4, 0]}>
        <boxGeometry args={[0.4, 8, 40]} />
        <meshStandardMaterial color="#241204" />
      </mesh>
      <mesh position={[18, 4, 0]}>
        <boxGeometry args={[0.4, 8, 40]} />
        <meshStandardMaterial color="#241204" />
      </mesh>

      {/* Counter — back of cafe */}
      <group position={[0, 0, -14]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[16, 1.2, 2]} />
          <meshStandardMaterial color="#5c3310" />
        </mesh>
        <mesh position={[0, 1.22, 0]}>
          <boxGeometry args={[16.3, 0.1, 2.2]} />
          <meshStandardMaterial color="#7a4a1a" />
        </mesh>
        {/* Coffee machines */}
        {[-5, -1, 3, 7].map((mx) => (
          <group key={mx} position={[mx, 1.35, 0]}>
            <mesh>
              <boxGeometry args={[1.0, 0.9, 0.8]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <sphereGeometry args={[0.16, 8, 8]} />
              <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={1.5} toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* Mugs on counter */}
        {[-8, -3, 1, 5, 9].map((mx) => (
          <group key={mx} position={[mx, 1.35, 0.5]}>
            <mesh>
              <cylinderGeometry args={[0.12, 0.1, 0.22, 8]} />
              <meshStandardMaterial color="#e8e0d0" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
              <circleGeometry args={[0.1, 8]} />
              <meshStandardMaterial color="#3a1a05" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Windows with warm glow — right wall */}
      {[-8, -2, 4, 10].map((wz, i) => (
        <group key={i} position={[17.8, 3, wz]}>
          <mesh>
            <boxGeometry args={[0.1, 2.4, 1.8]} />
            <meshStandardMaterial color="#f0a030" emissive="#f0a030" emissiveIntensity={0.6} toneMapped={false} transparent opacity={0.35} />
          </mesh>
          <pointLight position={[0, 0, 0]} color="#f59e0b" intensity={0.7} distance={8} />
        </group>
      ))}

      {/* Tables + chairs */}
      {TABLE_POSITIONS.map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.65, 0.6, 0.09, 18]} />
            <meshStandardMaterial color="#7a4a1a" />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.76, 6]} />
            <meshStandardMaterial color="#5c3310" />
          </mesh>
          {/* Cup */}
          <mesh position={[0.18, 0.85, 0.1]}>
            <cylinderGeometry args={[0.11, 0.09, 0.2, 8]} />
            <meshStandardMaterial color="#e8e0d0" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.18, 0.95, 0.1]}>
            <circleGeometry args={[0.09, 8]} />
            <meshStandardMaterial color="#3a1a05" />
          </mesh>
          {/* 2 chairs */}
          {[0, Math.PI].map((angle, ci) => (
            <group key={ci} position={[Math.sin(angle) * 0.95, 0, Math.cos(angle) * 0.95]} rotation={[0, angle, 0]}>
              <mesh position={[0, 0.24, 0]}>
                <cylinderGeometry args={[0.29, 0.26, 0.06, 8]} />
                <meshStandardMaterial color="#5c3310" />
              </mesh>
              {[-0.18, 0.18].map((lx) => (
                <mesh key={lx} position={[lx, 0.12, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, 0.24, 4]} />
                  <meshStandardMaterial color="#4a2808" />
                </mesh>
              ))}
              <mesh position={[0, 0.52, 0.22]}>
                <boxGeometry args={[0.52, 0.44, 0.06]} />
                <meshStandardMaterial color="#5c3310" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Sofa corner — right back area */}
      <group position={[12, 0, -8]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[4, 0.6, 1.6]} />
          <meshStandardMaterial color="#6b4a2a" />
        </mesh>
        <mesh position={[0, 0.7, -0.7]}>
          <boxGeometry args={[4, 0.8, 0.3]} />
          <meshStandardMaterial color="#7a5a35" />
        </mesh>
        {[-1.7, 1.7].map((ax) => (
          <mesh key={ax} position={[ax, 0.55, 0]}>
            <boxGeometry args={[0.3, 0.6, 1.6]} />
            <meshStandardMaterial color="#7a5a35" />
          </mesh>
        ))}
        {/* Coffee table */}
        <mesh position={[0, 0.22, 1.4]}>
          <boxGeometry args={[2.4, 0.06, 0.9]} />
          <meshStandardMaterial color="#5c3310" />
        </mesh>
        {/* Books on table */}
        {[-0.6, 0, 0.6].map((bx) => (
          <mesh key={bx} position={[bx, 0.28, 1.4]} rotation={[0, bx * 0.5, 0]}>
            <boxGeometry args={[0.4, 0.06, 0.28]} />
            <meshStandardMaterial color={['#7c3aed', '#0ea5e9', '#f59e0b'][Math.abs(Math.round(bx))] ?? '#7c3aed'} emissive={['#7c3aed', '#0ea5e9', '#f59e0b'][Math.abs(Math.round(bx))] ?? '#7c3aed'} emissiveIntensity={0.2} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Bookshelf wall — left side */}
      {[-12, -7, -2, 3, 8].map((bz, idx) => (
        <group key={idx} position={[-17, 0, bz]}>
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[0.5, 4.4, 2.8]} />
            <meshStandardMaterial color="#2a1505" />
          </mesh>
          {[0.5, 1.5, 2.5, 3.5].map((sy, si) => (
            <mesh key={si} position={[0.26, sy, 0]}>
              <boxGeometry args={[0.06, 0.06, 2.8]} />
              <meshStandardMaterial color="#3d2310" />
            </mesh>
          ))}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <mesh key={`${row}-${col}`} position={[0.3, 0.35 + row, col * 0.42 - 1.05]}>
                <boxGeometry args={[0.22, 0.72, 0.35]} />
                <meshStandardMaterial
                  color={(['#7c3aed', '#ec4899', '#0ea5e9', '#059669', '#f59e0b', '#f43f5e'] as const)[(row * 6 + col + idx) % 6]}
                  emissive={(['#7c3aed', '#ec4899', '#0ea5e9', '#059669', '#f59e0b', '#f43f5e'] as const)[(row * 6 + col + idx) % 6]}
                  emissiveIntensity={0.12}
                  toneMapped={false}
                />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* Corner plants */}
      {[[-14, -14], [14, -14], [-14, 14], [14, 14]].map(([px, pz], i) => (
        <group key={i} position={[px, 0, pz]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 0.7, 8]} />
            <meshStandardMaterial color="#3d2310" />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <sphereGeometry args={[0.55, 8, 8]} />
            <meshStandardMaterial color="#1a5010" />
          </mesh>
          <mesh position={[0.25, 1.2, 0]}>
            <sphereGeometry args={[0.3, 6, 6]} />
            <meshStandardMaterial color="#226618" />
          </mesh>
        </group>
      ))}

      {/* Ceiling lights grid */}
      {[-9, -3, 3, 9].map((lx) =>
        [-9, -3, 3, 9].map((lz) => (
          <group key={`${lx}-${lz}`} position={[lx, 5, lz]}>
            <mesh>
              <boxGeometry args={[0.4, 0.1, 0.4]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={3} toneMapped={false} />
            </mesh>
            <pointLight position={[0, -0.3, 0]} color="#f59e0b" intensity={0.9} distance={8} />
          </group>
        ))
      )}

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
