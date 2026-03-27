'use client'

import { Canvas } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Suspense } from 'react'
import Room from './Room'
import HUD from './HUD'

export default function GameCanvas() {
  return (
    <div className="w-screen h-screen relative bg-[#0d1b2a]">
      <Canvas
        className="absolute inset-0"
        gl={{ antialias: true }}
      >
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={60} near={0.1} far={100} />
        <ambientLight intensity={0.3} />
        <Suspense fallback={null}>
          <Room />
        </Suspense>
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            intensity={1.8}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
      <HUD />
    </div>
  )
}
