'use client'

import { useEffect, useRef } from 'react'
import * as Ably from 'ably'
import { useGameStore } from '@/store/gameStore'
import {
  buildHousePresenceData,
  buildPresencePlayerData,
  getRealtimeClientId,
  getRealtimeHouseChannel,
  getRealtimeRoomChannel,
  presenceDataToHouseState,
  presenceDataToRemotePlayer,
} from '@/lib/realtime'

const MOVE_HZ = 20        // position broadcast frequency
const MOVE_THRESHOLD = 0.01 // skip tiny position changes

export function useMultiplayer() {
  const realtimeRef = useRef<Ably.Realtime | null>(null)
  const channelRef = useRef<Ably.RealtimeChannel | null>(null)
  const ownHouseChannelRef = useRef<Ably.RealtimeChannel | null>(null)
  const visitingHouseChannelRef = useRef<Ably.RealtimeChannel | null>(null)
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

    const buildOwnHousePresence = () => {
      const state = useGameStore.getState()
      return buildHousePresenceData({
        ownerId: clientId,
        ownerName: state.playerName || 'Anon',
        items: state.houseItems,
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

    const syncVisitedHouse = async (channel: Ably.RealtimeChannel, ownerId: string) => {
      const members = await channel.presence.get()
      const ownerState = members
        .filter((member) => member.clientId === ownerId)
        .map((member) => presenceDataToHouseState(member.data ?? {}))
        .find((value): value is NonNullable<typeof value> => value !== null)

      useGameStore.getState().setVisitedHouse(
        ownerId,
        ownerState?.ownerName ?? null,
        ownerState?.items ?? [],
      )
    }

    const handleVisitedHousePresence = (message: Ably.PresenceMessage) => {
      const store = useGameStore.getState()
      const ownerId = store.houseOwnerId
      if (!ownerId || message.clientId !== ownerId) return

      if (message.action === 'leave') {
        store.setVisitedHouse(ownerId, store.houseOwnerName, [])
        return
      }

      const ownerState = presenceDataToHouseState(message.data ?? {})
      if (!ownerState) return
      store.setVisitedHouse(ownerState.ownerId, ownerState.ownerName, ownerState.items)
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

    const leaveVisitedHouse = async () => {
      const channel = visitingHouseChannelRef.current
      if (!channel) return

      channel.presence.unsubscribe(handleVisitedHousePresence)
      try { await channel.detach() } catch {}
      visitingHouseChannelRef.current = null
      useGameStore.getState().setVisitedHouse(null, null, [])
    }

    const joinVisitedHouse = async (ownerId: string) => {
      await leaveVisitedHouse()

      const channel = realtime.channels.get(getRealtimeHouseChannel(ownerId))
      visitingHouseChannelRef.current = channel
      await channel.presence.subscribe(handleVisitedHousePresence)
      await syncVisitedHouse(channel, ownerId)
    }

    const joinRoom = async (room: ReturnType<typeof useGameStore.getState>['currentRoom']) => {
      const joinToken = ++joinTokenRef.current
      await leaveCurrentRoom()

      const state = useGameStore.getState()
      const houseScopeId = room === 'house' ? (state.houseOwnerId || clientId) : null
      const channel = realtime.channels.get(getRealtimeRoomChannel(room, houseScopeId))
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

    const ownHouseChannel = realtime.channels.get(getRealtimeHouseChannel(clientId))
    ownHouseChannelRef.current = ownHouseChannel
    void ownHouseChannel.presence.enter(buildOwnHousePresence())

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
        if (state.currentRoom === 'house' && state.houseOwnerId) {
          void joinVisitedHouse(state.houseOwnerId)
        } else {
          void leaveVisitedHouse()
        }
        void joinRoom(state.currentRoom)
        return
      }

      if (state.houseOwnerId !== prev.houseOwnerId) {
        if (state.currentRoom === 'house' && state.houseOwnerId) {
          void joinVisitedHouse(state.houseOwnerId)
        } else {
          void leaveVisitedHouse()
        }
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

      if (
        state.playerName !== prev.playerName ||
        state.houseItems !== prev.houseItems
      ) {
        void ownHouseChannel.presence.update(buildOwnHousePresence())
      }
    })

    return () => {
      window.clearInterval(moveTimer)
      unsub()
      void leaveCurrentRoom()
      void leaveVisitedHouse()
      try { void ownHouseChannel.presence.leave() } catch {}
      realtime.close()
    }
  }, [])
}
