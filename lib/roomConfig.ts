import type { Collider } from './collision'

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
  colliders: Collider[]
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
    npcCount: 5,
    npcColors: ['#7c3aed', '#059669', '#0ea5e9', '#f59e0b', '#ec4899'],
    colliders: [
      // Fountain (cylinder radius ~2.3)
      { cx: 0, cz: 0, hw: 2.5, hd: 2.5 },
      // Mid-distance buildings — bw/2 + 0.3 padding
      { cx: -13, cz: -10, hw: 2.3, hd: 2.3 },
      { cx: -13, cz:  10, hw: 1.8, hd: 1.8 },
      { cx:  13, cz: -10, hw: 1.8, hd: 1.8 },
      { cx:  13, cz:  10, hw: 2.3, hd: 2.3 },
      { cx:  -8, cz: -16, hw: 1.8, hd: 1.8 },
      { cx:   8, cz: -16, hw: 2.3, hd: 2.3 },
      { cx:  -8, cz:  16, hw: 2.3, hd: 2.3 },
      { cx:   8, cz:  16, hw: 1.8, hd: 1.8 },
      // Trees
      { cx:  -7, cz:  -7, hw: 0.5, hd: 0.5 },
      { cx:   7, cz:  -7, hw: 0.5, hd: 0.5 },
      { cx:  -7, cz:   7, hw: 0.5, hd: 0.5 },
      { cx:   7, cz:   7, hw: 0.5, hd: 0.5 },
      { cx: -12, cz:   0, hw: 0.5, hd: 0.5 },
      { cx:  12, cz:   0, hw: 0.5, hd: 0.5 },
      { cx:   0, cz: -12, hw: 0.5, hd: 0.5 },
      { cx:   0, cz:  12, hw: 0.5, hd: 0.5 },
    ],
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
    npcCount: 4,
    npcColors: ['#f59e0b', '#dc2626', '#f97316', '#a855f7'],
    colliders: [
      // Counter (16 wide, 2 deep, centred at z=-14)
      { cx: 0, cz: -14, hw: 8.2, hd: 1.2 },
      // Sofa corner
      { cx: 12, cz: -8, hw: 2.3, hd: 1.1 },
      // Tables (cylinder radius 0.65)
      { cx: -6, cz: -6, hw: 0.8, hd: 0.8 },
      { cx: -2, cz: -6, hw: 0.8, hd: 0.8 },
      { cx:  2, cz: -6, hw: 0.8, hd: 0.8 },
      { cx:  6, cz: -6, hw: 0.8, hd: 0.8 },
      { cx: -6, cz: -1, hw: 0.8, hd: 0.8 },
      { cx: -2, cz: -1, hw: 0.8, hd: 0.8 },
      { cx:  2, cz: -1, hw: 0.8, hd: 0.8 },
      { cx:  6, cz: -1, hw: 0.8, hd: 0.8 },
      { cx: -6, cz:  5, hw: 0.8, hd: 0.8 },
      { cx: -2, cz:  5, hw: 0.8, hd: 0.8 },
      { cx:  2, cz:  5, hw: 0.8, hd: 0.8 },
      { cx:  6, cz:  5, hw: 0.8, hd: 0.8 },
    ],
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
    npcCount: 4,
    npcColors: ['#f97316', '#06b6d4', '#84cc16', '#f43f5e'],
    colliders: [
      // Ocean wall — blocks everything north of z=-6
      { cx: 0, cz: -18, hw: 20, hd: 12 },
      // Palm trees (trunk radius ~0.2)
      { cx: -10, cz:  -2, hw: 0.45, hd: 0.45 },
      { cx:  10, cz:   2, hw: 0.45, hd: 0.45 },
      { cx:  -7, cz:   7, hw: 0.45, hd: 0.45 },
      { cx:   7, cz:  -4, hw: 0.45, hd: 0.45 },
      { cx: -14, cz:   6, hw: 0.45, hd: 0.45 },
      { cx:  14, cz:   0, hw: 0.45, hd: 0.45 },
      { cx:  -4, cz:  10, hw: 0.45, hd: 0.45 },
      { cx:   4, cz:  12, hw: 0.45, hd: 0.45 },
    ],
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
    npcCount: 4,
    npcColors: ['#8b5cf6', '#ec4899', '#0ea5e9', '#10b981'],
    colliders: [
      // Reading desks (3.0 wide × 1.6 deep)
      { cx: -4, cz: -3, hw: 1.6, hd: 0.9 },
      { cx:  4, cz: -3, hw: 1.6, hd: 0.9 },
      { cx:  0, cz:  4, hw: 1.6, hd: 0.9 },
      // Spiral staircase (~1.4 radius)
      { cx: 13, cz: -12, hw: 1.6, hd: 1.6 },
      // Reading nooks (low table + seat)
      { cx: -14, cz: 12, hw: 1.4, hd: 0.8 },
      { cx:  14, cz: 12, hw: 1.4, hd: 0.8 },
      // Back-wall bookshelf row (blocks z ≤ -16)
      { cx: 0, cz: -17.5, hw: 16, hd: 0.8 },
      // Left-wall bookshelf row (blocks x ≤ -16)
      { cx: -17.5, cz: 0, hw: 0.8, hd: 16 },
    ],
  },
}
