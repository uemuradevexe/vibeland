import type { RoomId } from '@/lib/roomConfig'
import type { RemotePlayer } from '@/store/gameStore'

const CLIENT_ID_KEY = 'vibeland-realtime-client-id'
const ROOM_CHANNEL_PREFIX = 'vibeland:room:'

type PresencePlayerData = {
  name?: unknown
  color?: unknown
  hat?: unknown
  vehicle?: unknown
  avatar?: unknown
  level?: unknown
  x?: unknown
  z?: unknown
  room?: unknown
}

export function getRealtimeClientId() {
  if (typeof window === 'undefined') return 'server'

  const existing = window.localStorage.getItem(CLIENT_ID_KEY)
  if (existing) return existing

  const next = `player-${crypto.randomUUID()}`
  window.localStorage.setItem(CLIENT_ID_KEY, next)
  return next
}

export function sanitizeClientId(value: string) {
  return value.replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 80)
}

export function getRealtimeRoomChannel(room: RoomId) {
  return `${ROOM_CHANNEL_PREFIX}${room}`
}

export function buildPresencePlayerData(input: {
  name: string
  color: string
  hat: string
  vehicle: string
  avatar: string
  level: number
  x: number
  z: number
  room: RoomId
}) {
  return {
    name: input.name || 'Anon',
    color: input.color,
    hat: input.hat,
    vehicle: input.vehicle,
    avatar: input.avatar,
    level: input.level,
    x: input.x,
    z: input.z,
    room: input.room,
  }
}

export function presenceDataToRemotePlayer(clientId: string, data: PresencePlayerData): RemotePlayer | null {
  const room = typeof data.room === 'string' ? data.room : null
  if (!room) return null

  const x = Number(data.x)
  const z = Number(data.z)
  const level = Number(data.level)

  return {
    id: clientId,
    name: typeof data.name === 'string' && data.name.trim() ? data.name.trim().slice(0, 24) : 'Anon',
    color: typeof data.color === 'string' ? data.color : '#ea580c',
    hat: typeof data.hat === 'string' ? data.hat : 'none',
    vehicle: typeof data.vehicle === 'string' ? data.vehicle : 'none',
    avatar: typeof data.avatar === 'string' ? data.avatar : 'default',
    level: Number.isFinite(level) ? Math.max(1, Math.min(10, level)) : 1,
    x: Number.isFinite(x) ? x : 0,
    z: Number.isFinite(z) ? z : 0,
    room: room as RoomId,
    chat: null,
    chatTimer: 0,
    emote: null,
    emoteTimer: 0,
  }
}
