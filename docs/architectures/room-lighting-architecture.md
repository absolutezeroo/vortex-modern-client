# Room lighting — dynamic light and cast shadows

> **This is the one document in this directory that describes no AS3 module.** Every other file
> here maps a module of the Flash client. This one describes a subsystem the Flash client does not
> have, and never had. It exists so that nobody later mistakes it for a port, "restores" it to match
> an AS3 source that does not exist, or deletes it as an unexplained divergence.

Location: `packages/vortex-client/src/lighting/`. Disabled by default.

## What the Flash client actually does

There is nothing to port here, and it is worth being precise about why.

| What it looks like | What it is |
|---|---|
| Floor and wall faces are shaded | Three constants picked on the sign of the plane normal — `RoomVisualization.FLOOR_COLOR_TOP/LEFT/RIGHT` (`0xFFFFFF` / `0xDDDDDD` / `0xBBBBBB`), `WALL_COLOR_TOP/SIDE/BOTTOM`. A lambert frozen at authoring time, with no source and no position. Selection at `RoomVisualization.ts:427-480`. |
| The moodlight lights the room | `FurnitureRoomBackgroundColorLogic` sets `ROOM_BACKGROUND_COLOR`; `RoomVisualization` multiplies every plane's RGB by it, uniformly (`RoomVisualization.ts:201-207`). No attenuation, no direction, no position. |
| Furniture casts shadows | The shadows are painted into the sprites. `shadow` does not occur once in `room/` or `habbo/room/`. |

So this subsystem is additive by construction. It contributes the two things the Flash client has no
notion of — **direction** and **occlusion** — and nothing else.

## The contract

These are the rules that keep the port auditable. Breaking any of them turns a documented addition
back into an undocumented divergence.

1. **Read the engine. Write to it in exactly one place, `SpriteLighting.ts`.** Everything else —
   geometry, occluders, the floor overlay — only consumes `RoomGeometry`,
   `FurniStackingHeightMap` and the room object list, sets no model variable, dispatches no event
   and modifies no ported class. Grep for `lighting` outside this directory: the only hit is the
   single `RoomLightingController.install()` call in `App.ts`.

   The exception is deliberate and was the author's explicit call, because without it the effect
   cannot work: a floor overlay is drawn above the whole sprite list, so it can only ever *cover*
   what stands on the floor, never light it — an avatar walking into a shadow gets painted over.
   Per-sprite lighting writes `ExtendedSprite.tint`, which is the engine's own channel
   (`RoomObjectSprite.color`, AS3-native, applied by `RoomRenderingCanvas.updateSprite()`), and the
   same model `RoomVisualization` already uses to apply the dimmer globally.

   What keeps the exception contained:

   - it is confined to one file, and that file writes nothing but `tint`;
   - it records the renderer's own colour before overwriting, and `restore()` puts every one back,
     so `litSprites: false` or `VortexLighting.off()` returns the render to vanilla;
   - it never fights the renderer: a tint that is not the one it last wrote is taken as the
     renderer's new base, so a repainted sprite is respected rather than clobbered.
2. **Zero hooks in ported code.** Not "one small documented hook" — zero. Pixi lets a sibling
   container be inserted without the renderer knowing, so there is no reason to reach for one.
3. **Physically outside the port surface.** `vortex-client/src/lighting/`, never `habbo/room/`. The
   directory says what the `TS-only:` markers repeat.
4. **Every member carries `// TS-only:`.** Not to quiet `check-as3-trace.mjs`, but because the
   marker is the greppable record that the absence of an `AS3:` trace here is deliberate.
5. **The off-switch stays.** `VortexLighting.off()` must always restore the vanilla render exactly,
   so any comparison against the Flash client remains one console call away.

## Why it does not skew the coverage numbers

`docs/IMPLEMENTATION_STATUS.md`'s gap measurement counts ported files against AS3 files. These
files have no AS3 counterpart, so they must not be counted on either side. They live outside
`habbo/` for exactly that reason — the recipe walks the port's AS3-mirroring trees, and this
directory is not one of them.

