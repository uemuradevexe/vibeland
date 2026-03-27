# Skins + Token Economy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hat/vehicle skins system and token economy so players can unlock cosmetics with in-game currency.

**Architecture:** Define skins in `lib/skins.ts`; persist tokens + equipped items via localStorage through `lib/tokenStore.ts` and a wardrobe Zustand slice; render hats as Three.js geometry inside `ClaudeOrb.tsx`; expose a `WardrobeModal` from the HUD.

**Tech Stack:** React 19, Zustand 5, React Three Fiber, Three.js, localStorage, Tailwind CSS 4

**Closes:** #16, #20

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `lib/skins.ts` | Create | Hat + vehicle definitions (id, name, emoji, cost, 3D geometry params) |
| `lib/tokenStore.ts` | Create | localStorage read/write for token balance + daily login |
| `store/gameStore.ts` | Modify | Add `playerHat`, `playerVehicle`, `tokens` fields + actions |
| `components/game/ClaudeOrb.tsx` | Modify | Render hat geometry on top of head |
| `components/ui/WardrobeModal.tsx` | Create | Full wardrobe UI (tabs: Hats / Vehicles, inventory, shop) |
| `components/game/HUD.tsx` | Modify | Add wardrobe button + token counter |
| `components/entry/NameColorPicker.tsx` | Modify | Hat selection on entry screen |

---

## Task 1: Define skins data

**Files:**
- Create: `lib/skins.ts`

- [ ] **Step 1: Create skin definitions**

```ts
// lib/skins.ts

export type HatId = 'none' | 'tophat' | 'crown' | 'cap' | 'cowboy' | 'wizard'
export type VehicleId = 'none' | 'skateboard'

export interface HatDef {
  id: HatId
  name: string
  emoji: string
  cost: number          // 0 = free
  // geometry to render on head (y=0 relative to head center at y=1.75)
  pieces: HatPiece[]
}

export interface HatPiece {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  emissive?: string
  emissiveIntensity?: number
}

export interface VehicleDef {
  id: VehicleId
  name: string
  emoji: string
  cost: number
  // board geometry rendered at y=-0.05 under feet
  pieces: VehiclePiece[]
}

export interface VehiclePiece {
  position: [number, number, number]
  size: [number, number, number]
  color: string
}

export const HATS: Record<HatId, HatDef> = {
  none: { id: 'none', name: 'None', emoji: '🚫', cost: 0, pieces: [] },

  tophat: {
    id: 'tophat', name: 'Top Hat', emoji: '🎩', cost: 80,
    pieces: [
      // brim
      { position: [0, 0.27, 0], size: [0.62, 0.06, 0.62], color: '#111111' },
      // cylinder
      { position: [0, 0.54, 0], size: [0.38, 0.42, 0.38], color: '#111111' },
      // band
      { position: [0, 0.33, 0], size: [0.40, 0.07, 0.40], color: '#c8960c' },
    ],
  },

  crown: {
    id: 'crown', name: 'Crown', emoji: '👑', cost: 150,
    pieces: [
      // base band
      { position: [0, 0.27, 0], size: [0.58, 0.10, 0.58], color: '#f5c518' },
      // center spike
      { position: [0, 0.44, 0], size: [0.10, 0.24, 0.10], color: '#f5c518', emissive: '#f5c518', emissiveIntensity: 0.6 },
      // left spike
      { position: [-0.18, 0.38, 0], size: [0.09, 0.18, 0.09], color: '#f5c518', emissive: '#f5c518', emissiveIntensity: 0.6 },
      // right spike
      { position: [0.18, 0.38, 0], size: [0.09, 0.18, 0.09], color: '#f5c518', emissive: '#f5c518', emissiveIntensity: 0.6 },
    ],
  },

  cap: {
    id: 'cap', name: 'Cap', emoji: '🧢', cost: 60,
    pieces: [
      // dome
      { position: [0, 0.38, 0], size: [0.50, 0.24, 0.50], color: '#2563eb' },
      // brim (front only — shifted forward)
      { position: [0, 0.28, 0.22], size: [0.44, 0.05, 0.22], color: '#1d4ed8' },
    ],
  },

  cowboy: {
    id: 'cowboy', name: 'Cowboy', emoji: '🤠', cost: 100,
    pieces: [
      // wide brim
      { position: [0, 0.26, 0], size: [0.76, 0.05, 0.76], color: '#92400e' },
      // dome
      { position: [0, 0.54, 0], size: [0.40, 0.44, 0.40], color: '#78350f' },
      // band
      { position: [0, 0.31, 0], size: [0.42, 0.07, 0.42], color: '#451a03' },
    ],
  },

  wizard: {
    id: 'wizard', name: 'Wizard', emoji: '🧙', cost: 120,
    pieces: [
      // base brim
      { position: [0, 0.26, 0], size: [0.60, 0.06, 0.60], color: '#4c1d95' },
      // lower cone
      { position: [0, 0.44, 0], size: [0.40, 0.30, 0.40], color: '#5b21b6' },
      // mid cone
      { position: [0, 0.64, 0], size: [0.26, 0.28, 0.26], color: '#6d28d9' },
      // tip
      { position: [0, 0.82, 0], size: [0.12, 0.24, 0.12], color: '#7c3aed', emissive: '#8b5cf6', emissiveIntensity: 0.8 },
    ],
  },
}

export const VEHICLES: Record<VehicleId, VehicleDef> = {
  none: { id: 'none', name: 'None', emoji: '🚫', cost: 0, pieces: [] },

  skateboard: {
    id: 'skateboard', name: 'Skateboard', emoji: '🛹', cost: 200,
    pieces: [
      // deck
      { position: [0, -0.07, 0], size: [0.55, 0.06, 1.10], color: '#92400e' },
      // left truck axle
      { position: [0, -0.13, 0.35], size: [0.60, 0.05, 0.08], color: '#6b7280' },
      // right truck axle
      { position: [0, -0.13, -0.35], size: [0.60, 0.05, 0.08], color: '#6b7280' },
    ],
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/skins.ts
git commit -m "feat: define hat and vehicle skin data"
```

