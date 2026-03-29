export type FurnitureId = 'rug' | 'table' | 'lamp' | 'plant' | 'bookshelf' | 'tv' | 'sofa'

export interface FurnitureDef {
  id: FurnitureId
  name: string
  emoji: string
  cost: number
  /** [width, depth] footprint in world units */
  footprint: [number, number]
  color: string
  accentColor: string
}

export interface PlacedFurniture {
  id: string          // uuid
  type: FurnitureId
  x: number
  z: number
  rotation: number    // radians (multiples of π/2)
}

export const FURNITURE_DEFS: Record<FurnitureId, FurnitureDef> = {
  rug: {
    id: 'rug',
    name: 'Tapete',
    emoji: '🟫',
    cost: 50,
    footprint: [3, 2],
    color: '#8b4513',
    accentColor: '#d4a05a',
  },
  table: {
    id: 'table',
    name: 'Mesa',
    emoji: '🟤',
    cost: 80,
    footprint: [2, 1],
    color: '#6b4423',
    accentColor: '#c8a06a',
  },
  lamp: {
    id: 'lamp',
    name: 'Luminária',
    emoji: '💡',
    cost: 60,
    footprint: [0.5, 0.5],
    color: '#888888',
    accentColor: '#ffe066',
  },
  plant: {
    id: 'plant',
    name: 'Planta',
    emoji: '🌿',
    cost: 40,
    footprint: [0.8, 0.8],
    color: '#5a3a1a',
    accentColor: '#2d8a3e',
  },
  bookshelf: {
    id: 'bookshelf',
    name: 'Estante',
    emoji: '📚',
    cost: 100,
    footprint: [2, 0.5],
    color: '#5a3a1a',
    accentColor: '#e07a30',
  },
  tv: {
    id: 'tv',
    name: 'TV',
    emoji: '📺',
    cost: 120,
    footprint: [1.5, 0.4],
    color: '#111111',
    accentColor: '#4488ff',
  },
  sofa: {
    id: 'sofa',
    name: 'Sofá',
    emoji: '🛋️',
    cost: 150,
    footprint: [3, 1],
    color: '#4a5a8a',
    accentColor: '#7a8abf',
  },
}

export const FURNITURE_IDS = Object.keys(FURNITURE_DEFS) as FurnitureId[]

export function furnitureInventoryKey(id: FurnitureId) {
  return `furniture_${id}`
}
