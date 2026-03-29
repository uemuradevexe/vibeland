'use client'

import { useGameStore } from '@/store/gameStore'

interface Props {
  onClose: () => void
}

export default function FriendsModal({ onClose }: Props) {
  const friends = useGameStore((s) => s.friends)
  const remotePlayers = useGameStore((s) => s.remotePlayers)
  const changeRoom = useGameStore((s) => s.changeRoom)
  const removeFriend = useGameStore((s) => s.removeFriend)

  const entries = friends
    .map((friend) => ({ friend, remote: remotePlayers[friend.id] }))
    .sort((a, b) => Number(Boolean(b.remote)) - Number(Boolean(a.remote)))

  function handleVisit(friendId: string) {
    const remote = remotePlayers[friendId]
    if (!remote) return
    changeRoom(remote.room)
    onClose()
  }

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1b2a] border-2 border-[#2a4a7f] rounded-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-mono font-bold text-[#7a9cc8] text-lg">👥 Amigos</h2>
          <button onClick={onClose} className="text-[#3d6db5] hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="flex flex-col gap-2 max-h-[24rem] overflow-y-auto pr-1">
          {entries.length === 0 && (
            <div className="bg-[#111e38] border border-[#2a4a7f] rounded-xl px-4 py-3 font-mono text-sm text-[#5a7aa8]">
              Nenhum amigo ainda. Clique em outro jogador para adicionar.
            </div>
          )}

          {entries.map(({ friend, remote }) => (
            <div
              key={friend.id}
              className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
                remote
                  ? 'bg-[#13233f] border-[#2e5b8f]'
                  : 'bg-[#111e38] border-[#2a4a7f]'
              }`}
            >
              <div
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-lg"
                style={{ backgroundColor: friend.color }}
              >
                {friend.avatar === 'default' ? '🙂' : '⭐'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${remote ? 'text-green-400' : 'text-slate-500'}`}>●</span>
                  <p className="font-mono text-sm font-bold text-white truncate">{friend.name}</p>
                </div>
                <p className="font-mono text-xs text-[#5a7aa8] truncate">
                  {remote ? `Online em ${remote.room}` : 'Offline'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVisit(friend.id)}
                  disabled={!remote}
                  className="bg-[#1e3a8a] hover:bg-[#2a4a9a] disabled:bg-[#1a2744] disabled:text-[#4c6488] disabled:border-[#243754] border border-[#3d6db5] rounded-lg px-3 py-2 text-xs font-mono font-bold transition-colors"
                >
                  Visit
                </button>
                <button
                  onClick={() => removeFriend(friend.id)}
                  className="bg-[#3a1820] hover:bg-[#51202b] border border-[#7a3240] rounded-lg px-3 py-2 text-xs font-mono font-bold transition-colors text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[#3d6db5] text-xs font-mono text-center">click outside to close</p>
      </div>
    </div>
  )
}
