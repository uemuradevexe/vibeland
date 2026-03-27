export interface Collider {
  cx: number  // center X
  cz: number  // center Z
  hw: number  // half-width  (X axis)
  hd: number  // half-depth  (Z axis)
}

/** Character footprint radius in world units */
export const CHAR_RADIUS = 0.38

/** Resolve a circle at (x, z) out of one AABB collider. */
function resolveOne(x: number, z: number, c: Collider): [number, number] {
  // Nearest point on AABB to circle centre
  const nearX = Math.max(c.cx - c.hw, Math.min(c.cx + c.hw, x))
  const nearZ = Math.max(c.cz - c.hd, Math.min(c.cz + c.hd, z))
  const dx = x - nearX
  const dz = z - nearZ
  const distSq = dx * dx + dz * dz

  if (distSq >= CHAR_RADIUS * CHAR_RADIUS) return [x, z]   // no overlap

  if (distSq < 0.00001) {
    // Centre is inside AABB — push out on the shortest-overlap axis
    const overlapX = c.hw + CHAR_RADIUS - Math.abs(x - c.cx)
    const overlapZ = c.hd + CHAR_RADIUS - Math.abs(z - c.cz)
    if (overlapX < overlapZ) {
      return [c.cx + (x >= c.cx ? c.hw + CHAR_RADIUS : -(c.hw + CHAR_RADIUS)), z]
    }
    return [x, c.cz + (z >= c.cz ? c.hd + CHAR_RADIUS : -(c.hd + CHAR_RADIUS))]
  }

  // Push circle to just touch the AABB surface
  const dist = Math.sqrt(distSq)
  return [nearX + (dx / dist) * CHAR_RADIUS, nearZ + (dz / dist) * CHAR_RADIUS]
}

/** Iteratively resolve (x, z) against all colliders and return a safe position. */
export function resolvePosition(x: number, z: number, colliders: Collider[]): [number, number] {
  let rx = x, rz = z
  for (const c of colliders) {
    ;[rx, rz] = resolveOne(rx, rz, c)
  }
  return [rx, rz]
}
