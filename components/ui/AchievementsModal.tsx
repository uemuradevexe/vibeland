'use client'

import { useGameStore } from '@/store/gameStore'
import { ACHIEVEMENTS } from '@/lib/achievements'

export default function AchievementsModal({ onClose }: { onClose: () => void }) {
  const achievements = useGameStore((s) => s.achievements)
  const entries = Object.values(ACHIEVEMENTS)

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-5 w-80 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono font-bold text-[#7a9cc8]">🏆 Achievements</h2>
          <span className="font-mono text-xs text-green-400">
            {entries.filter(a => achievements[a.id]?.unlocked).length}/{entries.length}
          </span>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {entries.map((ach) => {
            const prog = achievements[ach.id] ?? { progress: 0, unlocked: false }
            const pct = Math.min(100, (prog.progress / ach.maxProgress) * 100)
            return (
              <div
                key={ach.id}
                className={`rounded-lg p-2.5 border ${prog.unlocked ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-[#2a4a7f] bg-[#1a2744]'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ach.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className={`font-mono text-xs font-bold ${prog.unlocked ? 'text-yellow-400' : 'text-[#7a9cc8]'}`}>
                        {ach.name}
                      </span>
                      {prog.unlocked && <span className="text-yellow-400 text-xs">✦</span>}
                    </div>
                    <p className="font-mono text-[9px] text-[#5a7aa8] truncate">{ach.description}</p>
                    {!prog.unlocked && (
                      <div className="mt-1 h-1 bg-[#0d1b2a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3d6db5] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    {!prog.unlocked && (
                      <p className="font-mono text-[8px] text-[#3d6db5] mt-0.5">
                        {prog.progress}/{ach.maxProgress}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[#3d6db5] text-xs font-mono text-center mt-3">click outside to close</p>
      </div>
    </div>
  )
}
