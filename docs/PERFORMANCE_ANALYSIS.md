# Performance Analysis Report

Analysis of the Vortex codebase for performance anti-patterns, inefficient algorithms,
unnecessary re-renders, and resource management issues.

---

## Critical Issues

### 1. Texture Recreation on Every Avatar Frame

**File:** `packages/vortex-engine/src/habbo/avatar/AvatarImage.ts:640-704`

Every call to `getImage()` creates a new `OffscreenCanvas`, composites all body parts onto
it, then converts it to a `Texture.from()`. This happens on every animation frame advance,
even when the avatar's visual state hasn't changed.

```typescript
// Line 640-641 — allocated every call
const offscreen = new OffscreenCanvas(canvasWidth, canvasHeight);
const ctx = offscreen.getContext('2d')!;

// Line 704 — new GPU texture upload every call
this._image = Texture.from({ resource: offscreen, alphaMode: 'premultiply-alpha-on-upload' });
```

The full-image cache only covers the `POSTURE_STAND` action (line 1144-1184). Walking,
dancing, waving, and all other animations bypass the cache entirely, meaning every frame
triggers a full recomposite + GPU upload.

**Impact:** Major GPU memory churn and CPU overhead per avatar per frame. In a room with
20+ avatars all walking, this creates 20+ OffscreenCanvas allocations and 20+ texture
uploads per frame (60 fps).

**Fix:** Cache by `(direction, action, animation_frame_index)` tuple. Most animation cycles
are 4-8 frames that repeat — cache them all and cycle through cached textures.

---

### 2. Array Sort + Slice Every Render Frame

**File:** `packages/vortex-engine/src/habbo/room/renderer/RoomRenderingCanvas.ts:283-292`

The render loop creates a new array slice and sorts it **every frame**:

```typescript
const sortSlice = this._sortableSpriteList.slice(0, spriteIndex); // O(n) copy
sortSlice.sort((a, b) => b.z - a.z);                             // O(n log n)

for (let i = 0; i < spriteIndex; i++) {
    this._sortableSpriteList[i] = sortSlice[i];                   // O(n) copy-back
}
```

At 60 fps with 100+ room objects, this allocates a new array and performs a full sort
20,000+ times per second.

**Impact:** GC pressure from array allocations and unnecessary sorting when z-order hasn't
changed.

**Fix:** Use a dirty flag — only re-sort when objects are added, removed, or change z-index.
Sort in-place to avoid the slice/copy-back.

---

### 3. No Viewport Culling for Room Objects

**File:** `packages/vortex-engine/src/habbo/room/renderer/RoomRenderingCanvas.ts:277-280`

Every visualization is updated every frame regardless of visibility:

```typescript
for (const [objectId, entry] of this._visualizations) {
    spriteIndex += this.renderObject(entry.visualization, entry.object, objectId, time, spriteIndex);
}
```

No bounds check against the camera viewport is performed before calling `renderObject()`.

