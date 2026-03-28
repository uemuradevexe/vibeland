import { WebSocketServer, WebSocket } from 'ws'

type RoomId = 'plaza' | 'cafe' | 'beach' | 'library'

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
  chat: string | null
  emote: string | null
}

// Valid IDs kept in sync with lib/skins.ts and lib/avatars.ts
const VALID_HATS     = new Set(['none', 'tophat', 'crown', 'cap', 'cowboy', 'wizard'])
const VALID_VEHICLES = new Set(['none', 'skateboard'])
const VALID_AVATARS  = new Set(['default', 'turtle', 'elephant', 'lizard', 'penguin'])

function validHat(v: unknown)     { return VALID_HATS.has(String(v))     ? String(v) : 'none' }
function validVehicle(v: unknown) { return VALID_VEHICLES.has(String(v)) ? String(v) : 'none' }
function validAvatar(v: unknown)  { return VALID_AVATARS.has(String(v))  ? String(v) : 'default' }

const PORT = Number(process.env.WS_PORT ?? 3001)
const wss = new WebSocketServer({ port: PORT })
const players = new Map<WebSocket, PlayerState>()
let nextId = 1

function send(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data))
}

function broadcastToRoom(room: RoomId, data: object, exclude?: WebSocket) {
  for (const [ws, p] of players) {
    if (ws !== exclude && p.room === room) send(ws, data)
  }
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

wss.on('connection', (ws) => {
  const socket = ws as AliveSocket
  socket.isAlive = true
  socket.on('pong', () => { socket.isAlive = true })

  const id = `p${nextId++}`
  console.log(`[+] ${id} connected  (total: ${wss.clients.size})`)
  send(ws, { type: 'welcome', id })

  ws.on('message', (raw) => {
    let msg: Record<string, unknown>
    try { msg = JSON.parse(raw.toString()) } catch { return }

    const player = players.get(ws)

    // ── join ──────────────────────────────────────────────────────────────
    if (msg.type === 'join') {
      const state: PlayerState = {
        id,
        name:    String(msg.name  || 'Anon').slice(0, 24),
        color:   String(msg.color || '#ea580c'),
        hat:     validHat(msg.hat),
        vehicle: validVehicle(msg.vehicle),
        avatar:  validAvatar(msg.avatar),
        level:   Math.max(1, Math.min(10, Number(msg.level) || 1)),
        x: 0, z: 0,
        room:  (msg.room as RoomId) || 'plaza',
        chat:  null,
        emote: null,
      }
      players.set(ws, state)

      const roomSnapshot = [...players.values()].filter(p => p.id !== id && p.room === state.room)
      send(ws, { type: 'room_state', players: roomSnapshot })
      broadcastToRoom(state.room, { type: 'player_joined', player: state }, ws)
      console.log(`[join] ${id} "${state.name}" → ${state.room}`)
      return
    }

    if (!player) return   // not joined yet

    switch (msg.type) {
      // ── move ────────────────────────────────────────────────────────────
      case 'move':
        player.x = Number(msg.x) || 0
        player.z = Number(msg.z) || 0
        broadcastToRoom(player.room, { type: 'player_moved', id, x: player.x, z: player.z, room: player.room }, ws)
        break

      // ── chat ────────────────────────────────────────────────────────────
      case 'chat': {
        const message = String(msg.message || '').slice(0, 120)
        player.chat = message
        broadcastToRoom(player.room, { type: 'player_chat', id, message }, ws)
        break
      }

      // ── emote ───────────────────────────────────────────────────────────
      case 'emote': {
        const emote = String(msg.emote || '')
        player.emote = emote
        broadcastToRoom(player.room, { type: 'player_emote', id, emote }, ws)
        break
      }

      // ── color_change ─────────────────────────────────────────────────────
      case 'color_change': {
        const color = String(msg.color || '#ea580c')
        player.color = color
        broadcastToRoom(player.room, { type: 'player_color_changed', id, color }, ws)
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
        }, ws)
        break
      }

      // ── change_room ──────────────────────────────────────────────────────
      case 'change_room': {
        const oldRoom = player.room
        const newRoom = (msg.room as RoomId) || 'plaza'
        broadcastToRoom(oldRoom, { type: 'player_left', id }, ws)

        player.room  = newRoom
        player.x     = 0
        player.z     = 0
        player.chat  = null
        player.emote = null

        const roomSnapshot = [...players.values()].filter(p => p.id !== id && p.room === newRoom)
        send(ws, { type: 'room_state', players: roomSnapshot })
        broadcastToRoom(newRoom, { type: 'player_joined', player: { ...player } }, ws)
        console.log(`[room] ${id} "${player.name}"  ${oldRoom} → ${newRoom}`)
        break
      }
    }
  })

  ws.on('close', () => {
    const p = players.get(ws)
    if (p) {
      broadcastToRoom(p.room, { type: 'player_left', id: p.id })
      console.log(`[-] ${p.id} "${p.name}" disconnected  (total: ${wss.clients.size - 1})`)
    }
    players.delete(ws)
  })
})

console.log(`🌐  WS server  →  ws://localhost:${PORT}`)
