'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import GameCanvas from '@/components/game/GameCanvas'

export default function GamePage() {
  const playerName = useGameStore((s) => s.playerName)
  const router = useRouter()

  useEffect(() => {
    if (!playerName) router.replace('/')
  }, [playerName, router])

  if (!playerName) return null

  return <GameCanvas />
}
