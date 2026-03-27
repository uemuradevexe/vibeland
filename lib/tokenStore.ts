const KEY_TOKENS = 'vl_tokens'
const KEY_LAST_LOGIN = 'vl_last_login'
const DAILY_BONUS = 50
const STARTING_TOKENS = 100

export function loadTokens(): number {
  if (typeof window === 'undefined') return STARTING_TOKENS
  const stored = localStorage.getItem(KEY_TOKENS)
  return stored !== null ? parseInt(stored, 10) : STARTING_TOKENS
}

export function saveTokens(amount: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_TOKENS, String(amount))
}

/** Returns bonus amount if daily login is new, 0 otherwise */
export function claimDailyBonus(): number {
  if (typeof window === 'undefined') return 0
  const today = new Date().toDateString()
  const last = localStorage.getItem(KEY_LAST_LOGIN)
  if (last === today) return 0
  localStorage.setItem(KEY_LAST_LOGIN, today)
  return DAILY_BONUS
}

export function loadEquipped(): { hat: string; vehicle: string } {
  if (typeof window === 'undefined') return { hat: 'none', vehicle: 'none' }
  try {
    const raw = localStorage.getItem('vl_equipped')
    return raw ? JSON.parse(raw) : { hat: 'none', vehicle: 'none' }
  } catch {
    return { hat: 'none', vehicle: 'none' }
  }
}

export function saveEquipped(hat: string, vehicle: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('vl_equipped', JSON.stringify({ hat, vehicle }))
}

export function loadInventory(): string[] {
  if (typeof window === 'undefined') return ['none']
  try {
    const raw = localStorage.getItem('vl_inventory')
    const parsed: string[] = raw ? JSON.parse(raw) : ['none']
    if (!parsed.includes('none')) parsed.unshift('none')
    return parsed
  } catch {
    return ['none']
  }
}

export function saveInventory(items: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('vl_inventory', JSON.stringify(items))
}
