'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Suspense } from 'react'
import Room from './Room'
import HUD from './HUD'

export default function GameCanvas() {
  return (
    <div className="w-screen h-screen relative">
      <Canvas
        className="absolute inset-0"
        gl={{ antialias: true }}
        camera={{ position: [16, 13, 16], fov: 42, near: 0.1, far: 300 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          minPolarAngle={Math.PI / 9}
          maxPolarAngle={Math.PI / 2.8}
          minDistance={8}
          maxDistance={55}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          target={[0, 0, 0]}
        />
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 16, 8]} intensity={0.7} />
        <Suspense fallback={null}>
          <Room />
        </Suspense>
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            intensity={1.5}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
      <HUD />
    </div>
  )
}
