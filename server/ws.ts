import { WebSocketServer, WebSocket } from 'ws'

type RoomId = 'plaza' | 'cafe' | 'beach' | 'library'

interface PlayerState {
  id: string
  name: string
  color: string
  x: number
  z: number
  room: RoomId
  chat: string | null
  emote: string | null
}

const wss = new WebSocketServer({ port: 3001 })
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

wss.on('connection', (ws) => {
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
        name:  String(msg.name  || 'Anon').slice(0, 24),
        color: String(msg.color || '#ea580c'),
        x: 0, z: 0,
        room:  (msg.room as RoomId) || 'plaza',
        chat:  null,
        emote: null,
      }
      players.set(ws, state)

      // Send snapshot of the room the new player is entering
      const roomSnapshot = [...players.values()].filter(p => p.id !== id && p.room === state.room)
      send(ws, { type: 'room_state', players: roomSnapshot })

      // Tell everyone else in the room
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
        broadcastToRoom(player.room, { type: 'player_moved', id, x: player.x, z: player.z }, ws)
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

const PORT = Number(process.env.WS_PORT ?? 3001)
console.log(`🌐  WS server  →  ws://localhost:${PORT}`)
