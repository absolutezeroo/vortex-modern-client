# Helium

Full TypeScript/PixiJS v8 port of the Habbo Hotel Flash client. pnpm monorepo: `helium-engine` (engine) + `helium-client` (display, UI). The entire Flash client is ported — both logic and display — with original XML layouts converted to JSON.

## Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Dev server (Vite)
pnpm build        # Production build (TSC + Vite)
pnpm lint         # ESLint over both packages
```

## Rules

Enforcement rules live in `.claude/rules/` and are auto-loaded into every session (some are path-scoped and only load when you read a matching file). Start with `.claude/rules/00-mandate.md` — nothing may be implemented before it is followed. See also `.claude/rules/10-conventions.md`, `20-architecture.md`, `30-as3-traceability.md`, and the path-scoped `communication.md` / `window-ui.md` / `room.md`.

## Path aliases

**Engine** (`helium-engine`): `@core/` → `src/core/` | `@habbo/` → `src/habbo/` | `@room/` → `src/room/` | `@iid/` → `src/iid/`

**Client** (`helium-client`): `@core/` `@habbo/` `@room/` `@iid/` → engine src | `@ui/` `@/` → `src/`

## AS3 sources

| Directory                                    | Priority    | Package roots                           | Files | Obfuscated |
|----------------------------------------------|-------------|-----------------------------------------|-------|------------|
| `sources/WIN63-202607011411-782849652/`      | **PRIMARY** | `src/com/sulake/{habbo,room,core,iid}/` | 3,305 | 25%        |
| `sources/win63_version/`                     | Secondary   | `habbo/`, `room/`, `core/`              | 4,694 | 18%        |
| `sources/PRODUCTION-201601012205-226667486/` | Tertiary    | `src/com/sulake/habbo/`                 | 3,526 | 0%         |

`WIN63-202607011411-782849652` is a later, partly-obfuscated client build and is the primary
day-to-day reference.

**Class names are obfuscated; member names are not.** In an obfuscated file the class is
`_SafeCls_N` and some *types* it references are too, but its methods, getters and constants keep
their real names. `habbo/room/_SafeCls_90.as` declares
`public class _SafeCls_90 extends _SafeCls_50 implements IRoomEngine, ...` and all 255 of its
methods are readable — that file is RoomEngine. **Interfaces are never obfuscated**, so the
reliable way to identify an obfuscated class is the interface it implements
(`implements IRoomEngine` → RoomEngine), not a name lookup elsewhere.

**Do not expect `win63_version` to recover names.** It is obfuscated too — 868 `class_N.as` files —
just with a different scheme, so the same class has a different meaningless name in each tree and
the two do **not** line up file-for-file (in `habbo/room`, 9 of 20 filenames match). RoomEngine is
`_SafeCls_90.as` here, `class_34.as` there, and `RoomEngine.as` only in
`PRODUCTION-201601012205-226667486`, the one tree with no obfuscation at all. Use PRODUCTION to
*identify* a class or recover a member name — never as a behaviour reference: it is a 2016 build and
the API has moved. Some identifiers are obfuscated in every available tree (e.g.
`RoomObjectVariableEnum`'s `furniture_extra`, `RoomObjectLogicEnum`'s `furniture_nft_reward_box`,
which postdate the 2016 build); when a name has to be derived from its value, say so at the
declaration rather than passing it off as recovered.

**`src/unknowns/` (`_SafePkg_N/`) is part of the client** — 556 files under `src/com/sulake/` import
from it, e.g. `habbo/inventory/items/FurnitureItem.as` imports `_SafePkg_2405._SafeCls_2649`, the
interface declaring `get stuffData():IStuffData`. It holds real parser DTOs and composers
(`_SafePkg_3364` carries the unseen-item reset composers). Treating it as an unrelated module means
failing to find definitions that exist. The flat `_SafeCls_N.as` files directly under `src/` are a
different matter and can be ignored.

**The 2026 decompiler drops the `@` from E4X computed-attribute access.** `_loc3_.@["order-before"]`
comes back as `_loc3_["order-before"]`, which reads as child-element access and makes live code look
dead — `.@id` in the same method keeps its `@`, so the inconsistency is the tell. Check the XML: if
the name is an attribute there, the source had `.@[...]`. This is how the `order-before` bodypart
ordering was missed (`AvatarModelGeometry.as`).

Path mapping: `sources/WIN63-202607011411-782849652/src/com/sulake/<module>/` ↔
`sources/win63_version/<module>/` ↔ `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/<module>/`

### Assets

Window layout/skin JSON is compiled from `binaryDataXml_organized/{layouts,skins,non-layouts}`,
which lives in `sources/WIN63-202607011411-782849652/` (see
`packages/helium-client/tools/compile-window-*.mjs`). `src/layouts/` and `src/images/` in the same
dump hold the same raw XML/PNG resources (same `$<hash>` filenames) flat and unsorted.

Shipped assets are not always current with the primary tree — check before assuming a code gap.
`packages/helium-client/src/assets/configurations/HabboAvatarGeometry.xml` has 9 bodyparts and no
`order-*` attributes, where the WIN63 dump's has 11 and 8; the two extra are `petl`/`petr`, the only
bodyparts `order-before` applies to.

## Documentation

| File                                 | Content                                                                                               |
|--------------------------------------|-------------------------------------------------------------------------------------------------------|
| `.claude/rules/`                     | Auto-loaded enforcement rules for Claude Code                                                         |
| `AGENTS.md`                          | Universal AI agent instructions (generated from `.claude/rules/`, for non-Claude tools)               |
| `docs/CONTEXT.md`                    | Full architecture and project context                                                                 |
| `docs/PATTERNS.md`                   | Implementation templates with code examples                                                           |
| `docs/STYLEGUIDE.md`                 | Complete code style reference + performance                                                           |
| `docs/IMPLEMENTATION_STATUS.md`      | Progress tracking (~35% overall, ~710+ files)                                                         |
| `docs/architectures/`                | Per-module AS3 architecture deep-dives, created on demand — see `docs/architectures/README.md`        |
| `docs/CLIENT-SERVER-ARCHITECTURE.md` | Real client↔server protocol, message flows, and known server-side bugs (Arcturus-Community reference) |
