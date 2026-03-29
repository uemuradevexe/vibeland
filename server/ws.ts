import { WebSocketServer, WebSocket } from 'ws'
import { randomUUID } from 'crypto'
import { IncomingMessage } from 'http'

type RoomId = 'plaza' | 'cafe' | 'beach' | 'library' | 'arcade' | 'garden' | 'house'

interface PlayerState {
  id: string
  name: string
  color: string
  hat: string
  vehicle: string
  avatar: string
  level: number
  x: number
  z: number
  room: RoomId
  houseOwnerId: string | null
  chat: string | null
  emote: string | null
}

// ── Validation allowlists (keep in sync with client libs) ───────────────────
const VALID_ROOMS    = new Set<string>(['plaza', 'cafe', 'beach', 'library', 'arcade', 'garden'])
const VALID_HATS     = new Set(['none', 'tophat', 'crown', 'cap', 'cowboy', 'wizard'])
const VALID_VEHICLES = new Set(['none', 'skateboard'])
const VALID_AVATARS  = new Set(['default', 'turtle', 'elephant', 'lizard', 'penguin'])
const VALID_EMOTES   = new Set(['❤️', '✨', '😂', '🤔', '👋', '🎉', '💃', '😴', '🤖', '🧠', '🔥', '😎', '🪑'])

function validRoom(v: unknown): RoomId     { return VALID_ROOMS.has(String(v)) ? String(v) as RoomId : 'plaza' }
function validHat(v: unknown)              { return VALID_HATS.has(String(v))     ? String(v) : 'none' }
function validVehicle(v: unknown)          { return VALID_VEHICLES.has(String(v)) ? String(v) : 'none' }
function validAvatar(v: unknown)           { return VALID_AVATARS.has(String(v))  ? String(v) : 'default' }
function validColor(v: unknown): string    { return /^#[0-9a-fA-F]{6}$/.test(String(v)) ? String(v) : '#ea580c' }
function validEmote(v: unknown): string | null { return VALID_EMOTES.has(String(v)) ? String(v) : null }

// Clamp position to playable bounds
const POS_MIN = -20
const POS_MAX = 20
function clampPos(v: unknown): number {
  const n = Number(v) || 0
  return Math.max(POS_MIN, Math.min(POS_MAX, n))
}

// Sanitize chat: strip HTML tags and limit length
function sanitizeChat(v: unknown): string {
  return String(v || '')
    .replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]!))
    .slice(0, 120)
}

// ── Rate limiting ────────────────────────────────────────────────────────────
const MAX_CONNECTIONS_PER_IP = 5
const MAX_MESSAGES_PER_SEC   = 20
const ipConnections = new Map<string, number>()

interface RateLimitState {
  messageCount: number
  lastReset: number
}

function checkRateLimit(state: RateLimitState): boolean {
  const now = Date.now()
  if (now - state.lastReset > 1000) {
    state.messageCount = 0
    state.lastReset = now
  }
  state.messageCount++
  return state.messageCount <= MAX_MESSAGES_PER_SEC
}

function validHat(v: unknown)     { return VALID_HATS.has(String(v))     ? String(v) : 'none' }
function validVehicle(v: unknown) { return VALID_VEHICLES.has(String(v)) ? String(v) : 'none' }
function validAvatar(v: unknown)  { return VALID_AVATARS.has(String(v))  ? String(v) : 'default' }
function validColor(v: unknown)   {
  const s = String(v ?? '').trim()
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : '#ea580c'
}

// ── Server setup ─────────────────────────────────────────────────────────────
const PORT = Number(process.env.WS_PORT ?? 3001)
const wss = new WebSocketServer({ port: PORT })
const players = new Map<WebSocket, PlayerState>()

function send(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data))
}

function broadcastToRoom(room: RoomId, data: object, exclude?: WebSocket, houseOwnerId?: string | null) {
  for (const [ws, p] of players) {
    if (ws === exclude || p.room !== room) continue
    if (room === 'house' && p.houseOwnerId !== (houseOwnerId ?? null)) continue
    send(ws, data)
  }
}

function resolveHouseOwnerId(room: RoomId, raw: unknown, fallbackId: string) {
  if (room !== 'house') return null
  const value = String(raw || '').trim()
  return value || fallbackId
}

// ── Heartbeat: detect and terminate dead connections ─────────────────────────
const HEARTBEAT_MS = 30_000
type AliveSocket = WebSocket & { isAlive: boolean }

const heartbeatTimer = setInterval(() => {
  for (const ws of wss.clients) {
    const socket = ws as AliveSocket
    if (!socket.isAlive) { socket.terminate(); continue }
    socket.isAlive = false
    socket.ping()
  }
}, HEARTBEAT_MS)

wss.on('close', () => clearInterval(heartbeatTimer))

// ─────────────────────────────────────────────────────────────────────────────

