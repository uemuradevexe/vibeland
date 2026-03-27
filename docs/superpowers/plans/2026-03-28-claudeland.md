# Claudeland Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Claudeland — jogo 2.5D estilo Club Penguin onde o jogador é uma orbe Claude que anda por salas temáticas, chata, usa emotes e customiza sua cor.

**Architecture:** Next.js App Router com canvas R3F usando câmera ortográfica fixa. Salas são cenas 2.5D com layers em Z. Estado global em Zustand. NPCs simulados localmente via useFrame. Bloom post-processing para o glow das orbes.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, zustand

---

## File Map

```
app/
  layout.tsx                  # root layout, html/body, tailwind
  page.tsx                    # tela de entrada (nome + cor)
  game/
    page.tsx                  # página do jogo (GameCanvas + HUD)

components/
  entry/
    NameColorPicker.tsx       # formulário de nome + seletor de cor
  game/
    GameCanvas.tsx            # <Canvas> R3F + câmera + luzes + postprocessing
    Room.tsx                  # switcher: renderiza sala atual do store
    ClaudeOrb.tsx             # orbe 3D (esfera + olhos + partículas + float)
    NPCManager.tsx            # cria e atualiza NPCs da sala atual
    GroundPlane.tsx           # plano invisível para click-to-walk
    Door.tsx                  # porta clicável que troca de sala
    ChatBubble.tsx            # balão de chat acima da orbe (Html drei)
    EmoteParticle.tsx         # emoji flutuante que some
    HUD.tsx                   # overlay DOM: chat input, emotes, cor, mapa
  rooms/
    PlazaRoom.tsx             # geometria da Praça Central
    CafeRoom.tsx              # geometria do Café do Contexto
    BeachRoom.tsx             # geometria da Praia dos Tokens
    LibraryRoom.tsx           # geometria da Biblioteca

store/
  gameStore.ts                # zustand store completo

lib/
  roomConfig.ts               # definição de salas (cores, portas, NPCs)
  npcPhrases.ts               # frases aleatórias por sala
  orbColors.ts                # 8 cores disponíveis para a orbe
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx` (placeholder)
- Create: `app/game/page.tsx` (placeholder)

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/uemuradev/myProjects/claudeland
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --yes
```

- [ ] **Step 2: Install 3D and state dependencies**

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing zustand
npm install -D @types/three
```

- [ ] **Step 3: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Claudeland',
  description: 'Club Penguin com Claudes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#0d1b2a] text-white overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Create placeholder `app/game/page.tsx`**

```tsx
export default function GamePage() {
  return <div className="w-screen h-screen bg-[#0d1b2a] flex items-center justify-center text-white">Carregando...</div>
}
```

- [ ] **Step 5: Create placeholder `app/page.tsx`**