## How it works

### Occluders — `OccluderGrid.ts`

Shadow casters are read off the **furniture stacking height map**, not off the furniture objects.
That map is already maintained by `RoomEngine` as items are placed, moved and picked up, and it
answers the only two questions the layer asks: is there floor here (`getIsRoomTile`), and how tall
is the stack (`getTileHeight`). This buys us no footprint maths, no rotation handling, and no
subscription to object add/move/remove — a signature over the grid says when anything changed.

A tile occludes when it is not floor (walls, the void) or when its stack reaches
`minCasterHeight` (0.4 tiles by default — rugs and mats sit below it, tables and seats above).

Only **silhouette** edges are emitted, and collinear ones are merged in the same pass. A solid block
of furniture contributes its outline, not its interior; a six-tile row of furniture is four
segments, not twenty-four. The shadow pass is `O(segments)`, so this is what keeps it cheap.

### The light — `RoomLightingController.ts`

The moodlight is located by scanning the room's wall objects (then floor objects) for one whose
logic is `FurnitureRoomDimmerLogic`.

> It is **not** driven by `RoomEngineDimmerStateEvent`. That event is dead in this port:
> `FurnitureDimmerWidgetHandler` registers for `RoomEngineDimmerStateEvent.CYCLED`, but nothing
> anywhere constructs one, so it never fires. Building on it would have produced a feature that
> silently never lit up — the "ported but never wired" failure mode. This also means the dimmer's
> **brightness never reaches the client**, which is why `ILightSource.intensity` is currently
> always 1.

A moodlight hangs on a wall, so its tile centre lands where there is no floor — and a light standing
inside an occluder puts the entire room in its own shadow. The light is therefore snapped to the
nearest floor tile, searching outward in square rings.

`debugLight` puts a light at the room's centre instead, so the effect can be judged in a room that
has no dimmer furniture.

### The layer — `RoomLightingLayer.ts`

One container attached to the rendering canvas's `_master`, drawn above the room's sprite list.

**It is never a child of `_display`.** That container is index-addressed — `_display.children[index]`
in `getSprite()`, `cleanSprites()` and `checkMouseHits()` — so inserting anything into it would
shift every sprite index and break hit-testing. Living on `_master` means working in canvas space
and folding in `_display`'s transform by hand (`geometryScreen * scale + screenOffset`, exactly what
`updateDisplayTransform()` applies), which also means nothing has to be mirrored per frame.

Composition, back to front:

1. **Ambient falloff** — a radial gradient centred on the light, transformed by the *projected tile
   axes*, so the pool is the iso ellipse the floor grid lives in and not a screen-space circle.
2. **Cast shadows** — each occluder segment extruded away from the light and filled opaque into a
   render texture, which is then composited once at `shadowStrength`. Flattening in the texture is
   the whole point: filling the same quads straight into the scene at 55% would darken every overlap
   twice, and a furnished room is nothing but overlaps.

Both are clipped to the floor, because a flat floor projection is only correct on the floor —
without the clip the darkness climbs the walls and spills into the void.

Redraws are gated on a signature over the occluder grid, the camera (offset, scale,
`geometry.updateId`, viewport) and the light. A still room costs one signature comparison per
`updateIntervalMs`.

## Three traps, all of which reported success

Recorded because each produced a perfectly healthy-looking layer — attached, visible, mask
populated, geometry with real bounds — and either no pixels or pixels in the wrong place. None
would have been found by reading.

### A tile is CENTRED on its index — it does not span from it

`RoomPlaneParser` rasterises the floor like this:

```ts
const planeX = x / 4 - 0.5;   // x is in quarter-tiles, so x / 4 is the tile index
const planeY = y / 4 - 0.5;
```

