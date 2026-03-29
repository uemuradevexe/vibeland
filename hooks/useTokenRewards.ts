'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { saveTokens } from '@/lib/tokenStore'
import { playTokenReward } from '@/lib/sounds'

const ONLINE_REWARD = 10
const ONLINE_INTERVAL_MS = 15 * 60 * 1000   // 15 minutes

export function useTokenRewards() {
  useEffect(() => {
    const timer = setInterval(() => {
      const state = useGameStore.getState()
      const next = state.tokens + ONLINE_REWARD
      saveTokens(next)
      useGameStore.setState({ tokens: next, onlineRewardPending: ONLINE_REWARD })
      useGameStore.getState().checkAchievements()
      playTokenReward()
    }, ONLINE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])
}
