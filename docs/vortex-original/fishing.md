# Fishing

> **Status**: design corrected against the real feature; slices 1–4 of the client built against the
> *previous* design and now partly wrong — see §10.

## 0. What this is, and how well we know it

**Fishing is a real Habbo feature.** It shipped in **Habbo Hotel: Origins** and is live there today.
It is not a Vortex invention, and this document is not a design — it is a **reconstruction**.

That matters for how much to trust it:

| Evidence | Authority |
|---|---|
| An Origins client dump | **None available.** `sources/` has WIN63 ×2, PRODUCTION 2016, `win63_version`, NITRO, Arcturus — nothing from Origins |
| Official Habbo articles | Real, but marketing prose: features named, mechanics not specified |
| Community guides (Steam, treyexgaming, bobba.me) | Detailed and consistent with each other — **evidence, not authority** |
| Retro reimplementations (bobba.me's own hotel) | A *copy* of Origins, so it inherits whatever its authors guessed |

So: no packet names, no header ids, no field orders, no numbers. Everything below is behaviour
observed and written down by players. **Where this document states a number it is a guess** unless it
says otherwise, and every one of them is live-configurable precisely so it can be corrected without
a deploy.

**If an Origins client or a packet capture ever becomes available, it outranks this entire file.**

> ### ⚠️ One became available — 2026-08-29
>
> `%APPDATA%/Habbo Launcher/downloads/shockwave/346/hh_fishing.cct` is the **real Origins Shockwave
> client's fishing cast**: 403 bitmaps, 426 named members, 21 Lingo scripts. The full member
> inventory is in `origins-hh_fishing-members.txt` beside this file.
>
> Everything below that this contradicts is wrong, and §14 lists what it already overturned. The
> table above stands as the record of what was guessed and why — not as authority any more.

An earlier revision of this document called the system a Vortex original and designed it from
scratch, then redesigned it around bobba.me. Both were wrong in the same way — they treated a
reimplementation as the thing being implemented. The corrections are in §10.

---

## 1. The loop, as Origins actually plays it

1. A **fish shadow** appears on the water in a public fishing room. A wooden fish sign in the room
   opens the skill interface — overview, stats, and the store.
2. The player **left-clicks the shadow**. Their avatar starts fishing.
3. **Fishing then continues by itself.** Catch after catch, each announced to the player by a
   message naming the fish and the XP earned.
4. Occasionally a catch triggers **Hook Havoc**, a short skill minigame. Winning it yields a Golden
   Fish, bonus XP, extra tokens, and a trophy that visibly hangs from the rod as the avatar walks.
5. The spot **depletes** after an unpredictable number of catches — "one fish or several" — and the
   player has to move to another shadow.

**This is the single biggest correction to the earlier design**, which had one cast per sighting and
a spot that never ran out. The real loop is start-once, run-until-dry, relocate — which changes the
protocol from a request/response per fish into a session with a stream of results.

---

## 2. Progression — two systems, not one

Origins runs **two parallel** progressions, and conflating them was the second big error:

| | What it does |
|---|---|
| **Fishing level** | Unlocks zones. Nothing else observed. |
| **Fishing rod quality** | Raises the multiplier on normal fish *and* on Golden Fish, and improves the chance of triggering Hook Havoc |

XP feeds both. A rod is not a level and a level is not a rod.

### Zones

| Zone | Level |
|---|---|
| Infobus Park | 1–29 |
| Port Hana | 30–69 |
| Snouthill Pier | 70+ |

Snouthill Pier is a public room added in a later update, together with **50 new species** across
every zone.

---

## 3. What decides which fish appears

Four axes, all confirmed by the guides:

- **time of day** (day/night variants)
- **day of the week**
- **season**
- **zone**

The earlier design had the first two. Season is a real fourth axis and is missing from the client
code as built.

Catch types observed: **regular fish** (XP and tokens), **frogs** (rare finds, called out separately
from fish), and **Golden Fish** (from Hook Havoc, and from frenzies).

---

## 4. Hook Havoc

A short skill minigame, triggered at random on a catch.

- **Q** moves the line left, **E** right. Keep the needle centred while a green bar fills.
- The bar must fill **before time runs out**.
- Guides warn: tap the keys, do not hold — holding overbalances the line.
- Success: a Golden Fish, bonus XP, extra tokens, and a visible trophy hanging on the rod.
- Failure: nothing lost, fishing resumes immediately.

**A previous revision of this document designed a tension-bar minigame, then deleted it** in favour
of a passive catch-rate model. The deletion was wrong: Origins has exactly such a minigame, and the
design that was thrown away was closer to the real feature than the one that replaced it. Q/E rather
than hold-to-reel is the difference that matters.

---

## 5. Fishing Frenzy

Every four hours, on the hour, at **00:00, 04:00, 08:00, 12:00, 16:00 and 20:00 UTC**, for **10–15
minutes**.

During a frenzy **every catch triggers Hook Havoc**, and the XP is **×5** a normal catch. The two
descriptions in circulation — "only Golden Fish" and "every catch is Hook Havoc" — are the same
statement, because winning Hook Havoc *is* how a Golden Fish is caught.

---

## 6. Rewards

- **Fish Tokens**, spent in the Fishing store on cosmetics. **Non-tradeable**, deliberately — it is
  the firewall between the fishing economy and the hotel's.
- **Fishing Bottles**: ten unique variants, non-tradeable.
- **Fish Statues**: bronze (Infobus Park), silver (Port Hana), gold (Snouthill Pier).
- **Fishing Badge**: a one-time random drop.

---

## 7. What the client already has, and what it rides on

These are unchanged by the correction, because they are facts about *this port*, not about Origins:

| Rides existing rails | Verified where |
|---|---|
| The token currency → activity points, priced offers in the catalogue | `HabboCatalog.getActivityPointName()` reads `activitypoint.name.<type>` from config, not a hardcoded switch — the shop needs **no client code**, only three pieces of configuration |
| The rod and the hanging trophy → carry object, id ≥ 1000 | `AvatarLogic.CARRY_ITEM_LAST_CONSUMABLE` is 999; above it an item is held, not drunk |
| The spot → room object logic + a furni widget | Four wirings, three of which fail silently |
| Trophy furni → one model, N variants via `MapStuffData` | How Habbo already does engraved trophies |
| Score boards → `HighScoreStuffData` (format key 6) | Already ported |
| The records tab → an `IInventoryModel` registered under its own category | `getCategoryWindowContainer()` is a map lookup, so one registration is the whole hook |

⚠️ The live `external_variables` is hand-edited and must never be regenerated over.

---

## 8. Id allocation

Origins' real header ids are unknown — no dump. So the ids remain **allocated**, not recovered, and
they live in the band this repository already reserves for that:

> The 8000-8999 band was chosen because it is empty in both registries. Never renumber one side alone.
> — `HabboMessages.registerEvents()`, and the emulator's `Headers.cs`

Re-verified: the client registry `_SafeCls_2046.as` contains **zero** 8xxx headers; the emulator's
only 8xxx entries are 8001–8007, the furni editor's. Fishing takes **8100–8199**, odd for composers
and even for events. `check-header-ids.mjs` allowlists each one, under its own rule: add an id there
only when the emulator carries it too.

Activity-point type **2000** for the token; hand items **2000+**; furni classes prefixed `vtx_`.

**If Origins' real ids ever surface, these are wrong and must be renumbered on both sides together.**

---

## 9. What the server decides

Unchanged and not in doubt: all of it. The client starts a fishing session and plays Hook Havoc; the
server owns which fish, what weight, what XP, what tokens, when a spot depletes, and whether a
Hook Havoc attempt succeeded.

Origins shows no daily cap or anti-AFK measure in any guide. That is not evidence that none exists —
it is evidence that players have not documented one. Since fishing here is **continuous and
unattended by design**, a session decay or daily ceiling is still worth having, and it is a
live-configurable number rather than a mechanic to copy.

---

## 10. Corrections owed to the code already written

**All five were applied on 2026-08-29, together with the server.** The table is kept because it is
the record of what the Origins correction actually changed, and because §11's unknowns are the same
list one dump would settle. Three further defects surfaced while wiring the two halves together, and
they are listed under §12.

Slices 1–4 of the client were built against the earlier, wrong design. What is still right, and what
is not:

**Still correct** — the whole plumbing argument, the id band, the live-reload push, the records tab
as an `IInventoryModel`, the spot as a furni widget, the currency as activity points, the trophy as
one furni model with `MapStuffData`, and every one of those verified against this repository rather
than against a guide.

**Now wrong, and owed:**

| # | What | Where it bites |
|---|---|---|
| 1 | The loop is a **session**, not a cast per sighting | `Cast(sightingId)` and `FishSighted` model the wrong interaction. It should be start/stop plus a stream of results |
| 2 | **Spots deplete** | `FishingZoneSnapshot` and the client's zone definition carry no stock; §2.3 of the old doc explicitly said they never deplete |
| 3 | **Rod quality is separate from fishing level** | `RodLevelDefinition` fuses them — it keys tiers by XP threshold as though the rod *were* the level |
| 4 | **Season** is a fourth availability axis | `FishSpeciesDefinition` has `activeHours` and `activeWeekdays` only |
| 5 | **Hook Havoc exists** | The minigame was designed, then deleted. It has to come back, as Q/E rather than hold-to-reel |

None of this invalidates the wire layer's *shape* — count-prefixed tables, an append-only field
order, a versioned re-sendable definitions push. It invalidates several of the fields inside it, and
the interaction the three client→server packets describe.

**Do not patch these one at a time.** Items 1 and 3 change the data model, and 5 adds a whole
interaction; correcting them together is one pass, correcting them separately is five.

---

## 11. Still unknown

Everything a dump would answer, and nothing a guide can:

- Real packet names, ids, and field orders.
- The XP curve, the rod tiers and their multipliers, the Hook Havoc trigger chance.
- Per-species rarity, weight, XP and token values, and how the season axis is encoded.
- Whether a spot's depletion count is per-spot, per-player, or global.
- Whether frogs are a species or a separate catch type.

---

## 12. What the server is, and the three defects wiring it exposed

The emulator half shipped on 2026-08-29: `../vortex-emulator/Vortex.Fishing`, four grains
(definitions, player, session, derby), eight tables, fifteen registered packets, and a seed that
makes the feature playable rather than merely present.

**Where the authority sits.** The client starts a session and plays Hook Havoc; everything else is
decided server-side and arrives unasked — which fish, what weight, what XP, what tokens, when a spot
runs dry, and whether a Hook Havoc attempt succeeded. Two consequences worth stating:

- **A sighting names no species.** Naming it would let a client filter for rare ones before the catch
  resolves. Only `Golden` travels, because a Golden Fish is visible in the water in Origins.
- **Hook Havoc is replayed, not reported.** The server issues a seed, the client plays against it,
  the whole input timeline comes back, and `HookHavocSimulation.Replay` decides. Every constant in
  that file is wire contract: the client has to reproduce the generator, the tick length and the
  order of operations exactly, or a fair attempt scores as a loss.

**Everything is editable at runtime, and the two halves sit in different places.**

*Content* — species, zones, rod tiers, the level curve — is reference data in tables an operator
fills. `FishingDefinitionsGrain.ReloadAsync()` re-reads it and broadcasts to every connected session,
so an edit reaches a player already standing at a pond. That is the whole reason the tables travel as
a packet rather than as a gamedata file.

*Tunables* — the daily cap, the sighting delays, the session decay, the frenzy schedule and
multiplier, the Hook Havoc parameters, the derby size, the trophy furni class — are **not** table
rows. They are admin-editable gameplay config in `IServerConfigGrain` under the `fishing.*` keys,
resolved by `FishingConfig.ResolveAsync` in one round trip against compiled defaults, exactly as
`FreezeConfig` / `GroupConfig` / `ClubConfig` do. That grain is write-through, so an override is live
on the next read.

The first version of this got it wrong and put the tunables in a `fishing_settings` singleton row,
copied from `marketplace_settings`. `IServerConfigGrain`'s own summary says why that is the wrong
home: *"tunable gameplay config lives here rather than in a boot-cached provider or (for
runtime-editable knobs) appsettings."*

