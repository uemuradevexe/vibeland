import { create } from 'zustand'
import { ROOMS, type RoomId } from '@/lib/roomConfig'
import { resolvePosition } from '@/lib/collision'
import type { HatId, VehicleId } from '@/lib/skins'
import type { AvatarId } from '@/lib/avatars'
import {
  loadTokens, saveTokens, claimDailyBonus,
  loadEquipped, saveEquipped,
  loadInventory, saveInventory,
} from '@/lib/tokenStore'
import { loadFriends, saveFriends, type Friend } from '@/lib/friends'
import {
  ACHIEVEMENTS,
  loadAchievements, saveAchievements,
  loadStats, saveStats,
  defaultAchievementsState,
  type AchievementId,
  type AchievementsState,
  type GameStats,
} from '@/lib/achievements'
import { loadGithubLevel, saveGithubLevel } from '@/lib/githubLevel'

export interface RemotePlayer {
  id: string
  name: string
  color: string
  hat: string
  vehicle: string
  avatar?: string
  level?: number
  x: number
  z: number
  room: RoomId
  chat: string | null
  chatTimer: number
  emote: string | null
  emoteTimer: number
}

export interface GameState {
  // Player
  playerName: string
  playerColor: string
  playerX: number
  playerZ: number
  playerTargetX: number
  playerTargetZ: number
  playerChat: string | null
  playerChatTimer: number
  playerEmote: string | null
  playerEmoteTimer: number

  // Cosmetics
  playerHat: HatId
  playerVehicle: VehicleId
  playerAvatar: AvatarId
  tokens: number
  inventory: string[]
  dailyBonusPending: number
  onlineRewardPending: number
  friends: Friend[]

  // GitHub level
  githubUsername: string
  githubLevel: number
  githubContributions: number

  // Achievements
  achievements: AchievementsState
  gameStats: GameStats
  pendingAchievement: AchievementId | null

  // World
  currentRoom: RoomId

  // Multiplayer
  wsConnected: boolean
  remotePlayers: Record<string, RemotePlayer>

  // Actions
  setPlayer: (name: string, color: string) => void
  setPlayerColor: (color: string) => void
  setPlayerTarget: (x: number, z: number) => void
  sendChat: (message: string) => void
  sendEmote: (emote: string) => void
  changeRoom: (room: RoomId) => void
  tickGame: (delta: number) => void

  // Multiplayer actions
  setRemotePlayers: (players: RemotePlayer[]) => void
  upsertRemotePlayer: (partial: Partial<RemotePlayer> & { id: string }) => void
  removeRemotePlayer: (id: string) => void

  // Skins & tokens
  equipHat: (hat: HatId) => void
  equipVehicle: (vehicle: VehicleId) => void
  equipAvatar: (avatar: AvatarId) => void
  buyItem: (itemId: string, cost: number) => boolean
  initPlayer: () => void
  dismissDailyBonus: () => void
  dismissOnlineReward: () => void
  addFriend: (friend: Friend) => void
  removeFriend: (id: string) => void

  // GitHub level
  setGithubLevel: (username: string, level: number, contributions: number) => void

  // Achievements
  checkAchievements: () => void
  trackStat: (key: keyof GameStats, value: string | number | boolean) => void
  dismissAchievement: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  playerName: '',
  playerColor: '#ea580c',
  playerX: 0,
  playerZ: 0,
  playerTargetX: 0,
  playerTargetZ: 0,
  playerChat: null,
  playerChatTimer: 0,
  playerEmote: null,
  playerEmoteTimer: 0,
  playerHat: 'none',
  playerVehicle: 'none',
  playerAvatar: 'default',
  tokens: 0,
  inventory: ['none'],
  dailyBonusPending: 0,
  onlineRewardPending: 0,
  friends: [],
  githubUsername: '',
  githubLevel: 1,
  githubContributions: 0,
  achievements: defaultAchievementsState(),
  gameStats: {
    roomsVisited: [],
    roomSwitches: 0,
    messagesSent: 0,
    emotesUsed: {},
    emotesCount: 0,
    loginCount: 0,
    dailyBonusClaimed: 0,
    seenPlayers: [],
  },
  pendingAchievement: null,
  currentRoom: 'plaza',
  wsConnected: false,
  remotePlayers: {},

  setPlayer: (name, color) => set({ playerName: name, playerColor: color }),
  setPlayerColor: (color) => set({ playerColor: color }),
  setPlayerTarget: (x, z) => set({ playerTargetX: x, playerTargetZ: z }),

  sendChat: (message) => {
    const { gameStats } = get()
    const newStats: GameStats = { ...gameStats, messagesSent: gameStats.messagesSent + 1 }
    saveStats(newStats)
    set({ playerChat: message, playerChatTimer: 4, gameStats: newStats })
    get().checkAchievements()
  },

