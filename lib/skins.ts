export type HatId = 'none' | 'tophat' | 'crown' | 'cap' | 'cowboy' | 'wizard' | 'viking' | 'halo' | 'pirate' | 'alien'
export type VehicleId = 'none' | 'skateboard' | 'hoverboard' | 'cloud'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

export interface HatPiece {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  emissive?: string
  emissiveIntensity?: number
}

export interface VehiclePiece {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  emissive?: string
  emissiveIntensity?: number
}

export interface HatDef {
  id: HatId
  name: string
  emoji: string
  cost: number
  rarity: Rarity
  pieces: HatPiece[]
}

export interface VehicleDef {
  id: VehicleId
  name: string
  emoji: string
  cost: number
  rarity: Rarity
  pieces: VehiclePiece[]
}

export const HATS: Record<HatId, HatDef> = {
  none: { id: 'none', name: 'None', emoji: '🚫', cost: 0, rarity: 'common', pieces: [] },

  tophat: {
    id: 'tophat', name: 'Top Hat', emoji: '🎩', cost: 80, rarity: 'uncommon',
    pieces: [
      { position: [0, 0.27, 0], size: [0.62, 0.06, 0.62], color: '#111111' },
      { position: [0, 0.54, 0], size: [0.38, 0.42, 0.38], color: '#111111' },
      { position: [0, 0.33, 0], size: [0.40, 0.07, 0.40], color: '#c8960c' },
    ],
  },

  crown: {
    id: 'crown', name: 'Crown', emoji: '👑', cost: 150, rarity: 'rare',
    pieces: [
      { position: [0, 0.27, 0], size: [0.58, 0.10, 0.58], color: '#f5c518' },
      { position: [0, 0.44, 0], size: [0.10, 0.24, 0.10], color: '#f5c518', emissive: '#f5c518', emissiveIntensity: 0.6 },
      { position: [-0.18, 0.38, 0], size: [0.09, 0.18, 0.09], color: '#f5c518', emissive: '#f5c518', emissiveIntensity: 0.6 },
      { position: [0.18, 0.38, 0], size: [0.09, 0.18, 0.09], color: '#f5c518', emissive: '#f5c518', emissiveIntensity: 0.6 },
    ],
  },

  cap: {
    id: 'cap', name: 'Cap', emoji: '🧢', cost: 60, rarity: 'common',
    pieces: [
      { position: [0, 0.38, 0], size: [0.50, 0.24, 0.50], color: '#2563eb' },
      { position: [0, 0.28, 0.22], size: [0.44, 0.05, 0.22], color: '#1d4ed8' },
    ],
  },

  cowboy: {
    id: 'cowboy', name: 'Cowboy', emoji: '🤠', cost: 100, rarity: 'uncommon',
    pieces: [
      { position: [0, 0.26, 0], size: [0.76, 0.05, 0.76], color: '#92400e' },
      { position: [0, 0.54, 0], size: [0.40, 0.44, 0.40], color: '#78350f' },
      { position: [0, 0.31, 0], size: [0.42, 0.07, 0.42], color: '#451a03' },
    ],
  },

  wizard: {
    id: 'wizard', name: 'Wizard', emoji: '🧙', cost: 120, rarity: 'epic',
    pieces: [
      { position: [0, 0.26, 0], size: [0.60, 0.06, 0.60], color: '#4c1d95' },
      { position: [0, 0.44, 0], size: [0.40, 0.30, 0.40], color: '#5b21b6' },
      { position: [0, 0.64, 0], size: [0.26, 0.28, 0.26], color: '#6d28d9' },
      { position: [0, 0.82, 0], size: [0.12, 0.24, 0.12], color: '#7c3aed', emissive: '#8b5cf6', emissiveIntensity: 0.8 },
    ],
  },

  viking: {
    id: 'viking', name: 'Viking Helmet', emoji: '⚔️', cost: 180, rarity: 'rare',
    pieces: [
      { position: [0, 0.30, 0], size: [0.55, 0.30, 0.55], color: '#6b7280' },
      { position: [-0.28, 0.42, 0], size: [0.08, 0.25, 0.08], color: '#d4a06a' },
      { position: [0.28, 0.42, 0], size: [0.08, 0.25, 0.08], color: '#d4a06a' },
    ],
  },

  halo: {
    id: 'halo', name: 'Halo', emoji: '😇', cost: 300, rarity: 'legendary',
    pieces: [
      { position: [0, 0.45, 0], size: [0.50, 0.05, 0.50], color: '#ffd700', emissive: '#ffd700', emissiveIntensity: 1.5 },
    ],
  },

  pirate: {
    id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', cost: 90, rarity: 'uncommon',
    pieces: [
      { position: [0, 0.34, 0], size: [0.52, 0.18, 0.48], color: '#1a1a1a' },
      { position: [0, 0.36, 0.24], size: [0.08, 0.08, 0.02], color: '#ffffff' },
    ],
  },

  alien: {
    id: 'alien', name: 'Alien Antenna', emoji: '👽', cost: 200, rarity: 'epic',
    pieces: [
      { position: [0, 0.45, 0], size: [0.04, 0.40, 0.04], color: '#22c55e' },
      { position: [0, 0.65, 0], size: [0.08, 0.08, 0.08], color: '#22c55e', emissive: '#22c55e', emissiveIntensity: 2.0 },
    ],
  },
}

export const VEHICLES: Record<VehicleId, VehicleDef> = {
  none: { id: 'none', name: 'None', emoji: '🚫', cost: 0, rarity: 'common', pieces: [] },

  skateboard: {
    id: 'skateboard', name: 'Skateboard', emoji: '🛹', cost: 200, rarity: 'uncommon',
    pieces: [
      { position: [0, -0.07, 0], size: [0.55, 0.06, 1.10], color: '#92400e' },
      { position: [0, -0.13, 0.35], size: [0.60, 0.05, 0.08], color: '#6b7280' },
      { position: [0, -0.13, -0.35], size: [0.60, 0.05, 0.08], color: '#6b7280' },
    ],
  },

  hoverboard: {
    id: 'hoverboard', name: 'Hoverboard', emoji: '🛸', cost: 350, rarity: 'rare',
    pieces: [
      { position: [0, -0.10, 0], size: [0.55, 0.04, 1.10], color: '#3b82f6' },
      { position: [0, -0.14, 0], size: [0.45, 0.02, 0.90], color: '#60a5fa', emissive: '#60a5fa', emissiveIntensity: 1.5 },
    ],
  },

  cloud: {
    id: 'cloud', name: 'Cloud', emoji: '☁️', cost: 500, rarity: 'legendary',
    pieces: [
      { position: [0, -0.08, 0], size: [0.40, 0.40, 0.40], color: '#e2e8f0' },
      { position: [-0.30, -0.10, 0], size: [0.30, 0.30, 0.30], color: '#e2e8f0' },
      { position: [0.30, -0.10, 0], size: [0.30, 0.30, 0.30], color: '#e2e8f0' },
    ],
  },
}
