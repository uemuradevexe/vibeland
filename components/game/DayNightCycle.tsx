'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Full cycle: 20 minutes (1200 seconds)
const CYCLE_DURATION = 1200

// Keyframes: [time 0-1, ambient intensity, directional intensity, ambient color hex, directional color hex]
const KEYFRAMES = [
  // Dawn
  { t: 0.0,  ai: 0.15, di: 0.2,  ac: '#1a0e30', dc: '#ff6030' },
  // Morning
  { t: 0.15, ai: 0.5,  di: 0.9,  ac: '#304060', dc: '#fff4e0' },
  // Noon
  { t: 0.3,  ai: 0.7,  di: 1.2,  ac: '#4060a0', dc: '#ffffff' },
  // Afternoon
  { t: 0.55, ai: 0.55, di: 0.9,  ac: '#305080', dc: '#ffd080' },
  // Sunset
  { t: 0.7,  ai: 0.3,  di: 0.5,  ac: '#2a1030', dc: '#ff4020' },
  // Night
  { t: 0.85, ai: 0.1,  di: 0.1,  ac: '#050510', dc: '#2040a0' },
  // Late night / back to dawn
  { t: 1.0,  ai: 0.15, di: 0.2,  ac: '#1a0e30', dc: '#ff6030' },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpColor(ca: string, cb: string, t: number): THREE.Color {
  const a = new THREE.Color(ca)
  const b = new THREE.Color(cb)
  return a.lerp(b, t)
}

export default function DayNightCycle() {
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const dirRef = useRef<THREE.DirectionalLight>(null)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    if (!ambientRef.current || !dirRef.current) return

    elapsed.current = (elapsed.current + delta) % CYCLE_DURATION
    const phase = elapsed.current / CYCLE_DURATION

    // Find surrounding keyframes
    let prev = KEYFRAMES[KEYFRAMES.length - 2]
    let next = KEYFRAMES[KEYFRAMES.length - 1]
    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
      if (phase >= KEYFRAMES[i].t && phase < KEYFRAMES[i + 1].t) {
        prev = KEYFRAMES[i]
        next = KEYFRAMES[i + 1]
        break
      }
    }

    const span = next.t - prev.t
    const t = span > 0 ? (phase - prev.t) / span : 0

    ambientRef.current.intensity = lerp(prev.ai, next.ai, t)
    ambientRef.current.color = lerpColor(prev.ac, next.ac, t)
    dirRef.current.intensity = lerp(prev.di, next.di, t)
    dirRef.current.color = lerpColor(prev.dc, next.dc, t)
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} />
      <directionalLight ref={dirRef} position={[8, 16, 8]} intensity={0.7} />
    </>
  )
}
