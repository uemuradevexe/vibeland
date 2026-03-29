import type { PlacedFurniture } from './furniture'

const KEY = 'vl_house_v1'

export function loadHouseItems(): PlacedFurniture[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is PlacedFurniture =>
        item &&
        typeof item.id === 'string' &&
        typeof item.type === 'string' &&
        typeof item.x === 'number' &&
        typeof item.z === 'number' &&
        typeof item.rotation === 'number',
    )
  } catch {
    return []
  }
}

export function saveHouseItems(items: PlacedFurniture[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {}
}
