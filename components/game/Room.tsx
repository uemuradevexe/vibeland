'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import PlazaRoom from '@/components/rooms/PlazaRoom'
import CafeRoom from '@/components/rooms/CafeRoom'
import BeachRoom from '@/components/rooms/BeachRoom'
import LibraryRoom from '@/components/rooms/LibraryRoom'
import ArcadeRoom from '@/components/rooms/ArcadeRoom'
import GardenRoom from '@/components/rooms/GardenRoom'
import ClaudeOrb from './ClaudeOrb'
import NPCManager from './NPCManager'
import RemotePlayers from './RemotePlayers'

const ROOM_COMPONENTS = {
  plaza: PlazaRoom,
  cafe: CafeRoom,
  beach: BeachRoom,
  library: LibraryRoom,
  arcade: ArcadeRoom,
  garden: GardenRoom,
}

export default function Room() {
  const currentRoom = useGameStore((s) => s.currentRoom)
  const playerX = useGameStore((s) => s.playerX)
  const playerZ = useGameStore((s) => s.playerZ)
  const playerColor = useGameStore((s) => s.playerColor)
  const playerName = useGameStore((s) => s.playerName)
  const playerChat    = useGameStore((s) => s.playerChat)
  const playerEmote   = useGameStore((s) => s.playerEmote)
  const playerHat     = useGameStore((s) => s.playerHat)
  const playerVehicle = useGameStore((s) => s.playerVehicle)
  const playerAvatar  = useGameStore((s) => s.playerAvatar)
  const initPlayer    = useGameStore((s) => s.initPlayer)

  useEffect(() => { initPlayer() }, [initPlayer])

  const RoomComponent = ROOM_COMPONENTS[currentRoom]

  return (
    <>
      <RoomComponent />
      <NPCManager />
      <RemotePlayers />
      <ClaudeOrb
        x={playerX}
        z={playerZ}
        color={playerColor}
        name={playerName || 'você'}
        chat={playerChat}
        emote={playerEmote}
        hat={playerHat}
        vehicle={playerVehicle}
        avatar={playerAvatar}
        isPlayer
      />
    </>
  )
}
