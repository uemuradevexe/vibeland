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

### Issues addressed (second round — #77–#83)
- Free items never added to inventory → achievements unreliable (#77)
- `interpRef` memory leak in RemotePlayers (#78)
- `first_steps` achievement wrong room count (#79)
- Server color field not validated (#80)
- Server emote has no length limit (#81)
- HUD cooldown timer leaks on unmount (#82)
- THREE.Vector3 allocated per frame in KeyboardInput (#83)

---

## 2026-03-29 — Round 3 — Branch: `fix/issues-63-70-avatar-sync-multiplayer` (continued)

### Summary
Four more bugs fixed after reading `Room.tsx`, `BeachMinigame.tsx`, `GameCanvas.tsx`, `DayNightCycle.tsx`, and `app/api/github/contributions/route.ts`.

### Changes

#### `components/game/Room.tsx` ← CRITICAL
- **Added `playerAvatar` subscription and prop** to the local player's `<ClaudeOrb>`.
  - This was the root cause of the original bug report: `playerAvatar` was never read from the store nor forwarded to `ClaudeOrb`, so the local player always rendered as the default humanoid regardless of what was equipped. Remote players saw the correct avatar (via WS), but the local player never did. (closes #84)

#### `components/game/BeachMinigame.tsx`
- **`claimReward` now reads tokens from `useGameStore.getState()`** instead of the stale selector value.
  - The component's selector could be stale if the online reward timer fired during the 60-second game, causing those tokens to be silently overwritten. (closes #85)
- Removed unused `const storeTokens = useGameStore(...)` selector.

#### `components/game/GameCanvas.tsx` (CameraRig)
- **Pre-allocated `_dest`, `_prevTarget`, `_delta`** as module-level `THREE.Vector3` instances.
  - Was creating 3 new objects per frame (180/s at 60 FPS). Now uses `.set()`, `.copy()`, `.sub()` on reused instances. (closes #86)

#### `components/game/DayNightCycle.tsx`
- **Added `PARSED_KEYFRAMES`** — hex colors parsed into `THREE.Color` once at module load.
- **Added `_ambientColor`, `_dirColor`** scratch colors reused each frame.
  - Was creating 4 `new THREE.Color()` per frame (240/s) and parsing hex strings each time. Now zero allocations per frame. (closes #86)

#### `app/api/github/contributions/route.ts`
- **Added `null` user check** — non-existent usernames now return HTTP 404 with `{ error: 'GitHub user not found' }` instead of silent `{ contributions: 0 }` (HTTP 200). (closes #87)

#### `components/game/HUD.tsx`
- GitHub connect error now surfaces the actual error message so "GitHub user not found" appears instead of the generic fallback.

### Issues addressed (third round — #84–#87)
- CRITICAL: local player avatar never updates — `playerAvatar` prop missing in Room.tsx (#84)
- BeachMinigame stale token read in `claimReward` (#85)
- CameraRig + DayNightCycle per-frame Three.js allocations (#86)
- GitHub API returns silent 200 for non-existent users (#87)

---

## 2026-03-29 — Round 4 — Branch: `fix/issues-63-70` (continued)

### Summary
Five more bugs fixed across ProfileModal, Door, GitHub API, and PlazaRoom night sky.

### Changes

#### `components/ui/ProfileModal.tsx`
- **Added `playerAvatar` and `githubLevel` subscriptions** from the Zustand store.
- **Fixed level display** — replaced `Math.floor(tokens/100)+1` (token-based, inconsistent) with `githubLevel` (the canonical GitHub contribution level used everywhere else in the game). (closes #88)
- **Avatar now shown in profile preview** — the orb preview circle shows `avatarDef.emoji` when a non-default avatar is equipped, falling back to the hat emoji for default avatar. (closes #89)
- **Added Avatar column to the "Equipped" section** — previously only hat and vehicle were shown.
- **Added `ownedAvatars` to inventory summary** — avatars in the player's inventory are now displayed alongside hats and vehicles. (closes #89)
- Removed unused `level` variable.

#### `components/game/Door.tsx`
- **Added `dragStateRef` guard** — imported `dragStateRef` from `GameCanvas` and added `!dragStateRef.current.didDrag` check before calling `changeRoom`. Prevents a camera drag-end over a door from triggering an unintended room change. (closes #90)

#### `app/api/github/route.ts`
- **Added `GITHUB_TOKEN` auth header** — mirrors the pattern already used in `app/api/github/contributions/route.ts`. Unauthenticated GitHub REST API calls are limited to 60 req/h per IP; with a token the limit is 5000 req/h. (closes #91)

#### `components/game/DayNightCycle.tsx`
- **Exported `cyclePhaseRef`** — a module-level `{ current: 0 }` ref updated every frame with the current cycle phase (0–1). Allows other Three.js components to read the time of day without store overhead.

#### `components/rooms/PlazaRoom.tsx`
- **Extracted moon and stars into `<NightSky />`** — a sub-component that uses `useFrame` to set `group.visible = phase < 0.15 || phase > 0.65`. Moon and stars are now hidden during morning through afternoon, matching the day/night cycle. (closes #92)
- Added imports: `useRef`, `useFrame`, `THREE`, `cyclePhaseRef`.

### Issues addressed (fourth round — #88–#92)
- ProfileModal shows wrong level (token-based vs GitHub level) (#88)
- ProfileModal missing avatar display and avatar inventory (#89)
- Door.tsx drag-end triggers room change (#90)
- GitHub profile API unauthenticated → rate-limited at 60 req/h (#91)
- PlazaRoom moon/stars always visible regardless of day/night cycle (#92)

---

## 2026-03-29 — Round 5 — Branch: `fix/issues-63-70` (continued)

### Summary
Five more bugs found and fixed in a deep audit of `useTokenRewards`, `server/ws.ts`, `HUD.tsx`, `SittableObject.tsx`.

### Changes

#### `hooks/useTokenRewards.ts`
- **Added `checkAchievements()` call after online reward** — the 15-minute token reward used `useGameStore.setState(...)` directly, bypassing store actions and never triggering achievement checks. The `token_saver` achievement (500 tokens) would not fire if the player crossed 500 via this reward. (closes #93)

#### `server/ws.ts`
- **Added `.trim()` and empty-string guard to `chat` handler** — blank or all-whitespace messages are now rejected before broadcast. Prevents malicious clients from sending blank chat bubbles to all room players. (closes #94)
- **Trimmed player name before fallback to 'Anon'** — changed `String(msg.name || 'Anon').slice(0,24)` to `(String(msg.name || '').trim().slice(0,24)) || 'Anon'`. A name of all spaces was truthy and bypassed the 'Anon' fallback, causing blank name tags. (closes #97)

#### `components/game/HUD.tsx`
- **Fixed mute button initial state** — changed `useState(false)` to `useState(isMuted)` (lazy initializer). The button now correctly reflects the actual mute state at mount time instead of always showing 🔊. (closes #95)

#### `components/game/SittableObject.tsx`
- **Added `dragStateRef` guard** — camera drag-end over a bench no longer triggers sit+teleport. Same fix pattern as Door.tsx (#90). Also removed the unused `THREE` import. (closes #96)

### Issues addressed (fifth round — #93–#97)
- `useTokenRewards` bypasses `checkAchievements` — `token_saver` achievement broken for online reward path (#93)
- Server broadcasts blank/whitespace chat messages (#94)
- HUD mute button always initializes to unmuted (#95)
- SittableObject camera drag triggers sit (#96)
- Server player name not trimmed — blank name possible (#97)
