import { create } from 'zustand'
import { ROOMS, type RoomId } from '@/lib/roomConfig'
import { resolvePosition } from '@/lib/collision'
import type { HatId, VehicleId } from '@/lib/skins'
import {
  loadTokens, saveTokens, claimDailyBonus,
  loadEquipped, saveEquipped,
  loadInventory, saveInventory,
} from '@/lib/tokenStore'

export interface NPC {
  id: string
  color: string
  x: number
  z: number
  targetX: number
  targetZ: number
  phrase: string | null
  phraseTimer: number
  wanderTimer: number
}

export interface RemotePlayer {
  id: string
  name: string
  color: string
  hat: string
  vehicle: string
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
  tokens: number
  inventory: string[]
  dailyBonusPending: number

  // World
  currentRoom: RoomId
  npcs: NPC[]

  // Multiplayer
  remotePlayers: Record<string, RemotePlayer>

  // Actions
  setPlayer: (name: string, color: string) => void
  setPlayerColor: (color: string) => void
  setPlayerTarget: (x: number, z: number) => void
  sendChat: (message: string) => void
  sendEmote: (emote: string) => void
  changeRoom: (room: RoomId) => void
  setNPCs: (npcs: NPC[]) => void
  tickGame: (delta: number) => void

  // Multiplayer actions
  setRemotePlayers: (players: RemotePlayer[]) => void
  upsertRemotePlayer: (partial: Partial<RemotePlayer> & { id: string }) => void
  removeRemotePlayer: (id: string) => void

  // Skins & tokens
  equipHat: (hat: HatId) => void
  equipVehicle: (vehicle: VehicleId) => void
  buyItem: (itemId: string, cost: number) => boolean
  initPlayer: () => void
  dismissDailyBonus: () => void
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
  tokens: 0,
  inventory: ['none'],
  dailyBonusPending: 0,
  currentRoom: 'plaza',
  npcs: [],
  remotePlayers: {},

  setPlayer: (name, color) => set({ playerName: name, playerColor: color }),
  setPlayerColor: (color) => set({ playerColor: color }),
  setPlayerTarget: (x, z) => set({ playerTargetX: x, playerTargetZ: z }),

  sendChat: (message) => set({ playerChat: message, playerChatTimer: 4 }),
  sendEmote: (emote) => set({ playerEmote: emote, playerEmoteTimer: 2 }),

  changeRoom: (room) => set({
    currentRoom: room,
    playerX: 0,
    playerZ: 0,
    playerTargetX: 0,
    playerTargetZ: 0,
    npcs: [],
    playerChat: null,
    playerEmote: null,
    remotePlayers: {},
  }),

  setNPCs: (npcs) => set({ npcs }),

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
    const NPC_SPEED    = 2.5

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

    // ── NPC movement ────────────────────────────────────────────────────
    const npcs = state.npcs.map((npc) => {
      const ndx = npc.targetX - npc.x
      const ndz = npc.targetZ - npc.z
      const npcDist = Math.sqrt(ndx * ndx + ndz * ndz)
      let nx: number, nz: number
      if (npcDist < 0.05) {
        nx = npc.targetX
        nz = npc.targetZ
      } else {
        const step = Math.min(NPC_SPEED * delta, npcDist)
        nx = npc.x + (ndx / npcDist) * step
        nz = npc.z + (ndz / npcDist) * step
      }
      ;[nx, nz] = resolvePosition(nx, nz, colliders)

      const phraseTimer = Math.max(0, npc.phraseTimer - delta)
      let wanderTimer = npc.wanderTimer - delta
      let targetX = npc.targetX
      let targetZ = npc.targetZ

      if (wanderTimer <= 0) {
        let wx = (Math.random() - 0.5) * 28
        let wz = (Math.random() - 0.5) * 28
        ;[wx, wz] = resolvePosition(wx, wz, colliders)
        targetX = wx
        targetZ = wz
        wanderTimer = 4 + Math.random() * 6
      }

      return { ...npc, x: nx, z: nz, targetX, targetZ, phraseTimer, wanderTimer, phrase: phraseTimer > 0 ? npc.phrase : null }
    })

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
      npcs,
      remotePlayers,
    }
  }),

  // ── Skins & Tokens ──────────────────────────────────────────────────
  equipHat: (hat) => {
    const { playerVehicle } = get()
    saveEquipped(hat, playerVehicle)
    set({ playerHat: hat })
  },

  equipVehicle: (vehicle) => {
    const { playerHat } = get()
    saveEquipped(playerHat, vehicle)
    set({ playerVehicle: vehicle })
  },

  buyItem: (itemId, cost) => {
    const { tokens, inventory } = get()
    if (tokens < cost) return false
    const newTokens = tokens - cost
    const newInventory = inventory.includes(itemId) ? inventory : [...inventory, itemId]
    saveTokens(newTokens)
    saveInventory(newInventory)
    set({ tokens: newTokens, inventory: newInventory })
    return true
  },

  initPlayer: () => {
    const tokens = loadTokens()
    const bonus = claimDailyBonus()
    const finalTokens = tokens + bonus
    if (bonus > 0) saveTokens(finalTokens)
    const equipped = loadEquipped()
    const inventory = loadInventory()
    set({
      tokens: finalTokens,
      dailyBonusPending: bonus,
      playerHat: equipped.hat as HatId,
      playerVehicle: equipped.vehicle as VehicleId,
      inventory,
    })
  },

  dismissDailyBonus: () => set({ dailyBonusPending: 0 }),
}))
