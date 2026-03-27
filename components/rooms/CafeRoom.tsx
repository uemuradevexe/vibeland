'use client'
import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'
const room = ROOMS.cafe
export default function CafeRoom() {
  return (
    <>
      <mesh position={[0, 4, -8]}><planeGeometry args={[30, 20]} /><meshStandardMaterial color={room.skyColor} /></mesh>
      <mesh position={[0, -2, -1]}><boxGeometry args={[22, 0.3, 4]} /><meshStandardMaterial color={room.groundColor} /></mesh>
      <mesh position={[0, -1.84, 0.5]}><boxGeometry args={[22, 0.05, 0.1]} /><meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={0.4} toneMapped={false} /></mesh>
      {room.doors.map((door) => <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />)}
      <GroundPlane />
    </>
  )
}