So tile `t` covers world `[t - 0.5, t + 0.5]`, **not** `[t, t + 1]`. Everything drawn on the assumption
that tiles span forward is offset by half a tile in each axis, which projects to exactly
`(0, +16)` pixels — a half-diamond straight down. Small enough to read as a rounding artefact,
large enough to be plainly wrong once noticed, and it survived several rounds of "the shape is
right, so the geometry must be right".

Two consequences that must stay consistent:

- grid coordinates (segment endpoints, floor-run edges) are tile indices and go through
  `gridToWorld()` before projection; object locations are already world and must not;
- world → tile is `Math.round`, not `Math.floor`, since world `5.6` sits inside tile `6`.

`RoomEngine.handleUserPlace()` uses `Math.floor` for the same conversion, which agrees only for
integer positions. That near-miss is what made an early check of this convention come back clean.

### The room is centred in the canvas, and that centring is in neither the geometry nor `screenOffset`

The projection is **not** `geometry.getScreenPoint()`. There is a `+ canvas.width / 2`,
`+ canvas.height / 2` term, stated in two independent places in `RoomEngine`:

```ts
// getRoomObjectBoundingRectangle()
const left = bounds.x * scale + screenPoint.x * scale + canvas.width / 2 + canvas.screenOffsetX;
// getRoomObjectScreenLocation()
point.x += canvas.width / 2 + canvas.screenOffsetX;
```

Without it the shadows had exactly the right shape, the right size and the right orientation, and
sat about 770 pixels to the left of the room. Shape being right is what made it convincing: it
looked like a coordinate-space bug of the subtle kind, when it was one missing term that the engine
documents twice.

The lesson generalises past this layer: **when the engine already converts room coordinates to
screen, use its conversion.** Reimplementing the projection from the geometry alone reproduces the
easy half and silently drops the rest.

## Two further traps, both of which drew nothing

1. **The render texture was anchored to the viewport origin.** A render texture captures from its
   source's local `(0,0)` outward, and the room geometry routinely projects to *negative*
   master-space coordinates (in a 12x16 room, tile (0,0) landed at `y = -156` and the floor started
   at `x = -320`). Everything left of and above the origin was clipped away. The texture is now
   aligned to the floor's bounding box, with the scratch container shifted by `-bounds` and the
   sprite placed back at `+bounds`.
2. **The falloff ramp was spread over the whole sprite.** The ambient sprite must span the viewport
   so its far corners are dark, but the gradient ramped from the light's radius all the way to the
   sprite's edge — about 63 tiles. Inside the room that worked out to roughly `0.02` alpha:
   correctly computed, correctly drawn, invisible. The ramp now completes at `FALLOFF_SPAN` times
   the light radius and holds at full darkness beyond.

The generalisable lesson: every failure in this subsystem degrades to "draw nothing" rather than
throwing, so `VortexLighting.diagnose()` (which reports where each tick gave up) and
`VortexLighting.probe()` (which draws an unmissable marker with the mask off) are part of the
design, not scaffolding to be removed.

## Known limitations

These are properties of the model, not bugs to be fixed casually:

- **Floor-plane shadows only.** Nothing self-shadows, nothing casts onto a wall, and nothing casts
  onto furniture standing in the shadow. A 2D visibility model on the floor plane is what this is.
- **Occlusion is per-tile, but the drawn shape need not be.** The tile grid decides *whether* a
  thing is lit; `silhouetteShadows` decides what the shadow *looks like*. With it off, a chair and a
  wardrobe on the same tile throw the same square. With it on (the default), each caster's own
  texture is flattened onto the floor away from the light — the alpha is already in the sprites, so
  this costs no assets, one draw per caster.

  The flattening prepends a shear to each sprite's existing `localTransform` rather than
  recomputing its placement. That is deliberate: `flipH`/`flipV` live in that transform as a
  negative scale with a compensating origin shift, and any hand-rolled placement would have to
  reproduce that and would get every mirrored sprite in the room wrong.

  Avatars are collected from the room object list (`OBJECT_CATEGORY_USER`) and occupy one tile each,
  since they never reach the furniture stacking height map.
