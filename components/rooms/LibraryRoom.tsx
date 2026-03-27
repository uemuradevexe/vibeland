'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.library
const BOOK_COLORS = ['#7c3aed', '#ec4899', '#0ea5e9', '#059669', '#f59e0b', '#f43f5e', '#06b6d4', '#a855f7'] as const

export default function LibraryRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>
      {/* Diamond tile pattern */}
      {Array.from({ length: 12 }).map((_, i) =>
        Array.from({ length: 12 }).map((_, j) => (
          <mesh key={`${i}-${j}`} rotation={[-Math.PI / 2, Math.PI / 4, 0]} position={[(i - 5.5) * 4.5, 0.003, (j - 5.5) * 4.5]}>
            <planeGeometry args={[2.2, 2.2]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? '#200840' : '#2a1a50'} />
          </mesh>
        ))
      )}

      {/* Walls */}
      <mesh position={[0, 5, -18]}>
        <boxGeometry args={[40, 10, 0.4]} />
        <meshStandardMaterial color="#180630" />
      </mesh>
      <mesh position={[-18, 5, 0]}>
        <boxGeometry args={[0.4, 10, 40]} />
        <meshStandardMaterial color="#180630" />
      </mesh>
      <mesh position={[18, 5, 0]}>
        <boxGeometry args={[0.4, 10, 40]} />
        <meshStandardMaterial color="#150528" />
      </mesh>

      {/* Bookshelves — back wall */}
      {[-12, -7, -2, 3, 8, 13].map((sx, idx) => (
        <group key={idx} position={[sx, 0, -17]}>
          <mesh position={[0, 2.8, 0]}>
            <boxGeometry args={[3.2, 5.6, 0.6]} />
            <meshStandardMaterial color="#1a0e30" />
          </mesh>
          {[0.7, 1.7, 2.7, 3.7, 4.7].map((sy, si) => (
            <mesh key={si} position={[0, sy, 0.31]}>
              <boxGeometry args={[3.2, 0.07, 0.07]} />
              <meshStandardMaterial color="#2a1a4e" />
            </mesh>
          ))}
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 7 }).map((_, col) => (
              <mesh key={`${row}-${col}`} position={[col * 0.42 - 1.26, 0.4 + row, 0.32]}>
                <boxGeometry args={[0.36, 0.8, 0.26]} />
                <meshStandardMaterial
                  color={BOOK_COLORS[(row * 7 + col + idx) % BOOK_COLORS.length]}
                  emissive={BOOK_COLORS[(row * 7 + col + idx) % BOOK_COLORS.length]}
                  emissiveIntensity={0.15}
                  toneMapped={false}
                />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* Bookshelves — left wall */}
      {[-12, -6, 0, 6, 12].map((sz, idx) => (
        <group key={idx} position={[-17, 0, sz]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 2.8, 0]}>
            <boxGeometry args={[3.2, 5.6, 0.6]} />
            <meshStandardMaterial color="#1a0e30" />
          </mesh>
          {[0.7, 1.7, 2.7, 3.7, 4.7].map((sy, si) => (
            <mesh key={si} position={[0, sy, 0.31]}>
              <boxGeometry args={[3.2, 0.07, 0.07]} />
              <meshStandardMaterial color="#2a1a4e" />
            </mesh>
          ))}
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 7 }).map((_, col) => (
              <mesh key={`${row}-${col}`} position={[col * 0.42 - 1.26, 0.4 + row, 0.32]}>
                <boxGeometry args={[0.36, 0.8, 0.26]} />
                <meshStandardMaterial
                  color={BOOK_COLORS[(row * 7 + col + idx + 3) % BOOK_COLORS.length]}
                  emissive={BOOK_COLORS[(row * 7 + col + idx + 3) % BOOK_COLORS.length]}
                  emissiveIntensity={0.15}
                  toneMapped={false}
                />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* Central reading desks */}
      {[[-4, -3], [4, -3], [0, 4]].map(([dx, dz], i) => (
        <group key={i} position={[dx, 0, dz]}>
          <mesh position={[0, 0.74, 0]}>
            <boxGeometry args={[3.0, 0.12, 1.6]} />
            <meshStandardMaterial color="#3d2a6b" />
          </mesh>
          {[[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]].map(([lx, lz], li) => (
            <mesh key={li} position={[lx, 0.37, lz]}>
              <cylinderGeometry args={[0.07, 0.07, 0.74, 6]} />
              <meshStandardMaterial color="#2a1a4e" />
            </mesh>
          ))}
          {/* Glowing open book */}
          <mesh position={[0, 0.83, 0]} rotation={[0, i * 0.4, 0]}>
            <boxGeometry args={[1.1, 0.07, 0.8]} />
            <meshStandardMaterial color={BOOK_COLORS[i * 2 % BOOK_COLORS.length]} emissive={BOOK_COLORS[i * 2 % BOOK_COLORS.length]} emissiveIntensity={0.7} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.88, 0]} rotation={[0, i * 0.4, 0]}>
            <boxGeometry args={[1.05, 0.01, 0.76]} />
            <meshStandardMaterial color="#e8ddf8" emissive="#8b5cf6" emissiveIntensity={0.25} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 1.6, 0]} color={BOOK_COLORS[i * 2 % BOOK_COLORS.length]} intensity={0.7} distance={5} />
          {/* Ink well + quill */}
          <mesh position={[0.9, 0.82, -0.4]}>
            <cylinderGeometry args={[0.1, 0.12, 0.2, 8]} />
            <meshStandardMaterial color="#1a0a2e" />
          </mesh>
        </group>
      ))}

      {/* Spiral staircase prop — corner */}
      <group position={[13, 0, -12]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[
            Math.cos(i * Math.PI * 0.35) * 1.0,
            i * 0.36,
            Math.sin(i * Math.PI * 0.35) * 1.0,
          ]} rotation={[0, i * Math.PI * 0.35, 0]}>
            <boxGeometry args={[1.0, 0.1, 0.45]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#3d2a6b' : '#2a1a4e'} />
          </mesh>
        ))}
        {/* Centre pole */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 3.6, 8]} />
          <meshStandardMaterial color="#2a1a4e" />
        </mesh>
      </group>

      {/* Reading nooks — cozy corners */}
      {[[-14, 12], [14, 12]].map(([nx, nz], i) => (
        <group key={i} position={[nx, 0, nz]}>
          {/* Low table */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[2, 0.08, 1.2]} />
            <meshStandardMaterial color="#3d2a6b" />
          </mesh>
          {/* Globe */}
          <mesh position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.28, 12, 12]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <torusGeometry args={[0.3, 0.025, 6, 20]} />
            <meshStandardMaterial color="#c8a060" />
          </mesh>
          {/* Cushioned seat */}
          <mesh position={[0, 0.18, 1.2]}>
            <boxGeometry args={[2, 0.36, 0.9]} />
            <meshStandardMaterial color="#4a2a6a" />
          </mesh>
        </group>
      ))}

      {/* Floating magical orb candles */}
      {[
        [-6, 4.5, -6], [6, 4.5, -6], [-6, 4.5, 6], [6, 4.5, 6],
        [0, 5.5, -10], [-10, 5.5, 0], [10, 5.5, 0], [0, 5.5, 10],
      ].map(([cx, cy, cz], i) => (
        <group key={i} position={[cx, cy, cz]}>
          <mesh>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial
              color={BOOK_COLORS[i % BOOK_COLORS.length]}
              emissive={BOOK_COLORS[i % BOOK_COLORS.length]}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
          <pointLight color={BOOK_COLORS[i % BOOK_COLORS.length]} intensity={0.55} distance={6} />
        </group>
      ))}

      {/* Tall candle stands */}
      {[[-8, -8], [8, -8], [-8, 8], [8, 8], [-14, 0], [14, 0], [0, -14], [0, 14]].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.07, 0.11, 2.4, 6]} />
            <meshStandardMaterial color="#2a1a4e" />
          </mesh>
          <mesh position={[0, 2.45, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.36, 6]} />
            <meshStandardMaterial color="#e8e0c0" />
          </mesh>
          <mesh position={[0, 2.67, 0]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color={BOOK_COLORS[i % BOOK_COLORS.length]} emissive={BOOK_COLORS[i % BOOK_COLORS.length]} emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 2.9, 0]} color={BOOK_COLORS[i % BOOK_COLORS.length]} intensity={0.45} distance={5} />
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
