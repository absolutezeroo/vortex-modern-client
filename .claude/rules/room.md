---
paths:
  - "**/room/**"
---

# Room engine rules

`room/` (generic engine primitives: `data`, `events`, `object`, `renderer`, `utils`) and `habbo/room/` (Habbo-specific room game logic) are different layers — do not confuse them.

1. Use `createObjectInternal()`, never `createRoomObject()`, when creating room objects from a container (the latter recurses infinitely).
2. `renderer/` is a render-loop hot path: no allocations per frame, cache textures by content key, cull objects outside the viewport. See `docs/STYLEGUIDE.md` → Performance.
3. See `docs/PATTERNS.md` for Manager/Handler patterns before adding new room object types.