- **Nothing is cast onto the walls.** The darkness is clipped to the floor, so a shadow never climbs
  a wall. This is not a hard limit — the wall planes exist in `RoomPlaneParser`, and each would need
  its own projection — it is simply not built.
- **The darkness is drawn over everything, including the objects standing in it.** The room's sprite
  list is one index-addressed container — `_display.children[index]` in `getSprite()`,
  `cleanSprites()` and `checkMouseHits()` — so this layer cannot be interleaved between the floor
  and the objects on it without breaking sprite indexing and hit-testing. An avatar walking into a
  shadow therefore goes dark with it. `keepObjectsLit` cuts the occupied tiles out of the clip
  region instead, trading that for a lit tile under each caster; neither reads perfectly, so it is a
  switch rather than a fix. Interleaving properly would mean restructuring the ported renderer,
  which the contract above rules out.
- **Lights are point lights, capped at `maxLights`.** Sources are the moodlight, every glowing
  furni, and — only if none of those exist — the debug light. Anything past the cap is dropped
  nearest-to-centre-first and logged, never cut in silence.

  Glowing furni are guessed at by their **additive blend mode**: a layer's `ink` in the
  visualization data, which `FurnitureVisualization.getBlendMode()` maps to `'add'` for
  `ink === 1`. `visible` is checked too, or an unlit lamp would still emit.

  **This is a heuristic and it is wrong in both directions.** Additive means "draw this
  additively" — artists use it for glow, but equally for gloss, glass and highlights — and a lamp
  whose lit look is painted into its texture carries no additive layer at all. Observed in a test
  room: four objects matched (a table, a ball, a rug, a tile) and the actual ceiling lamp did not.
  It was first written up here as the artists' own marker for emission; it is not, and the claim was
  stronger than the data. There is no authoritative flag for this in the client — furnidata has
  none — so any criterion will be a guess, and `Log furni` in the debug panel exists to show what a
  given room actually matched rather than leaving it to be argued about.

  Contributions combine by **taking the brightest light, not by adding darkness**. Accumulating is
  backwards: with two lamps three tiles apart, summing puts the spot beside one lamp at `0.33`
  darkness instead of `0.00`, and the far corner at `0.64` instead of `0.40`. The floor overlay gets
  the same behaviour structurally — the texture starts fully dark and each light *erases* its own
  pool out of it, so there is no ordering to get right.
- **Walls occlude but are not lit.** They are outside the floor clip, so they keep the flat
  `WALL_COLOR_*` shading while the floor in front of them goes dark.

## Turning it on

**Ctrl+Shift+L**, or the 💡 button, opens the debug panel — every setting as a checkbox or slider,
plus live readouts (ticks, redraws, where the last tick stopped, lit objects, tinted sprites, the
sampled darkness values). Tuning this subsystem means sweeping continuous values while watching the
room, which a console cannot do.

One readout earns its place specifically: `tinted sprites` alongside the darkness sample. A pass
that tints thirteen sprites by `0.00` each looks exactly like a pass that does not run, and is
entirely correct — an object inside the light's core darkens by nothing. That distinction cost a
round trip before the panel existed.

The console handle remains, and both drive the same config:

```js
VortexLighting.on()                       // enable
VortexLighting.set({debugLight: true})    // light at the room centre, no moodlight needed
VortexLighting.set({shadowStrength: 0.7, lightRadiusTiles: 10})
VortexLighting.set({shadows: false})      // ambient falloff only
VortexLighting.off()                      // back to the vanilla render, exactly
VortexLighting.reset()                    // defaults
VortexLighting.config                     // current values

VortexLighting.diagnose()                 // where the last tick stopped, and what each step found
VortexLighting.probe(true)                // magenta marker over the floor, mask off
VortexLighting.probe(false)               // back to normal
```

Defaults live in `LightingConfig.ts`. `enabled` is `false`, and while it is false the subsystem is
one ticker callback that returns on its first line.
