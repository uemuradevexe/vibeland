'use client'

import { useEffect, useRef } from 'react'
import * as Ably from 'ably'
import { useGameStore } from '@/store/gameStore'
import {
  buildPresencePlayerData,
  getRealtimeClientId,
  getRealtimeRoomChannel,
  presenceDataToRemotePlayer,
} from '@/lib/realtime'

const MOVE_HZ = 20        // position broadcast frequency
const MOVE_THRESHOLD = 0.01 // skip tiny position changes

export function useMultiplayer() {
  const realtimeRef = useRef<Ably.Realtime | null>(null)
  const channelRef = useRef<Ably.RealtimeChannel | null>(null)
  const roomRef = useRef<string | null>(null)
  const joinTokenRef = useRef(0)

  useEffect(() => {
    const clientId = getRealtimeClientId()
    const realtime = new Ably.Realtime({
      clientId,
      authUrl: `/api/realtime/token?clientId=${encodeURIComponent(clientId)}`,
      echoMessages: false,
    })
    realtimeRef.current = realtime

    const buildSelfPresence = () => {
      const state = useGameStore.getState()
      return buildPresencePlayerData({
        name: state.playerName || 'Anon',
        color: state.playerColor,
        hat: state.playerHat,
        vehicle: state.playerVehicle,
        avatar: state.playerAvatar,
        level: state.githubLevel,
        x: state.playerX,
        z: state.playerZ,
        room: state.currentRoom,
      })
    }

    const syncRoomMembers = async (channel: Ably.RealtimeChannel) => {
      const members = await channel.presence.get()
      const store = useGameStore.getState()
      const players = members
        .filter((member) => member.clientId !== clientId)
        .map((member) => presenceDataToRemotePlayer(member.clientId, member.data ?? {}))
        .filter((player): player is NonNullable<typeof player> => player !== null)

      store.setRemotePlayers(players)
      for (const player of players) {
        store.trackStat('seenPlayers', player.id)
      }
    }

    const handlePresence = (message: Ably.PresenceMessage) => {
      if (message.clientId === clientId) return

      const store = useGameStore.getState()
      if (message.action === 'leave') {
        store.removeRemotePlayer(message.clientId)
        return
      }

      const player = presenceDataToRemotePlayer(message.clientId, message.data ?? {})
      if (!player) return

      store.upsertRemotePlayer(player)
      store.trackStat('seenPlayers', player.id)
    }

    const handleMessage = (message: Ably.Message) => {
      if (message.clientId === clientId) return

      const store = useGameStore.getState()
      const payload = (message.data ?? {}) as Record<string, unknown>
      const id = typeof payload.id === 'string' ? payload.id : (message.clientId ?? '')
      if (!id) return

      switch (message.name) {
        case 'move':
          store.upsertRemotePlayer({
            id,
            x: Number(payload.x),
            z: Number(payload.z),
            room: store.currentRoom,
          })
          break

        case 'chat':
          store.upsertRemotePlayer({ id, chat: String(payload.message ?? ''), chatTimer: 4 })
          break

        case 'emote':
          store.upsertRemotePlayer({ id, emote: String(payload.emote ?? ''), emoteTimer: 2 })
          break
      }
    }

    const leaveCurrentRoom = async () => {
      const current = channelRef.current
      if (!current) return

      try { await current.presence.leave() } catch {}
      current.presence.unsubscribe(handlePresence)
      current.unsubscribe(handleMessage)
      try { await current.detach() } catch {}

      channelRef.current = null
      roomRef.current = null
    }

    const joinRoom = async (room: ReturnType<typeof useGameStore.getState>['currentRoom']) => {
      const joinToken = ++joinTokenRef.current
      await leaveCurrentRoom()

      const channel = realtime.channels.get(getRealtimeRoomChannel(room))
      channelRef.current = channel
      roomRef.current = room

      await channel.subscribe(handleMessage)
      await channel.presence.subscribe(handlePresence)
      await channel.presence.enter(buildSelfPresence())

      if (joinToken !== joinTokenRef.current) return
      await syncRoomMembers(channel)
    }

    realtime.connection.on((stateChange) => {
      const connected = stateChange.current === 'connected'
      useGameStore.setState({
        wsConnected: connected,
        remotePlayers: connected ? useGameStore.getState().remotePlayers : {},
      })
    })

    realtime.connection.once('connected', () => {
      void joinRoom(useGameStore.getState().currentRoom)
    })

    realtime.connection.on('failed', () => {
      console.warn('[realtime] connection failed')
      useGameStore.setState({ wsConnected: false, remotePlayers: {} })
    })

    // ── Throttled position broadcast (~20 Hz) ───────────────────────────
    let lastX = 0
    let lastZ = 0
    const moveTimer = window.setInterval(() => {
      const channel = channelRef.current
      if (!channel) return

      const state = useGameStore.getState()
      const dx = Math.abs(state.playerX - lastX)
      const dz = Math.abs(state.playerZ - lastZ)
      if (dx < MOVE_THRESHOLD && dz < MOVE_THRESHOLD) return

      lastX = state.playerX
      lastZ = state.playerZ

      void channel.publish('move', {
        id: clientId,
        x: state.playerX,
        z: state.playerZ,
      })
      void channel.presence.update(buildSelfPresence())
    }, 1000 / MOVE_HZ)

    // ── React to store changes ───────────────────────────────────────────
    const unsub = useGameStore.subscribe((state, prev) => {
      const channel = channelRef.current
      if (!channel) return

      if (state.currentRoom !== prev.currentRoom) {
        void joinRoom(state.currentRoom)
        return
      }

      if (state.playerChat && state.playerChat !== prev.playerChat) {
        void channel.publish('chat', { id: clientId, message: state.playerChat })
      }
      if (state.playerEmote && state.playerEmote !== prev.playerEmote) {
        void channel.publish('emote', { id: clientId, emote: state.playerEmote })
      }
      if (
        state.playerName    !== prev.playerName    ||
        state.playerColor   !== prev.playerColor   ||
        state.playerHat     !== prev.playerHat     ||
        state.playerVehicle !== prev.playerVehicle ||
        state.playerAvatar  !== prev.playerAvatar  ||
        state.githubLevel   !== prev.githubLevel
      ) {
        void channel.presence.update(buildSelfPresence())
      }
    })

    return () => {
      window.clearInterval(moveTimer)
      unsub()
      void leaveCurrentRoom()
      realtime.close()
    }
  }, [])
}
