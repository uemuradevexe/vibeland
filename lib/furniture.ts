export type FurnitureId = 'rug' | 'table' | 'lamp' | 'plant' | 'bookshelf' | 'tv' | 'sofa'

export interface FurnitureDef {
  id: FurnitureId
  name: string
  emoji: string
  cost: number
  size: [number, number, number]
  color: string
}

export interface PlacedFurniture {
  id: string
  type: FurnitureId
  x: number
  z: number
  rotation: number
}

export const FURNITURE: Record<FurnitureId, FurnitureDef> = {
  rug: { id: 'rug', name: 'Tapete Neon', emoji: '🟪', cost: 35, size: [2.6, 0.05, 1.8], color: '#7c3aed' },
  table: { id: 'table', name: 'Mesa Dev', emoji: '🪵', cost: 55, size: [1.6, 0.9, 1.0], color: '#8b5a2b' },
  lamp: { id: 'lamp', name: 'Luminária', emoji: '💡', cost: 45, size: [0.35, 1.8, 0.35], color: '#f0c84a' },
  plant: { id: 'plant', name: 'Planta', emoji: '🪴', cost: 30, size: [0.7, 1.2, 0.7], color: '#22c55e' },
  bookshelf: { id: 'bookshelf', name: 'Estante', emoji: '📚', cost: 70, size: [1.4, 2.2, 0.5], color: '#4a2e14' },
  tv: { id: 'tv', name: 'TV Retro', emoji: '📺', cost: 80, size: [1.8, 1.1, 0.35], color: '#1f2937' },
  sofa: { id: 'sofa', name: 'Sofá', emoji: '🛋️', cost: 90, size: [2.0, 1.0, 0.9], color: '#2563eb' },
}
