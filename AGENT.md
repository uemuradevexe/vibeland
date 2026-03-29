# Agent Changelog

This file is maintained by the AI agent. Each entry records the last set of changes made, in English, so any future session can immediately understand what was done and why.

---

## 2026-03-29 — Branch: `fix/issues-63-70-avatar-sync-multiplayer`

### Summary
Four bugs fixed across the multiplayer and skin/avatar systems.

### Changes

#### `lib/tokenStore.ts`
- **Extended `loadEquipped` return type** from `{ hat, vehicle }` to `{ hat, vehicle, avatar }`.
  - Added `avatar` field with fallback `'default'` for backward-compatible reads of old localStorage entries.
- **Extended `saveEquipped` signature** to accept a third `avatar: string` parameter, so avatar selection is now persisted alongside hat and vehicle.

#### `store/gameStore.ts`
- **`equipHat`**: now passes current `playerAvatar` to `saveEquipped` so the avatar is not erased when the hat changes.
- **`equipVehicle`**: same — passes current `playerAvatar` to `saveEquipped`.
- **`equipAvatar`**: now calls `saveEquipped(hat, vehicle, avatar)` before `set(...)`, fixing the root cause of avatar resetting to `'default'` on page reload.
- **`initPlayer`**: added `playerAvatar: equipped.avatar as AvatarId` to the `set(...)` call, so the persisted avatar is restored on login.

#### `server/ws.ts`
- **Extended `RoomId` type** to include `'arcade'` and `'garden'` (previously missing, causing silent type errors for two of the six rooms).
- **Added `VALID_ROOMS` set and `validRoom()` helper** — validates the room string on `join` and `change_room`, falling back to `'plaza'` for unknown values instead of blind casting.
- **Added `POSITION_BOUND = 17` constant and `clampPos()` helper** — clamps incoming `x`/`z` coordinates to `[-17, 17]` in the `move` handler, matching the client-side keyboard bounds and preventing position spoofing.
- Replaced `Number(msg.x) || 0` (broken for `x = 0`) with `clampPos(msg.x)` which correctly handles `0`, `NaN`, `Infinity`, and out-of-range values.

#### `hooks/useMultiplayer.ts`
- **`player_equipped` handler**: replaced object literal with explicit `undefined`-safe patch building.
  - Previously, `avatar: msg.avatar !== undefined ? ... : undefined` would spread `avatar: undefined` into the existing remote player state (overwriting a valid avatar with `undefined`) because `{ ...existing, ...{ avatar: undefined } }` does override in JavaScript.
  - Now only defined fields are included in the patch object.

### Issues addressed
- Avatar/skin resets to `default` on page reload (#63)
- Multiplayer: remote players show wrong/default avatar after equip (#64)
- Server accepts any room name without validation (#65)
- Position spoofing: server accepts unbounded x/z coordinates (#66)
- `RoomId` type on server missing arcade and garden rooms (#67)