---

## Task 2: Token store (localStorage)

**Files:**
- Create: `lib/tokenStore.ts`

- [ ] **Step 1: Create token persistence module**

```ts
// lib/tokenStore.ts

const KEY_TOKENS = 'vl_tokens'
const KEY_LAST_LOGIN = 'vl_last_login'
const DAILY_BONUS = 50
const STARTING_TOKENS = 100

export function loadTokens(): number {
  if (typeof window === 'undefined') return STARTING_TOKENS
  const stored = localStorage.getItem(KEY_TOKENS)
  return stored !== null ? parseInt(stored, 10) : STARTING_TOKENS
}

export function saveTokens(amount: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_TOKENS, String(amount))
}

/** Returns bonus amount if daily login is new, 0 otherwise */
export function claimDailyBonus(): number {
  if (typeof window === 'undefined') return 0
  const today = new Date().toDateString()
  const last = localStorage.getItem(KEY_LAST_LOGIN)
  if (last === today) return 0
  localStorage.setItem(KEY_LAST_LOGIN, today)
  return DAILY_BONUS
}

export function loadEquipped(): { hat: string; vehicle: string } {
  if (typeof window === 'undefined') return { hat: 'none', vehicle: 'none' }
  try {
    const raw = localStorage.getItem('vl_equipped')
    return raw ? JSON.parse(raw) : { hat: 'none', vehicle: 'none' }
  } catch {
    return { hat: 'none', vehicle: 'none' }
  }
}

export function saveEquipped(hat: string, vehicle: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('vl_equipped', JSON.stringify({ hat, vehicle }))
}

export function loadInventory(): string[] {
  if (typeof window === 'undefined') return ['none']
  try {
    const raw = localStorage.getItem('vl_inventory')
    const parsed: string[] = raw ? JSON.parse(raw) : ['none']
    if (!parsed.includes('none')) parsed.unshift('none')
    return parsed
  } catch {
    return ['none']
  }
}

export function saveInventory(items: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('vl_inventory', JSON.stringify(items))
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/tokenStore.ts
git commit -m "feat: token store with localStorage persistence and daily login"
```

---

## Task 3: Extend gameStore with skins + tokens

**Files:**
- Modify: `store/gameStore.ts`

- [ ] **Step 1: Add skins and token state + actions to the store**

Replace the entire file content:

