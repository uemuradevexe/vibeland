import { create } from 'zustand'
import type { RoomId } from '@/lib/roomConfig'

export interface NPC {
  id: string
  color: string
  x: number
  targetX: number
  phrase: string | null
  phraseTimer: number   // seconds until phrase clears
  wanderTimer: number  // seconds until next wander target
}

export interface GameState {
  // Player
  playerName: string
  playerColor: string
  playerX: number
  playerTargetX: number
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
  setPlayerTargetX: (x: number) => void
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
  playerTargetX: 0,
  playerChat: null,
  playerChatTimer: 0,
  playerEmote: null,
  playerEmoteTimer: 0,
  currentRoom: 'plaza',
  npcs: [],

  setPlayer: (name, color) => set({ playerName: name, playerColor: color }),
  setPlayerColor: (color) => set({ playerColor: color }),
  setPlayerTargetX: (x) => set({ playerTargetX: x }),

  sendChat: (message) => set({ playerChat: message, playerChatTimer: 4 }),
  sendEmote: (emote) => set({ playerEmote: emote, playerEmoteTimer: 2 }),

  changeRoom: (room) => set({
    currentRoom: room,
    playerX: 0,
    playerTargetX: 0,
    npcs: [],
    playerChat: null,
    playerEmote: null,
  }),

  setNPCs: (npcs) => set({ npcs }),

  tickGame: (delta) => set((state) => {
    // Move player toward target
    const dx = state.playerTargetX - state.playerX
    const newX = Math.abs(dx) < 0.05 ? state.playerTargetX : state.playerX + dx * Math.min(delta * 3, 1)

    // Tick player timers
    const playerChatTimer = Math.max(0, state.playerChatTimer - delta)
    const playerEmoteTimer = Math.max(0, state.playerEmoteTimer - delta)

    // Tick NPCs
    const npcs = state.npcs.map((npc) => {
      const ndx = npc.targetX - npc.x
      const nx = Math.abs(ndx) < 0.05 ? npc.targetX : npc.x + ndx * Math.min(delta * 2, 1)

      const phraseTimer = Math.max(0, npc.phraseTimer - delta)
      let wanderTimer = npc.wanderTimer - delta
      let targetX = npc.targetX
      const phrase = phraseTimer > 0 ? npc.phrase : null

      if (wanderTimer <= 0) {
        targetX = (Math.random() - 0.5) * 14  // -7 to 7
        wanderTimer = 4 + Math.random() * 6   // 4-10s
      }

      return { ...npc, x: nx, targetX, phraseTimer, wanderTimer, phrase }
    })

    return {
      playerX: newX,
      playerChat: playerChatTimer > 0 ? state.playerChat : null,
      playerChatTimer,
      playerEmote: playerEmoteTimer > 0 ? state.playerEmote : null,
      playerEmoteTimer,
      npcs,
    }
  }),
}))
