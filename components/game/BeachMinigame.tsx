'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { saveTokens } from '@/lib/tokenStore'

const GAME_DURATION = 60
const TOKEN_COUNT   = 12
const REWARD_PER_TOKEN = 5

interface FloatingToken {
  id: number
  x: number // % of play area
  y: number
  collected: boolean
}

function makeTokens(): FloatingToken[] {
  return Array.from({ length: TOKEN_COUNT }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    collected: false,
  }))
}

interface Props {
  onClose: () => void
}

export default function BeachMinigame({ onClose }: Props) {
  const [phase, setPhase]   = useState<'ready' | 'playing' | 'done'>('ready')
  const [tokens, setTokens] = useState<FloatingToken[]>(makeTokens())
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore]   = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function start() {
    setPhase('playing')
    setTokens(makeTokens())
    setScore(0)
    setTimeLeft(GAME_DURATION)
  }

  useEffect(() => {
    if (phase !== 'playing') return
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          setPhase('done')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [phase])

  const collectToken = useCallback((id: number) => {
    if (phase !== 'playing') return
    setTokens((prev) => prev.map((t) => t.id === id ? { ...t, collected: true } : t))
    setScore((s) => s + 1)
  }, [phase])

  function claimReward() {
    const earned = score * REWARD_PER_TOKEN
    const current = useGameStore.getState().tokens  // always fresh — avoids stale closure
    const newTotal = current + earned
    saveTokens(newTotal)
    useGameStore.setState({ tokens: newTotal })
    onClose()
  }

  const progress = (timeLeft / GAME_DURATION) * 100

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      onClick={phase !== 'playing' ? onClose : undefined}
    >
      <div
        className="bg-[#0c2a4a] border-2 border-[#f0c060] rounded-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-mono font-bold text-[#f0c060] text-lg">🏖️ Token Rush</h2>
          {phase !== 'playing' && (
            <button onClick={onClose} className="text-[#8a6a20] hover:text-white transition-colors text-xl">✕</button>
          )}
        </div>

        {phase === 'ready' && (
          <div className="flex flex-col gap-4 items-center text-center">
            <p className="font-mono text-sm text-[#c8a040]">
              Colete o máximo de 💰 tokens em {GAME_DURATION} segundos!
            </p>
            <p className="font-mono text-xs text-[#8a6a20]">
              Cada token vale {REWARD_PER_TOKEN} moedas.
            </p>
            <button
              onClick={start}
              className="bg-[#f0c060] hover:bg-[#f5d070] text-black font-mono font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Começar!
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="flex flex-col gap-3">
            {/* Stats bar */}
            <div className="flex justify-between font-mono text-sm">
              <span className="text-yellow-400">💰 {score} × {REWARD_PER_TOKEN} = {score * REWARD_PER_TOKEN}</span>
              <span className={`${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-[#c8a040]'}`}>
                ⏱ {timeLeft}s
              </span>
            </div>

            {/* Timer bar */}
            <div className="h-2 bg-[#0a1a30] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: timeLeft <= 10 ? '#ef4444' : '#f0c060',
                }}
              />
            </div>

            {/* Play area */}
            <div
              className="relative bg-[#1a4a6a] rounded-xl border border-[#2a6a9a] overflow-hidden"
              style={{ height: '260px' }}
            >
              {/* Waves decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#0ea5e9]/20 rounded-b-xl" />
              <div className="absolute bottom-2 left-0 right-0 h-4 bg-[#0ea5e9]/10 rounded-b-xl" />

              {tokens.map((token) => (
                !token.collected && (
                  <button
                    key={token.id}
                    onClick={() => collectToken(token.id)}
                    className="absolute w-8 h-8 flex items-center justify-center text-xl hover:scale-125 transition-transform active:scale-75"
                    style={{ left: `${token.x}%`, top: `${token.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    💰
                  </button>
                )
              ))}

              {tokens.every((t) => t.collected) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-mono text-yellow-400 font-bold text-lg animate-bounce">
                    🎉 Todos coletados!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col gap-4 items-center text-center">
            <p className="font-mono text-2xl">🎉</p>
            <p className="font-mono font-bold text-white text-lg">
              Você coletou {score}/{TOKEN_COUNT} tokens!
            </p>
            <p className="font-mono text-yellow-400 text-xl font-bold">
              +{score * REWARD_PER_TOKEN} 💰
            </p>
            <div className="flex gap-3">
              <button
                onClick={start}
                className="bg-[#1e3a8a] hover:bg-[#2a4a9a] border border-[#3d6db5] font-mono text-sm px-5 py-2 rounded-xl transition-colors"
              >
                Jogar de novo
              </button>
              <button
                onClick={claimReward}
                className="bg-[#f0c060] hover:bg-[#f5d070] text-black font-mono font-bold px-5 py-2 rounded-xl transition-colors"
              >
                Resgatar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
