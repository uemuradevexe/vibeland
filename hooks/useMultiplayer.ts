'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { RemotePlayer } from '@/store/gameStore'
import type { PlacedFurniture } from '@/lib/furniture'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001'
const MOVE_HZ = 20        // position broadcast frequency
const MOVE_THRESHOLD = 0.01 // skip tiny position changes

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
          const localPlayerId = String(msg.id)
          store.setLocalPlayerId(localPlayerId)
          ws.send(JSON.stringify({
            type:    'join',
            name:    store.playerName  || 'Anon',
            color:   store.playerColor,
            hat:     store.playerHat,
            vehicle: store.playerVehicle,
            avatar:  store.playerAvatar,
            level:   store.githubLevel,
            room:    store.currentRoom,
            houseOwnerId: store.currentRoom === 'house'
              ? (store.viewingHouseOwnerId || localPlayerId)
              : undefined,
          }))
          break
        }

        // Snapshot of everyone already in the room
        case 'room_state': {
          const players = msg.players as RemotePlayer[]
          store.setRemotePlayers(players)
          if (
            store.currentRoom === 'house' &&
            (!store.viewingHouseOwnerId || store.viewingHouseOwnerId === store.localPlayerId)
          ) {
            ws.send(JSON.stringify({ type: 'house_state', items: store.houseItems }))
          }
          // Track seen players for social_butterfly achievement
          for (const p of players) {
            store.trackStat('seenPlayers', p.id)
          }
          break
        }

        case 'player_joined': {
          const p = msg.player as RemotePlayer
          store.upsertRemotePlayer(p)
          store.trackStat('seenPlayers', p.id)
          if (
            store.currentRoom === 'house' &&
            (!store.viewingHouseOwnerId || store.viewingHouseOwnerId === store.localPlayerId) &&
            p.houseOwnerId === store.localPlayerId
          ) {
            ws.send(JSON.stringify({ type: 'house_state', items: store.houseItems }))
          }
          break
        }

        case 'player_moved':
          store.upsertRemotePlayer({ id: String(msg.id), x: Number(msg.x), z: Number(msg.z), room: msg.room as RemotePlayer['room'] })
          break

        case 'player_chat':
          store.upsertRemotePlayer({ id: String(msg.id), chat: String(msg.message), chatTimer: 4 })
          break

        case 'player_emote':
          store.upsertRemotePlayer({ id: String(msg.id), emote: String(msg.emote), emoteTimer: 2 })
          break

        case 'player_color_changed':
          store.upsertRemotePlayer({ id: String(msg.id), color: String(msg.color) })
          break

        case 'player_equipped':
          store.upsertRemotePlayer({
            id: String(msg.id),
            hat: String(msg.hat),
            vehicle: String(msg.vehicle),
            avatar: msg.avatar !== undefined ? String(msg.avatar) : undefined,
            level: msg.level !== undefined ? Number(msg.level) : undefined,
          })
          break

        case 'house_state':
          if (typeof msg.ownerId === 'string' && Array.isArray(msg.items)) {
            store.setVisitedHouseItems(String(msg.ownerId), msg.items as PlacedFurniture[])
          }
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
      const dx = Math.abs(playerX - lastX)
      const dz = Math.abs(playerZ - lastZ)
      if (dx < MOVE_THRESHOLD && dz < MOVE_THRESHOLD) return
      lastX = playerX;  lastZ = playerZ
      ws.send(JSON.stringify({ type: 'move', x: playerX, z: playerZ }))
    }, 1000 / MOVE_HZ)

    // ── React to store changes ───────────────────────────────────────────
    const unsub = useGameStore.subscribe((state, prev) => {
      if (ws.readyState !== WebSocket.OPEN) return

      const stateHouseOwnerId = state.currentRoom === 'house'
        ? (state.viewingHouseOwnerId || state.localPlayerId || null)
        : null
      const prevHouseOwnerId = prev.currentRoom === 'house'
        ? (prev.viewingHouseOwnerId || prev.localPlayerId || null)
        : null

      if (state.currentRoom !== prev.currentRoom || stateHouseOwnerId !== prevHouseOwnerId) {
        ws.send(JSON.stringify({
          type: 'change_room',
          room: state.currentRoom,
          houseOwnerId: stateHouseOwnerId || undefined,
        }))
      }
      if (state.playerChat && state.playerChat !== prev.playerChat) {
        ws.send(JSON.stringify({ type: 'chat', message: state.playerChat }))
      }
      if (state.playerEmote && state.playerEmote !== prev.playerEmote) {
        ws.send(JSON.stringify({ type: 'emote', emote: state.playerEmote }))
      }
      if (state.playerColor !== prev.playerColor) {
        ws.send(JSON.stringify({ type: 'color_change', color: state.playerColor }))
      }
      if (
        state.playerHat     !== prev.playerHat     ||
        state.playerVehicle !== prev.playerVehicle ||
        state.playerAvatar  !== prev.playerAvatar  ||
        state.githubLevel   !== prev.githubLevel
      ) {
        ws.send(JSON.stringify({
          type:    'equip',
          hat:     state.playerHat,
          vehicle: state.playerVehicle,
          avatar:  state.playerAvatar,
          level:   state.githubLevel,
        }))
      }

      if (
        state.currentRoom === 'house' &&
        (!state.viewingHouseOwnerId || state.viewingHouseOwnerId === state.localPlayerId) &&
        state.houseItems !== prev.houseItems
      ) {
        ws.send(JSON.stringify({ type: 'house_state', items: state.houseItems }))
      }
    })

    return () => {
      clearInterval(moveTimer)
      unsub()
      ws.close()
    }
  }, [])
}