**Impact:** In rooms with 100+ objects, offscreen furniture still runs its full
visualization update pipeline. Combined with avatar animations (#1), this multiplies
wasted work.

**Fix:** Add AABB-vs-viewport check before processing each visualization. Skip
`renderObject()` for objects entirely outside the visible area.

---

### 4. CPU Pixel Manipulation for Color Transforms

**File:** `packages/vortex-engine/src/habbo/room/object/visualization/room/rasterizer/basic/PlaneVisualizationLayer.ts:158-172`

Floor/wall color tinting uses `getImageData`/`putImageData` with a per-pixel loop:

```typescript
const imageData = ctx.getImageData(0, 0, result.width, result.height);
const data = imageData.data;

for (let i = 0; i < data.length; i += 4) {
    data[i]     = Math.round(data[i]     * rMul);
    data[i + 1] = Math.round(data[i + 1] * gMul);
    data[i + 2] = Math.round(data[i + 2] * bMul);
}

ctx.putImageData(imageData, 0, 0);
```

`getImageData` forces a GPU-to-CPU readback. The pixel loop then runs on the CPU.
`putImageData` re-uploads the result.

**Impact:** For a 256x256 plane tile, this iterates 262,144 pixels with three
multiplications and three `Math.round` calls each. Multiple planes per room multiply
this cost.

**Fix:** Use PixiJS `ColorMatrixFilter` or a simple `globalCompositeOperation = 'multiply'`
with a solid color overlay. Both operate on the GPU.

---

### 5. Offscreen Avatars Continue Animating

**File:** `packages/vortex-engine/src/habbo/room/object/visualization/avatar/AvatarVisualization.ts:308-316`

```typescript
if (needsSpriteUpdate || shouldAnimate) {
    this.increaseUpdateId();
    this._currentAngleDeg--;
    this._headAngle--;

    if (this._headAngle <= 0 || scaleChanged || modelChanged || needsNewImage) {
        this._activeAvatarImage.updateAnimationByFrames(1);  // runs for all avatars
        this._headAngle = SPRITE_INDEX_AVATAR;
    }
}
```

There is no visibility check. Every avatar in the room advances its animation state
machine, triggers body-part compositing, and creates textures — even if scrolled
offscreen.

**Impact:** Proportional to total avatar count, not visible avatar count.

**Fix:** Gate animation updates on viewport visibility. Avatars that are offscreen should
freeze their animation and resume when scrolled back into view.

---

## High-Severity Issues

### 6. Linear Array Searches in Hot Paths

Multiple locations use `Array.includes()` or `Array.indexOf()` where `Set` would give O(1):

**`packages/vortex-engine/src/habbo/session/IgnoredUsersManager.ts:60,115`**
```typescript
isIgnored(userId: number): boolean {
    return this._ignoredUserIds.includes(userId);  // O(n) — called per chat message
}

private addUserToIgnoreList(userId: number): void {
    if (!this._ignoredUserIds.includes(userId)) {  // O(n) duplicate check
        this._ignoredUserIds.push(userId);
    }
}
```
Called for every incoming chat message to filter ignored users.

**`packages/vortex-engine/src/habbo/room/renderer/RoomRenderingCanvas.ts:775`**
```typescript
for (const [objectId, data] of this._mouseActiveObjects) {
    if (!hitObjectIds.includes(objectId)) {  // O(n) per active object, per mouse move
```
Called on every mouse move event against all active mouse objects.

**`packages/vortex-engine/src/room/RoomManager.ts:96-100`**
```typescript
if (!this._pendingTypes.includes(type)) {  // O(n) per furniture type
    this._contentLoader.loadObjectContent(type, this.events);
    this._pendingTypes.push(type);
}
```

**`packages/vortex-engine/src/habbo/session/SessionDataManager.ts:888,909`**
```typescript
if (listener && this._productDataListeners.indexOf(listener) === -1)  // O(n)
if (this._furniDataListeners.indexOf(listener) === -1)                // O(n)
```

**Fix:** Replace these arrays with `Set<number>` or `Set<string>` for O(1) lookups.

---

### 7. String Concatenation in Loop

**File:** `packages/vortex-engine/src/habbo/avatar/AvatarImage.ts:924-926`

```typescript
for (const action of this._sortedActions) {
    this._currentActionsString += action.actionType + action.actionParameter;
}
```

String concatenation via `+=` in a loop creates intermediate string objects. Called during
every action update for every avatar.

**Fix:** Use `Array.map().join('')` or build an array and join once.

---

### 8. Array.concat() Creates New Arrays in Animation Loop

**File:** `packages/vortex-engine/src/habbo/avatar/AvatarImage.ts:1043`

```typescript
this._animationSpriteData = this._animationSpriteData.concat(spriteData);
```

`concat()` creates a brand new array every time. Called during action setup for
animated avatars.

**Fix:** Use `this._animationSpriteData.push(...spriteData)` to append in-place.

---

### 9. Unbounded Avatar Image Cache

**File:** `packages/vortex-engine/src/habbo/avatar/AvatarImage.ts:801-812`

```typescript
protected cacheFullImage(key: string, image: Texture): void {
    const existing = this._fullImageCache.get(key);
    if (existing) {
        existing.destroy();
        this._fullImageCache.delete(key);
    }
    this._fullImageCache.set(key, image);  // grows without limit
}
```

No LRU eviction or size cap. Each avatar can cache `8 directions x N actions x M frames`,
accumulating GPU textures indefinitely.

**Fix:** Implement an LRU cache with a maximum entry count. Destroy evicted textures.

---

### 10. Canvas Element Recreation Instead of Reuse

**File:** `packages/vortex-engine/src/habbo/room/object/visualization/room/rasterizer/basic/PlaneVisualizationLayer.ts:118-145`

```typescript
if (this._cachedBitmap === null) {
    this._cachedBitmap = document.createElement('canvas');  // new DOM element
    this._cachedBitmap.width = result.width;
    this._cachedBitmap.height = result.height;
}
```

When cached bitmap dimensions don't match, it's set to `null` (line 114) and then a
brand new canvas element is created. This happens for every plane that changes size.

At line 139, the else-branch always creates a new canvas without checking dimensions:
```typescript
this._cachedBitmap = document.createElement('canvas');
```

**Fix:** Resize the existing canvas instead of creating a new DOM element. Canvas elements
survive dimension changes — just set `.width` and `.height`.

---

## Medium-Severity Issues

### 11. ByteArray Allocation Per Message in WireFormatter

**File:** `packages/vortex-engine/src/core/communication/wireformat/WireFormatter.ts`

Each incoming WebSocket message creates 1-3 `ByteArray` objects during splitting. With
encryption enabled, creates a temporary `ByteArray` for the length bytes, another for the
encrypted data, and a third for the decrypted result.

**Fix:** Pool `ByteArray` objects and reuse them. Clear and return to pool after message
processing.

---

### 12. Redundant Array Replacement in Message Parsers

Multiple parsers replace array references in both `flush()` and `parse()`:

**`packages/vortex-engine/src/habbo/communication/messages/parser/room/engine/ObjectsMessageParser.ts`**
```typescript
flush(): boolean {
    this._objects = [];   // replaces reference
    return true;
}
parse(wrapper: IMessageDataWrapper): boolean {
    this._objects = [];   // replaces again
}
```

This pattern appears in `ItemsMessageParser`, `ObjectsMessageParser`, and others.

**Fix:** Use `this._objects.length = 0` to clear the array in-place, avoiding GC of the
old array reference.

---

### 13. Temporary Map Allocation Per Room Load

**File:** `packages/vortex-engine/src/habbo/communication/messages/parser/room/engine/ObjectsMessageParser.ts`

Creates a temporary `Map<number, string>` in every `parse()` call for owner ID-to-name
mapping:

```typescript
const ownerMap = new Map<number, string>();
```

This map is used once and immediately abandoned to GC.

**Fix:** Make `_ownerMap` a reusable class field. Call `.clear()` at the start of each parse.

---

### 14. Juggler Uses Array.indexOf for Add/Remove

**File:** `packages/vortex-engine/src/habbo/utils/animation/Juggler.ts:36`

```typescript
if (animatable && this._animatables.indexOf(animatable) === -1) {  // O(n)
    this._animatables[this._animatables.length] = animatable;
}
```

The animation juggler checks for duplicates with `indexOf()`. It also maintains a sparse
array with null entries after removal, requiring compaction during the advance loop.

**Fix:** Use a `Set` alongside the array for O(1) membership testing. Or switch entirely to
a `Set` if iteration order doesn't matter.

---

### 15. Resize Listener Leak in RoomEngine

**File:** `packages/vortex-engine/src/habbo/room/RoomEngine.ts`

`window.addEventListener('resize', onResize)` is registered inside `getRenderingCanvas()`
with a closure that captures the canvas reference. If the canvas is recreated, the old
listener remains attached, preventing GC of the old canvas.

**Fix:** Store the handler reference and call `removeEventListener` when disposing the canvas.

---

### 16. Map-to-Array Conversion for Index Access

**File:** `packages/vortex-engine/src/room/RoomManager.ts:207`

```typescript
getRoomWithIndex(index: number): IRoomInstance | null {
    const rooms = Array.from(this._rooms.values());  // O(n) copy
    if (index >= 0 && index < rooms.length) {
        return rooms[index];
    }
    return null;
}
```

Converts the entire room Map to an array just to access one element by index.

**Fix:** Iterate with a counter, or maintain a parallel array if index access is frequent.

---

## Summary by Priority

| #  | Issue                                  | Severity | Location                       | Fix Effort | Status |
|----|----------------------------------------|----------|--------------------------------|------------|--------|
| 1  | Texture recreation per avatar frame    | Critical | AvatarImage.ts:640             | Medium     | TODO   |
| 2  | Array sort + slice every render frame  | Critical | RoomRenderingCanvas.ts:283     | Low        | FIXED  |
| 3  | No viewport culling                    | Critical | RoomRenderingCanvas.ts:277     | Medium     | TODO   |
| 4  | CPU pixel loop for color transforms    | Critical | PlaneVisualizationLayer.ts:158 | Medium     | FIXED  |
| 5  | Offscreen avatars keep animating       | Critical | AvatarVisualization.ts:308     | Medium     | TODO   |
| 6  | Array.includes() in hot paths          | High     | Multiple files                 | Low        | FIXED  |
| 7  | String concatenation in loop           | High     | AvatarImage.ts:926             | Low        | FIXED  |
| 8  | Array.concat() in animation loop       | High     | AvatarImage.ts:1043            | Low        | FIXED  |
| 9  | Unbounded image cache                  | High     | AvatarImage.ts:801             | Medium     | TODO   |
| 10 | Canvas element recreation              | High     | PlaneVisualizationLayer.ts:118 | Low        | FIXED  |
| 11 | ByteArray allocation per message       | Medium   | WireFormatter.ts               | Medium     | TODO   |
| 12 | Redundant array replacement in parsers | Medium   | Multiple parsers               | Low        | FIXED  |
| 13 | Temporary Map per room load            | Medium   | ObjectsMessageParser.ts        | Low        | FIXED  |
| 14 | Juggler indexOf for membership         | Medium   | Juggler.ts:36                  | Low        | FIXED  |
| 15 | Resize listener leak                   | Medium   | RoomEngine.ts                  | Low        | FIXED  |
| 16 | Map-to-Array for index access          | Medium   | RoomManager.ts:207             | Low        | FIXED  |