### The three defects

None of them threw, and none showed in a typecheck. Each is the same shape as the failures this
repository already documents: complete code that nothing reaches.

| # | Defect | Why it was invisible |
|---|---|---|
| 1 | `FishingSpotWidgetHandler.getProcessedEvents()` returned **null** | `RoomDesktop` appends the open/close pair to whatever it returns and appends nothing to null. The four wirings were all present and correct; the panel still could not be opened by clicking a spot. The handler's own comment claimed the null was deliberate |
| 2 | `StartFishing` sent the **sighting id** in the spot id's place | It also deadlocked: a shadow only arrives inside a session that has already started, so a start gated on an armed sighting could never fire. The client also dropped `FishSighted.spotItemId` entirely, so it had nothing else to send |
| 3 | Every `translate()` call passed **positional values** | `getLocalizationWithParams(key, default, ...params)` reads its params as name/value **pairs**. A list of bare values registers the first under the second's name and substitutes nothing — every `%placeholder%` would have rendered literally |
| 4 | The panel was never handed `HabboFishing` | `setDependencies()` existed and nothing called it. Without the tables the panel reads "you cannot fish here"; without registering itself on `HabboFishing` every sighting, catch and refusal is dropped on arrival. The factory comment said RoomUI handed them in — RoomUI did not even resolve the component |
| 5 | **`FurnitureLogic` read `this._widget` instead of `this.widget`** at both emit sites | *An engine bug, not a fishing one.* Every logic that names a widget does it by overriding the **getter** and never assigns `widgetType`, so the private field stays null and a double-click emits nothing at all. `getEventTypes()` had already been fixed for exactly this and the two emit sites were left standing — which made the crafting table and the rentable space inert too. AS3 `_SafeCls_1722.as` reads `widget` at all three (lines 62, 306, 443) |

