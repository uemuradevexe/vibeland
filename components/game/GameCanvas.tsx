'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import Room from './Room'
import HUD from './HUD'
import DayNightCycle from './DayNightCycle'
import { useGameStore } from '@/store/gameStore'
import { useMultiplayer } from '@/hooks/useMultiplayer'

function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const smoothTarget = useRef(new THREE.Vector3(0, 0.8, 0))
  const { camera } = useThree()

  useFrame(() => {
    if (!controlsRef.current) return
    const { playerX, playerZ } = useGameStore.getState()
    const dest = new THREE.Vector3(playerX, 0.8, playerZ)
    smoothTarget.current.lerp(dest, 0.08)
    const prevTarget = controlsRef.current.target.clone()
    const delta = smoothTarget.current.clone().sub(prevTarget)
    controlsRef.current.target.copy(smoothTarget.current)
    camera.position.add(delta)
    controlsRef.current.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      minPolarAngle={Math.PI / 9}
      maxPolarAngle={Math.PI / 2.8}
      minDistance={8}
      maxDistance={55}
      rotateSpeed={0.6}
      zoomSpeed={0.8}
    />
  )
}

export default function GameCanvas() {
  useMultiplayer()

  return (
    <div className="w-screen h-screen relative">
      <Canvas
        className="absolute inset-0"
        gl={{ antialias: true }}
        camera={{ position: [16, 13, 16], fov: 42, near: 0.1, far: 300 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <CameraRig />
        <DayNightCycle />
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
