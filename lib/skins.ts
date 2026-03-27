export type HatId = 'none' | 'tophat' | 'crown' | 'cap' | 'cowboy' | 'wizard'
export type VehicleId = 'none' | 'skateboard'

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
}

export interface HatDef {
  id: HatId
  name: string
  emoji: string
  cost: number
  pieces: HatPiece[]
}

export interface VehicleDef {
  id: VehicleId
  name: string
  emoji: string
  cost: number
  pieces: VehiclePiece[]
}

export const HATS: Record<HatId, HatDef> = {
  none: { id: 'none', name: 'None', emoji: '🚫', cost: 0, pieces: [] },

  tophat: {
    id: 'tophat', name: 'Top Hat', emoji: '🎩', cost: 80,
    pieces: [
      { position: [0, 0.27, 0], size: [0.62, 0.06, 0.62], color: '#111111' },
      { position: [0, 0.54, 0], size: [0.38, 0.42, 0.38], color: '#111111' },
      { position: [0, 0.33, 0], size: [0.40, 0.07, 0.40], color: '#c8960c' },
    ],
  },

  crown: {
    id: 'crown', name: 'Crown', emoji: '👑', cost: 150,
    pieces: [
      { position: [0, 0.27, 0], size: [0.58, 0.10, 0.58], color: '#f5c518' },
      { position: [0, 0.44, 0], size: [0.10, 0.24, 0.10], color: '#f5c518', emissive: '#f5c518', emissiveIntensity: 0.6 },
      { position: [-0.18, 0.38, 0], size: [0.09, 0.18, 0.09], color: '#f5c518', emissive: '#f5c518', emissiveIntensity: 0.6 },
      { position: [0.18, 0.38, 0], size: [0.09, 0.18, 0.09], color: '#f5c518', emissive: '#f5c518', emissiveIntensity: 0.6 },
    ],
  },

  cap: {
    id: 'cap', name: 'Cap', emoji: '🧢', cost: 60,
    pieces: [
      { position: [0, 0.38, 0], size: [0.50, 0.24, 0.50], color: '#2563eb' },
      { position: [0, 0.28, 0.22], size: [0.44, 0.05, 0.22], color: '#1d4ed8' },
    ],
  },

  cowboy: {
    id: 'cowboy', name: 'Cowboy', emoji: '🤠', cost: 100,
    pieces: [
      { position: [0, 0.26, 0], size: [0.76, 0.05, 0.76], color: '#92400e' },
      { position: [0, 0.54, 0], size: [0.40, 0.44, 0.40], color: '#78350f' },
      { position: [0, 0.31, 0], size: [0.42, 0.07, 0.42], color: '#451a03' },
    ],
  },

  wizard: {
    id: 'wizard', name: 'Wizard', emoji: '🧙', cost: 120,
    pieces: [
      { position: [0, 0.26, 0], size: [0.60, 0.06, 0.60], color: '#4c1d95' },
      { position: [0, 0.44, 0], size: [0.40, 0.30, 0.40], color: '#5b21b6' },
      { position: [0, 0.64, 0], size: [0.26, 0.28, 0.26], color: '#6d28d9' },
      { position: [0, 0.82, 0], size: [0.12, 0.24, 0.12], color: '#7c3aed', emissive: '#8b5cf6', emissiveIntensity: 0.8 },
    ],
  },
}

export const VEHICLES: Record<VehicleId, VehicleDef> = {
  none: { id: 'none', name: 'None', emoji: '🚫', cost: 0, pieces: [] },

  skateboard: {
    id: 'skateboard', name: 'Skateboard', emoji: '🛹', cost: 200,
    pieces: [
      { position: [0, -0.07, 0], size: [0.55, 0.06, 1.10], color: '#92400e' },
      { position: [0, -0.13, 0.35], size: [0.60, 0.05, 0.08], color: '#6b7280' },
      { position: [0, -0.13, -0.35], size: [0.60, 0.05, 0.08], color: '#6b7280' },
    ],
  },
}
