'use client'

export type AvatarId = 'default' | 'turtle' | 'elephant' | 'lizard' | 'penguin'

export interface AvatarPiece {
  color: string
  position: [number, number, number]
  size: [number, number, number]
  emissive?: string
  emissiveIntensity?: number
}

export interface AvatarDef {
  id: AvatarId
  name: string
  emoji: string
  cost: number
  headTopY: number  // y where hats attach
  pieces: AvatarPiece[]
}

export const AVATARS: Record<AvatarId, AvatarDef> = {
  default: { id: 'default', name: 'Claude', emoji: '🟣', cost: 0, headTopY: 1.30, pieces: [] },

  turtle: {
    id: 'turtle', name: 'Turtle', emoji: '🐢', cost: 0, headTopY: 1.0,
    pieces: [
      // Body (flat, wide)
      { position: [0, 0.3, 0], size: [0.8, 0.28, 0.65], color: '#90C060' },
      // Shell base rim
      { position: [0, 0.5, 0], size: [0.65, 0.07, 0.52], color: '#EDE0C8' },
      // Shell blocks (checkerboard)
      { position: [-0.15, 0.66, -0.08], size: [0.26, 0.22, 0.22], color: '#8B5E3C' },
      { position: [0.15, 0.66, -0.08], size: [0.26, 0.22, 0.22], color: '#D4A96A' },
      { position: [-0.15, 0.66, 0.12], size: [0.26, 0.22, 0.22], color: '#D4A96A' },
      { position: [0.15, 0.66, 0.12], size: [0.26, 0.22, 0.22], color: '#8B5E3C' },
      { position: [0, 0.76, 0.02], size: [0.2, 0.18, 0.18], color: '#8B5E3C' },
      // Head
      { position: [0, 0.48, 0.48], size: [0.34, 0.28, 0.28], color: '#90C060' },
      // Eyes (black + white highlight)
      { position: [-0.09, 0.56, 0.63], size: [0.09, 0.09, 0.02], color: '#111111' },
      { position: [0.09, 0.56, 0.63], size: [0.09, 0.09, 0.02], color: '#111111' },
      { position: [-0.07, 0.58, 0.64], size: [0.04, 0.04, 0.02], color: '#ffffff' },
      { position: [0.07, 0.58, 0.64], size: [0.04, 0.04, 0.02], color: '#ffffff' },
      // Paws (4)
      { position: [-0.44, 0.13, 0.2], size: [0.2, 0.14, 0.2], color: '#90C060' },
      { position: [0.44, 0.13, 0.2], size: [0.2, 0.14, 0.2], color: '#90C060' },
      { position: [-0.4, 0.13, -0.2], size: [0.18, 0.12, 0.18], color: '#90C060' },
      { position: [0.4, 0.13, -0.2], size: [0.18, 0.12, 0.18], color: '#90C060' },
      { position: [-0.44, 0.07, 0.2], size: [0.18, 0.06, 0.18], color: '#EDE0C8' },
      { position: [0.44, 0.07, 0.2], size: [0.18, 0.06, 0.18], color: '#EDE0C8' },
    ],
  },

  elephant: {
    id: 'elephant', name: 'Elephant', emoji: '🐘', cost: 150, headTopY: 2.3,
    pieces: [
      // Body
      { position: [0, 0.75, 0], size: [1.0, 1.0, 0.75], color: '#87CEEB' },
      // Head
      { position: [0, 1.65, 0.28], size: [0.78, 0.68, 0.68], color: '#87CEEB' },
      // Trunk
      { position: [0, 1.28, 0.72], size: [0.22, 0.24, 0.2], color: '#87CEEB' },
      { position: [0, 1.04, 0.82], size: [0.2, 0.22, 0.18], color: '#87CEEB' },
      { position: [0, 0.82, 0.88], size: [0.18, 0.2, 0.16], color: '#87CEEB' },
      // Ears
      { position: [-0.52, 1.65, 0.2], size: [0.1, 0.5, 0.42], color: '#87CEEB' },
      { position: [0.52, 1.65, 0.2], size: [0.1, 0.5, 0.42], color: '#87CEEB' },
      // Tusks
      { position: [-0.2, 1.32, 0.7], size: [0.1, 0.1, 0.16], color: '#FFFFFF' },
      { position: [0.2, 1.32, 0.7], size: [0.1, 0.1, 0.16], color: '#FFFFFF' },
      // Eyes
      { position: [-0.22, 1.82, 0.63], size: [0.1, 0.1, 0.02], color: '#1A3A5C' },
      { position: [0.22, 1.82, 0.63], size: [0.1, 0.1, 0.02], color: '#1A3A5C' },
      { position: [-0.2, 1.84, 0.64], size: [0.05, 0.05, 0.02], color: '#ffffff' },
      { position: [0.2, 1.84, 0.64], size: [0.05, 0.05, 0.02], color: '#ffffff' },
      // Legs
      { position: [-0.3, 0.28, 0.2], size: [0.3, 0.56, 0.28], color: '#87CEEB' },
      { position: [0.3, 0.28, 0.2], size: [0.3, 0.56, 0.28], color: '#87CEEB' },
      { position: [-0.3, 0.28, -0.2], size: [0.3, 0.56, 0.28], color: '#87CEEB' },
      { position: [0.3, 0.28, -0.2], size: [0.3, 0.56, 0.28], color: '#87CEEB' },
      // Feet
      { position: [-0.3, 0.06, 0.2], size: [0.32, 0.1, 0.3], color: '#FFFFFF' },
      { position: [0.3, 0.06, 0.2], size: [0.32, 0.1, 0.3], color: '#FFFFFF' },
      { position: [-0.3, 0.06, -0.2], size: [0.32, 0.1, 0.3], color: '#FFFFFF' },
      { position: [0.3, 0.06, -0.2], size: [0.32, 0.1, 0.3], color: '#FFFFFF' },
    ],
  },

  lizard: {
    id: 'lizard', name: 'Lizard', emoji: '🦎', cost: 200, headTopY: 0.75,
    pieces: [
      // Body
      { position: [0, 0.27, 0], size: [0.62, 0.32, 0.5], color: '#FFD700' },
      // Tail (decreasing)
      { position: [0, 0.22, -0.42], size: [0.4, 0.26, 0.24], color: '#FFD700' },
      { position: [0, 0.18, -0.68], size: [0.26, 0.2, 0.2], color: '#FFD700' },
      { position: [0, 0.14, -0.9], size: [0.16, 0.15, 0.2], color: '#FFD700' },
      { position: [0, 0.1, -1.1], size: [0.1, 0.1, 0.2], color: '#FFD700' },
      // Dorsal spikes
      { position: [0, 0.48, 0.08], size: [0.09, 0.15, 0.09], color: '#FF6600' },
      { position: [0, 0.44, -0.06], size: [0.09, 0.14, 0.09], color: '#FF6600' },
      { position: [0, 0.39, -0.2], size: [0.08, 0.12, 0.08], color: '#FF6600' },
      { position: [0, 0.34, -0.34], size: [0.07, 0.1, 0.07], color: '#FF6600' },
      { position: [0, 0.28, -0.5], size: [0.06, 0.08, 0.06], color: '#FF6600' },
      { position: [0, 0.22, -0.65], size: [0.05, 0.07, 0.05], color: '#FF6600' },
      // Head
      { position: [0, 0.29, 0.42], size: [0.48, 0.3, 0.36], color: '#FFD700' },
      // Chin/snout
      { position: [0, 0.2, 0.51], size: [0.36, 0.16, 0.2], color: '#F5DEB3' },
      // Tongue
      { position: [0, 0.18, 0.64], size: [0.07, 0.04, 0.08], color: '#FF69B4' },
      // Eyes
      { position: [-0.16, 0.38, 0.59], size: [0.1, 0.1, 0.02], color: '#111111' },
      { position: [0.16, 0.38, 0.59], size: [0.1, 0.1, 0.02], color: '#111111' },
      { position: [-0.14, 0.4, 0.6], size: [0.05, 0.05, 0.02], color: '#ffffff' },
      { position: [0.14, 0.4, 0.6], size: [0.05, 0.05, 0.02], color: '#ffffff' },
      // Legs (4 short)
      { position: [-0.36, 0.13, 0.16], size: [0.17, 0.18, 0.17], color: '#FFD700' },
      { position: [0.36, 0.13, 0.16], size: [0.17, 0.18, 0.17], color: '#FFD700' },
      { position: [-0.33, 0.13, -0.2], size: [0.15, 0.16, 0.15], color: '#FFD700' },
      { position: [0.33, 0.13, -0.2], size: [0.15, 0.16, 0.15], color: '#FFD700' },
    ],
  },

  penguin: {
    id: 'penguin', name: 'Penguin', emoji: '🐧', cost: 100, headTopY: 2.15,
    pieces: [
      // Body (charcoal)
      { position: [0, 0.82, 0], size: [0.78, 1.05, 0.68], color: '#2D3142' },
      // Belly (white)
      { position: [0, 0.82, 0.3], size: [0.52, 0.88, 0.14], color: '#FFFFFF' },
      // Head
      { position: [0, 1.62, 0], size: [0.68, 0.62, 0.62], color: '#2D3142' },
      // Face white
      { position: [0, 1.62, 0.28], size: [0.46, 0.4, 0.14], color: '#FFFFFF' },
      // Beak
      { position: [0, 1.5, 0.44], size: [0.2, 0.13, 0.13], color: '#FFA500' },
      // Eyes
      { position: [-0.16, 1.72, 0.37], size: [0.1, 0.1, 0.02], color: '#111111' },
      { position: [0.16, 1.72, 0.37], size: [0.1, 0.1, 0.02], color: '#111111' },
      { position: [-0.14, 1.74, 0.38], size: [0.05, 0.05, 0.02], color: '#ffffff' },
      { position: [0.14, 1.74, 0.38], size: [0.05, 0.05, 0.02], color: '#ffffff' },
      // Wings
      { position: [-0.45, 0.9, 0], size: [0.17, 0.58, 0.26], color: '#2D3142' },
      { position: [0.45, 0.9, 0], size: [0.17, 0.58, 0.26], color: '#2D3142' },
      // Feet
      { position: [-0.17, 0.06, 0.16], size: [0.26, 0.1, 0.3], color: '#FFA500' },
      { position: [0.17, 0.06, 0.16], size: [0.26, 0.1, 0.3], color: '#FFA500' },
    ],
  },
}
