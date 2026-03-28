'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { ROOMS } from '@/lib/roomConfig'
import { ORB_COLORS } from '@/lib/orbColors'
import WardrobeModal from '@/components/ui/WardrobeModal'
import ProfileModal from '@/components/ui/ProfileModal'
import BeachMinigame from '@/components/game/BeachMinigame'
import AchievementsModal from '@/components/ui/AchievementsModal'
import { getLevel } from '@/lib/githubLevel'
import { ACHIEVEMENTS } from '@/lib/achievements'

const EMOTES = [
  '❤️', '✨', '😂', '🤔', '👋', '🎉',
  '💃', '😴', '🤖', '🧠', '🔥', '😎',
]

export default function HUD() {
  const [chatInput, setChatInput]     = useState('')
  const [showEmotes, setShowEmotes]   = useState(false)
  const [showColors, setShowColors]   = useState(false)
  const [showMap, setShowMap]         = useState(false)
  const [showWardrobe, setShowWardrobe] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showMinigame, setShowMinigame] = useState(false)
  const [showDailyToast, setShowDailyToast] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showGithubModal, setShowGithubModal] = useState(false)
  const [githubInput, setGithubInput] = useState('')
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubError, setGithubError] = useState<string | null>(null)
  const [showAchievementToast, setShowAchievementToast] = useState(false)

  const sendChat    = useGameStore((s) => s.sendChat)
  const sendEmote   = useGameStore((s) => s.sendEmote)
  const playerColor = useGameStore((s) => s.playerColor)
  const setPlayerColor = useGameStore((s) => s.setPlayerColor)
  const currentRoom    = useGameStore((s) => s.currentRoom)
  const changeRoom     = useGameStore((s) => s.changeRoom)
  const playerName          = useGameStore((s) => s.playerName)
  const tokens              = useGameStore((s) => s.tokens)
  const dailyBonusPending   = useGameStore((s) => s.dailyBonusPending)
  const dismissDailyBonus   = useGameStore((s) => s.dismissDailyBonus)
  const onlineRewardPending = useGameStore((s) => s.onlineRewardPending)
  const dismissOnlineReward = useGameStore((s) => s.dismissOnlineReward)
  const remotePlayers       = useGameStore((s) => s.remotePlayers)
  const githubLevel         = useGameStore((s) => s.githubLevel)
  const githubUsername      = useGameStore((s) => s.githubUsername)
  const setGithubLevel      = useGameStore((s) => s.setGithubLevel)
  const pendingAchievement  = useGameStore((s) => s.pendingAchievement)
  const dismissAchievement  = useGameStore((s) => s.dismissAchievement)
  const onlineCount         = Object.keys(remotePlayers).length + 1

  // Daily bonus toast
  useEffect(() => {
    if (dailyBonusPending > 0) {
      setShowDailyToast(true)
      const t = setTimeout(() => { setShowDailyToast(false); dismissDailyBonus() }, 4000)
      return () => clearTimeout(t)
    }
  }, [dailyBonusPending, dismissDailyBonus])

  // Achievement unlock toast
  useEffect(() => {
    if (pendingAchievement) {
      setShowAchievementToast(true)
      const t = setTimeout(() => {
        setShowAchievementToast(false)
        dismissAchievement()
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [pendingAchievement, dismissAchievement])

  // Prefill github input when modal opens
  useEffect(() => {
    if (showGithubModal && githubUsername) {
      setGithubInput(githubUsername)
    }
  }, [showGithubModal, githubUsername])

  async function handleGithubConnect() {
    const username = githubInput.trim()
    if (!username) return
    setGithubLoading(true)
    setGithubError(null)
    try {
      const res = await fetch(`/api/github/contributions?username=${encodeURIComponent(username)}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const contributions = data.contributions ?? 0
      const level = getLevel(contributions)
      setGithubLevel(username, level, contributions)
      setShowGithubModal(false)
    } catch {
      setGithubError('Could not fetch GitHub data')
    } finally {
      setGithubLoading(false)
    }
  }

  const pendingAchievementDef = pendingAchievement ? ACHIEVEMENTS[pendingAchievement] : null

  function handleSendChat() {
    if (!chatInput.trim()) return
    sendChat(chatInput.trim())
    playChat()
    setChatInput('')
    setShowEmotes(false)
  }

  function handleEmote(emote: string) {
    sendEmote(emote)
    playEmote()
    setShowEmotes(false)
  }

  function handleChangeRoom(roomId: Parameters<typeof changeRoom>[0]) {
    changeRoom(roomId)
    playRoomChange()
    setShowMap(false)
  }

  function handleMute() {
    const m = toggleMute()
    setMuted(m)
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
      {/* Top bar */}
      <div className="pointer-events-auto flex justify-between items-start pt-4 px-4">
        <button
          onClick={() => setShowProfile(true)}
          className="bg-[#111e38cc] border border-[#2a4a7f] rounded-full px-5 py-1.5 font-mono text-sm text-[#7a9cc8] backdrop-blur-sm hover:border-[#3d6db5] transition-colors"
        >
          {ROOMS[currentRoom].emoji} {ROOMS[currentRoom].name}
          <span className="ml-3 text-[#3d6db5]">·</span>
          <span className="ml-3 text-[#5a7aa8] text-xs">{playerName}</span>
          <span className="ml-3 text-[#3d6db5]">·</span>
          <span className="ml-2 text-[#5a9a58] text-xs">🟢 {onlineCount}</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGithubModal(true)}
            className="bg-[#111e38cc] border border-[#2a4a7f] rounded-full px-4 py-1.5 font-mono text-sm text-yellow-400 backdrop-blur-sm hover:bg-[#1a2744cc] transition-colors"
            title={githubUsername ? `GitHub: ${githubUsername}` : 'Connect GitHub'}
          >
            ⚡ Lv.{githubLevel}
          </button>
          <div className="bg-[#111e38cc] border border-[#2a4a7f] rounded-full px-4 py-1.5 font-mono text-sm text-yellow-400 backdrop-blur-sm">
            💰 {tokens}
          </div>
        </div>
      </div>

      {/* Toasts */}
      {showDailyToast && (
        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-black font-mono text-sm font-bold px-5 py-2 rounded-full shadow-lg animate-bounce z-50 whitespace-nowrap">
          🎁 +{dailyBonusPending} tokens — login diário!
        </div>
      )}
      {showOnlineToast && (
        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 bg-green-500/90 text-black font-mono text-sm font-bold px-5 py-2 rounded-full shadow-lg animate-bounce z-50 whitespace-nowrap">
          ⏱️ +{onlineRewardPending} tokens — online reward!
        </div>
      )}

      {/* Achievement unlock toast */}
      {showAchievementToast && pendingAchievementDef && (
        <div className="pointer-events-none absolute top-28 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-black font-mono text-sm font-bold px-5 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 whitespace-nowrap">
          <span>{pendingAchievementDef.emoji}</span>
          <span>Achievement: {pendingAchievementDef.name}!</span>
        </div>
      )}

      {/* Map overlay */}
      {showMap && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMap(false)}
        >
          <div
            className="bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-6 w-64"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-mono font-bold text-center mb-4 text-[#7a9cc8]">🗺️ Mapa</h2>
            <div className="flex flex-col gap-2">
              {Object.values(ROOMS).map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleChangeRoom(room.id)}
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

      {/* Wardrobe modal */}
      {showWardrobe && <WardrobeModal onClose={() => setShowWardrobe(false)} />}

      {/* Profile modal */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* Beach minigame */}
      {showMinigame && <BeachMinigame onClose={() => setShowMinigame(false)} />}

      {/* Achievements modal */}
      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}

      {/* GitHub connect modal */}
      {showGithubModal && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setShowGithubModal(false)}
        >
          <div
            className="bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-5 w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-mono font-bold text-[#7a9cc8] mb-3">⚡ Connect GitHub</h2>
            <p className="font-mono text-[10px] text-[#5a7aa8] mb-3">
              Your GitHub contribution count determines your in-game level and aura.
            </p>
            <input
              className="w-full bg-[#0d1b2a] border-2 border-[#2a4a7f] rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-[#3d6db5] outline-none focus:border-[#3d6db5] transition-colors mb-3"
              placeholder="github username"
              value={githubInput}
              onChange={(e) => setGithubInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGithubConnect()}
              autoFocus
            />
            {githubError && (
              <p className="font-mono text-[10px] text-red-400 mb-2">{githubError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleGithubConnect}
                disabled={githubLoading || !githubInput.trim()}
                className="flex-1 bg-[#1e3a8a] hover:bg-[#2a4a9a] disabled:opacity-50 border-2 border-[#3d6db5] rounded-lg px-4 py-2 text-sm font-mono font-bold transition-colors"
              >
                {githubLoading ? 'Loading...' : 'Connect'}
              </button>
              <button
                onClick={() => setShowGithubModal(false)}
                className="bg-[#1a2744] hover:bg-[#243060] border-2 border-[#2a4a7f] rounded-lg px-4 py-2 text-sm font-mono transition-colors text-[#7a9cc8]"
              >
                Cancel
              </button>
            </div>
            <p className="text-[#3d6db5] text-xs font-mono text-center mt-3">click outside to close</p>
          </div>
        </div>
      )}

      {/* Bottom HUD */}
      <div className="pointer-events-auto p-2 sm:p-3 flex items-end gap-1.5 sm:gap-2 overflow-x-auto">
        {/* Emotes popup — 4×3 grid */}
        {showEmotes && (
          <div className="absolute bottom-16 sm:bottom-[4.5rem] left-2 bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-3 grid grid-cols-4 gap-2 w-52">
            {EMOTES.map((emote, i) => (
              <button
                key={emote}
                onClick={() => handleEmote(emote)}
                className="text-2xl hover:scale-125 transition-transform relative"
                title={`${emote} [${i + 1}]`}
              >
                {emote}
                {i < 9 && (
                  <span className="absolute -top-1 -right-1 text-[8px] text-[#3d6db5] font-mono">{i + 1}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Color picker popup */}
        {showColors && (
          <div className="absolute bottom-16 sm:bottom-[4.5rem] left-12 bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-3 grid grid-cols-4 gap-2">
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
          className="bg-[#1a2744] border-2 border-[#2a4a7f] rounded-xl p-2.5 sm:p-3 text-xl hover:bg-[#243060] transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          😊
        </button>

        {/* Chat input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendChat() }}
          className="flex-1 flex gap-1.5 sm:gap-2 min-w-0"
        >
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="💬 Digite algo..."
            maxLength={80}
            className="flex-1 min-w-0 bg-[#0d1b2a] border-2 border-[#2a4a7f] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-mono text-white placeholder-[#3d6db5] outline-none focus:border-[#3d6db5] transition-colors"
          />
          <button
            type="submit"
            className="bg-[#1e3a8a] hover:bg-[#2a4a9a] border-2 border-[#3d6db5] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-mono font-bold transition-colors flex-shrink-0 min-w-[44px] min-h-[44px]"
          >
            ↵
          </button>
        </form>

        {/* Orb color button */}
        <button
          onClick={() => { setShowColors(!showColors); setShowEmotes(false) }}
          className="w-11 h-11 rounded-full border-2 border-white/30 flex-shrink-0 transition-all hover:border-white/70"
          style={{
            backgroundColor: playerColor,
            boxShadow: `0 0 12px ${playerColor}88`,
          }}
        />

        {/* Wardrobe button */}
        <button
          onClick={() => { setShowWardrobe(true); setShowEmotes(false); setShowColors(false) }}
          className="bg-[#1a2744] border-2 border-[#2a4a7f] rounded-xl p-2.5 sm:p-3 text-xl hover:bg-[#243060] transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          👕
        </button>

        {/* Achievements button */}
        <button
          onClick={() => { setShowAchievements(true); setShowEmotes(false); setShowColors(false) }}
          className="bg-[#1a2744] border-2 border-[#2a4a7f] rounded-xl p-3 text-xl hover:bg-[#243060] transition-colors flex-shrink-0"
        >
          🏆
        </button>

        {/* Map button */}
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-[#1a2744] border-2 border-[#2a4a7f] rounded-xl p-2.5 sm:p-3 text-xl hover:bg-[#243060] transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          🗺️
        </button>

        {/* Minigame button — beach only */}
        {currentRoom === 'beach' && (
          <button
            onClick={() => setShowMinigame(true)}
            className="bg-[#1a3a20] border-2 border-[#f0c060] rounded-xl p-3 text-xl hover:bg-[#2a4a30] transition-colors flex-shrink-0 animate-pulse"
            title="Token Rush — minijogo"
          >
            🎮
          </button>
        )}
      </div>
    </div>
  )
}