wss.on('connection', (ws, req) => {
  // ── Per-IP connection limit ──
  const ip = getClientIp(req)
  const currentCount = ipConnections.get(ip) ?? 0
  if (currentCount >= MAX_CONNECTIONS_PER_IP) {
    ws.close(4429, 'Too many connections')
    return
  }
  ipConnections.set(ip, currentCount + 1)

  const socket = ws as AliveSocket
  socket.isAlive = true
  socket.on('pong', () => { socket.isAlive = true })

  const id = randomUUID().slice(0, 8)
  const rateLimit: RateLimitState = { messageCount: 0, lastReset: Date.now() }

  console.log(`[+] ${id} connected  (total: ${wss.clients.size})`)
  send(ws, { type: 'welcome', id })

  ws.on('message', (raw) => {
    // Rate limit check
    if (!checkRateLimit(rateLimit)) return

    // Max message size: 2KB
    if (raw.toString().length > 2048) return

    let msg: Record<string, unknown>
    try { msg = JSON.parse(raw.toString()) } catch { return }

    const player = players.get(ws)

    // ── join ──────────────────────────────────────────────────────────────
    if (msg.type === 'join') {
      const state: PlayerState = {
        id,
        name:    (String(msg.name  || '').trim().slice(0, 24)) || 'Anon',
        color:   validColor(msg.color),
        hat:     validHat(msg.hat),
        vehicle: validVehicle(msg.vehicle),
        avatar:  validAvatar(msg.avatar),
        level:   Math.max(1, Math.min(10, Number(msg.level) || 1)),
        x: 0, z: 0,
        room:  (msg.room as RoomId) || 'plaza',
        houseOwnerId: resolveHouseOwnerId((msg.room as RoomId) || 'plaza', msg.houseOwnerId, id),
        chat:  null,
        emote: null,
      }
      players.set(ws, state)

      const roomSnapshot = [...players.values()].filter((p) =>
        p.id !== id &&
        p.room === state.room &&
        (state.room !== 'house' || p.houseOwnerId === state.houseOwnerId)
      )
      send(ws, { type: 'room_state', players: roomSnapshot })
      broadcastToRoom(state.room, { type: 'player_joined', player: state }, ws, state.houseOwnerId)
      console.log(`[join] ${id} "${state.name}" → ${state.room}`)
      return
    }

    if (!player) return   // not joined yet

    switch (msg.type) {
      // ── move ────────────────────────────────────────────────────────────
      case 'move':
        player.x = Number(msg.x) || 0
        player.z = Number(msg.z) || 0
        broadcastToRoom(player.room, { type: 'player_moved', id, x: player.x, z: player.z, room: player.room }, ws, player.houseOwnerId)
        break

      // ── chat ────────────────────────────────────────────────────────────
      case 'chat': {
        const message = String(msg.message || '').trim().slice(0, 120)
        if (!message) break
        player.chat = message
        broadcastToRoom(player.room, { type: 'player_chat', id, message }, ws, player.houseOwnerId)
        break
      }

      // ── emote ───────────────────────────────────────────────────────────
      case 'emote': {
        const emote = String(msg.emote || '').slice(0, 12)
        player.emote = emote
        broadcastToRoom(player.room, { type: 'player_emote', id, emote }, ws, player.houseOwnerId)
        break
      }

      // ── color_change ─────────────────────────────────────────────────────
      case 'color_change': {
        const color = validColor(msg.color)
        player.color = color
        broadcastToRoom(player.room, { type: 'player_color_changed', id, color }, ws, player.houseOwnerId)
        break
      }

      // ── equip ────────────────────────────────────────────────────────────
      case 'equip': {
        player.hat     = validHat(msg.hat)
        player.vehicle = validVehicle(msg.vehicle)
        player.avatar  = validAvatar(msg.avatar)
        player.level   = Math.max(1, Math.min(10, Number(msg.level) || 1))
        broadcastToRoom(player.room, {
          type: 'player_equipped',
          id,
          hat: player.hat,
          vehicle: player.vehicle,
          avatar: player.avatar,
          level: player.level,
        }, ws, player.houseOwnerId)
        break
      }

      case 'house_state': {
        if (player.room !== 'house') break
        broadcastToRoom(player.room, {
          type: 'house_state',
          ownerId: player.id,
          items: Array.isArray(msg.items) ? msg.items : [],
        }, ws, player.houseOwnerId)
        break
      }

      // ── change_room ──────────────────────────────────────────────────────
      case 'change_room': {
        const oldRoom = player.room
        const newRoom = (msg.room as RoomId) || 'plaza'
        const oldHouseOwnerId = player.houseOwnerId
        broadcastToRoom(oldRoom, { type: 'player_left', id }, ws, oldHouseOwnerId)

        player.room  = newRoom
        player.houseOwnerId = resolveHouseOwnerId(newRoom, msg.houseOwnerId, id)
        player.x     = 0
        player.z     = 0
        player.chat  = null
        player.emote = null

        const roomSnapshot = [...players.values()].filter((p) =>
          p.id !== id &&
          p.room === newRoom &&
          (newRoom !== 'house' || p.houseOwnerId === player.houseOwnerId)
        )
        send(ws, { type: 'room_state', players: roomSnapshot })
        broadcastToRoom(newRoom, { type: 'player_joined', player: { ...player } }, ws, player.houseOwnerId)
        console.log(`[room] ${id} "${player.name}"  ${oldRoom} → ${newRoom}`)
        break
      }
    }
  })

  ws.on('close', () => {
    const p = players.get(ws)
    if (p) {
      broadcastToRoom(p.room, { type: 'player_left', id: p.id }, ws, p.houseOwnerId)
      console.log(`[-] ${p.id} "${p.name}" disconnected  (total: ${wss.clients.size - 1})`)
    }
    players.delete(ws)

    // Decrement IP connection count
    const count = ipConnections.get(ip) ?? 1
    if (count <= 1) ipConnections.delete(ip)
    else ipConnections.set(ip, count - 1)
  })
})

console.log(`🌐  WS server  →  ws://localhost:${PORT}`)
