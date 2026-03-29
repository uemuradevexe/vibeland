'use client'

import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/store/gameStore'
import ClaudeOrb from './ClaudeOrb'
import type { HatId, VehicleId } from '@/lib/skins'
import type { AvatarId } from '@/lib/avatars'
import type { Friend } from '@/lib/friends'

interface RemotePlayerActorProps {
  id: string
  name: string
  color: string
  hat: HatId
  vehicle: VehicleId
  avatar: AvatarId
  level: number
  chat: string | null
  emote: string | null
  targetX: number
  targetZ: number
  isFriend: boolean
  addFriend: (friend: Friend) => void
  removeFriend: (id: string) => void
}

function RemotePlayerActor({
  id,
  name,
  color,
  hat,
  vehicle,
  avatar,
  level,
  chat,
  emote,
  targetX,
  targetZ,
  isFriend,
  addFriend,
  removeFriend,
}: RemotePlayerActorProps) {
  const [position, setPosition] = useState({ x: targetX, z: targetZ })

  useFrame((_, delta) => {
    setPosition((current) => {
      const nextX = current.x + (targetX - current.x) * Math.min(delta * 12, 1)
      const nextZ = current.z + (targetZ - current.z) * Math.min(delta * 12, 1)
      if (Math.abs(nextX - current.x) < 0.0005 && Math.abs(nextZ - current.z) < 0.0005) return current
      return { x: nextX, z: nextZ }
    })
  })

  return (
    <ClaudeOrb
      x={position.x}
      z={position.z}
      color={color}
      name={name}
      chat={chat}
      emote={emote}
      hat={hat}
      vehicle={vehicle}
      avatar={avatar}
      level={level}
      isFriend={isFriend}
      onAddFriend={() => addFriend({ id, name, color, avatar })}
      onRemoveFriend={() => removeFriend(id)}
    />
  )
}

export default function RemotePlayers() {
  const remotePlayers = useGameStore((s) => s.remotePlayers)
  const currentRoom = useGameStore((s) => s.currentRoom)
  const friends = useGameStore((s) => s.friends)
  const addFriend = useGameStore((s) => s.addFriend)
  const removeFriend = useGameStore((s) => s.removeFriend)
  const friendIds = new Set(friends.map((friend) => friend.id))

  return (
    <>
      {Object.values(remotePlayers)
        .filter((p) => p.room === currentRoom)
        .map((p) => (
          <RemotePlayerActor
            key={p.id}
            id={p.id}
            name={p.name}
            color={p.color}
            chat={p.chat}
            emote={p.emote}
            hat={p.hat as HatId}
            vehicle={p.vehicle as VehicleId}
            avatar={(p.avatar as AvatarId) ?? 'default'}
            level={p.level ?? 1}
            targetX={p.x}
            targetZ={p.z}
            isFriend={friendIds.has(p.id)}
            addFriend={addFriend}
            removeFriend={removeFriend}
          />
        ))}
    </>
  )
}
