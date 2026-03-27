'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/store/gameStore'
import { ROOMS } from '@/lib/roomConfig'
import { getRandomPhrase } from '@/lib/npcPhrases'
import ClaudeOrb from './ClaudeOrb'
import type { NPC } from '@/store/gameStore'

export default function NPCManager() {
  const currentRoom = useGameStore((s) => s.currentRoom)
  const npcs = useGameStore((s) => s.npcs)
  const setNPCs = useGameStore((s) => s.setNPCs)
  const tickGame = useGameStore((s) => s.tickGame)
  const initialized = useRef(false)

  useEffect(() => {
    const room = ROOMS[currentRoom]
    const newNpcs: NPC[] = room.npcColors.slice(0, room.npcCount).map((color, i) => {
      const angle = (i / room.npcCount) * Math.PI * 2
      return {
        id: `npc_${currentRoom}_${i}`,
        color,
        x: Math.cos(angle) * 3,
        z: Math.sin(angle) * 3,
        targetX: Math.cos(angle) * 3,
        targetZ: Math.sin(angle) * 3,
        phrase: null,
        phraseTimer: 0,
        wanderTimer: Math.random() * 3,
      }
    })
    setNPCs(newNpcs)
    initialized.current = true
  }, [currentRoom, setNPCs])

  useEffect(() => {
    const interval = setInterval(() => {
      const store = useGameStore.getState()
      const updatedNpcs = store.npcs.map((npc) => {
        if (Math.random() < 0.3) {
          return { ...npc, phrase: getRandomPhrase(store.currentRoom), phraseTimer: 4 }
        }
        return npc
      })
      setNPCs(updatedNpcs)
    }, 5000)
    return () => clearInterval(interval)
  }, [setNPCs])

  useFrame((_, delta) => {
    tickGame(Math.min(delta, 0.1))
  })

  return (
    <>
      {npcs.map((npc, i) => (
        <ClaudeOrb
          key={npc.id}
          x={npc.x}
          z={npc.z}
          color={npc.color}
          name={`npc_00${i + 1}`}
          chat={npc.phrase}
        />
      ))}
    </>
  )
}