`scripts/check-fishing.mjs` now guards 1, 2, 4 and 5 by inspecting the sources, alongside the wire
format and the reload path it already ran. Defect 5 is worth its own note: it is the reason a spot
placed in a room did nothing at all, and it had been shipping against two other widgets since long
before fishing existed.

**The panel opens on double-click**, like every other furni widget — `FurnitureLogic.mouseEvent`
routes `doubleClick` to `useObject()`, which is what emits `ROWRE_OPEN_WIDGET`. A single click only
raises `ROE_MOUSE_CLICK`.

**No server-side logic registration is needed.** `RoomObjectLogicProvider.CreateLogicInstance` falls
back to the default floor logic for an unknown name and logs a warning, which is all a fishing spot
needs from the room grain — the feature's own packets are a separate path. Registering a no-op
`vortex_fishing_spot` logic server-side would only silence that warning.

### What is still owed

- ~~**Hook Havoc's client half.**~~ Built. `HookHavocGame` is the arithmetic, mirrored statement for
  statement from `HookHavocSimulation.cs` — same xorshift, same tick length, same order of
  operations. The two halves share no code and cannot: one is TypeScript in a browser, the other C#
  in a grain. What they share is a drift sequence, and `check-fishing.mjs` pins it against a vector
  computed independently in Python with explicit uint32 masking. **Neither file may change without
  the other**: one operation out of step scores a fair attempt as a loss.

  Keys are read on the `document`, not on the panel — a window-scoped listener only fires while that
  window holds focus, and the minigame has to answer wherever the pointer is. `event.code`, not
  `event.key`, so an AZERTY keyboard reports the physical Q.
- **The derby has no client UI.** Both packets are registered and the server half is complete —
  nothing sends `JoinDerby` and nothing listens for a standing. The derby is Vortex's own addition
  anyway: Origins has the Fishing Frenzy, which is a schedule rather than a leaderboard.
- **Collectibles are not modelled.** `FishingPlayerState.collectibleIds` is always empty because no
  table says which furni or badge ids count as fishing collectibles. The bottles, statues and badge
  of §6 are named in this document and nowhere else.
- **The furniture does not exist.** `vtx_fishing_spot_park` / `_hana` / `_snouthill` and
  `vtx_fishing_trophy` are in no furnidata. Until a hotel adds them there is no spot to click — which
  is the honest outcome, rather than pointing a zone at somebody's pond decoration.
