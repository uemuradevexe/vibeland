'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Suspense } from 'react'
import Room from './Room'
import HUD from './HUD'

function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(16, 13, 16)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

export default function GameCanvas() {
  return (
    <div className="w-screen h-screen relative">
      <Canvas
        className="absolute inset-0"
        gl={{ antialias: true }}
        camera={{ fov: 42, near: 0.1, far: 200 }}
      >
        <CameraSetup />
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 16, 8]} intensity={0.7} />
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
