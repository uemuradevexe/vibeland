'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.space

export default function SpaceRoom() {
  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Metal floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={room.groundColor} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Floor grid pattern — lighter lines */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={`h${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, (i - 7.5) * 4]}>
          <planeGeometry args={[60, 0.06]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={`v${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 7.5) * 4, 0.003, 0]}>
          <planeGeometry args={[0.06, 60]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      ))}

      {/* Central reactor core */}
      <group position={[0, 0, 0]}>
        {/* Reactor cylinder */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[1.5, 1.8, 5, 16]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={1.5}
            toneMapped={false}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Reactor base */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 0.6, 16]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Reactor top ring */}
        <mesh position={[0, 5.1, 0]}>
          <cylinderGeometry args={[1.8, 1.5, 0.3, 16]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.8} roughness={0.2} />
        </mesh>
        <pointLight position={[0, 2.5, 0]} color="#00e5ff" intensity={3} distance={15} />
      </group>

      {/* Console bank left */}
      <group position={[-12, 0, -10]}>
        {/* Console body */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[5, 2.0, 2]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 1.8, -0.5]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[4, 1.2, 0.1]} />
          <meshStandardMaterial
            color="#0044ff"
            emissive="#0044ff"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
        <pointLight position={[0, 2, -1]} color="#0044ff" intensity={0.8} distance={5} />
      </group>

      {/* Console bank right */}
      <group position={[12, 0, -10]}>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[5, 2.0, 2]} />
          <meshStandardMaterial color="#1a1a2a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.8, -0.5]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[4, 1.2, 0.1]} />
          <meshStandardMaterial
            color="#00ff44"
            emissive="#00ff44"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
        <pointLight position={[0, 2, -1]} color="#00ff44" intensity={0.8} distance={5} />
      </group>

      {/* Cargo pod left */}
      <group position={[-10, 0, 10]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[3, 2.4, 3]} />
          <meshStandardMaterial color="#2a2a3a" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Marking stripe */}
        <mesh position={[0, 1.2, 1.52]}>
          <boxGeometry args={[2.5, 0.3, 0.05]} />
          <meshStandardMaterial color="#ff4081" emissive="#ff4081" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* Cargo pod right */}
      <group position={[10, 0, 10]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[3, 2.4, 3]} />
          <meshStandardMaterial color="#2a2a3a" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.2, 1.52]}>
          <boxGeometry args={[2.5, 0.3, 0.05]} />
          <meshStandardMaterial color="#76ff03" emissive="#76ff03" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* Viewport window — large transparent pane on back wall */}
      <group position={[0, 4, -18]}>
        <mesh>
          <planeGeometry args={[20, 8]} />
          <meshStandardMaterial
            color="#0a1a3a"
            transparent
            opacity={0.3}
            emissive="#0a1a3a"
            emissiveIntensity={0.3}
            toneMapped={false}
          />
        </mesh>
        {/* Window frame */}
        {[
          [0, 4.1, 20, 0.2],
          [0, -4.1, 20, 0.2],
          [-10.1, 0, 0.2, 8.4],
          [10.1, 0, 0.2, 8.4],
        ].map(([fx, fy, fw, fh], i) => (
          <mesh key={i} position={[fx, fy, 0.05]}>
            <boxGeometry args={[fw, fh, 0.1]} />
            <meshStandardMaterial color="#1a1a2a" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Stars visible through window (behind the window) */}
      {Array.from({ length: 80 }).map((_, i) => (
        <mesh key={i} position={[
          Math.sin(i * 2.1) * 25,
          4 + Math.cos(i * 1.3) * 5,
          -20 - Math.abs(Math.sin(i * 0.7)) * 10,
        ]}>
          <sphereGeometry args={[0.08, 4, 4]} />
          <meshStandardMaterial color="#c8d8f0" emissive="#c8d8f0" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      ))}

      {/* Holographic displays — small floating emissive planes */}
      {[
        [-5, 3, -5, '#00e5ff'],
        [5, 3.5, -5, '#76ff03'],
        [-3, 4, 5, '#ff4081'],
      ].map(([hx, hy, hz, hc], i) => (
        <mesh key={i} position={[hx as number, hy as number, hz as number]} rotation={[0, Math.PI / 6 * i, 0]}>
          <planeGeometry args={[1.5, 1.0]} />
          <meshStandardMaterial
            color={hc as string}
            emissive={hc as string}
            emissiveIntensity={2}
            toneMapped={false}
            transparent
            opacity={0.6}
            side={2}
          />
        </mesh>
      ))}

      {/* Support beams / struts */}
      {[
        [-8, -8],
        [8, -8],
        [-8, 8],
        [8, 8],
        [-16, 0],
        [16, 0],
      ].map(([sx, sz], i) => (
        <mesh key={i} position={[sx, 4, sz]}>
          <cylinderGeometry args={[0.12, 0.12, 8, 6]} />
          <meshStandardMaterial color="#2a2a3a" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Blinking status lights */}
      {[
        [-16, 2, -8, '#ff0000'],
        [-16, 2, 8, '#00ff00'],
        [16, 2, -8, '#00ff00'],
        [16, 2, 8, '#ff0000'],
        [-8, 6, -8, '#ffff00'],
        [8, 6, -8, '#ffff00'],
      ].map(([lx, ly, lz, lc], i) => (
        <mesh key={i} position={[lx as number, ly as number, lz as number]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial
            color={lc as string}
            emissive={lc as string}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#0a0a14" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
