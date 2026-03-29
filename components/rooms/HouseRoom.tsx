'use client'

import { Html } from '@react-three/drei'
import { useMemo, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { FURNITURE, type FurnitureId, type PlacedFurniture } from '@/lib/furniture'
import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'

const room = ROOMS.house

function HouseFurnitureMesh({
  item,
  editable,
  selected,
  onSelect,
  onRotate,
  onRemove,
}: {
  item: PlacedFurniture
  editable: boolean
  selected: boolean
  onSelect: () => void
  onRotate: () => void
  onRemove: () => void
}) {
  const def = FURNITURE[item.type]

  return (
    <group
      position={[item.x, 0, item.z]}
      rotation={[0, item.rotation, 0]}
      onClick={(e) => {
        if (!editable) return
        e.stopPropagation()
        onSelect()
      }}
    >
      {item.type === 'lamp' ? (
        <>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.45, 0.08, 0.45]} />
            <meshStandardMaterial color="#2a3a5a" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.12, 1.2, 0.12]} />
            <meshStandardMaterial color={def.color} />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[0.4, 0.28, 0.4]} />
            <meshStandardMaterial color="#fff2a8" emissive="#fff2a8" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 1.7, 0]} color="#fff2a8" intensity={1.5} distance={5} />
        </>
      ) : item.type === 'plant' ? (
        <>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.55, 0.5, 0.55]} />
            <meshStandardMaterial color="#8b5a2b" />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[0.7, 0.9, 0.7]} />
            <meshStandardMaterial color={def.color} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, def.size[1] / 2, 0]}>
          <boxGeometry args={def.size} />
          <meshStandardMaterial
            color={def.color}
            emissive={selected ? def.color : '#000000'}
            emissiveIntensity={selected ? 0.25 : 0}
            toneMapped={false}
          />
        </mesh>
      )}

      {selected && editable && (
        <Html position={[0, 2.1, 0]} center style={{ pointerEvents: 'auto', userSelect: 'none' }}>
          <div
            className="bg-[#0d1b2a] border border-[#2a4a7f] rounded-lg px-2 py-2 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onRotate}
              className="bg-[#1e3a8a] hover:bg-[#2a4a9a] border border-[#3d6db5] rounded px-2 py-1 text-[10px] font-mono"
            >
              Rotate
            </button>
            <button
              onClick={onRemove}
              className="bg-[#5a1f1f] hover:bg-[#6f2a2a] border border-[#a85555] rounded px-2 py-1 text-[10px] font-mono"
            >
              Remove
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}

export default function HouseRoom() {
  const localPlayerId = useGameStore((s) => s.localPlayerId)
  const playerName = useGameStore((s) => s.playerName)
  const remotePlayers = useGameStore((s) => s.remotePlayers)
  const inventory = useGameStore((s) => s.inventory)
  const houseItems = useGameStore((s) => s.houseItems)
  const visitedHouseItems = useGameStore((s) => s.visitedHouseItems)
  const viewingHouseOwnerId = useGameStore((s) => s.viewingHouseOwnerId)
  const houseEditMode = useGameStore((s) => s.houseEditMode)
  const addFurniture = useGameStore((s) => s.addFurniture)
  const rotateFurniture = useGameStore((s) => s.rotateFurniture)
  const removeFurniture = useGameStore((s) => s.removeFurniture)

  const isOwner = !viewingHouseOwnerId || viewingHouseOwnerId === localPlayerId
  const activeOwnerId = viewingHouseOwnerId || localPlayerId
  const activeItems = isOwner ? houseItems : (visitedHouseItems[activeOwnerId] ?? [])
  const ownerName = isOwner
    ? (playerName || 'Sua Casa')
    : (remotePlayers[activeOwnerId]?.name || 'Casa Visitada')
  const ownedFurniture = useMemo(
    () => inventory.filter((id): id is FurnitureId => id in FURNITURE),
    [inventory]
  )

  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [pickerPosition, setPickerPosition] = useState<{ x: number; z: number } | null>(null)

  return (
    <>
      <color attach="background" args={[room.skyColor]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[38, 38]} />
        <meshStandardMaterial color="#18243f" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {[[-17.5, 2.5, 0, 1, 5, 35], [17.5, 2.5, 0, 1, 5, 35], [0, 2.5, -17.5, 35, 5, 1], [0, 2.5, 17.5, 35, 5, 1]].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#243560" />
        </mesh>
      ))}

      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[38, 0.4, 38]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <mesh position={[0, 2.2, -17.2]}>
        <boxGeometry args={[4.5, 2.2, 0.2]} />
        <meshStandardMaterial color="#f0c84a" emissive="#f0c84a" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        onClick={(e) => {
          if (!isOwner || !houseEditMode) return
          e.stopPropagation()
          setSelectedFurnitureId(null)
          setPickerPosition({
            x: Math.max(-14.5, Math.min(14.5, e.point.x)),
            z: Math.max(-14.5, Math.min(14.5, e.point.z)),
          })
        }}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {activeItems.map((item) => (
        <HouseFurnitureMesh
          key={item.id}
          item={item}
          editable={isOwner && houseEditMode}
          selected={selectedFurnitureId === item.id}
          onSelect={() => {
            setPickerPosition(null)
            setSelectedFurnitureId(item.id)
          }}
          onRotate={() => rotateFurniture(item.id)}
          onRemove={() => {
            removeFurniture(item.id)
            setSelectedFurnitureId(null)
          }}
        />
      ))}

      <Html position={[0, 4.65, -15.5]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div className="bg-[#0d1b2a]/90 border border-[#2a4a7f] rounded-full px-4 py-1 text-xs font-mono text-[#7a9cc8] whitespace-nowrap">
          {isOwner ? 'Sua Casa' : `Casa de ${ownerName}`}
        </div>
      </Html>

      {pickerPosition && isOwner && houseEditMode && (
        <Html position={[pickerPosition.x, 0.45, pickerPosition.z]} center style={{ pointerEvents: 'auto', userSelect: 'none' }}>
          <div className="bg-[#0d1b2a] border border-[#2a4a7f] rounded-xl p-3 w-48" onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-[10px] text-[#7a9cc8] mb-2">+ Add Furniture</p>
            <div className="grid grid-cols-2 gap-2">
              {ownedFurniture.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    addFurniture(id, pickerPosition.x, pickerPosition.z)
                    setPickerPosition(null)
                  }}
                  className="bg-[#1a2744] hover:bg-[#243060] border border-[#2a4a7f] rounded-lg px-2 py-2 text-[10px] font-mono text-white"
                >
                  {FURNITURE[id].emoji} {FURNITURE[id].name}
                </button>
              ))}
            </div>
            {ownedFurniture.length === 0 && (
              <p className="font-mono text-[10px] text-[#5a7aa8]">Compre móveis na loja primeiro.</p>
            )}
          </div>
        </Html>
      )}

      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
    </>
  )
}