```ts
// store/gameStore.ts
import { create } from 'zustand'
import { ROOMS, type RoomId } from '@/lib/roomConfig'
import { resolvePosition } from '@/lib/collision'
import type { HatId, VehicleId } from '@/lib/skins'
import {
  loadTokens, saveTokens, claimDailyBonus,
  loadEquipped, saveEquipped,
  loadInventory, saveInventory,
} from '@/lib/tokenStore'

export interface NPC {
  id: string
  color: string
  x: number
  z: number
  targetX: number
  targetZ: number
  phrase: string | null
  phraseTimer: number
  wanderTimer: number
}

export interface GameState {
  // Player
  playerName: string
  playerColor: string
  playerX: number
  playerZ: number
  playerTargetX: number
  playerTargetZ: number
  playerChat: string | null
  playerChatTimer: number
  playerEmote: string | null
  playerEmoteTimer: number

  // Cosmetics
  playerHat: HatId
  playerVehicle: VehicleId
  tokens: number
  inventory: string[]   // owned item ids
  dailyBonusPending: number  // > 0 while toast should show

  // World
  currentRoom: RoomId
  npcs: NPC[]

  // Actions
  setPlayer: (name: string, color: string) => void
  setPlayerColor: (color: string) => void
  setPlayerTarget: (x: number, z: number) => void
  sendChat: (message: string) => void
  sendEmote: (emote: string) => void
  changeRoom: (room: RoomId) => void
  setNPCs: (npcs: NPC[]) => void
  tickGame: (delta: number) => void

  // Skins & tokens
  equipHat: (hat: HatId) => void
  equipVehicle: (vehicle: VehicleId) => void
  buyItem: (itemId: string, cost: number) => boolean  // returns false if insufficient tokens
  initPlayer: () => void   // call once on game mount
  dismissDailyBonus: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  playerName: '',
  playerColor: '#ea580c',
  playerX: 0,
  playerZ: 0,
  playerTargetX: 0,
  playerTargetZ: 0,
  playerChat: null,
  playerChatTimer: 0,
  playerEmote: null,
  playerEmoteTimer: 0,

  playerHat: 'none',
  playerVehicle: 'none',
  tokens: 0,
  inventory: ['none'],
  dailyBonusPending: 0,

  currentRoom: 'plaza',
  npcs: [],

  setPlayer: (name, color) => set({ playerName: name, playerColor: color }),
  setPlayerColor: (color) => set({ playerColor: color }),
  setPlayerTarget: (x, z) => set({ playerTargetX: x, playerTargetZ: z }),

  sendChat: (message) => set({ playerChat: message, playerChatTimer: 4 }),
  sendEmote: (emote) => set({ playerEmote: emote, playerEmoteTimer: 2 }),

  changeRoom: (room) => set({
    currentRoom: room,
    playerX: 0,
    playerZ: 0,
    playerTargetX: 0,
    playerTargetZ: 0,
    npcs: [],
    playerChat: null,
    playerEmote: null,
  }),

  setNPCs: (npcs) => set({ npcs }),

  equipHat: (hat) => {
    const { playerVehicle } = get()
    saveEquipped(hat, playerVehicle)
    set({ playerHat: hat })
  },

  equipVehicle: (vehicle) => {
    const { playerHat } = get()
    saveEquipped(playerHat, vehicle)
    set({ playerVehicle: vehicle })
  },

  buyItem: (itemId, cost) => {
    const { tokens, inventory } = get()
    if (tokens < cost) return false
    const newTokens = tokens - cost
    const newInventory = inventory.includes(itemId) ? inventory : [...inventory, itemId]
    saveTokens(newTokens)
    saveInventory(newInventory)
    set({ tokens: newTokens, inventory: newInventory })
    return true
  },

  initPlayer: () => {
    const tokens = loadTokens()
    const bonus = claimDailyBonus()
    const finalTokens = tokens + bonus
    if (bonus > 0) saveTokens(finalTokens)
    const equipped = loadEquipped()
    const inventory = loadInventory()
    set({
      tokens: finalTokens,
      dailyBonusPending: bonus,
      playerHat: equipped.hat as HatId,
      playerVehicle: equipped.vehicle as VehicleId,
      inventory,
    })
  },

  dismissDailyBonus: () => set({ dailyBonusPending: 0 }),

  tickGame: (delta) => set((state) => {
    const colliders = ROOMS[state.currentRoom].colliders

    const dx = state.playerTargetX - state.playerX
    const dz = state.playerTargetZ - state.playerZ
    let newX = Math.abs(dx) < 0.05 ? state.playerTargetX : state.playerX + dx * Math.min(delta * 3, 1)
    let newZ = Math.abs(dz) < 0.05 ? state.playerTargetZ : state.playerZ + dz * Math.min(delta * 3, 1)
    ;[newX, newZ] = resolvePosition(newX, newZ, colliders)

    const playerChatTimer = Math.max(0, state.playerChatTimer - delta)
    const playerEmoteTimer = Math.max(0, state.playerEmoteTimer - delta)

    const npcs = state.npcs.map((npc) => {
      const ndx = npc.targetX - npc.x
      const ndz = npc.targetZ - npc.z
      let nx = Math.abs(ndx) < 0.05 ? npc.targetX : npc.x + ndx * Math.min(delta * 2, 1)
      let nz = Math.abs(ndz) < 0.05 ? npc.targetZ : npc.z + ndz * Math.min(delta * 2, 1)
      ;[nx, nz] = resolvePosition(nx, nz, colliders)

      const phraseTimer = Math.max(0, npc.phraseTimer - delta)
      let wanderTimer = npc.wanderTimer - delta
      let targetX = npc.targetX
      let targetZ = npc.targetZ
      const phrase = phraseTimer > 0 ? npc.phrase : null

      if (wanderTimer <= 0) {
        let wx = (Math.random() - 0.5) * 28
        let wz = (Math.random() - 0.5) * 28
        ;[wx, wz] = resolvePosition(wx, wz, colliders)
        targetX = wx
        targetZ = wz
        wanderTimer = 4 + Math.random() * 6
      }

      return { ...npc, x: nx, z: nz, targetX, targetZ, phraseTimer, wanderTimer, phrase }
    })

    return {
      playerX: newX,
      playerZ: newZ,
      playerChat: playerChatTimer > 0 ? state.playerChat : null,
      playerChatTimer,
      playerEmote: playerEmoteTimer > 0 ? state.playerEmote : null,
      playerEmoteTimer,
      npcs,
    }
  }),
}))
```

