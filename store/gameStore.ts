import { create } from 'zustand'
import { ROOMS, type RoomId } from '@/lib/roomConfig'
import { resolvePosition } from '@/lib/collision'

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

  // World
  currentRoom: RoomId
  npcs: NPC[]

  // Actions
  setPlayer: (name: string, color: string) => void
  setPlayerColor: (color: string) => void
  setPlayerTarget: (x: number, z: number) => void
  sendChat: (message: string) => void
  sendEmote: (emote: string) => void
  changeRoom: (room: RoomId) => void
  setNPCs: (npcs: NPC[]) => void
  tickGame: (delta: number) => void
}

export const useGameStore = create<GameState>((set) => ({
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
  currentRoom: 'plaza',
  npcs: [],

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
  }),

  setNPCs: (npcs) => set({ npcs }),

  tickGame: (delta) => set((state) => {
    const colliders = ROOMS[state.currentRoom].colliders

    const PLAYER_SPEED = 5   // units per second
    const NPC_SPEED    = 2.5 // units per second

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

    const playerChatTimer = Math.max(0, state.playerChatTimer - delta)
    const playerEmoteTimer = Math.max(0, state.playerEmoteTimer - delta)

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
      const phrase = phraseTimer > 0 ? npc.phrase : null

      if (wanderTimer <= 0) {
        let wx = (Math.random() - 0.5) * 28
        let wz = (Math.random() - 0.5) * 28
        ;[wx, wz] = resolvePosition(wx, wz, colliders)
        targetX = wx
        targetZ = wz
        wanderTimer = 4 + Math.random() * 6
      }

      return { ...npc, x: nx, z: nz, targetX, targetZ, phraseTimer, wanderTimer, phrase }
    })

    return {
      playerX: newX,
      playerZ: newZ,
      playerChat: playerChatTimer > 0 ? state.playerChat : null,
      playerChatTimer,
      playerEmote: playerEmoteTimer > 0 ? state.playerEmote : null,
      playerEmoteTimer,
      npcs,
    }
  }),
}))