  sendEmote: (emote) => {
    const { gameStats } = get()
    const newStats: GameStats = {
      ...gameStats,
      emotesUsed: { ...gameStats.emotesUsed, [emote]: true },
      emotesCount: gameStats.emotesCount + 1,
    }
    saveStats(newStats)
    set({ playerEmote: emote, playerEmoteTimer: 2, gameStats: newStats })
    get().checkAchievements()
  },

  changeRoom: (room) => {
    const { gameStats } = get()
    const roomsVisited = gameStats.roomsVisited.includes(room)
      ? gameStats.roomsVisited
      : [...gameStats.roomsVisited, room]
    const newStats: GameStats = {
      ...gameStats,
      roomsVisited,
      roomSwitches: gameStats.roomSwitches + 1,
    }
    saveStats(newStats)
    set({
      currentRoom: room,
      playerX: 0,
      playerZ: 0,
      playerTargetX: 0,
      playerTargetZ: 0,
      playerChat: null,
      playerEmote: null,
      remotePlayers: {},
      gameStats: newStats,
    })
    get().checkAchievements()
  },
  // Multiplayer
  setRemotePlayers: (players) => set({
    remotePlayers: Object.fromEntries(
      players.map((p) => [p.id, {
        ...p,
        chatTimer:  p.chat  ? 2 : 0,
        emoteTimer: p.emote ? 1 : 0,
      }])
    ),
  }),

  upsertRemotePlayer: (partial) => set((state) => {
    const existing = state.remotePlayers[partial.id] ?? {
      id: partial.id, name: '?', color: '#888', hat: 'none', vehicle: 'none',
      avatar: 'default', level: 1,
      x: 0, z: 0, room: state.currentRoom, chat: null, chatTimer: 0, emote: null, emoteTimer: 0,
    } as RemotePlayer
    const updated: RemotePlayer = {
      ...existing,
      ...partial,
      chatTimer:  partial.chatTimer  !== undefined ? partial.chatTimer  : existing.chatTimer,
      emoteTimer: partial.emoteTimer !== undefined ? partial.emoteTimer : existing.emoteTimer,
    }
    return { remotePlayers: { ...state.remotePlayers, [partial.id]: updated } }
  }),

  removeRemotePlayer: (id) => set((state) => {
    const next = { ...state.remotePlayers }
    delete next[id]
    return { remotePlayers: next }
  }),

  tickGame: (delta) => set((state) => {
    const colliders = ROOMS[state.currentRoom].colliders

    const PLAYER_SPEED = 5
    // ── Player movement ─────────────────────────────────────────────────
    const dx = state.playerTargetX - state.playerX
    const dz = state.playerTargetZ - state.playerZ
    const playerDist = Math.sqrt(dx * dx + dz * dz)
    let newX: number, newZ: number
    if (playerDist < 0.05) {
      newX = state.playerTargetX
      newZ = state.playerTargetZ
    } else {
      const step = Math.min(PLAYER_SPEED * delta, playerDist)
      newX = state.playerX + (dx / playerDist) * step
      newZ = state.playerZ + (dz / playerDist) * step
    }
    ;[newX, newZ] = resolvePosition(newX, newZ, colliders)

    const playerChatTimer  = Math.max(0, state.playerChatTimer  - delta)
    const playerEmoteTimer = Math.max(0, state.playerEmoteTimer - delta)

    // ── Remote player timers ────────────────────────────────────────────
    const remotePlayers: Record<string, RemotePlayer> = {}
    for (const [id, rp] of Object.entries(state.remotePlayers)) {
      const chatTimer  = Math.max(0, rp.chatTimer  - delta)
      const emoteTimer = Math.max(0, rp.emoteTimer - delta)
      remotePlayers[id] = {
        ...rp,
        chat:  chatTimer  > 0 ? rp.chat  : null,
        chatTimer,
        emote: emoteTimer > 0 ? rp.emote : null,
        emoteTimer,
      }
    }

    return {
      playerX: newX,
      playerZ: newZ,
      playerChat:  playerChatTimer  > 0 ? state.playerChat  : null,
      playerChatTimer,
      playerEmote: playerEmoteTimer > 0 ? state.playerEmote : null,
      playerEmoteTimer,
      remotePlayers,
    }
  }),

  // ── Skins & Tokens ──────────────────────────────────────────────────
  equipHat: (hat) => {
    const { playerVehicle, playerAvatar } = get()
    saveEquipped(hat, playerVehicle, playerAvatar)
    set({ playerHat: hat })
    get().checkAchievements()
  },

  equipVehicle: (vehicle) => {
    const { playerHat, playerAvatar } = get()
    saveEquipped(playerHat, vehicle, playerAvatar)
    set({ playerVehicle: vehicle })
    get().checkAchievements()
  },

  equipAvatar: (avatar) => {
    const { playerHat, playerVehicle } = get()
    saveEquipped(playerHat, playerVehicle, avatar)
    set({ playerAvatar: avatar })
    get().checkAchievements()
  },

