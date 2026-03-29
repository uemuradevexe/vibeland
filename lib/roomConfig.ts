import type { Collider } from './collision'

export type RoomId = 'plaza' | 'cafe' | 'beach' | 'library' | 'arcade' | 'garden' | 'rooftop' | 'dungeon' | 'space'

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
      { side: 'left',  leadsTo: 'cafe',  label: 'Café',  emoji: '☕' },
      { side: 'right', leadsTo: 'beach', label: 'Praia', emoji: '🏖️' },
    ],
    npcCount: 5,
    npcColors: ['#7c3aed', '#059669', '#0ea5e9', '#f59e0b', '#ec4899'],
    colliders: [
      { cx: 0, cz: 0, hw: 2.5, hd: 2.5 },
      { cx: -13, cz: -10, hw: 2.3, hd: 2.3 },
      { cx: -13, cz:  10, hw: 1.8, hd: 1.8 },
      { cx:  13, cz: -10, hw: 1.8, hd: 1.8 },
      { cx:  13, cz:  10, hw: 2.3, hd: 2.3 },
      { cx:  -8, cz: -16, hw: 1.8, hd: 1.8 },
      { cx:   8, cz: -16, hw: 2.3, hd: 2.3 },
      { cx:  -8, cz:  16, hw: 2.3, hd: 2.3 },
      { cx:   8, cz:  16, hw: 1.8, hd: 1.8 },
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
      { side: 'left',  leadsTo: 'library', label: 'Biblioteca', emoji: '📚' },
      { side: 'right', leadsTo: 'plaza',   label: 'Praça',      emoji: '🏔️' },
    ],
    npcCount: 4,
    npcColors: ['#f59e0b', '#dc2626', '#f97316', '#a855f7'],
    colliders: [
      { cx: 0,   cz: -14, hw: 8.2, hd: 1.2 },
      { cx: 12,  cz:  -8, hw: 2.3, hd: 1.1 },
      { cx: -6,  cz:  -6, hw: 0.8, hd: 0.8 },
      { cx: -2,  cz:  -6, hw: 0.8, hd: 0.8 },
      { cx:  2,  cz:  -6, hw: 0.8, hd: 0.8 },
      { cx:  6,  cz:  -6, hw: 0.8, hd: 0.8 },
      { cx: -6,  cz:  -1, hw: 0.8, hd: 0.8 },
      { cx: -2,  cz:  -1, hw: 0.8, hd: 0.8 },
      { cx:  2,  cz:  -1, hw: 0.8, hd: 0.8 },
      { cx:  6,  cz:  -1, hw: 0.8, hd: 0.8 },
      { cx: -6,  cz:   5, hw: 0.8, hd: 0.8 },
      { cx: -2,  cz:   5, hw: 0.8, hd: 0.8 },
      { cx:  2,  cz:   5, hw: 0.8, hd: 0.8 },
      { cx:  6,  cz:   5, hw: 0.8, hd: 0.8 },
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
      { side: 'left',  leadsTo: 'plaza',  label: 'Praça',  emoji: '🏔️' },
      { side: 'right', leadsTo: 'garden', label: 'Jardim', emoji: '🌿' },
    ],
    npcCount: 4,
    npcColors: ['#f97316', '#06b6d4', '#84cc16', '#f43f5e'],
    colliders: [
      { cx: 0,   cz: -18, hw: 20,   hd: 12   },
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
      { side: 'left',  leadsTo: 'arcade', label: 'Arcade',     emoji: '🎮' },
      { side: 'right', leadsTo: 'cafe',   label: 'Café',       emoji: '☕' },
    ],
    npcCount: 4,
    npcColors: ['#8b5cf6', '#ec4899', '#0ea5e9', '#10b981'],
    colliders: [
      { cx: -4,    cz:  -3,   hw: 1.6, hd: 0.9 },
      { cx:  4,    cz:  -3,   hw: 1.6, hd: 0.9 },
      { cx:  0,    cz:   4,   hw: 1.6, hd: 0.9 },
      { cx: 13,    cz: -12,   hw: 1.6, hd: 1.6 },
      { cx: -14,   cz:  12,   hw: 1.4, hd: 0.8 },
      { cx:  14,   cz:  12,   hw: 1.4, hd: 0.8 },
      { cx:  0,    cz: -17.5, hw: 16,  hd: 0.8 },
      { cx: -17.5, cz:   0,   hw: 0.8, hd: 16  },
    ],
  },
  arcade: {
    id: 'arcade',
    name: 'Arcade',
    emoji: '🎮',
    skyColor: '#0a0018',
    groundColor: '#1a0a30',
    accentColor: '#f000ff',
    doors: [
      { side: 'left',  leadsTo: 'rooftop', label: 'Rooftop', emoji: '🏙️' },
      { side: 'right', leadsTo: 'library', label: 'Biblioteca', emoji: '📚' },
    ],
    npcCount: 3,
    npcColors: ['#ff00ff', '#00ffff', '#ffff00'],
    colliders: [
      // Arcade cabinets back row
      { cx: -12, cz: -14, hw: 1.2, hd: 0.8 },
      { cx:  -8, cz: -14, hw: 1.2, hd: 0.8 },
      { cx:  -4, cz: -14, hw: 1.2, hd: 0.8 },
      { cx:   0, cz: -14, hw: 1.2, hd: 0.8 },
      { cx:   4, cz: -14, hw: 1.2, hd: 0.8 },
      { cx:   8, cz: -14, hw: 1.2, hd: 0.8 },
      { cx:  12, cz: -14, hw: 1.2, hd: 0.8 },
      // Centre cabinet island
      { cx:  0, cz: -4, hw: 2.0, hd: 1.0 },
    ],
  },
  garden: {
    id: 'garden',
    name: 'Jardim',
    emoji: '🌿',
    skyColor: '#0a1a0a',
    groundColor: '#1a4a1a',
    accentColor: '#22c55e',
    doors: [
      { side: 'left',  leadsTo: 'beach',   label: 'Praia',   emoji: '🏖️' },
      { side: 'right', leadsTo: 'dungeon', label: 'Dungeon', emoji: '🕯️' },
    ],
    npcCount: 4,
    npcColors: ['#22c55e', '#86efac', '#fbbf24', '#f472b6'],
    colliders: [
      // Big tree trunks
      { cx:  -8, cz: -8,  hw: 0.7, hd: 0.7 },
      { cx:   8, cz: -8,  hw: 0.7, hd: 0.7 },
      { cx:  -8, cz:  8,  hw: 0.7, hd: 0.7 },
      { cx:   8, cz:  8,  hw: 0.7, hd: 0.7 },
      { cx: -14, cz:  0,  hw: 0.6, hd: 0.6 },
      { cx:  14, cz:  0,  hw: 0.6, hd: 0.6 },
      // Central pond
      { cx: 0, cz: 0, hw: 2.8, hd: 2.8 },
    ],
  },
  rooftop: {
    id: 'rooftop',
    name: 'Rooftop',
    emoji: '🏙️',
    skyColor: '#050510',
    groundColor: '#2a2a3a',
    accentColor: '#ff6b35',
    doors: [
      { side: 'left',  leadsTo: 'space',  label: 'Estação', emoji: '🚀' },
      { side: 'right', leadsTo: 'arcade', label: 'Arcade',  emoji: '🎮' },
    ],
    npcCount: 3,
    npcColors: ['#ff6b35', '#e040fb', '#00e5ff'],
    colliders: [
      { cx: -10, cz: -10, hw: 2.0, hd: 1.5 },  // HVAC 1
      { cx: 10,  cz: -12, hw: 1.5, hd: 1.5 },   // HVAC 2
      { cx: 0,   cz: 12,  hw: 1.2, hd: 1.2 },    // water tower
      { cx: -14, cz: 5,   hw: 0.5, hd: 0.5 },    // vent
      { cx: 14,  cz: -5,  hw: 0.5, hd: 0.5 },    // vent
    ],
  },
  dungeon: {
    id: 'dungeon',
    name: 'Dungeon',
    emoji: '🕯️',
    skyColor: '#0a0505',
    groundColor: '#1a1008',
    accentColor: '#ff8c00',
    doors: [
      { side: 'left',  leadsTo: 'garden', label: 'Jardim',  emoji: '🌿' },
      { side: 'right', leadsTo: 'space',  label: 'Estação', emoji: '🚀' },
    ],
    npcCount: 3,
    npcColors: ['#ff8c00', '#dc143c', '#8b4513'],
    colliders: [
      { cx: -8, cz: -8, hw: 1.0, hd: 1.0 },  // pillar
      { cx: 8,  cz: -8, hw: 1.0, hd: 1.0 },   // pillar
      { cx: -8, cz: 8,  hw: 1.0, hd: 1.0 },    // pillar
      { cx: 8,  cz: 8,  hw: 1.0, hd: 1.0 },    // pillar
      { cx: 0,  cz: 0,  hw: 1.5, hd: 1.0 },    // treasure chest
      { cx: 0,  cz: -16, hw: 14, hd: 0.8 },    // back wall
      { cx: -16, cz: 0,  hw: 0.8, hd: 14 },    // left wall
    ],
  },
  space: {
    id: 'space',
    name: 'Estação Espacial',
    emoji: '🚀',
    skyColor: '#000008',
    groundColor: '#0a0a1a',
    accentColor: '#00e5ff',
    doors: [
      { side: 'left',  leadsTo: 'dungeon', label: 'Dungeon', emoji: '🕯️' },
      { side: 'right', leadsTo: 'rooftop', label: 'Rooftop', emoji: '🏙️' },
    ],
    npcCount: 3,
    npcColors: ['#00e5ff', '#76ff03', '#ff4081'],
    colliders: [
      { cx: 0,   cz: 0,   hw: 2.0, hd: 2.0 },    // reactor core
      { cx: -12, cz: -10, hw: 2.5, hd: 1.0 },      // console bank
      { cx: 12,  cz: -10, hw: 2.5, hd: 1.0 },      // console bank
      { cx: -10, cz: 10,  hw: 1.5, hd: 1.5 },      // cargo pod
      { cx: 10,  cz: 10,  hw: 1.5, hd: 1.5 },      // cargo pod
    ],
  },
}