- [ ] **Step 2: Commit**

```bash
git add store/gameStore.ts
git commit -m "feat: add skins, token, and inventory state to gameStore"
```

---

## Task 4: Render hat in ClaudeOrb

**Files:**
- Modify: `components/game/ClaudeOrb.tsx`

- [ ] **Step 1: Add `hat` prop and render hat pieces above the head**

Replace the `ClaudeOrbProps` interface and add the hat rendering block. The head center is at `y=1.75`. Hat pieces use positions relative to `y=2.0` (top of head) so they sit above it.

Full updated file:

```tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'
import { HATS, VEHICLES, type HatId, type VehicleId } from '@/lib/skins'

interface ClaudeOrbProps {
  x: number
  z?: number
  color: string
  name: string
  chat?: string | null
  emote?: string | null
  isPlayer?: boolean
  hat?: HatId
  vehicle?: VehicleId
}

// Slightly darker shade for limbs
function darkenHex(hex: string, amount = 0.62): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const d = (v: number) => Math.round(v * amount).toString(16).padStart(2, '0')
  return `#${d(r)}${d(g)}${d(b)}`
}

// Minecraft-style proportions (total height ~2 units, feet at y=0):
//   Legs   : 0.25 × 0.75 × 0.25   pivot at hip y=0.75, x=±0.125
//   Torso  : 0.50 × 0.75 × 0.25   center y=1.125
//   Arms   : 0.25 × 0.75 × 0.25   pivot at shoulder y=1.50, x=±0.375
//   Head   : 0.50 × 0.50 × 0.50   center y=1.75
export default function ClaudeOrb({ x, z = 0, color, name, chat, emote, isPlayer, hat = 'none', vehicle = 'none' }: ClaudeOrbProps) {
  const rootRef   = useRef<THREE.Group>(null)
  const bodyRef   = useRef<THREE.Group>(null)
  const floatRef  = useRef<THREE.Group>(null)
  const leftArmRef  = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const leftLegRef  = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)

  const prevPos    = useRef({ x, z })
  const targetRotY = useRef(0)
  const walkPhase  = useRef(Math.random() * Math.PI * 2)
  const idlePhase  = useRef(Math.random() * Math.PI * 2)

  const limbColor = darkenHex(color)
  const scale = isPlayer ? 1.1 : 1.0
  const hatDef = HATS[hat] ?? HATS.none
  const vehicleDef = VEHICLES[vehicle] ?? VEHICLES.none

  useFrame((_, delta) => {
    if (!bodyRef.current || !floatRef.current) return

    const dx = x - prevPos.current.x
    const dz = z - prevPos.current.z
    const speed = Math.sqrt(dx * dx + dz * dz)
    const isMoving = speed > 0.002

    if (isMoving) {
      targetRotY.current = Math.atan2(dx, dz)
      walkPhase.current += delta * 7
      const swing = Math.sin(walkPhase.current)
      if (leftLegRef.current)   leftLegRef.current.rotation.x  =  swing * 0.6
      if (rightLegRef.current)  rightLegRef.current.rotation.x = -swing * 0.6
      if (leftArmRef.current)   leftArmRef.current.rotation.x  = -swing * 0.45
      if (rightArmRef.current)  rightArmRef.current.rotation.x  =  swing * 0.45
    } else {
      if (leftLegRef.current)   leftLegRef.current.rotation.x  *= 0.85
      if (rightLegRef.current)  rightLegRef.current.rotation.x *= 0.85
      if (leftArmRef.current)   leftArmRef.current.rotation.x  *= 0.85
      if (rightArmRef.current)  rightArmRef.current.rotation.x *= 0.85

      idlePhase.current += delta * 1.4
      floatRef.current.position.y = Math.sin(idlePhase.current) * 0.018
    }

    const diff = targetRotY.current - bodyRef.current.rotation.y
    const wrapped = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI
    bodyRef.current.rotation.y += wrapped * Math.min(delta * 14, 1)

    prevPos.current = { x, z }
  })

  return (
    <group ref={rootRef} position={[x, 0, z]} scale={[scale, scale, scale]}>
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      {/* Body group — rotates to face direction */}
      <group ref={bodyRef}>
        {/* Float group — idle bob offset */}
        <group ref={floatRef}>

          {/* LEGS — pivot at hip */}
          <group position={[-0.125, 0.75, 0]}>
            <mesh ref={leftLegRef} position={[0, -0.375, 0]}>
              <boxGeometry args={[0.25, 0.75, 0.25]} />
              <meshStandardMaterial color={limbColor} />
            </mesh>
          </group>
          <group position={[0.125, 0.75, 0]}>
            <mesh ref={rightLegRef} position={[0, -0.375, 0]}>
              <boxGeometry args={[0.25, 0.75, 0.25]} />
              <meshStandardMaterial color={limbColor} />
            </mesh>
          </group>

          {/* TORSO */}
          <mesh position={[0, 1.125, 0]}>
            <boxGeometry args={[0.5, 0.75, 0.25]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isPlayer ? 0.22 : 0.1}
              toneMapped={false}
            />
          </mesh>

          {/* ARMS — pivot at shoulder */}
          <group position={[-0.375, 1.5, 0]}>
            <mesh ref={leftArmRef} position={[0, -0.375, 0]}>
              <boxGeometry args={[0.25, 0.75, 0.25]} />
              <meshStandardMaterial color={limbColor} />
            </mesh>
          </group>
          <group position={[0.375, 1.5, 0]}>
            <mesh ref={rightArmRef} position={[0, -0.375, 0]}>
              <boxGeometry args={[0.25, 0.75, 0.25]} />
              <meshStandardMaterial color={limbColor} />
            </mesh>
          </group>

          {/* HEAD */}
          <mesh position={[0, 1.75, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isPlayer ? 0.28 : 0.13}
              toneMapped={false}
            />
          </mesh>

          {/* Eyes — front face */}
          <mesh position={[-0.12, 1.79, 0.26]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
            <meshStandardMaterial color="#1a0a00" />
          </mesh>
          <mesh position={[0.12, 1.79, 0.26]}>
            <boxGeometry args={[0.1, 0.1, 0.02]} />
            <meshStandardMaterial color="#1a0a00" />
          </mesh>

          {/* HAT — rendered above head center (y=1.75 + 0.25 = 2.0 top of head) */}
          {hatDef.pieces.length > 0 && (
            <group position={[0, 2.0, 0]}>
              {hatDef.pieces.map((piece, i) => (
                <mesh key={i} position={piece.position}>
                  <boxGeometry args={piece.size} />
                  <meshStandardMaterial
                    color={piece.color}
                    emissive={piece.emissive ?? piece.color}
                    emissiveIntensity={piece.emissiveIntensity ?? 0}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          )}

          {/* VEHICLE — rendered below feet */}
          {vehicleDef.pieces.length > 0 && (
            <group position={[0, 0, 0]}>
              {vehicleDef.pieces.map((piece, i) => (
                <mesh key={i} position={piece.position}>
                  <boxGeometry args={piece.size} />
                  <meshStandardMaterial color={piece.color} />
                </mesh>
              ))}
            </group>
          )}

        </group>{/* /floatRef */}

        {/* Player crown — sits above head at fixed position */}
        {isPlayer && hat === 'none' && (
          <>
            <mesh position={[-0.13, 2.07, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
            <mesh position={[0, 2.12, 0]}>
              <boxGeometry args={[0.12, 0.18, 0.12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
            <mesh position={[0.13, 2.07, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
          </>
        )}

        {/* Name tag */}
        <Html
          position={[0, 2.22, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            background: isPlayer ? '#1e3a8a' : '#1a2744',
            border: `1px solid ${isPlayer ? '#3d6db5' : '#2a3a5a'}`,
            borderRadius: 4,
            padding: '1px 7px',
            fontSize: 10,
            color: 'white',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}>
            {isPlayer ? `${name} ✦` : name}
          </div>
        </Html>

        {/* Chat bubble */}
        {chat && (
          <Html position={[0, 2.55, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'white',
              color: '#1a1a2e',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              maxWidth: 200,
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            }}>
              {chat}
              <div style={{
                position: 'absolute', bottom: -6, left: '50%',
                transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '7px solid white',
              }} />
            </div>
          </Html>
        )}

        {/* Emote */}
        {emote && (
          <Html position={[0.45, 2.4, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{ fontSize: 20, animation: 'floatUp 2s ease-out forwards' }}>
              {emote}
            </div>
          </Html>
        )}

      </group>{/* /bodyRef */}
    </group>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/ClaudeOrb.tsx
git commit -m "feat: render hat and vehicle skins on ClaudeOrb character"
```

---

## Task 5: Wire player hat/vehicle into Room

**Files:**
- Modify: `components/game/Room.tsx`

- [ ] **Step 1: Pass hat and vehicle props to ClaudeOrb and call initPlayer**

```tsx
'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import PlazaRoom from '@/components/rooms/PlazaRoom'
import CafeRoom from '@/components/rooms/CafeRoom'
import BeachRoom from '@/components/rooms/BeachRoom'
import LibraryRoom from '@/components/rooms/LibraryRoom'
import ClaudeOrb from './ClaudeOrb'
import NPCManager from './NPCManager'

const ROOM_COMPONENTS = {
  plaza: PlazaRoom,
  cafe: CafeRoom,
  beach: BeachRoom,
  library: LibraryRoom,
}

export default function Room() {
  const currentRoom  = useGameStore((s) => s.currentRoom)
  const playerX      = useGameStore((s) => s.playerX)
  const playerZ      = useGameStore((s) => s.playerZ)
  const playerColor  = useGameStore((s) => s.playerColor)
  const playerName   = useGameStore((s) => s.playerName)
  const playerChat   = useGameStore((s) => s.playerChat)
  const playerEmote  = useGameStore((s) => s.playerEmote)
  const playerHat    = useGameStore((s) => s.playerHat)
  const playerVehicle = useGameStore((s) => s.playerVehicle)
  const initPlayer   = useGameStore((s) => s.initPlayer)

  useEffect(() => { initPlayer() }, [initPlayer])

  const RoomComponent = ROOM_COMPONENTS[currentRoom]

  return (
    <>
      <RoomComponent />
      <NPCManager />
      <ClaudeOrb
        x={playerX}
        z={playerZ}
        color={playerColor}
        name={playerName || 'você'}
        chat={playerChat}
        emote={playerEmote}
        hat={playerHat}
        vehicle={playerVehicle}
        isPlayer
      />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/Room.tsx
git commit -m "feat: wire player hat and vehicle into Room, init player data on mount"
```

---

## Task 6: Wardrobe modal UI

**Files:**
- Create: `components/ui/WardrobeModal.tsx`

- [ ] **Step 1: Create the wardrobe modal**

```tsx
'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { HATS, VEHICLES, type HatId, type VehicleId } from '@/lib/skins'

interface WardrobeModalProps {
  onClose: () => void
}

type Tab = 'hats' | 'vehicles'

export default function WardrobeModal({ onClose }: WardrobeModalProps) {
  const [tab, setTab] = useState<Tab>('hats')

  const tokens      = useGameStore((s) => s.tokens)
  const inventory   = useGameStore((s) => s.inventory)
  const playerHat   = useGameStore((s) => s.playerHat)
  const playerVehicle = useGameStore((s) => s.playerVehicle)
  const equipHat    = useGameStore((s) => s.equipHat)
  const equipVehicle = useGameStore((s) => s.equipVehicle)
  const buyItem     = useGameStore((s) => s.buyItem)

  const [feedback, setFeedback] = useState<string | null>(null)

  function handleSelect(id: string, cost: number, type: 'hat' | 'vehicle') {
    if (!inventory.includes(id) && cost > 0) {
      const ok = buyItem(id, cost)
      if (!ok) { setFeedback('Tokens insuficientes! ✗'); return }
      setFeedback(`+1 item desbloqueado ✦`)
      setTimeout(() => setFeedback(null), 2000)
    }
    if (type === 'hat') equipHat(id as HatId)
    else equipVehicle(id as VehicleId)
  }

  const hatsArray = Object.values(HATS)
  const vehiclesArray = Object.values(VEHICLES)
  const items = tab === 'hats' ? hatsArray : vehiclesArray
  const equippedId = tab === 'hats' ? playerHat : playerVehicle

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-5 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono font-bold text-[#7a9cc8]">👕 Wardrobe</h2>
          <div className="font-mono text-sm text-yellow-400">💰 {tokens} tokens</div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['hats', 'vehicles'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg font-mono text-xs transition-all ${
                tab === t
                  ? 'bg-[#1e3a8a] border border-[#3d6db5] text-white'
                  : 'bg-[#1a2744] text-[#7a9cc8] border border-transparent hover:bg-[#243060]'
              }`}
            >
              {t === 'hats' ? '🎩 Hats' : '🛹 Vehicles'}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="mb-3 text-center font-mono text-xs text-green-400">{feedback}</div>
        )}

        {/* Items grid */}
        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {items.map((item) => {
            const owned = inventory.includes(item.id) || item.cost === 0
            const equipped = item.id === equippedId
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id, item.cost, tab === 'hats' ? 'hat' : 'vehicle')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  equipped
                    ? 'border-[#3d6db5] bg-[#1e3a8a]'
                    : owned
                    ? 'border-[#2a4a7f] bg-[#1a2744] hover:bg-[#243060]'
                    : 'border-[#1a2744] bg-[#0d1b2a] hover:border-[#2a4a7f] opacity-80'
                }`}
                title={owned ? item.name : `${item.name} — ${item.cost} tokens`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-mono text-[9px] text-[#7a9cc8] truncate w-full text-center">
                  {item.name}
                </span>
                {!owned && item.cost > 0 && (
                  <span className="font-mono text-[9px] text-yellow-400">{item.cost}🪙</span>
                )}
                {equipped && (
                  <span className="font-mono text-[8px] text-[#3d6db5]">equipped</span>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-[#3d6db5] text-xs font-mono text-center mt-3">
          clique fora para fechar
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/WardrobeModal.tsx
git commit -m "feat: wardrobe modal with hat/vehicle shop and equip UI"
```

---

## Task 7: Update HUD with wardrobe button, token counter, daily bonus toast

**Files:**
- Modify: `components/game/HUD.tsx`

- [ ] **Step 1: Add wardrobe button, token display, daily bonus toast, and import WardrobeModal**

Full updated file:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { ROOMS } from '@/lib/roomConfig'
import { ORB_COLORS } from '@/lib/orbColors'
import WardrobeModal from '@/components/ui/WardrobeModal'

const EMOTES = ['❤️', '✨', '😂', '🤔', '👋', '🎉']

export default function HUD() {
  const [chatInput, setChatInput] = useState('')
  const [showEmotes, setShowEmotes] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showWardrobe, setShowWardrobe] = useState(false)
  const [showDailyToast, setShowDailyToast] = useState(false)

  const sendChat    = useGameStore((s) => s.sendChat)
  const sendEmote   = useGameStore((s) => s.sendEmote)
  const playerColor = useGameStore((s) => s.playerColor)
  const setPlayerColor = useGameStore((s) => s.setPlayerColor)
  const currentRoom = useGameStore((s) => s.currentRoom)
  const changeRoom  = useGameStore((s) => s.changeRoom)
  const playerName  = useGameStore((s) => s.playerName)
  const tokens      = useGameStore((s) => s.tokens)
  const dailyBonusPending = useGameStore((s) => s.dailyBonusPending)
  const dismissDailyBonus = useGameStore((s) => s.dismissDailyBonus)

  useEffect(() => {
    if (dailyBonusPending > 0) {
      setShowDailyToast(true)
      const t = setTimeout(() => {
        setShowDailyToast(false)
        dismissDailyBonus()
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [dailyBonusPending, dismissDailyBonus])

  function handleSendChat() {
    if (!chatInput.trim()) return
    sendChat(chatInput.trim())
    setChatInput('')
    setShowEmotes(false)
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
      {/* Top bar */}
      <div className="pointer-events-none flex justify-between items-start pt-4 px-4">
        <div className="bg-[#111e38cc] border border-[#2a4a7f] rounded-full px-5 py-1.5 font-mono text-sm text-[#7a9cc8] backdrop-blur-sm">
          {ROOMS[currentRoom].emoji} {ROOMS[currentRoom].name}
          <span className="ml-3 text-[#3d6db5]">·</span>
          <span className="ml-3 text-[#5a7aa8] text-xs">{playerName}</span>
        </div>
        {/* Token counter */}
        <div className="pointer-events-none bg-[#111e38cc] border border-[#2a4a7f] rounded-full px-4 py-1.5 font-mono text-sm text-yellow-400 backdrop-blur-sm">
          💰 {tokens}
        </div>
      </div>

      {/* Daily bonus toast */}
      {showDailyToast && (
        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-black font-mono text-sm font-bold px-5 py-2 rounded-full shadow-lg animate-bounce">
          🎁 +{dailyBonusPending} tokens — login diário!
        </div>
      )}

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

      {/* Wardrobe modal */}
      {showWardrobe && <WardrobeModal onClose={() => setShowWardrobe(false)} />}

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

        {/* Wardrobe button */}
        <button
          onClick={() => { setShowWardrobe(true); setShowEmotes(false); setShowColors(false) }}
          className="bg-[#1a2744] border-2 border-[#2a4a7f] rounded-xl p-3 text-xl hover:bg-[#243060] transition-colors flex-shrink-0"
        >
          👕
        </button>

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
```

- [ ] **Step 2: Commit**

```bash
git add components/game/HUD.tsx
git commit -m "feat: add wardrobe button, token counter, and daily bonus toast to HUD"
```

---

## Task 8: Verify it builds

- [ ] **Step 1: Run build**

```bash
cd /Users/uemuradev/myProjects/vibeland && npm run build
```

Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 2: Fix any type errors if build fails, then commit fixes**

Common issues to watch:
- `HatId` / `VehicleId` import missing in any file
- `initPlayer` not called (should be in `Room.tsx` via `useEffect`)

- [ ] **Step 3: Final commit and push**

```bash
git push origin main
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Hats ✓, Vehicles ✓, Token economy ✓, Daily login ✓, Inventory ✓, Wardrobe UI ✓, Purchase flow ✓
- [x] **No TBDs or placeholders** — all code written in full
- [x] **Type consistency:** `HatId`/`VehicleId` defined in Task 1 and used consistently in Tasks 3, 4, 5, 6, 7
- [x] **localStorage isolation:** `tokenStore.ts` guards all localStorage calls with `typeof window === 'undefined'` for SSR safety
- [x] **Crown hides when hat equipped:** `{isPlayer && hat === 'none' && ...}` in ClaudeOrb
