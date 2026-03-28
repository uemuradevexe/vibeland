'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { RemotePlayer } from '@/store/gameStore'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001'
const MOVE_HZ = 20   // position broadcast frequency

export function useMultiplayer() {
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onmessage = (ev) => {
      let msg: Record<string, unknown>
      try { msg = JSON.parse(ev.data) } catch { return }

      const store = useGameStore.getState()

      switch (msg.type) {
        // Server assigned us an ID — now introduce ourselves
        case 'welcome': {
          ws.send(JSON.stringify({
            type:    'join',
            name:    store.playerName  || 'Anon',
            color:   store.playerColor,
            hat:     store.playerHat,
            vehicle: store.playerVehicle,
            room:    store.currentRoom,
          }))
          break
        }

        // Snapshot of everyone already in the room
        case 'room_state':
          store.setRemotePlayers(msg.players as RemotePlayer[])
          break

        case 'player_joined':
          store.upsertRemotePlayer(msg.player as RemotePlayer)
          break

        case 'player_moved':
          store.upsertRemotePlayer({ id: String(msg.id), x: Number(msg.x), z: Number(msg.z), room: msg.room as RemotePlayer['room'] })
          break

        case 'player_chat':
          store.upsertRemotePlayer({ id: String(msg.id), chat: String(msg.message), chatTimer: 4 })
          break

        case 'player_emote':
          store.upsertRemotePlayer({ id: String(msg.id), emote: String(msg.emote), emoteTimer: 2 })
          break

        case 'player_left':
          store.removeRemotePlayer(String(msg.id))
          break
      }
    }

    ws.onerror = () => console.warn('[WS] connection error — is the server running?')
    ws.onclose = () => useGameStore.getState().setRemotePlayers([])

    // ── Throttled position broadcast (~20 Hz) ───────────────────────────
    let lastX = 0, lastZ = 0
    const moveTimer = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return
      const { playerX, playerZ } = useGameStore.getState()
      if (playerX === lastX && playerZ === lastZ) return
      lastX = playerX;  lastZ = playerZ
      ws.send(JSON.stringify({ type: 'move', x: playerX, z: playerZ }))
    }, 1000 / MOVE_HZ)

    // ── React to store changes ───────────────────────────────────────────
    const unsub = useGameStore.subscribe((state, prev) => {
      if (ws.readyState !== WebSocket.OPEN) return

      if (state.currentRoom !== prev.currentRoom) {
        ws.send(JSON.stringify({ type: 'change_room', room: state.currentRoom }))
      }
      if (state.playerChat && state.playerChat !== prev.playerChat) {
        ws.send(JSON.stringify({ type: 'chat', message: state.playerChat }))
      }
      if (state.playerEmote && state.playerEmote !== prev.playerEmote) {
        ws.send(JSON.stringify({ type: 'emote', emote: state.playerEmote }))
      }
    })

    return () => {
      clearInterval(moveTimer)
      unsub()
      ws.close()
    }
  }, [])
}
