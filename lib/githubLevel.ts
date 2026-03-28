export function getLevel(contributions: number): number {
  if (contributions < 10)   return 1
  if (contributions < 50)   return 2
  if (contributions < 150)  return 3
  if (contributions < 350)  return 4
  if (contributions < 700)  return 5
  if (contributions < 1200) return 6
  if (contributions < 2000) return 7
  if (contributions < 3500) return 8
  if (contributions < 6000) return 9
  return 10
}

export const LEVEL_COLORS: Record<number, string> = {
  1: '#9E9E9E', 2: '#9E9E9E', 3: '#4CAF50',
  4: '#2196F3', 5: '#9C27B0', 6: '#FF9800',
  7: '#FFD700', 8: '#FF00FF', 9: '#FF3333', 10: '#FF6B35',
}

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Newbie', 2: 'Coder', 3: 'Builder', 4: 'Hacker',
  5: 'Craftsman', 6: 'Architect', 7: 'Wizard',
  8: 'Legend', 9: 'God', 10: '⚡ INFINITE',
}

export const AURA_CONFIGS: Record<number, { color: string; particleCount: number; rings: number; speed: number }> = {
  1:  { color: '#000000', particleCount: 0,   rings: 0, speed: 0 },
  2:  { color: '#A0A0A0', particleCount: 4,   rings: 0, speed: 0.5 },
  3:  { color: '#00CC66', particleCount: 8,   rings: 1, speed: 0.7 },
  4:  { color: '#0080FF', particleCount: 12,  rings: 1, speed: 0.9 },
  5:  { color: '#8A2BE2', particleCount: 18,  rings: 1, speed: 1.1 },
  6:  { color: '#FF6600', particleCount: 24,  rings: 2, speed: 1.3 },
  7:  { color: '#FFD700', particleCount: 30,  rings: 2, speed: 1.5 },
  8:  { color: '#FF00FF', particleCount: 40,  rings: 3, speed: 1.8 },
  9:  { color: '#FF3333', particleCount: 50,  rings: 3, speed: 2.0 },
  10: { color: '#FF6B35', particleCount: 60,  rings: 4, speed: 2.5 },
}

const KEY_GITHUB = 'vl_github'

export interface GithubLevelData {
  username: string
  level: number
  contributions: number
}

export function loadGithubLevel(): GithubLevelData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY_GITHUB)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveGithubLevel(data: GithubLevelData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_GITHUB, JSON.stringify(data))
}
