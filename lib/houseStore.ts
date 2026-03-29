import type { PlacedFurniture } from '@/lib/furniture'

const KEY = 'vl_house'

export function loadHouse(): PlacedFurniture[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHouse(items: PlacedFurniture[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(items))
}