- **The migrations are generated, not applied.** `AddFishing` and `SeedFishingDefaults` build; when to
  migrate is an operations decision (see the emulator's README).

---

## 13. Testing it

The feature is playable once four things are true. Three are done and recorded here so they can be
redone after a wipe; the fourth is a restart.

**1. The database.** `AddFishing` + `SeedFishingDefaults` create eight tables and fill four of them
(3 zones, 12 species, 14 level steps, 5 rod tiers). Applying them is an operations decision — see the
emulator's README. The tunables need no seed: they are `IServerConfigGrain` keys with compiled
defaults.

**2. The furniture, which does not exist in any Habbo dump.** A hotel has to make it. The trap is
that **the client reads a furni's logic from the `.nitro` bundle's own index**
(`RoomContentLoader.getLogicType()`), *not* from the emulator's `furniture_definitions.logic`
column — set only the column and the spot renders and does nothing.

A `.nitro` is: `int16` file count, then per file `int16` name length, name, `int32` data length,
data — **every entry zlib-deflated, the PNG included**. The three bundles this port uses are built
from Origins' own artwork; §15 has their construction, including the offset formula and the member
grammar that has to be decoded first. A throwaway spot needs none of that — a copy of any existing
1×1 furni bundle with `name` renamed throughout and `logicType` set to `vortex_fishing_spot` is
enough to click, and `atni_fountain` is the one this started on.

**3. The registrations**, in three places that must agree on the class name:

```sql
-- The emulator's definition. `logic` here is for the server's own use; the client ignores it.
INSERT IGNORE INTO furniture_definitions
  (id, sprite_id, name, type, category, logic, total_states, width, length, stack_height,
   can_stack, can_walk, can_sit, can_lay, can_recycle, can_trade, can_group, can_sell, usage_policy)
VALUES
  (8100001, 8100001, 'vtx_fishing_spot_park',      0, 1, 'vortex_fishing_spot', 1, 1, 1, 0.5, 0,0,0,0,0,1,1,1,1),
  (8100002, 8100002, 'vtx_fishing_spot_hana',      0, 1, 'vortex_fishing_spot', 1, 1, 1, 0.5, 0,0,0,0,0,1,1,1,1),
  (8100003, 8100003, 'vtx_fishing_spot_snouthill', 0, 1, 'vortex_fishing_spot', 1, 1, 1, 0.5, 0,0,0,0,0,1,1,1,1);

-- One copy each into a player's inventory, to place in a room.
INSERT INTO furniture (player_id, definition_id, room_id, x, y, z, direction)
SELECT 1, d.id, NULL, 0, 0, 0, 0 FROM furniture_definitions d
WHERE d.id BETWEEN 8100001 AND 8100003
  AND NOT EXISTS (SELECT 1 FROM furniture f WHERE f.player_id = 1 AND f.definition_id = d.id);
```

…plus one entry per class in the served `furnidata_json.json`, whose `classname` is what ties the row
to the bundle and to `fishing_zones.furni_class`. **Append, never regenerate**: the served furnidata
is hand-edited, the same rule as `external_variables`.

**4. Restart the emulator.** The furniture definitions are cached at boot, so a new class is invisible
until then.

Then: place a spot, click it, press *Start fishing*. Shadows appear every 4–9 s, each resolving into a
catch or an escape, and the spot runs dry after 1–6 catches in Infobus Park. Only zone 1 is reachable
at level 1 — Port Hana needs 30 and Snouthill Pier 70, which is what `fishing_levels` gates.

**Retuning while it runs**, which is the point of the config grain — no restart, no reload:

```sql
-- Faster shadows and a shorter wait, to see the loop without waiting on it.
INSERT INTO server_config (config_key, config_value, description, created_at)
VALUES ('fishing.min_sighting_delay_ms', '800', 'test', UTC_TIMESTAMP()),
       ('fishing.max_sighting_delay_ms', '1500', 'test', UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);
```

Mounting a catch stays off until `fishing.trophy_furni_class` names a real furni class — it defaults
to empty, and an empty value is honoured rather than defaulted, so a hotel without the trophy simply
has no mount button that does anything.

---

## 14. What the real Origins cast overturned

`hh_fishing.cct` — see the box in §0. Read against it, the reconstruction was right about the shape
and wrong about several things it had no way to know. Each of these is now **evidence**, not a guess.

| # | This document said | The cast says |
|---|---|---|
| 1 | "The derby is **Vortex's own addition, not an Origins feature** — Origins has the Fishing Frenzy, which is a schedule rather than a leaderboard." | **Wrong.** `derby_ui.window`, `derby_leaderboard_background`, `derby_leaderboard_logo`, `derby_reg_box`, `derby_standard.window`, `derby_store_a/b.window`, `derby_weight_0..9` + `derby_weight_decimal`, and `derby_frenzy.window` / `derby_frenzy_catch` / `derby_frenzy_gold`. Origins has a derby, with registration, a leaderboard, a store of its own, and a frenzy variant — and it weighs catches to one decimal |
| 2 | Hook Havoc is a needle on a horizontal track | It is a **dial**. `fishingUI_mittari` and `fishingUI_viisari1` / `viisari2` are Finnish for *gauge* and *pointer*, and `dial_fish` sits beside them. Two pointers, not one. The Q/E inputs are also real on-screen buttons: `fishing.button.left/right.active` + `.pressed` |
| 3 | Rarity is N filled stars, no empty sockets | Both exist: `fishpedia_star_empty` **and** `fishpedia_star_filled` |
| 4 | The hour, weekday and season masks are readable only as text | The Fishopedia draws them: `fishpedia_days_grid_bg` + `fishpedia_active_day_marker` (a weekday grid) and `fishpedia_timeline_bg` (the hours), plus `fishpedia_location_bar` for the zone |
| 5 | A species is one entry | Species have **variants**: `fishpedia_ice_*`, `fishpedia_sand_*` and `fishpedia_derby_*` versions of the same fish. Seasonal and derby-only skins, which is a fourth axis expressed as artwork rather than as a flag |

Confirmed rather than overturned: the rod is a carry object (`h_fishing_rod_0..7` with `sh_` shadows,
eight directions), there is a splash animation (`h_fishing_splash_*`, `s_fish_splash_*`), the catch
hangs from the line (`h_hooked_object_*`), the spot is a room furni (`s_fish_area_a_*`, 80 sprites —
see §15), there is a sign (`s_fish_sign_a_*`), the token has its own icon (`fish_currency_icon`), and
the store is a real three-tab window (`fishing_store_a/b/c.window`, `fishing_store_tab1/2/3_l/m/r`).

**The 21 Lingo scripts are unread.** They are where the numbers live — catch rates, timings, the
Hook Havoc rules, the frenzy schedule. Every value in §2 through §6 is still a guess until somebody
reads them.

## 15. The fishing furni, rebuilt from Origins' artwork

Until 2026-08-29 the three `vtx_fishing_spot_*` classes were a renamed copy of `atni_fountain` with
its `logicType` swapped — a placeholder, because the zones name furni classes that exist in no Habbo
furnidata and there had to be *something* to click. Six bundles now carry Origins' own art:

| Class | Origins tint | Zone |
|---|---|---|
| `vtx_fishing_spot_park` | 0, `#99FFFF` pale shallows | Infobus Park |
| `vtx_fishing_spot_hana` | 1, `#398FDF` open blue | Port Hana |
| `vtx_fishing_spot_snouthill` | 2, `#1A3854` deep navy | Snouthill Pier |
| `vtx_fishing_spot_lagoon` | 3, `#2BB5D3` turquoise | none yet |
| `vtx_fishing_spot_night` | 4, `#222230` near-black | none yet |
| `vtx_fishing_sign` | — | — |

**`lagoon` and `night` are derived names.** Origins numbers the five tints and names none of them;
these two are named from the colour at the tile's centre rather than passed off as recovered. They
place and animate, but no `fishing_zones` row points at them, so they are decoration until one does
— `GetZoneForFurniClassAsync` returns null for an unknown class and the session refuses cleanly.

**The signpost is a furni of its own, not a layer on the spot.** It marks that a fishing zone is
nearby; the water tiles make the zone without it, and Origins tiles several of them into an area.
Bundling it onto the spot — which the first cut here did — plants a post in the middle of every
single tile of water.

### The member grammar, which the name list alone gets wrong

    s_fish_area_a_0_1_1_<direction>_<colour>_<position>

- **`<direction>`** is 0 or 1, and X=1 is the exact horizontal mirror of X=0 — verified pixel for
  pixel, which is what identifies it as a direction rather than a state.
- **`<colour>`** is the water tint. Five of them, tabulated above.
- **`<position>`** is where the fish shadow sits. Eight of them: the swim loop.

**Colour 0 is written on two numbers, not three** — `..._0_5`, never `..._0_0_5`. Shockwave drops a
zero index. That single elision is why the member list on its own reads as an *eight-layer* furni
with four of the layers animated, which is what the first pass here concluded and what the pictures
immediately disproved: every sprite is a complete 34×17 tile, and stacking them composites nothing.
2 × 5 × 8 = 80, plus `s_fish_area.props`, which is the 81 the member file counts.

### Director regPoints → nitro offsets

Director anchors a cast member at its regPoint, stored at **byte 18 (regY) and byte 20 (regX)** of
the bitmap spec — confirmed against three members of known geometry, e.g. `fishing_progress_bar` is
241×25 with reg (120, 12), dead centre. Origins puts the fishing area's regPoint at the tile
diamond's **left corner**: (0, 9) on 34×17.

Nitro anchors at the tile **centre** and stores the offset from the sprite's top-left corner to it.
Calibrated against `atni_fountain`, whose 41×57 body sits at (20, 47) — ten pixels of it below the
origin, which is where a fountain's base ends on a 64×32 tile. So:

    nitro_x = regX * 2 + 32        nitro_y = regY * 2

The `+ 32` walks the anchor from the diamond's left corner to its centre; y needs no term because
the left corner already sits at the diamond's vertical middle. The `* 2` is the scale: **Origins
ships this art at the 32×16 tile size only** — its 64-scale copy lives in a furni cast downloaded on
demand, which is not in the client folder — and the modern client draws rooms at 64, so every sprite
is doubled nearest-neighbour. On flat-colour pixel art that reproduces each edge exactly.

The formula holds for the sign and the splash without adjustment: the sign's reg (−7, 29) puts its
foot 12px below the tile centre and its board 58px above, which is a post planted at the water's
edge.

### What a spot bundle contains

Layer `a` is the water — eight frames, `frameRepeat` 3, looping. Layer `b` is the splash. Direction 4
is a `flipH` alias of direction 0, which is Origins' X=1 pixel for pixel; the sign, whose own bundle
has one direction, is aliased **unflipped**, because a mirrored signpost reverses the fish on it.
`logic.model.directions` is `[0, 180]`, the pair Origins drew, and `dimensions.z` is 0 for the water
(nothing stacks on it and `canstandon` is false) and 1 for the sign.

Two visualization states:

- **0, idle.** Water swims; the splash layer holds a 1×1 transparent frame.
- **1, splash.** Water swims; the splash plays its ten frames once and **ends on that blank frame**,
  so the state can simply be held rather than needing something to clear it. `17_fallfan` is where
  the 1×1-transparent trick comes from — there is no "hide this layer" flag in a nitro animation,
  and a layer an animation omits is not defined to hold its previous frame.

No explicit layer `z` is needed: `FurnitureVisualization` subtracts `layerIndex * 0.001` from each
sprite's depth, so the higher layer index already draws in front.

**Nothing switches the furni to state 1 yet.** The art is in place; the session grain has to set the
state when a line goes in, which is the same wire a normal furni state update rides.

## 16. The rod, as an avatar effect

`h_fishing_rod_0..7` — eight real drawings, none of them another's mirror. It ships as effect
**8100** (`VortexFishingRod`), in the 8000–8999 band `effectmap.xml` uses none of; the emulator wears
it for the length of a session (`fishing.rod_effect_id`, `FishingSessionGrain.ShowRodAsync`) and
takes it off on stop or depletion. Everyone in the room sees it, which is the only outward sign that
somebody is fishing — the session otherwise runs unattended and shows nothing.

**An effect, not a carry item.** Origins anchors the rod to the avatar's own origin, where a Habbo
carry item is anchored to the hand by geometry this port would have had to re-derive. An effect's
`adds: [{id: "ri", align: "rightitem", base: …}]` places a sprite exactly the way Origins does;
`Torch.nitro` is the shipped bundle it copies.

Two things about the client's own handling had to be measured rather than reasoned about, and both
cost an iteration:

- **`ri` is mirrored for directions 4, 5 and 6** (`AvatarDirectionAngle.DIRECTION_IS_FLIPPED`) with
  no direction remap — a body part would resolve direction 4's art from direction 2, but a
  right-hand item resolves its own and flips it. The art for those three is therefore pre-mirrored
  in the bundle so the client's mirror restores it. Cancelling the mirror instead, with `flipH: true`
  on the alias (`effectiveFlipH = isPartFlipped !== totalAssetFlipH` reads as though it would),
  renders **nothing at all** on those three directions. A 3×3 magenta probe effect settled it in one
  render where reading `AvatarImageCache.renderPart()` had not.
- **The hand is not where a carried item's centre is.** The offsets were first derived from carry
  item 2's asset box; item 2 is a 7×27 bottle whose centre sits well above the grip, and the rod came
  out at chest height. The rod is placed by matching the centroid of the bottom fifth of its own
  opaque pixels — the handle — to where Habbo's own item lands, and verified by rendering a magenta
  silhouette of the finished bundle and measuring where the grip fell. All eight are within a pixel.

The bundle is built by `build_rod.py`, and `vortex-imager`'s `/habbo-imaging/avatarimage?effect=8100`
is what every one of those measurements was read off — a furni or an avatar can be rendered through
the client's own pipeline with no session, which is the cheapest way to check a hand-built asset.

### Still not in it

The avatar-side splash (`h_fishing_splash_*`) and the hooked catch (`h_hooked_object_*`). Both are
avatar-attached like the rod — `h_` is the 64 scale and `sh_` the 32, confirmed by
`h_fishing_rod_0`'s regY of −90 against `sh_`'s −40 — and both want the same treatment.

## 17. Three extraction bugs that shipped, and how each showed itself

None of these threw. Every one produced a plausible-looking PNG, which is the whole difficulty:
`docs/PATTERNS.md`'s rule about silent failures applies to asset pipelines exactly as it does to
parsers. All three were found by *looking at the output composited the way the client composites it*,
never by reading the extractor.

| Symptom | Cause | Rule now |
|---|---|---|
| `h_fishing_rod_4/5/6` shipped on a white card, outline gone | the colour key was `px[0, 0]`, and those three have the rod's black tip in that exact pixel — so it keyed the drawing and kept the card | key what the **four corners** vote for, not one corner |
| `fishingUI_green_pixel` — the whole Hook Havoc progress bar — rendered nothing | it is 1×1 and entirely the key colour, so keying left zero opaque pixels | never key a member that is **entirely** the key colour; it is a swatch Director stretches, not a drawing on a card |
| the same pixel came out transparent black rather than green, and 33 other small members were subtly wrong | Director stores a BITD **raw** when RLE would not pay. The decoder does not fail on raw bytes, it produces plausible garbage: `ff 00 aa 00` (opaque green) reads as "repeat the next byte twice" and yields zeros | when `len(data) == pitch * height`, it is not compressed |
| `fishpedia_bookmark` lost its black outline, `fishpedia_bookmark_shadow` lost all but 100 of its 600 pixels, `fishpedia_days_grid_bg`'s separators went transparent, and `fishpedia_hiliter` kept 755 pixels of 4269 | the key was whatever colour the four corners agreed on, and on a full-bleed plate that colour is the ARTWORK — the outline, the grid lines, the plate's own border | **flood-fill pure white inward from the border.** White only, because a member drawn on any other colour must stay opaque and reportable rather than silently holed; from the border, because white *inside* a drawing is not the card — the fish on the bookmark is white, and so is the rod's shaft |

A fourth, in the client rather than the extractor: `fishingUI_viisari1` is a 42×112 member that
Origins' window definition draws at `#width: 11, #height: 28`. Director scales a sprite to the size
its definition gives it; drawing the member at its own size filled the dial with a grey wedge.
**A cast member's size is not the size it is drawn at** — the window definition is the authority.

### A layout CAN name its own images — `asset_uri` on a `static_bitmap`

The Hook Havoc panel first shipped with every element a code-filled `<bitmap>`, which made it show
as empty slots in vortex-glaze and unfillable there. That was a mistake, and the reasoning behind it
was wrong twice over: `<bitmap>` really does carry no image attribute, and
`BitmapWrapperController.bitmapAssetName` really is written by code and read by nothing — but the
mechanism is on the *other* wrapper.

```xml
<static_bitmap x="0" y="0" width="160" height="243" params="16" style="0" name="hh_bg">
  <variables>
    <var key="asset_uri" value="fishingUI_bg" type="String"/>
  </variables>
</static_bitmap>
```

**293 of the shipped layouts do this.** `WindowParser` reads `asset_uri` out of the node's properties
and hands it to `StaticBitmapWrapperController.assetUri`, which resolves it through the
`ResourceManager`; `App.readImageAssets()` registers every image in the bundle under its bare
filename (`fishingUI_bg`, no `.png`), so a bare name resolves. `properties` round-trips the key, so
`windowToXMLString` emits it and glaze's serializer preserves it — the image survives an edit-and-save.

Only a slot whose pixels are *computed* needs code: here that is `hh_dial` alone, composited from
gauge + needle + pivot every tick. Two-state art does not count — a pressed key is a second
`static_bitmap` underneath, toggled by `visible`, which is the idiom `Achievement.xml` uses
(`bg_unselected_bitmap` / `bg_selected_bitmap`).

**Text alignment is `auto_size`, and it is a string** — `left` / `center` / `right` / `none`, not
the boolean the name suggests, set as `<var key="auto_size" value="center">`. 492 shipped layouts
use `center` and `TextSkinRenderer` shifts the line by `(maxWidth - textWidth) / 2`. There is no
`align` attribute, which is what makes it easy to miss: the first fix here hand-placed each key
letter's x from a measured glyph width, which is wrong the moment the font or the text changes.

## 18. There is no spot panel, and there never was

Clicking a fishing spot opened a window until 2026-08-30. **Origins opens nothing.** Its cast carries
thirteen window definitions --

    fishingUI          fish_o_pedia          fishing_store_a / _b / _c    old_fishing_store_c
    derby_ui           derby_standard        derby_frenzy
    derby_leader_a / _b                      derby_store_a / _b

-- and not one of them is a spot. Clicking the water fishes; the only window fishing ever shows is
Hook Havoc. The panel was invented, and it read as invented.

What replaced it is `vortex_fishing_hud_xml`: a strip carrying the level, the XP bar and the token
count, shown for the length of a session and gone with it. Clicking the spot again stops fishing —
the strip has no buttons, so the furni is the control.

**The plates are Origins'; the arrangement is not.** `fish_lvl_box`, `fish_lvl_max_box`,
`fish_currency_box`, `fish_currency_icon` and `fishing_progress_bar` are all in the cast and in
**none of the thirteen windows**, which means the compiled Lingo draws them directly. So their sizes
and their artwork are evidence and their positions are this port's — every plate is drawn at its own
native size except the background, which stretches. If the Lingo is ever read, the arrangement is
what to correct.

Two things went with the panel:

- **The zone name and level gate.** The server refuses a spot the player cannot fish. This section
  used to claim the refusal "lands in the strip's status line like every other outcome, so nothing is
  lost but a label", and that was wrong in the one case it mattered: the strip exists only for the
  length of a session, and `LevelTooLow`, `TooFarAway` and `DailyCapReached` all answer the click
  that would have *begun* one. There was no strip to write into, so clicking the water did nothing
  and said nothing. `HabboFishing.onFishingError()` raises a notification bubble now, and 8114
  carries a trailing `detail` int — the zone's required level — so the message names the number
  instead of saying "too low". The client cannot derive it: the refusal is what stops it ever
  learning which zone the spot is in.
- **The mount button.** `mountLastCatch()` survives and nothing calls it. It was already inert —
  mounting needs `fishing.trophy_furni_class` set and the shipped default is empty — and the
  Fishopedia's records tab is where it belongs, being the one screen that lists catches.

## 20. The Lingo is readable after all

`hh_fishing.cst` — the **uncompressed** cast, `XFIR`/`MC95` rather than the `.cct`'s afterburner
container — run through **ProjectorRays** decompiles. `docs/vortex-original/origins/lingo/` holds the
result: five classes, and `ParentScript 391 - Fish-O-Pedia Manager Class.ls` is the Fish-O-Pedia in
full.

Everything §19 reconstructed from screenshots is now read from the source instead, and
`vortex_fishing_pedia_xml.xml` is generated from it rather than measured. What the code says:

- **The screen is one 528x409 buffer.** `drawCurrentPages` blits the book at `(0, 50)`, so every
  coordinate below is buffer-relative and the book is `BUFFER - (0, 50)`.
- **A page is its own 236x299 image**, drawn at `x = 8 + (i - 1) * 235`, `y = 55`. Which is why the
  spread is two independent pages rather than one picture with a gutter.
- `renderFishesOverviewPage`: eight fish, `x = start + (i mod 2) * 96`, `y = 22 + 62 * (i div 2)`,
  the name at `(+1, +6)` in a 93x11 box and the preview at `(+0, +17)`.
- `renderFishInfoPage`: every row's y — 27 the name, 38 the fish, 59 and 70 the rarity, 87/104/121
  the three fields, 139/150/155 the location, 177/191 the hours, 231/246 the days.
- `renderInfoField`: **two boxes side by side, not nested.** The grey `a_l`/`a_m`/`a_r` wraps the
  LABEL, the lighter `b_m`/`b_r` wraps the VALUE, and the whole is `titleWidth + valueWidth + 8`
  wide. Three earlier attempts had it as one stretched bar, then a small box, then a nested pair.
- `renderPageBackground`: the title is a box filled `color(230, 230, 230)` with a 1px outline in
  `color(101, 157, 171)` — the same blue as the text and as the page frame. It is drawn *over* the
  frame line, which is unbroken in the plate; that is where the apparent gap comes from.
- `drawBookmark` puts it at `(195, 27)` — **above the book's own top edge**, which is why the
  container needs a margin and must not clip.
- `drawPageCorner`: `(8, 330)` and `(455, 330)`, the right one flipped.
- `drawFishTimelineBar`: `x = 5 + hour * 6` on a 159-wide image, the bars *above* the ruler.

**What this cost.** Six rounds of screenshot comparison produced a layout that was close and wrong in
a different place each time. The decompiler answered every one of those questions in a single pass.
The lesson is not about Lingo: when a reconstruction needs more than one correction from the same
source, stop reconstructing and go find the source.

## 21. The float, the line, and an engine bug they uncovered

The rod's bundle had carried a float and a ripple since §16, and neither had ever appeared in a
room. `vortex-imager` drew both correctly, which narrowed it to something the room does and the
imager does not.

**`AvatarVisualization.updateExtraSprites` negated the asset offset.** AS3 writes
`-_loc2_.offset.x - _loc8_ / 2 + _loc13_` and the port copied the sign, but the offset no longer
comes from where AS3 read it: AS3 read a Flash asset library's `<offset>`, and this port reads a
Nitro bundle, where `GraphicAssetCollection.createFromSpritesheet` has **already** stored
`offsetX = -assetDef.x`. Negating a second time lands every effect sprite mirrored about the
object's origin.

The body path settles it, because both have to end up in the same space: `AvatarImageCache` takes
`-graphicAsset.offsetX` as a part's regPoint and `setContainerOffset` negates *that*, so a body part
draws at `+asset.offsetX`. An effect sprite has to do the same. Rendered rather than reasoned: with
`+`, Hoverboard's board sits under the feet and Torch's flame in the hand; with the AS3 sign the
board is some 60px below the avatar with clear air between them.

It had gone unnoticed because effect libraries were not in the alias collection until recently, so
`getAsset()` returned null in that branch and **no effect sprite had ever been drawn in a room** —
not the hoverboard, not the torch, not the halo. The imager, which composites effects itself, was
the only place any of them had been seen.

**And a second cause under it, the one that actually reached the screen.** With the offsets fixed the
float still came out as a stray sliver of brown standing on the water. `updateExtraSprites` sets
`sprite.assetName` and stops — faithfully, because a Flash room sprite resolves its own name against
the object's asset library when it is drawn. This port's `RoomObjectSprite` has no library to resolve
against: **nothing anywhere reads `assetName` back.** So the sprite kept whatever texture its pool
slot last held, and the pool is shared with the body-part block. What drew on the water was a stale
slice of the avatar's own leg. `sprite.texture = asset.texture` now, the way `updateMainSprite` has
always done it.

The `asset == null` branch had the same shape and now hides the sprite: it `continue`d after
`sprite.visible = true`, which is how a missing animation frame strands the previous texture in mid
air rather than drawing nothing.

`MutedBubble`, `FloatingHeart`, `TypingBubble` and the rest of `visualization/avatar/additions/` also
set only `assetName`. They are presumably in the same state; nobody has checked.

### What the water is made of

Three fx sprites, and one thing that is not in the cast at all:

| Sprite | Member | Note |
|---|---|---|
| `fx8100_2` | `h_hooked_object_0_0` | The red-and-white float. 8x8, one drawing |
| `fx8100_3` | `h_fishing_splash_0_0..3` | The ripple, four frames |
| `fx8100_4` | — | **The line. Generated.** |

`hh_fishing.cst` has no line member under any name, so Origins draws one in Lingo and this draws
the same: a 1px run in the rod's own outline black, from the tip to where the float meets the water.
Its two ends cannot both be derived — the float's position is arithmetic, but the rod is a body part
composited into the avatar's union image, which `updateMainSprite` then places bottom-anchored and
horizontally centred, so where the tip lands depends on every part the avatar happens to be wearing.
`TIP_TO_FLOAT` is measured off a render, per direction, exactly as `HAND` and `CORRECTION` are.

The Director regPoints were dropped from the float and the ripple at the same time. They are the
cast's own, in Lingo's convention, and reading them as Nitro offsets put the two 11 and 15 pixels
apart and both of them a tile short. Every water sprite is now centred on the effect's origin and
`FLOAT_OFFSETS` — the tile delta through `screen = ((tx - ty) * 32, (tx + ty) * 16)`, plus the 16px
between the avatar's origin and the sole of its shoe — carries the set out together.

**Depth follows the tile, not the sprite.** A spot the avatar faces north-west is `(-1, -1)`, which
is 32px straight up the screen and two rows back, so the room hides it behind the avatar; one to the
south is in front and must not be. `dz = (tx + ty) * 4`, with the float and the line two steps above
the ripple. Direction 7 therefore shows the rod and nothing else, which is what an isometric room
does with the tile directly behind you.

`FEET_DROP` is measured, not `scale / 4`. `updateMainSprite` places the body at `-height + scale / 4`,
so the avatar texture's bottom EDGE is at +16 — but the image carries nine rows of empty margin under
the shoe, and the last shoe pixel is at **+6**. Taking the edge for the floor put the whole set ten
pixels low.

And `TIP_TO_FLOAT` must be measured with the line switched off (`DRAW_LINE = False`). The line is
drawn in the rod's own black, so with it on, the topmost non-water pixel in the frame is the top of
the *line* — which this very table placed — and the reading just echoes what is already there. The
tell is a residual identical in every direction.

## 22. Walking away puts the rod down

Two guards, because there are two kinds of moving.

`MoveAvatarMessageHandler` stops the session before it walks the avatar. It has to be there rather
than on the session's own next step: a step is on a rolled delay of seconds, so the player would
cross the room still holding the rod with a line running back to the water. The grain returns
immediately when no session is running, which is the usual case for that packet.

`FishingSessionGrain.SightAsync` re-checks `IsWithinReachAsync` on every step, beside the online
check that was already there for the same reason. Start is not the only moment reach matters — a
session runs on its own timer for as long as the stock lasts, so without this it keeps landing fish
from the far side of the room. And a walk packet is not the only way to move: a wired teleport, a
push and a roller all move an avatar without one.

## 23. Finishing pass — 2026-08-30

### The generators now live in the repository

`scripts/origins/` holds the whole Origins pipeline: the two cast readers (`.cct` afterburner and
`.cst` uncompressed), the bitmap extractor, the Mac palette, the image importer, the spot and rod
builders, the furnidata registrar, the Fish-O-Pedia generator, the window converter and the water
probe. Its README has the order they run in and the three decoding traps that each shipped wrong
pixels once.

They were in a scratch directory until now, which made every `.nitro` in the asset host a binary with
no source. Two things nearly went wrong on the way in:

- **`tools/` is gitignored at the repository root**, with exceptions only for `packages/*/tools/*.mjs`.
  A `tools/origins/` would have been invisible — the exact problem being fixed. They live under
  `scripts/`, which is not ignored.
- **The Fish-O-Pedia generator overwrote hand edits.** A title box, a plate and eighteen preview
  sizes had been fixed by hand in the layout and were gone the first time the generator ran. They are
  in the generator now, and the layout says `GENERATED - do not edit` at the top.

### Six more windows, converted rather than drawn

Origins declares its windows as flat lists of Lingo property lists, and
`docs/vortex-original/origins/*.window.txt` has them: member, position, size, flip, colour, font size
and the localisation key each text reads. `scripts/origins/convert-window.py` translates that into a
Vortex layout, so the store and the derby did not have to be measured off screenshots the way the
Fish-O-Pedia's first three cuts were.

| Window | Elements | State |
|---|---|---|
| `vortex_fishing_store_a_xml` | 34 | artwork |
| `vortex_fishing_store_c_xml` | 41 | artwork |
| `vortex_derby_standard_xml` | 43 | artwork |
| `vortex_derby_frenzy_xml` | 12 | artwork |
| `vortex_derby_leader_b_xml` | 11 | artwork |
| `vortex_derby_ui_xml` | 4 | artwork |

**Artwork only, and they are reachable on purpose.** `:fishwindow <name>` opens each through
`FishingStaticWindowView`, which says so in its class comment and in the log line it prints. Six XML
files nothing referenced would be this port's most common defect — complete code nobody connects —
and the hardest kind to notice. What each still needs is a view: the store's three tabs and its
purchase flow, the derby's standings, timer and registration.

Four members in those windows are not in the fishing cast at all (`content.middle.middle`,
`shadow.pixel`, `button_element`, `fishing_store_header`). They belong to Director's shared interface
cast — the main client's chrome — and all four are flat fills, so the converter substitutes a
`<text>` with a background, which is the only way this window system draws a plain rectangle.

`fishing_store_b`, `derby_store_a`, `derby_store_b`, `derby_leader_a` and `old_fishing_store_c` are
22 bytes each: Origins ships them empty.

### The sign opens the book

§1 says a wooden fish sign opens the skill interface and the sign had been inert since §15 made it a
furni of its own. It now carries `vortex_fishing_sign` logic and `RWE_FISHING_SIGN`, wired at all
four sites — and at a fifth the other four do not have: **the bundle's own `logicType`**, which is
what selects the logic in the first place. It said `furniture_basic`. `check-fishing.mjs` asserts all
five.

`FishingSignWidgetHandler` builds no widget of its own; the book is a window `HabboFishing` owns.
`RWE_LOCATION_WIDGET` is the precedent — `RoomDesktop` keeps a widget-less handler registered.

### A catch says so

`onCatchResult` raises one of the singular notification bubbles, with the species' own Fish-O-Pedia
preview as its icon.

**Whether a species is new is derived, not sent.** No field on the wire says so, but `_records` still
holds the pre-catch table at that moment, so a species missing from it has never been landed. That is
the only instant the client can tell.

The bubble's `type` has to be one `habbo_notifications_config_xml` already declares:
`SingularNotificationController` looks it up and **drops the notification** when it is absent — one
`warn`, nothing on screen. A `fishing` entry would have to go into a shipped Flash asset
`build-window-assets.mjs` regenerates from the dump, so it would not survive; `info` is the generic
bubble and an explicit `iconBitmap` overrides its own icon.

### The rest of the pass

- **The spot splashes.** The bundle has carried two animations since §15 — 0 the idle water, 1 the
  splash — and nothing had ever asked for the second, so a catch happened in still water.
  `FishingSessionGrain` sets state 1 on the spot when it banks one; the layer declares `loopCount 1`,
  so it plays once and returns to idle on its own.
- **`reload-fishing`.** `FishingDefinitionsGrain.ReloadAsync` had no caller, which made the whole
  live-tuning design inert. It is a console command now, beside `reload-mystery-box`.
- **`hook_havoc_chance` restored** to its seeded 20 for quality 1; it was left at 1000 for testing.
- **148 window sprites were missing from the client's image library**, `fishing_store_tab1_m` and
  every other stretchable middle among them, because the import step had only ever been somebody's
  hand. `scripts/origins/import-cast-images.py` is that step. `src/assets/images/` is gitignored
  (`*.png` is, repository-wide), so a tool is the only thing that can own it.

### Still open

| | Why it is not done |
|---|---|
| Store and derby behaviour | Six converted layouts, no views. The largest remaining piece by far |
| The page-opening animation | The Lingo names it (`pAnimStartTime`, `getPageImages`, `addCoverToPage`); `fishpedia_page` and `fishpedia_book_cover` are extracted and unused |
| The trophy on the rod | `h_hooked_object_2` and `_3` are the small and large caught fish, extracted and unused. Needs a wire signal for "holding one" and an effect variant |
| `fishpedia_slot_shadow`, `fishing_splash_0_0` | Extracted, no use found in Origins' own Lingo either |

**The additions are not open — they were already fixed.** This table used to carry a row saying
`MutedBubble`, `FloatingHeart` and `TypingBubble` set only `assetName` and presumably still had the
bug §21 fixed for the effect sprites. They do set only `assetName`, and that is correct: the fix went
into `AvatarVisualization.applyAdditionTexture()`, which runs over *every* addition in the update
loop, not into each addition. All eight `user_*` assets they name resolve in the shipped library.

**There is one Fish-O-Pedia.** An earlier `FishingBookView` showed the same records in an inventory
tab and was kept beside Origins' own book while the two were compared. The book won; the tab, its
model and its three layouts were deleted on 2026-08-31, and the entry point is the me-menu
(`vortex_memenu_fishpedia_xml` → `fishpedia/open`), the room's wooden sign, or `:fishpedia`.