  buyItem: (itemId, cost) => {
    const { tokens, inventory } = get()
    if (tokens < cost) return false
    const newTokens = tokens - cost
    const newInventory = inventory.includes(itemId) ? inventory : [...inventory, itemId]
    saveTokens(newTokens)
    saveInventory(newInventory)
    set({ tokens: newTokens, inventory: newInventory })
    get().checkAchievements()
    return true
  },

  initPlayer: () => {
    const tokens = loadTokens()
    const bonus = claimDailyBonus()
    const finalTokens = tokens + bonus
    if (bonus > 0) saveTokens(finalTokens)
    const equipped = loadEquipped()
    const inventory = loadInventory()
    const achievements = loadAchievements()
    const gameStats = loadStats()
    const friends = loadFriends()

    // Track login count
    const newStats: GameStats = { ...gameStats, loginCount: gameStats.loginCount + 1 }
    if (bonus > 0) newStats.dailyBonusClaimed = gameStats.dailyBonusClaimed + 1
    saveStats(newStats)

    // Track initial room visit
    if (!newStats.roomsVisited.includes('plaza')) {
      newStats.roomsVisited = [...newStats.roomsVisited, 'plaza']
      saveStats(newStats)
    }

    // Load github level from localStorage
    const githubData = loadGithubLevel()

    set({
      tokens: finalTokens,
      dailyBonusPending: bonus,
      playerHat:     equipped.hat     as HatId,
      playerVehicle: equipped.vehicle as VehicleId,
      playerAvatar:  equipped.avatar  as AvatarId,
      inventory,
      friends,
      achievements,
      gameStats: newStats,
      githubUsername: githubData?.username ?? '',
      githubLevel: githubData?.level ?? 1,
      githubContributions: githubData?.contributions ?? 0,
    })

    get().checkAchievements()
  },

  dismissDailyBonus: () => set({ dailyBonusPending: 0 }),
  dismissOnlineReward: () => set({ onlineRewardPending: 0 }),
  addFriend: (friend) => set((state) => {
    if (state.friends.some((existing) => existing.id === friend.id)) return state
    const friends = [...state.friends, friend]
    saveFriends(friends)
    return { friends }
  }),
  removeFriend: (id) => set((state) => {
    const friends = state.friends.filter((friend) => friend.id !== id)
    saveFriends(friends)
    return { friends }
  }),

  // ── GitHub level ────────────────────────────────────────────────────
  setGithubLevel: (username, level, contributions) => {
    saveGithubLevel({ username, level, contributions })
    set({ githubUsername: username, githubLevel: level, githubContributions: contributions })
  },

  // ── Achievements ────────────────────────────────────────────────────
  checkAchievements: () => {
    const { achievements, gameStats, tokens, inventory, playerAvatar } = get()
    const newAchievements = { ...achievements }
    let firstNew: AchievementId | null = null

    function check(id: AchievementId, progress: number) {
      const ach = newAchievements[id]
      if (ach.unlocked) return
      const newProg = Math.min(progress, ACHIEVEMENTS[id].maxProgress)
      if (newProg !== ach.progress || newProg >= ACHIEVEMENTS[id].maxProgress) {
        newAchievements[id] = { ...ach, progress: newProg }
        if (newProg >= ACHIEVEMENTS[id].maxProgress && !ach.unlocked) {
          newAchievements[id].unlocked = true
          newAchievements[id].unlockedAt = new Date().toISOString()
          if (!firstNew) firstNew = id
        }
      }
    }

    check('first_steps', gameStats.roomsVisited.length)
    check('world_traveler', gameStats.roomSwitches)
    check('chatterbox', gameStats.messagesSent)
    check('party_starter', Object.keys(gameStats.emotesUsed).length)
    check('fashionista', inventory.filter(i => i !== 'none').length)
    check('driver', inventory.includes('skateboard') ? 1 : 0)
    check('token_saver', tokens)
    check('daily_login', gameStats.dailyBonusClaimed)
    check('veteran', gameStats.loginCount)
    check('emote_master', gameStats.emotesCount)
    check('social_butterfly', gameStats.seenPlayers.length)
    const avatarCount = (['turtle', 'elephant', 'lizard', 'penguin'] as AvatarId[]).filter(
      a => a === playerAvatar || inventory.includes(a)
    ).length
    check('avatar_collector', avatarCount)

    saveAchievements(newAchievements)
    set({ achievements: newAchievements, pendingAchievement: firstNew ?? get().pendingAchievement })
  },

  trackStat: (key, value) => {
    const { gameStats } = get()
    const newStats = { ...gameStats }
    if (key === 'seenPlayers' && typeof value === 'string') {
      if (!newStats.seenPlayers.includes(value)) {
        newStats.seenPlayers = [...newStats.seenPlayers, value]
      }
    }
    saveStats(newStats)
    set({ gameStats: newStats })
    get().checkAchievements()
  },

  dismissAchievement: () => set({ pendingAchievement: null }),
}))
