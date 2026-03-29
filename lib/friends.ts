export interface Friend {
  id: string
  name: string
  color: string
  avatar: string
}

const KEY_FRIENDS = 'vl_friends'

export function loadFriends(): Friend[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY_FRIENDS)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveFriends(friends: Friend[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY_FRIENDS, JSON.stringify(friends))
}

export function addFriend(friend: Friend): void {
  const friends = loadFriends()
  const next = friends.some((entry) => entry.id === friend.id)
    ? friends.map((entry) => entry.id === friend.id ? friend : entry)
    : [...friends, friend]
  saveFriends(next)
}

export function removeFriend(id: string): void {
  saveFriends(loadFriends().filter((friend) => friend.id !== id))
}
