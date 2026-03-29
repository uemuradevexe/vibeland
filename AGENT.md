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

### Issues addressed (first round)
- Avatar/skin resets to `default` on page reload (#72)
- Multiplayer: remote players show wrong/default avatar after equip (#73)
- Server accepts any room name without validation (#74)
- Position spoofing: server accepts unbounded x/z coordinates (#75)
- `RoomId` type on server missing arcade and garden rooms (#74)

---

## 2026-03-29 — Round 2 — Branch: `fix/issues-63-70-avatar-sync-multiplayer` (continued)

### Summary
Seven more bugs fixed after deeper codebase review.

### Changes

#### `components/ui/WardrobeModal.tsx`
- **Removed `&& cost > 0` from purchase guards** in `handleSelectHatOrVehicle` and `handleSelectAvatar`.
  - Previously, free items (turtle avatar `cost=0`) never called `buyItem`, so they were never added to `inventory`. This caused `avatar_collector` and `fashionista` achievement progress to be unreliable.
  - Now `buyItem(id, 0)` is called on first equip of a free item — it adds the item to inventory without deducting any tokens.
  - The "Unlocked! ✦" feedback toast is only shown when `cost > 0` to avoid false positives for free items. (closes #77)

#### `components/game/RemotePlayers.tsx`
- **Added stale interpRef cleanup** at the end of the `useFrame` loop.
  - Previously, when a player disconnected, their entry in `interpRef.current` was never deleted — a memory leak that grew over time in long sessions.
  - Now, any `interpRef` key not present in `store.remotePlayers` is deleted each frame. (closes #78)

#### `lib/achievements.ts`
- **Fixed `first_steps` achievement** — changed description from `'Visit all 4 rooms'` to `'Visit all 6 rooms'` and `maxProgress` from `4` to `6`.
  - The game has 6 rooms (plaza, cafe, beach, library, arcade, garden); the old value of 4 was a leftover from an earlier version. (closes #79)

#### `server/ws.ts`
- **Added `validColor()` helper** — validates color strings against `/^#[0-9a-fA-F]{6}$/`, rejects anything else (falls back to `'#ea580c'`). Applied to `join` and `color_change` handlers. Prevents arbitrary string injection via the color field. (closes #80)
- **Capped emote length to 12 characters** via `.slice(0, 12)` in the `emote` handler. 12 chars is generous for compound emoji while bounding worst-case server memory and broadcast bandwidth. (closes #81)

#### `components/game/HUD.tsx`
- **Added unmount cleanup for `cooldownRef`** — a `useEffect` with an empty dependency array now clears the pending timeout on unmount, preventing setState-after-unmount for the chat cooldown timer. (closes #82)

#### `components/game/KeyboardInput.tsx`
- **Pre-allocated THREE.Vector3 instances** (`_forward`, `_right`, `_up`) at module level instead of creating new instances every frame.
  - Was creating 3 allocations per frame (180/s at 60 FPS) under key input, causing GC pressure.
  - Now reuses the same objects via mutating methods (`getWorldDirection`, `crossVectors`, `normalize`). (closes #83)

### Issues addressed (second round)
- Free items never added to inventory → achievements unreliable (#77)
- `interpRef` memory leak in RemotePlayers (#78)
- `first_steps` achievement wrong room count (#79)
- Server color field not validated (#80)
- Server emote has no length limit (#81)
- HUD cooldown timer leaks on unmount (#82)
- THREE.Vector3 allocated per frame in KeyboardInput (#83)
