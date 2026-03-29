'use client'

import { useState } from 'react'
import { Html } from '@react-three/drei'
import { ROOMS } from '@/lib/roomConfig'
import { useGameStore } from '@/store/gameStore'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'
import { FURNITURE_DEFS, type FurnitureId, type PlacedFurniture } from '@/lib/furniture'
import { dragStateRef } from '@/components/game/GameCanvas'

const room = ROOMS.house
const HALF = 10     // half-size of house room
const WALL_H = 4    // wall height

// ── Furniture meshes ─────────────────────────────────────────────────────────

function FurnitureMesh({
  item,
  editMode,
  onSelect,
}: {
  item: PlacedFurniture
  editMode: boolean
  onSelect: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const def = FURNITURE_DEFS[item.type]

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (!dragStateRef.current.didDrag && editMode) onSelect(item.id)
  }

  return (
    <group
      position={[item.x, 0, item.z]}
      rotation={[0, item.rotation, 0]}
      onPointerEnter={() => editMode && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <FurnitureShape type={item.type} hovered={hovered && editMode} color={def.color} accent={def.accentColor} />
    </group>
  )
}

function FurnitureShape({
  type,
  hovered,
  color,
  accent,
}: {
  type: FurnitureId
  hovered: boolean
  color: string
  accent: string
}) {
  const emissiveColor = hovered ? accent : '#000'
  const emissiveIntensity = hovered ? 0.5 : 0

  switch (type) {
    case 'rug':
      return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color={color} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
        </mesh>
      )
    case 'table':
      return (
        <group>
          {/* tabletop */}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[2, 0.1, 1]} />
            <meshStandardMaterial color={accent} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          {/* legs */}
          {([[-0.85, -0.4], [-0.85, 0.4], [0.85, -0.4], [0.85, 0.4]] as [number, number][]).map(([lx, lz]) => (
            <mesh key={`${lx}-${lz}`} position={[lx, 0.35, lz]}>
              <boxGeometry args={[0.1, 0.7, 0.1]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
        </group>
      )
    case 'lamp':
      return (
        <group>
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2.0, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={hovered ? 3.0 : 1.8}
              toneMapped={false}
            />
          </mesh>
        </group>
      )
    case 'plant':
      return (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.3, 0.25, 0.5, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <sphereGeometry args={[0.45, 10, 10]} />
            <meshStandardMaterial color={accent} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
        </group>
      )
    case 'bookshelf':
      return (
        <group>
          {/* main body */}
          <mesh position={[0, 1.0, 0]}>
            <boxGeometry args={[2, 2.0, 0.4]} />
            <meshStandardMaterial color={color} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          {/* shelves */}
          {[0.2, 0.85, 1.5].map((y, i) => (
            <mesh key={i} position={[0, y, 0.05]}>
              <boxGeometry args={[1.9, 0.05, 0.3]} />
              <meshStandardMaterial color={accent} />
            </mesh>
          ))}
        </group>
      )
    case 'tv':
      return (
        <group>
          {/* stand */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* screen */}
          <mesh position={[0, 1.0, 0]}>
            <boxGeometry args={[1.5, 0.9, 0.08]} />
            <meshStandardMaterial color={color} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          {/* screen glow */}
          <mesh position={[0, 1.0, 0.05]}>
            <boxGeometry args={[1.3, 0.7, 0.01]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={hovered ? 2.5 : 1.0} toneMapped={false} />
          </mesh>
        </group>
      )
    case 'sofa':
      return (
        <group>
          {/* seat */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[3, 0.4, 1]} />
            <meshStandardMaterial color={color} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          {/* back */}
          <mesh position={[0, 0.85, -0.45]}>
            <boxGeometry args={[3, 0.6, 0.2]} />
            <meshStandardMaterial color={accent} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
          </mesh>
          {/* armrests */}
          {([-1.45, 1.45] as const).map((ax) => (
            <mesh key={ax} position={[ax, 0.6, -0.1]}>
              <boxGeometry args={[0.15, 0.45, 0.8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
        </group>
      )
    default:
      return (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )
  }
}

// ── Floor click handler in edit mode ─────────────────────────────────────────

function EditFloor({ onPlace }: { onPlace: (x: number, z: number) => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.002, 0]}
      onClick={(e) => {
        e.stopPropagation()
        if (dragStateRef.current.didDrag) return
        const x = Math.max(-HALF + 1, Math.min(HALF - 1, e.point.x))
        const z = Math.max(-HALF + 1, Math.min(HALF - 1, e.point.z))
        onPlace(x, z)
      }}
    >
      <planeGeometry args={[HALF * 2, HALF * 2]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  )
}

// ── Main HouseRoom ────────────────────────────────────────────────────────────

export default function HouseRoom() {
  const houseItems      = useGameStore((s) => s.houseItems)
  const visitedHouseItems = useGameStore((s) => s.visitedHouseItems)
  const houseEditMode   = useGameStore((s) => s.houseEditMode)
  const houseOwnerId    = useGameStore((s) => s.houseOwnerId)
  const houseOwnerName  = useGameStore((s) => s.houseOwnerName)
  const addFurniture    = useGameStore((s) => s.addFurniture)
  const removeFurniture = useGameStore((s) => s.removeFurniture)
  const rotateFurniture = useGameStore((s) => s.rotateFurniture)
  const isOwnerHouse = !houseOwnerId
  const renderedItems = isOwnerHouse ? houseItems : visitedHouseItems

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [placingType, setPlacingType] = useState<FurnitureId | null>(null)

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const handlePlace = (x: number, z: number) => {
    if (!placingType) return
    addFurniture(placingType, x, z)
    setPlacingType(null)
  }

  const selectedItem = renderedItems.find((i) => i.id === selectedId)

  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      {/* Ambient + directional light */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 3.5, 0]} intensity={0.4} color="#ffe8c0" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <meshStandardMaterial color="#c8a06a" />
      </mesh>

      {/* Floor planks */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[i * 2 - 9, 0.001, 0]}>
          <planeGeometry args={[1.9, HALF * 2]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#c09050' : '#c8a06a'} />
        </mesh>
      ))}

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, WALL_H / 2, -HALF]}>
        <boxGeometry args={[HALF * 2, WALL_H, 0.3]} />
        <meshStandardMaterial color="#e8d8c0" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-HALF, WALL_H / 2, 0]}>
        <boxGeometry args={[0.3, WALL_H, HALF * 2]} />
        <meshStandardMaterial color="#ddd0b8" />
      </mesh>
      {/* Right wall */}
      <mesh position={[HALF, WALL_H / 2, 0]}>
        <boxGeometry args={[0.3, WALL_H, HALF * 2]} />
        <meshStandardMaterial color="#ddd0b8" />
      </mesh>

      {/* Baseboard */}
      <mesh position={[0, 0.1, -HALF + 0.2]}>
        <boxGeometry args={[HALF * 2, 0.2, 0.05]} />
        <meshStandardMaterial color="#8b6a3a" />
      </mesh>

      {/* Ceiling glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WALL_H - 0.01, 0]}>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <meshStandardMaterial color="#f5e8d0" emissive="#f5e8d0" emissiveIntensity={0.05} />
      </mesh>

      {/* Placed furniture */}
      {renderedItems.map((item) => (
        <FurnitureMesh
          key={item.id}
          item={item}
          editMode={houseEditMode && isOwnerHouse}
          onSelect={handleSelect}
        />
      ))}

      {/* Edit floor overlay for placing */}
      {houseEditMode && isOwnerHouse && placingType && (
        <EditFloor onPlace={handlePlace} />
      )}

      {/* Furniture action tooltip */}
      {houseEditMode && isOwnerHouse && selectedItem && (
        <Html
          position={[selectedItem.x, 2.5, selectedItem.z]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.85)',
              borderRadius: 8,
              padding: '6px 10px',
              display: 'flex',
              gap: 6,
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); rotateFurniture(selectedItem.id) }}
              style={{ background: '#4a5a8a', border: 'none', borderRadius: 4, color: 'white', padding: '4px 10px', cursor: 'pointer', fontSize: 13 }}
            >
              ↻
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeFurniture(selectedItem.id); setSelectedId(null) }}
              style={{ background: '#8a2020', border: 'none', borderRadius: 4, color: 'white', padding: '4px 10px', cursor: 'pointer', fontSize: 13 }}
            >
              ✕
            </button>
          </div>
        </Html>
      )}

      {/* Edit mode: place picker panel */}
      {houseEditMode && isOwnerHouse && (
        <Html
          position={[0, 0, HALF - 1]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              gap: 8,
              pointerEvents: 'auto',
              maxWidth: 320,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '100%', textAlign: 'center', fontSize: 11, color: '#aaa', marginBottom: 4 }}>
              {placingType
                ? `Clique no chão para colocar ${FURNITURE_DEFS[placingType].emoji} ${FURNITURE_DEFS[placingType].name} — ou cancele`
                : 'Escolha um móvel para colocar'}
            </div>
            <PlacePicker
              placingType={placingType}
              onSelect={(t) => setPlacingType((prev) => (prev === t ? null : t))}
            />
          </div>
        </Html>
      )}

      {!isOwnerHouse && (
        <Html position={[0, 3.2, 0]} center>
          <div
            style={{
              background: 'rgba(0,0,0,0.75)',
              border: '1px solid rgba(122,156,200,0.45)',
              borderRadius: 10,
              color: '#fff',
              padding: '8px 12px',
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}
          >
            Visitando a casa de {houseOwnerName ?? 'Amigo'}
          </div>
        </Html>
      )}

      {/* Door */}
      <Door config={room.doors[0]} accentColor={room.accentColor} />

      {/* Ground plane for walking */}
      {(!houseEditMode || !isOwnerHouse) && <GroundPlane />}
    </>
  )
}

// ── Place picker ──────────────────────────────────────────────────────────────

function PlacePicker({
  placingType,
  onSelect,
}: {
  placingType: FurnitureId | null
  onSelect: (type: FurnitureId) => void
}) {
  const inventory = useGameStore((s) => s.inventory)

  const available = (Object.values(FURNITURE_DEFS) as (typeof FURNITURE_DEFS)[FurnitureId][]).filter(
    (def) => inventory.includes(`furniture_${def.id}`),
  )

  if (available.length === 0) {
    return (
      <div style={{ color: '#888', fontSize: 12 }}>
        Compre móveis na loja 🛒
      </div>
    )
  }

  return (
    <>
      {available.map((def) => (
        <button
          key={def.id}
          onClick={() => onSelect(def.id)}
          style={{
            background: placingType === def.id ? '#4a5a9a' : '#2a3a5a',
            border: placingType === def.id ? '1px solid #7a9acc' : '1px solid #3a4a6a',
            borderRadius: 6,
            color: 'white',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {def.emoji} {def.name}
        </button>
      ))}
    </>
  )
}
