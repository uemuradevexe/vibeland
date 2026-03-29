export type AchievementId =
  | 'first_steps' | 'world_traveler' | 'chatterbox' | 'party_starter'
  | 'fashionista' | 'driver' | 'token_saver' | 'daily_login' | 'veteran'
  | 'avatar_collector' | 'emote_master' | 'social_butterfly'

export interface Achievement {
  id: AchievementId
  name: string
  emoji: string
  description: string
  maxProgress: number
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_steps:       { id: 'first_steps',       name: 'First Steps',       emoji: '🗺️', description: 'Visit all 6 rooms',               maxProgress: 6  },
  world_traveler:    { id: 'world_traveler',     name: 'World Traveler',    emoji: '🌍', description: 'Switch rooms 20 times',           maxProgress: 20 },
  chatterbox:        { id: 'chatterbox',         name: 'Chatterbox',        emoji: '💬', description: 'Send 50 chat messages',           maxProgress: 50 },
  party_starter:     { id: 'party_starter',      name: 'Party Starter',     emoji: '🎉', description: 'Use 6 different emotes',          maxProgress: 6  },
  fashionista:       { id: 'fashionista',        name: 'Fashionista',       emoji: '👒', description: 'Own 3 cosmetic items',            maxProgress: 3  },
  driver:            { id: 'driver',             name: 'Driver',            emoji: '🛹', description: 'Unlock any vehicle',             maxProgress: 1  },
  token_saver:       { id: 'token_saver',        name: 'Token Saver',       emoji: '💰', description: 'Accumulate 500 tokens',          maxProgress: 500},
  daily_login:       { id: 'daily_login',        name: 'Consistent',        emoji: '📅', description: 'Claim 7 daily bonuses',          maxProgress: 7  },
  veteran:           { id: 'veteran',            name: 'Veteran',           emoji: '🏆', description: 'Log in 30 times total',          maxProgress: 30 },
  avatar_collector:  { id: 'avatar_collector',   name: 'Avatar Collector',  emoji: '🎭', description: 'Own 3 different avatars',        maxProgress: 3  },
  emote_master:      { id: 'emote_master',       name: 'Emote Master',      emoji: '✨', description: 'Use emotes 30 times',            maxProgress: 30 },
  social_butterfly:  { id: 'social_butterfly',   name: 'Social Butterfly',  emoji: '🦋', description: 'See 10 different players online', maxProgress: 10 },
}

export interface AchievementProgress {
  progress: number
  unlocked: boolean
  unlockedAt?: string
}

export type AchievementsState = Record<AchievementId, AchievementProgress>

export function defaultAchievementsState(): AchievementsState {
  return Object.fromEntries(
    Object.keys(ACHIEVEMENTS).map((id) => [id, { progress: 0, unlocked: false }])
  ) as AchievementsState
}

const KEY = 'vl_achievements'
const KEY_STATS = 'vl_stats'

export function loadAchievements(): AchievementsState {
  if (typeof window === 'undefined') return defaultAchievementsState()
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaultAchievementsState(), ...JSON.parse(raw) } : defaultAchievementsState()
  } catch { return defaultAchievementsState() }
}

export function saveAchievements(state: AchievementsState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(state))
}

export interface GameStats {
  roomsVisited: string[]
  roomSwitches: number
  messagesSent: number
  emotesUsed: Record<string, boolean>
  emotesCount: number
  loginCount: number
  dailyBonusClaimed: number
  seenPlayers: string[]
}

export function loadStats(): GameStats {
  if (typeof window === 'undefined') return defaultStats()
  try {
    const raw = localStorage.getItem(KEY_STATS)
    return raw ? { ...defaultStats(), ...JSON.parse(raw) } : defaultStats()
  } catch { return defaultStats() }
}

export function saveStats(stats: GameStats): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_STATS, JSON.stringify(stats))
}

function defaultStats(): GameStats {
  return {
    roomsVisited: [],
    roomSwitches: 0,
    messagesSent: 0,
    emotesUsed: {},
    emotesCount: 0,
    loginCount: 0,
    dailyBonusClaimed: 0,
    seenPlayers: [],
  }
}
