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
    npcCount: 5,
    npcColors: ['#7c3aed', '#059669', '#0ea5e9', '#f59e0b', '#ec4899'],
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
  },
}