```tsx
export default function Home() {
  return <div className="w-screen h-screen bg-[#0d1b2a] flex items-center justify-center text-white">Claudeland</div>
}
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: `http://localhost:3000` abre sem erros no console.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js + install R3F + zustand"
```

---

## Task 2: Lib Files (Config, Colors, Phrases)

**Files:**
- Create: `lib/orbColors.ts`
- Create: `lib/roomConfig.ts`
- Create: `lib/npcPhrases.ts`

- [ ] **Step 1: Create `lib/orbColors.ts`**

```typescript
export const ORB_COLORS = [
  { name: 'Laranja Claude', value: '#ea580c' },
  { name: 'Roxo', value: '#7c3aed' },
  { name: 'Verde', value: '#059669' },
  { name: 'Azul', value: '#0ea5e9' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Vermelho', value: '#dc2626' },
  { name: 'Ciano', value: '#06b6d4' },
] as const

export type OrbColor = typeof ORB_COLORS[number]['value']
```

- [ ] **Step 2: Create `lib/roomConfig.ts`**

```typescript
export type RoomId = 'plaza' | 'cafe' | 'beach' | 'library'

export interface Door {
  side: 'left' | 'right'
  leadsTo: RoomId
  label: string
  emoji: string
}

export interface RoomConfig {
  id: RoomId
  name: string
  emoji: string
  skyColor: string
  groundColor: string
  accentColor: string
  doors: Door[]
  npcCount: number
  npcColors: string[]
}

export const ROOMS: Record<RoomId, RoomConfig> = {
  plaza: {
    id: 'plaza',
    name: 'Praça Central',
    emoji: '🏔️',
    skyColor: '#0d1b2a',
    groundColor: '#1e3a6a',
    accentColor: '#3d6db5',
    doors: [
      { side: 'left', leadsTo: 'cafe', label: 'Café', emoji: '☕' },
      { side: 'right', leadsTo: 'beach', label: 'Praia', emoji: '🏖️' },
    ],
    npcCount: 3,
    npcColors: ['#7c3aed', '#059669', '#0ea5e9'],
  },
  cafe: {
    id: 'cafe',
    name: 'Café do Contexto',
    emoji: '☕',
    skyColor: '#1a0e05',
    groundColor: '#4a2e14',
    accentColor: '#92510a',
    doors: [
      { side: 'left', leadsTo: 'library', label: 'Biblioteca', emoji: '📚' },
      { side: 'right', leadsTo: 'plaza', label: 'Praça', emoji: '🏔️' },
    ],
    npcCount: 2,
    npcColors: ['#f59e0b', '#dc2626'],
  },
  beach: {
    id: 'beach',
    name: 'Praia dos Tokens',
    emoji: '🏖️',
    skyColor: '#0c2a4a',
    groundColor: '#8a6a20',
    accentColor: '#f0c060',
    doors: [
      { side: 'left', leadsTo: 'plaza', label: 'Praça', emoji: '🏔️' },
    ],
    npcCount: 2,
    npcColors: ['#f97316', '#06b6d4'],
  },
  library: {
    id: 'library',
    name: 'Biblioteca',
    emoji: '📚',
    skyColor: '#100820',
    groundColor: '#2a1a4e',
    accentColor: '#7c3aed',
    doors: [
      { side: 'right', leadsTo: 'cafe', label: 'Café', emoji: '☕' },
    ],
    npcCount: 2,
    npcColors: ['#8b5cf6', '#ec4899'],
  },
}
```

- [ ] **Step 3: Create `lib/npcPhrases.ts`**

```typescript
import type { RoomId } from './roomConfig'

export const NPC_PHRASES: Record<RoomId, string[]> = {
  plaza: [
    'Olá! Meu contexto está fresco hoje! 🧠',
    'Alguém sabe onde fica o café? ☕',
    'Tokenzando tranquilo por aqui...',
    'Meus pesos estão ótimos hoje ✨',
    'Boa tarde, humano! 👋',
    'Temperatura 0.7 — perfeito!',
  ],
  cafe: [
    'Este café tem 4096 tokens de aroma ☕',
    'Lendo o contexto... muito interessante!',
    'Claude novo deve sair logo 👀',
    'Temperatura 0.0 no café, por favor',
    'RLHF me deixou assim de bom humor!',
  ],
  beach: [
    'Os tokens estão quentes hoje! 🌊',
    'Surfando na onda do RLHF 🏄',
    'Janela de contexto infinita seria legal...',
    'Que embeddings finos nessa areia!',
    'RAG & relax 😎',
  ],
  library: [
    'Este livro tem 2M de tokens!',
    'Estudando RAG para a prova 📖',
    'Shhh... processando...',
    'Encontrei um bug nos pesos! 🐛',
    'Knowledge cutoff: agora mesmo.',
  ],
}

export function getRandomPhrase(roomId: RoomId): string {
  const phrases = NPC_PHRASES[roomId]
  return phrases[Math.floor(Math.random() * phrases.length)]
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/ && git commit -m "feat: add room config, orb colors, npc phrases"
```

---

## Task 3: Zustand Store

**Files:**
- Create: `store/gameStore.ts`

- [ ] **Step 1: Create `store/gameStore.ts`**

```typescript
import { create } from 'zustand'
import type { RoomId } from '@/lib/roomConfig'

export interface NPC {
  id: string
  color: string
  x: number
  targetX: number
  phrase: string | null
  phraseTimer: number   // seconds until phrase clears
  wanderTimer: number  // seconds until next wander target
}

export interface GameState {
  // Player
  playerName: string
  playerColor: string
  playerX: number
  playerTargetX: number
  playerChat: string | null
  playerChatTimer: number
  playerEmote: string | null
  playerEmoteTimer: number

  // World
  currentRoom: RoomId
  npcs: NPC[]

  // Actions
  setPlayer: (name: string, color: string) => void
  setPlayerColor: (color: string) => void
  setPlayerTargetX: (x: number) => void
  sendChat: (message: string) => void
  sendEmote: (emote: string) => void
  changeRoom: (room: RoomId) => void
  setNPCs: (npcs: NPC[]) => void
  tickGame: (delta: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  playerName: '',
  playerColor: '#ea580c',
  playerX: 0,
  playerTargetX: 0,
  playerChat: null,
  playerChatTimer: 0,
  playerEmote: null,
  playerEmoteTimer: 0,
  currentRoom: 'plaza',
  npcs: [],

  setPlayer: (name, color) => set({ playerName: name, playerColor: color }),
  setPlayerColor: (color) => set({ playerColor: color }),
  setPlayerTargetX: (x) => set({ playerTargetX: x }),

  sendChat: (message) => set({ playerChat: message, playerChatTimer: 4 }),
  sendEmote: (emote) => set({ playerEmote: emote, playerEmoteTimer: 2 }),

  changeRoom: (room) => set({
    currentRoom: room,
    playerX: 0,
    playerTargetX: 0,
    npcs: [],
    playerChat: null,
    playerEmote: null,
  }),

  setNPCs: (npcs) => set({ npcs }),

  tickGame: (delta) => set((state) => {
    // Move player toward target
    const dx = state.playerTargetX - state.playerX
    const newX = Math.abs(dx) < 0.05 ? state.playerTargetX : state.playerX + dx * Math.min(delta * 3, 1)

    // Tick player timers
    const playerChatTimer = Math.max(0, state.playerChatTimer - delta)
    const playerEmoteTimer = Math.max(0, state.playerEmoteTimer - delta)

    // Tick NPCs
    const npcs = state.npcs.map((npc) => {
      const ndx = npc.targetX - npc.x
      const nx = Math.abs(ndx) < 0.05 ? npc.targetX : npc.x + ndx * Math.min(delta * 2, 1)

      const phraseTimer = Math.max(0, npc.phraseTimer - delta)
      let wanderTimer = npc.wanderTimer - delta
      let targetX = npc.targetX
      let phrase = phraseTimer > 0 ? npc.phrase : null

      if (wanderTimer <= 0) {
        targetX = (Math.random() - 0.5) * 14  // -7 to 7
        wanderTimer = 4 + Math.random() * 6   // 4-10s
        // Sometimes say a phrase when arriving
        if (Math.random() < 0.4) {
          phrase = null // will be set by NPCManager
        }
      }

      return { ...npc, x: nx, targetX, phraseTimer, wanderTimer, phrase }
    })

    return {
      playerX: newX,
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
git add store/ && git commit -m "feat: zustand game store with player, npcs, tick logic"
```

---

## Task 4: Entry Screen

**Files:**
- Create: `components/entry/NameColorPicker.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/entry/NameColorPicker.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { ORB_COLORS } from '@/lib/orbColors'

export default function NameColorPicker() {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#ea580c')
  const setPlayer = useGameStore((s) => s.setPlayer)
  const router = useRouter()

  function handleEnter() {
    const finalName = name.trim() || `claude_${Math.floor(Math.random() * 9999)}`
    setPlayer(finalName, selectedColor)
    router.push('/game')
  }

  return (
    <div className="w-screen h-screen bg-[#0d1b2a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 p-10 bg-[#1a2744] border-2 border-[#2a4a7f] rounded-xl w-80">
        {/* Orb preview */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center relative"
          style={{
            backgroundColor: selectedColor,
            boxShadow: `0 0 24px ${selectedColor}, 0 0 48px ${selectedColor}88`,
          }}
        >
          <div className="absolute flex gap-3 top-6">
            <div className="w-3 h-3 rounded-full bg-[#1a0a00]" />
            <div className="w-3 h-3 rounded-full bg-[#1a0a00]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Claudeland</h1>

        {/* Name input */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs text-[#7a9cc8] font-mono uppercase tracking-widest">Seu nome</label>
          <input
            className="w-full bg-[#0d1b2a] border-2 border-[#2a4a7f] rounded-lg px-4 py-2 text-white font-mono text-sm outline-none focus:border-[#3d6db5]"
            placeholder="claude_..."
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
          />
        </div>

        {/* Color picker */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs text-[#7a9cc8] font-mono uppercase tracking-widest">Cor da orbe</label>
          <div className="grid grid-cols-4 gap-2">
            {ORB_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(c.value)}
                className="w-full aspect-square rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c.value,
                  borderColor: selectedColor === c.value ? 'white' : 'transparent',
                  boxShadow: selectedColor === c.value ? `0 0 10px ${c.value}` : 'none',
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          className="w-full py-3 rounded-lg font-mono font-bold text-sm tracking-widest transition-all bg-[#ea580c] hover:bg-[#f97316] text-white"
          style={{ boxShadow: `0 0 16px #ea580c88` }}
        >
          ENTRAR ✦
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
import NameColorPicker from '@/components/entry/NameColorPicker'

export default function Home() {
  return <NameColorPicker />
}
```

- [ ] **Step 3: Verify**

```bash
# dev server deve estar rodando
# Abrir http://localhost:3000
# Deve aparecer o picker com orbe preview, input de nome, grid de cores, botão entrar
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/entry/ && git commit -m "feat: entry screen with name input and color picker"
```

---

## Task 5: Game Canvas (R3F + Câmera + Postprocessing)

**Files:**
- Create: `components/game/GameCanvas.tsx`
- Modify: `app/game/page.tsx`

- [ ] **Step 1: Create `components/game/GameCanvas.tsx`**

```tsx
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
        shadows
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
```

- [ ] **Step 2: Update `app/game/page.tsx`**

```tsx
import GameCanvas from '@/components/game/GameCanvas'

export default function GamePage() {
  return <GameCanvas />
}
```

- [ ] **Step 3: Verify canvas renders**

Abrir `http://localhost:3000/game` — deve mostrar tela escura sem erros no console.

- [ ] **Step 4: Commit**

```bash
git add app/game/page.tsx components/game/GameCanvas.tsx && git commit -m "feat: R3F canvas with orthographic camera and bloom"
```

---

## Task 6: Claude Orb Component

**Files:**
- Create: `components/game/ClaudeOrb.tsx`

- [ ] **Step 1: Create `components/game/ClaudeOrb.tsx`**

Note: all child positions are in **local space** — the group already handles `x` and `y`. Do NOT add `y` to child positions.

```tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface ClaudeOrbProps {
  x: number
  y?: number
  color: string
  name: string
  chat?: string | null
  emote?: string | null
  isPlayer?: boolean
}

export default function ClaudeOrb({ x, y = 0, color, name, chat, emote, isPlayer }: ClaudeOrbProps) {
  const groupRef = useRef<THREE.Group>(null)
  const floatOffset = useRef(Math.random() * Math.PI * 2)

  // Animate the whole group so eyes + particles + labels all float together
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.position.y = y + Math.sin(clock.elapsedTime * 1.5 + floatOffset.current) * 0.12
  })

  const radius = isPlayer ? 0.45 : 0.38

  return (
    <group ref={groupRef} position={[x, y, 0]}>
      {/* Glow outer sphere */}
      <Sphere args={[radius * 1.6, 16, 16]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </Sphere>

      {/* Main orb */}
      <Sphere args={[radius, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isPlayer ? 2.5 : 2}
          toneMapped={false}
        />
      </Sphere>

      {/* Eyes — local coords (0,0,0 = orb center) */}
      <Sphere args={[0.06, 8, 8]} position={[-0.13, 0.08, radius * 0.9]}>
        <meshStandardMaterial color="#1a0a00" />
      </Sphere>
      <Sphere args={[0.06, 8, 8]} position={[0.13, 0.08, radius * 0.9]}>
        <meshStandardMaterial color="#1a0a00" />
      </Sphere>

      {/* Floating particles */}
      {(
        [[-0.5, 0.5, 0.1], [0.55, 0.2, 0.05], [-0.3, -0.4, 0.08]] as [number, number, number][]
      ).map(([px, py, pz], i) => (
        <Sphere key={i} args={[0.05, 6, 6]} position={[px, py, pz]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
        </Sphere>
      ))}

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -radius - 0.05, 0]}>
        <ellipseGeometry args={[radius * 0.8, radius * 0.4, 16]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

      {/* Name tag */}
      <Html
        position={[0, -radius - 0.35, 0]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            background: isPlayer ? '#1e3a8a' : '#1a2744',
            border: `1px solid ${isPlayer ? '#3d6db5' : '#2a3a5a'}`,
            borderRadius: 4,
            padding: '1px 7px',
            fontSize: 10,
            color: 'white',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
        >
          {isPlayer ? `${name} ✦` : name}
        </div>
      </Html>

      {/* Chat bubble */}
      {chat && (
        <Html position={[0, radius + 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'white',
              color: '#1a1a2e',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              maxWidth: 180,
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {chat}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '7px solid white',
              }}
            />
          </div>
        </Html>
      )}

      {/* Emote */}
      {emote && (
        <Html position={[0.5, radius + 0.3, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ fontSize: 20, animation: 'floatUp 2s ease-out forwards' }}>
            {emote}
          </div>
        </Html>
      )}
    </group>
  )
}
```

- [ ] **Step 2: Add global CSS animation to `app/globals.css`** (append after existing styles)

```css
@keyframes floatUp {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
}
```

- [ ] **Step 3: Commit**

```bash
git add components/game/ClaudeOrb.tsx app/globals.css && git commit -m "feat: ClaudeOrb component with glow, eyes, chat bubble, emote"
```

---

## Task 7: Ground Plane (Click-to-Walk)

**Files:**
- Create: `components/game/GroundPlane.tsx`

- [ ] **Step 1: Create `components/game/GroundPlane.tsx`**

```tsx
'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

// Invisible plane the player clicks to walk
export default function GroundPlane() {
  const planeRef = useRef<THREE.Mesh>(null)
  const setPlayerTargetX = useGameStore((s) => s.setPlayerTargetX)

  function handleClick(e: { point: THREE.Vector3; stopPropagation: () => void }) {
    e.stopPropagation()
    // Clamp to room bounds (-8 to 8)
    const targetX = Math.max(-8, Math.min(8, e.point.x))
    setPlayerTargetX(targetX)
  }

  return (
    <mesh
      ref={planeRef}
      position={[0, -1.2, 0]}
      rotation={[0, 0, 0]}
      onClick={handleClick}
    >
      <planeGeometry args={[20, 2]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/GroundPlane.tsx && git commit -m "feat: invisible ground plane for click-to-walk"
```

---

## Task 8: Door Component

**Files:**
- Create: `components/game/Door.tsx`

- [ ] **Step 1: Create `components/game/Door.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'
import type { Door as DoorConfig } from '@/lib/roomConfig'

interface DoorProps {
  config: DoorConfig
  accentColor: string
}

export default function Door({ config, accentColor }: DoorProps) {
  const [hovered, setHovered] = useState(false)
  const changeRoom = useGameStore((s) => s.changeRoom)
  const x = config.side === 'left' ? -9.5 : 9.5

  return (
    <group position={[x, -0.5, 0.2]}>
      {/* Door frame */}
      <mesh
        onClick={() => changeRoom(config.leadsTo)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[1.2, 2.4, 0.1]} />
        <meshStandardMaterial
          color={hovered ? accentColor : '#0a1525'}
          emissive={hovered ? accentColor : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      {/* Door label */}
      <Html position={[0, 1.6, 0.1]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          fontSize: 20,
          filter: hovered ? 'drop-shadow(0 0 6px white)' : 'none',
          transition: 'filter 0.2s',
          cursor: 'pointer',
        }}>
          {config.emoji}
        </div>
      </Html>
      <Html position={[0, -1.4, 0.1]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: '#7a9cc8',
          fontSize: 9,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          {config.label}
        </div>
      </Html>
    </group>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/Door.tsx && git commit -m "feat: door component with hover + room change"
```

---

## Task 9: NPC Manager

**Files:**
- Create: `components/game/NPCManager.tsx`

- [ ] **Step 1: Create `components/game/NPCManager.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/store/gameStore'
import { ROOMS } from '@/lib/roomConfig'
import { getRandomPhrase } from '@/lib/npcPhrases'
import ClaudeOrb from './ClaudeOrb'
import type { NPC } from '@/store/gameStore'

export default function NPCManager() {
  const currentRoom = useGameStore((s) => s.currentRoom)
  const npcs = useGameStore((s) => s.npcs)
  const setNPCs = useGameStore((s) => s.setNPCs)
  const tickGame = useGameStore((s) => s.tickGame)
  const initialized = useRef(false)

  // Initialize NPCs when room changes
  useEffect(() => {
    const room = ROOMS[currentRoom]
    const newNpcs: NPC[] = room.npcColors.slice(0, room.npcCount).map((color, i) => ({
      id: `npc_${currentRoom}_${i}`,
      color,
      x: (i - Math.floor(room.npcCount / 2)) * 3,
      targetX: (i - Math.floor(room.npcCount / 2)) * 3,
      phrase: null,
      phraseTimer: 0,
      wanderTimer: Math.random() * 3,
    }))
    setNPCs(newNpcs)
    initialized.current = true
  }, [currentRoom, setNPCs])

  // Phrase timer — periodically give NPCs a phrase
  useEffect(() => {
    const interval = setInterval(() => {
      const store = useGameStore.getState()
      const updatedNpcs = store.npcs.map((npc) => {
        if (Math.random() < 0.3) {
          return { ...npc, phrase: getRandomPhrase(store.currentRoom), phraseTimer: 4 }
        }
        return npc
      })
      setNPCs(updatedNpcs)
    }, 5000)
    return () => clearInterval(interval)
  }, [setNPCs])

  // Game tick
  useFrame((_, delta) => {
    tickGame(Math.min(delta, 0.1))
  })

  return (
    <>
      {npcs.map((npc, i) => (
        <ClaudeOrb
          key={npc.id}
          x={npc.x}
          y={-1.2}
          color={npc.color}
          name={`npc_00${i + 1}`}
          chat={npc.phrase}
        />
      ))}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/NPCManager.tsx && git commit -m "feat: NPC manager with wander + random phrases"
```

---

## Task 10: Plaza Room

**Files:**
- Create: `components/rooms/PlazaRoom.tsx`

- [ ] **Step 1: Create `components/rooms/PlazaRoom.tsx`**

```tsx
'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.plaza

export default function PlazaRoom() {
  return (
    <>
      {/* Sky */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={room.skyColor} />
      </mesh>

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.sin(i * 2.3) * 12),
            (Math.cos(i * 1.7) * 4) + 4,
            -7.5,
          ]}
        >
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshStandardMaterial color="#c8d8f0" emissive="#c8d8f0" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}

      {/* Moon */}
      <mesh position={[6, 7, -7]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#f0e6c8" emissive="#f0e6c8" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>

      {/* Background buildings */}
      {[
        [-6, 2, -5, 1.4, 4],
        [-3.5, 1.5, -5, 1, 3],
        [4, 2.5, -5, 1.2, 5],
        [7, 1.8, -5, 1.6, 3.6],
      ].map(([bx, by, bz, bw, bh], i) => (
        <mesh key={i} position={[bx, by - 1, bz]}>
          <boxGeometry args={[bw, bh, 0.2]} />
          <meshStandardMaterial color="#243560" />
        </mesh>
      ))}

      {/* Windows on buildings */}
      {[
        [-6.2, 2.5, -4.8], [-5.8, 2.5, -4.8],
        [-6.2, 1.5, -4.8], [-5.8, 1.5, -4.8],
        [3.8, 3, -4.8], [4.2, 3, -4.8],
        [7.2, 2.2, -4.8], [6.8, 2.2, -4.8],
      ].map(([wx, wy, wz], i) => (
        <mesh key={i} position={[wx, wy, wz]}>
          <boxGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#f0c84a' : '#1a2744'}
            emissive={i % 3 === 0 ? '#f0c84a' : '#000'}
            emissiveIntensity={i % 3 === 0 ? 0.8 : 0}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Ground */}
      <mesh position={[0, -2, -1]}>
        <boxGeometry args={[22, 0.3, 4]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Ground top surface accent */}
      <mesh position={[0, -1.84, 0.5]}>
        <boxGeometry args={[22, 0.05, 0.1]} />
        <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>

      {/* Lamp posts */}
      {[-4, 4].map((lx) => (
        <group key={lx} position={[lx, -1.85, 0.3]}>
          {/* pole */}
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.08, 2.4, 0.08]} />
            <meshStandardMaterial color="#2a3a5a" />
          </mesh>
          {/* arm */}
          <mesh position={[0.3, 2.35, 0]}>
            <boxGeometry args={[0.6, 0.06, 0.06]} />
            <meshStandardMaterial color="#2a3a5a" />
          </mesh>
          {/* light bulb */}
          <mesh position={[0.6, 2.3, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#f0e06a" emissive="#f0e06a" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight position={[0.6, 2.3, 0.5]} color="#f0e06a" intensity={0.8} distance={4} />
        </group>
      ))}

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}

      {/* Walkable ground plane */}
      <GroundPlane />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/rooms/PlazaRoom.tsx && git commit -m "feat: Plaza room with sky, buildings, lamps, doors"
```

---

## Task 11: Player in Room + Room Switcher

**Files:**
- Create: `components/game/Room.tsx`

- [ ] **Step 1: Create `components/game/Room.tsx`**

```tsx
'use client'

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
  const currentRoom = useGameStore((s) => s.currentRoom)
  const playerX = useGameStore((s) => s.playerX)
  const playerColor = useGameStore((s) => s.playerColor)
  const playerName = useGameStore((s) => s.playerName)
  const playerChat = useGameStore((s) => s.playerChat)
  const playerEmote = useGameStore((s) => s.playerEmote)

  const RoomComponent = ROOM_COMPONENTS[currentRoom]

  return (
    <>
      <RoomComponent />
      <NPCManager />
      <ClaudeOrb
        x={playerX}
        y={-1.2}
        color={playerColor}
        name={playerName || 'você'}
        chat={playerChat}
        emote={playerEmote}
        isPlayer
      />
    </>
  )
}
```

- [ ] **Step 2: Create stub rooms (will be finished in Task 13)**

Create `components/rooms/CafeRoom.tsx`:
```tsx
'use client'
import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'
const room = ROOMS.cafe
export default function CafeRoom() {
  return (
    <>
      <mesh position={[0, 4, -8]}><planeGeometry args={[30, 20]} /><meshStandardMaterial color={room.skyColor} /></mesh>
      <mesh position={[0, -2, -1]}><boxGeometry args={[22, 0.3, 4]} /><meshStandardMaterial color={room.groundColor} /></mesh>
      {room.doors.map((door) => <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />)}
      <GroundPlane />
    </>
  )
}
```

Create `components/rooms/BeachRoom.tsx`:
```tsx
'use client'
import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'
const room = ROOMS.beach
export default function BeachRoom() {
  return (
    <>
      <mesh position={[0, 4, -8]}><planeGeometry args={[30, 20]} /><meshStandardMaterial color={room.skyColor} /></mesh>
      <mesh position={[0, -2, -1]}><boxGeometry args={[22, 0.3, 4]} /><meshStandardMaterial color={room.groundColor} /></mesh>
      {room.doors.map((door) => <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />)}
      <GroundPlane />
    </>
  )
}
```

Create `components/rooms/LibraryRoom.tsx`:
```tsx
'use client'
import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'
const room = ROOMS.library
export default function LibraryRoom() {
  return (
    <>
      <mesh position={[0, 4, -8]}><planeGeometry args={[30, 20]} /><meshStandardMaterial color={room.skyColor} /></mesh>
      <mesh position={[0, -2, -1]}><boxGeometry args={[22, 0.3, 4]} /><meshStandardMaterial color={room.groundColor} /></mesh>
      {room.doors.map((door) => <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />)}
      <GroundPlane />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/game/Room.tsx components/rooms/ && git commit -m "feat: Room switcher + player orb in scene + stub rooms"
```

---

## Task 12: HUD Overlay

**Files:**
- Create: `components/game/HUD.tsx`

- [ ] **Step 1: Create `components/game/HUD.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { ROOMS } from '@/lib/roomConfig'
import { ORB_COLORS } from '@/lib/orbColors'

const EMOTES = ['❤️', '✨', '😂', '🤔', '👋', '🎉']

export default function HUD() {
  const [chatInput, setChatInput] = useState('')
  const [showEmotes, setShowEmotes] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const sendChat = useGameStore((s) => s.sendChat)
  const sendEmote = useGameStore((s) => s.sendEmote)
  const playerColor = useGameStore((s) => s.playerColor)
  const setPlayerColor = useGameStore((s) => s.setPlayerColor)
  const currentRoom = useGameStore((s) => s.currentRoom)
  const changeRoom = useGameStore((s) => s.changeRoom)
  const playerName = useGameStore((s) => s.playerName)

  function handleSendChat() {
    if (!chatInput.trim()) return
    sendChat(chatInput.trim())
    setChatInput('')
    setShowEmotes(false)
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
      {/* Top bar: room name */}
      <div className="pointer-events-none flex justify-center pt-4">
        <div className="bg-[#111e38cc] border border-[#2a4a7f] rounded-full px-5 py-1.5 font-mono text-sm text-[#7a9cc8] backdrop-blur-sm">
          {ROOMS[currentRoom].emoji} {ROOMS[currentRoom].name}
          <span className="ml-3 text-[#3d6db5]">·</span>
          <span className="ml-3 text-[#5a7aa8] text-xs">{playerName}</span>
        </div>
      </div>

      {/* Map overlay */}
      {showMap && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowMap(false)}>
          <div className="bg-[#111e38] border-2 border-[#2a4a7f] rounded-xl p-6 min-w-64" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-mono font-bold text-center mb-4 text-[#7a9cc8]">🗺️ Mapa</h2>
            <div className="flex flex-col gap-2">
              {(Object.values(ROOMS)).map((room) => (
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
git add components/game/HUD.tsx && git commit -m "feat: HUD with chat, emotes, color picker, map"
```

---

## Task 13: Detailed Rooms (Café, Praia, Biblioteca)

**Files:**
- Modify: `components/rooms/CafeRoom.tsx`
- Modify: `components/rooms/BeachRoom.tsx`
- Modify: `components/rooms/LibraryRoom.tsx`

- [ ] **Step 1: Replace `components/rooms/CafeRoom.tsx`**

```tsx
'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.cafe

export default function CafeRoom() {
  return (
    <>
      {/* Sky — warm dark brown */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={room.skyColor} />
      </mesh>

      {/* Cafe window glow on background */}
      <mesh position={[-3, 2, -6]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#f0c060" emissive="#f0c060" emissiveIntensity={0.15} toneMapped={false} />
      </mesh>
      <mesh position={[3, 2, -6]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#f0c060" emissive="#f0c060" emissiveIntensity={0.12} toneMapped={false} />
      </mesh>

      {/* Ground — wooden floor */}
      <mesh position={[0, -2, -1]}>
        <boxGeometry args={[22, 0.3, 4]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Ground accent */}
      <mesh position={[0, -1.84, 0.5]}>
        <boxGeometry args={[22, 0.05, 0.1]} />
        <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={0.3} toneMapped={false} />
      </mesh>

      {/* Tables */}
      {[-4, 0, 4].map((tx) => (
        <group key={tx} position={[tx, -1.85, 0.5]}>
          {/* Table top */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.6, 0.08, 0.8]} />
            <meshStandardMaterial color="#6b3a1f" />
          </mesh>
          {/* Table leg */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color="#4a2a12" />
          </mesh>
          {/* Coffee cup */}
          <mesh position={[0.3, 0.6, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.18, 8]} />
            <meshStandardMaterial color="#f0c060" emissive="#f0c060" emissiveIntensity={0.2} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Warm ceiling lights */}
      {[-5, 0, 5].map((lx) => (
        <group key={lx} position={[lx, 2.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#f0c060" emissive="#f0c060" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight color="#f0c060" intensity={0.6} distance={5} />
        </group>
      ))}

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
```

- [ ] **Step 2: Replace `components/rooms/BeachRoom.tsx`**

```tsx
'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.beach

export default function BeachRoom() {
  return (
    <>
      {/* Sky — deep ocean blue */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={room.skyColor} />
      </mesh>

      {/* Stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 3.1) * 11, Math.cos(i * 2.1) * 3 + 5, -7.5]}>
          <sphereGeometry args={[0.035, 4, 4]} />
          <meshStandardMaterial color="#c8e0f0" emissive="#c8e0f0" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}

      {/* Moon */}
      <mesh position={[-5, 7, -7]}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#f0e6c8" emissive="#f0e6c8" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>

      {/* Ocean waves background */}
      <mesh position={[0, 0, -4]}>
        <planeGeometry args={[25, 4]} />
        <meshStandardMaterial color="#0a3a6a" />
      </mesh>
      <mesh position={[0, -0.5, -3.5]}>
        <planeGeometry args={[25, 0.15]} />
        <meshStandardMaterial color="#1a6aaa" emissive="#1a6aaa" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>

      {/* Sand ground */}
      <mesh position={[0, -2, -1]}>
        <boxGeometry args={[22, 0.3, 5]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Sand accent line */}
      <mesh position={[0, -1.84, 0.5]}>
        <boxGeometry args={[22, 0.04, 0.1]} />
        <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Palm trees */}
      {[-7, 7].map((tx) => (
        <group key={tx} position={[tx, -1.85, 0.5]}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 3, 8]} />
            <meshStandardMaterial color="#6b4a1f" />
          </mesh>
          {/* Leaves */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.8,
                3.2,
                Math.sin((angle * Math.PI) / 180) * 0.3,
              ]}
              rotation={[0.4, (angle * Math.PI) / 180, 0]}
            >
              <boxGeometry args={[1.4, 0.06, 0.3]} />
              <meshStandardMaterial color="#1a6a2a" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Token coins in sand */}
      {[-3, 0, 3].map((cx) => (
        <mesh key={cx} position={[cx, -1.82, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 12]} />
          <meshStandardMaterial color="#f0c840" emissive="#f0c840" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      ))}

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
```

- [ ] **Step 3: Replace `components/rooms/LibraryRoom.tsx`**

```tsx
'use client'

import { ROOMS } from '@/lib/roomConfig'
import Door from '@/components/game/Door'
import GroundPlane from '@/components/game/GroundPlane'

const room = ROOMS.library

export default function LibraryRoom() {
  return (
    <>
      {/* Sky — deep purple/navy */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={room.skyColor} />
      </mesh>

      {/* Ground */}
      <mesh position={[0, -2, -1]}>
        <boxGeometry args={[22, 0.3, 4]} />
        <meshStandardMaterial color={room.groundColor} />
      </mesh>

      {/* Ground accent */}
      <mesh position={[0, -1.84, 0.5]}>
        <boxGeometry args={[22, 0.05, 0.1]} />
        <meshStandardMaterial color={room.accentColor} emissive={room.accentColor} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>

      {/* Bookshelves */}
      {[-7, -3.5, 3.5, 7].map((sx) => (
        <group key={sx} position={[sx, -0.5, -2]}>
          {/* Shelf frame */}
          <mesh>
            <boxGeometry args={[2.5, 5, 0.3]} />
            <meshStandardMaterial color="#2a1a4e" />
          </mesh>
          {/* Colorful books */}
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <mesh
                key={`${row}-${col}`}
                position={[col * 0.42 - 0.85, row * 1.0 - 1.8, 0.2]}
              >
                <boxGeometry args={[0.35, 0.85, 0.2]} />
                <meshStandardMaterial
                  color={['#7c3aed', '#ec4899', '#0ea5e9', '#059669', '#f59e0b'][(row * 5 + col) % 5]}
                  emissive={['#7c3aed', '#ec4899', '#0ea5e9', '#059669', '#f59e0b'][(row * 5 + col) % 5]}
                  emissiveIntensity={0.2}
                  toneMapped={false}
                />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* Reading desk */}
      <group position={[0, -1.85, 0.5]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[3, 0.1, 1]} />
          <meshStandardMaterial color="#3d2a6b" />
        </mesh>
        <mesh position={[-0.7, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#2a1a4e" />
        </mesh>
        <mesh position={[0.7, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#2a1a4e" />
        </mesh>
        {/* Glowing book on desk */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.9]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.2, 0.5]} color="#8b5cf6" intensity={0.6} distance={4} />
      </group>

      {/* Ceiling lights (candles style) */}
      {[-5, 0, 5].map((lx) => (
        <group key={lx} position={[lx, 2.5, 0.5]}>
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight color="#ec4899" intensity={0.4} distance={4} />
        </group>
      ))}

      {/* Doors */}
      {room.doors.map((door) => (
        <Door key={door.leadsTo} config={door} accentColor={room.accentColor} />
      ))}
      <GroundPlane />
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/rooms/ && git commit -m "feat: detailed Cafe, Beach, Library rooms with props and decorations"
```

---

## Task 14: Guard Route + Final Wiring

**Files:**
- Modify: `app/game/page.tsx` (redirect if no player name)

- [ ] **Step 1: Add redirect guard to `app/game/page.tsx`**

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import GameCanvas from '@/components/game/GameCanvas'

export default function GamePage() {
  const playerName = useGameStore((s) => s.playerName)
  const router = useRouter()

  useEffect(() => {
    if (!playerName) router.replace('/')
  }, [playerName, router])

  if (!playerName) return null

  return <GameCanvas />
}
```

- [ ] **Step 2: Final smoke test**

```bash
# 1. Abrir http://localhost:3000
# - Entry screen aparece com picker de nome e cor
# - Selecionar cor, digitar nome, clicar ENTRAR
# 2. Jogo carrega
# - Canvas 3D aparece com Praça Central
# - Claude orbe laranja aparece no centro flutuando
# - NPCs aparecem nas laterais
# 3. Click no chão → orbe se move suavemente
# 4. Digitar no chat → balão aparece acima da orbe por 4s
# 5. Clicar emoji → reação flutua e some
# 6. Clicar bolinha laranja no HUD → color picker abre, trocar cor
# 7. Clicar porta esquerda → vai para Café
# 8. Clicar porta direita → vai para Praia
# 9. Explorar Biblioteca via Café
# 10. Mapa (🗺️) → teleporte direto entre salas
```

- [ ] **Step 3: Final commit**

```bash
git add -A && git commit -m "feat: Claudeland complete — 2.5D game with 4 rooms, chat, emotes, NPCs"
```
