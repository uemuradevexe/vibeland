'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { ROOMS } from '@/lib/roomConfig'
import { ORB_COLORS } from '@/lib/orbColors'

const EMOTES = ['❤️', '✨', '😂', '🤔', '👋', '🎉']

export default function HUD() {
  const [chatInput, setChatInput] = useState('')
  const [showEmotes, setShowEmotes] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const sendChat = useGameStore((s) => s.sendChat)
  const sendEmote = useGameStore((s) => s.sendEmote)
  const playerColor = useGameStore((s) => s.playerColor)
  const setPlayerColor = useGameStore((s) => s.setPlayerColor)
  const currentRoom = useGameStore((s) => s.currentRoom)
  const changeRoom = useGameStore((s) => s.changeRoom)
  const playerName    = useGameStore((s) => s.playerName)
  const remotePlayers = useGameStore((s) => s.remotePlayers)
  const onlineCount   = Object.keys(remotePlayers).length + 1   // +1 = self

  function handleSendChat() {
    if (!chatInput.trim()) return
    sendChat(chatInput.trim())
    setChatInput('')
    setShowEmotes(false)
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
      {/* Top bar: room name */}
      <div className="pointer-events-none flex justify-center pt-4">
        <div className="bg-[#111e38cc] border border-[#2a4a7f] rounded-full px-5 py-1.5 font-mono text-sm text-[#7a9cc8] backdrop-blur-sm">
          {ROOMS[currentRoom].emoji} {ROOMS[currentRoom].name}
          <span className="ml-3 text-[#3d6db5]">·</span>
          <span className="ml-3 text-[#5a7aa8] text-xs">{playerName}</span>
          <span className="ml-3 text-[#3d6db5]">·</span>
          <span className="ml-2 text-[#5a9a58] text-xs">🟢 {onlineCount}</span>
        </div>
      </div>

      {/* Map overlay */}
      {showMap && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMap(false)}
        >
          <div
            className="bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-6 min-w-64"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-mono font-bold text-center mb-4 text-[#7a9cc8]">🗺️ Mapa</h2>
            <div className="flex flex-col gap-2">
              {Object.values(ROOMS).map((room) => (
                <button
                  key={room.id}
                  onClick={() => { changeRoom(room.id); setShowMap(false) }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                    currentRoom === room.id
                      ? 'bg-[#1e3a8a] border border-[#3d6db5] text-white'
                      : 'bg-[#1a2744] hover:bg-[#243060] text-[#7a9cc8] border border-transparent'
                  }`}
                >
                  {room.emoji} {room.name}
                </button>
              ))}
            </div>
            <p className="text-[#3d6db5] text-xs font-mono text-center mt-3">clique fora para fechar</p>
          </div>
        </div>
      )}

      {/* Bottom HUD */}
      <div className="pointer-events-auto p-3 flex items-end gap-2">
        {/* Emotes popup */}
        {showEmotes && (
          <div className="absolute bottom-16 left-3 bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-3 flex gap-2 flex-wrap w-48">
            {EMOTES.map((emote) => (
              <button
                key={emote}
                onClick={() => { sendEmote(emote); setShowEmotes(false) }}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emote}
              </button>
            ))}
          </div>
        )}

        {/* Color picker popup */}
        {showColors && (
          <div className="absolute bottom-16 left-12 bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-3 grid grid-cols-4 gap-2">
            {ORB_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => { setPlayerColor(c.value); setShowColors(false) }}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c.value,
                  borderColor: playerColor === c.value ? 'white' : 'transparent',
                  boxShadow: playerColor === c.value ? `0 0 8px ${c.value}` : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Emote button */}
        <button
          onClick={() => { setShowEmotes(!showEmotes); setShowColors(false) }}
          className="bg-[#1a2744] border-2 border-[#2a4a7f] rounded-xl p-3 text-xl hover:bg-[#243060] transition-colors flex-shrink-0"
        >
          😊
        </button>

        {/* Chat input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendChat() }}
          className="flex-1 flex gap-2"
        >
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="💬 Digite algo..."
            maxLength={80}
            className="flex-1 bg-[#0d1b2a] border-2 border-[#2a4a7f] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-[#3d6db5] outline-none focus:border-[#3d6db5] transition-colors"
          />
          <button
            type="submit"
            className="bg-[#1e3a8a] hover:bg-[#2a4a9a] border-2 border-[#3d6db5] rounded-xl px-4 py-3 text-sm font-mono font-bold transition-colors"
          >
            ↵
          </button>
        </form>

        {/* Orb color button */}
        <button
          onClick={() => { setShowColors(!showColors); setShowEmotes(false) }}
          className="w-12 h-12 rounded-full border-2 border-white/30 flex-shrink-0 transition-all hover:border-white/70"
          style={{
            backgroundColor: playerColor,
            boxShadow: `0 0 12px ${playerColor}88`,
          }}
        />

        {/* Map button */}
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-[#1a2744] border-2 border-[#2a4a7f] rounded-xl p-3 text-xl hover:bg-[#243060] transition-colors flex-shrink-0"
        >
          🗺️
        </button>
      </div>
    </div>
  )
}
