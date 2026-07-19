# AGENTS.md — Vortex

Universal instructions for all AI assistants (Cursor, Windsurf, Codex, Copilot, Claude, etc.)

> The section between the `BEGIN:GENERATED-RULES` / `END:GENERATED-RULES` markers below is generated from `.claude/rules/*.md` by `scripts/sync-agent-docs.mjs`. Do not hand-edit that section — edit the source file under `.claude/rules/` and run `pnpm run sync:agents`.

## Project

Vortex: Full TypeScript/PixiJS v8 port of the Habbo Hotel Flash client. pnpm monorepo with `vortex-engine` (engine) and `vortex-client` (display, UI). The entire Flash client is ported — both logic and display — and the original Flash window layouts/skins ship as XML, verbatim from the dump.

```bash
pnpm install && pnpm dev    # Dev server
pnpm build                   # Production build
pnpm lint                    # ESLint over both packages
```

## AS3 sources

| Directory                                    | Priority  | Package roots                           | Files  |
|----------------------------------------------|-----------|-----------------------------------------|--------|
| `sources/WIN63-202607011411-782849652/`      | PRIMARY   | `src/com/sulake/{habbo,room,core,iid}/` | ~3,369 |
| `sources/win63_version/`                     | Secondary | `habbo/`, `room/`                       | ~4,465 |
| `sources/PRODUCTION-201601012205-226667486/` | Tertiary  | `com/sulake/habbo/`                     | ~7,160 |

`WIN63-202607011411-782849652` is a later, obfuscated build; it mirrors `win63_version` one directory level deeper and both trees line up 1:1. Cross-reference `win63_version` to recover any identifier obfuscated as `_SafeCls_N`/`_SafeStr_N`. Ignore the flat `_SafeCls_N.as` files under its `src/` root and `src/unknowns/` — an unrelated obfuscated module bundled in the same dump.

ALL AS3 files are to be ported — both logic and display classes. See `docs/architectures/<module>-architecture.md` for per-module deep-dives (created on demand).

## Work protocol (mandatory phases)

Inspired by the BMAD method (Breakthrough Method for Agile AI Driven Development). Every implementation task MUST follow these phases in order. No phase may be skipped.

### Phase 1 — Research (BLOCKING)

Until this phase is complete, writing code is FORBIDDEN.

- [ ] Read `docs/CONTEXT.md` to understand the architecture
- [ ] Find and read the AS3 source file IN ITS ENTIRETY:
  - Class declaration (`extends`, `implements`)
  - All imports (reveal dependencies)
  - ALL methods and their complete implementation
  - ALL properties
  - Constructor logic
- [ ] Read the AS3 interface (`I<Class>.as`)
- [ ] Check for handler/listener patterns in the `handler/` subdirectory
- [ ] Check `docs/IMPLEMENTATION_STATUS.md` for current status

### Phase 2 — Plan

- [ ] Identify all classes, interfaces, and relationships from the AS3
- [ ] Map AS3 inheritance to TypeScript equivalents
- [ ] Identify all files to port (logic AND display)
- [ ] List required dependencies

### Phase 3 — Implementation

- [ ] Follow conventions from `docs/STYLEGUIDE.md` (Allman, naming, etc.)
- [ ] Follow templates from `docs/PATTERNS.md` for Composers/Parsers/Events/Managers
- [ ] Engine code → `packages/vortex-engine/src/`
- [ ] Client code → `packages/vortex-client/src/`
- [ ] Preserve AS3 class names, method names, interfaces, and inheritance chains
- [ ] Preserve the complete AS3 public API: every public method, accessor, interface member, implemented interface, constructor contract, and dispose contract must exist in TypeScript
- [ ] Every TypeScript class, method, accessor, property, interface member, handler, parser, composer, or event ported from AS3 MUST include an `AS3:` source trace comment immediately above the declaration (see AS3 traceability section below)
- [ ] Flash XML layouts → JSON format

### Phase 4 — Validation

- [ ] Verify compilation with `pnpm dev`
- [ ] Update `docs/IMPLEMENTATION_STATUS.md` (change ❌ → ✅, update percentages)
- [ ] Check performance rules (see `docs/STYLEGUIDE.md` section **Performance**):
  - No `Array.includes()`/`indexOf()` for frequent lookups → use `Set`/`Map`
  - No object allocation in render loops or high-frequency handlers
  - No `new OffscreenCanvas()` / `Texture.from()` without caching
  - No `getImageData`/`putImageData` for color transforms → use GPU
  - All listeners have a matching `removeEventListener`/`off()` in `dispose()`

<!-- BEGIN:GENERATED-RULES -->
## Mandatory: read before coding

Before writing any implementation code, you MUST complete these steps IN ORDER:

1. **Read the AS3 source file** — Find and read the corresponding AS3 file IN ITS ENTIRETY
   - Primary: `sources/WIN63-202607011411-782849652/src/com/sulake/<module>/<Class>.as`
   - Secondary: `sources/win63_version/<module>/<Class>.as`
   - Tertiary: `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/<module>/<Class>.as`
   - **Never invent a name for an obfuscated identifier.** `win63_version` will not recover it — that tree is obfuscated too, with a different scheme. Only PRODUCTION is unobfuscated, and only for classes that existed in 2016. See CLAUDE.md → "AS3 sources" for how to identify a class, and what to do when a name exists in no tree (say so at the declaration; never pass a derived name off as recovered).
2. **Read the AS3 interface** — `I<Class>.as` + `handler/` directory if present
3. **Check `docs/PATTERNS.md`** if implementing a Composer, Parser, Event, Manager, or UI Window
4. **Check `docs/IMPLEMENTATION_STATUS.md`** for the current module status
5. **Read `docs/CLIENT-SERVER-ARCHITECTURE.md`** if touching anything in `habbo/communication/` (composers, parsers, message events/IDs) or any feature that sends/receives network messages — it documents how this client is expected to talk to a real Arcturus-Community-style server: the wire protocol, handshake/encryption sequence, message ID conventions, full per-system request/response flows (room, chat, catalog, inventory, trading, etc.), and a list of **known real-server bugs and protocol mismatches**. Some AS3 behavior that looks wrong may actually be a deliberate workaround for a documented server-side bug — check this doc before "fixing" wire-format code in `habbo/communication/`.

If you haven't read the AS3 source, your implementation is invalid. No exceptions.

## Before you delete or replace existing TypeScript

The steps above are about the AS3 side. Most of the damage comes from the other one.

**Read the body of every call you remove, replace, or stop making.** Not its name — its
body. This port's method names are inherited from AS3, and the TS behind them is frequently
narrower, wider, or simply different. A name tells you what someone meant; only the body
tells you what the next line depends on.

This is not hypothetical. `createMainWindow()` ended with `hideMainWindow()`, which does not
hide anything — it detaches the window from its parent, and `showMainWindow()` refuses to
attach a window that already has one. Replacing that call with the `visible = false` the AS3
actually specifies stopped the catalog opening at all. The name lied; the body did not.

Two corollaries, both learned the same way:

- **"This change is inert" is a claim, not an observation.** Verify it or don't write it.
  Threading `catalogType` into `useNonTabbedCatalog()` was described as inert for
  BUILDERS_CLUB. It was the opposite: both navigators shared one window, so the per-type
  answer let BUILDERS_CLUB hide NORMAL's tabs permanently.
- **A faithful change to one member can break because a *different* member is unfaithful.**
  Both examples above were correct AS3 applied on top of a still-flattened structure. When a
  faithful change misbehaves, suspect the structure under it before reverting the change.

## Before you act on a finding from an audit or an agent

Verify it against the source yourself. Findings are claims, and a confident, well-cited claim
is still a claim. In the 2026-07-17 parity audit, 3 of 26 criticals did not survive contact
with the code, and one of them would have broken the client had it been acted on; separately,
several findings were already fixed by the time they were read. Re-checking costs minutes.
See `docs/IMPLEMENTATION_STATUS.md` → "Cross-module parity audit" for what the failures
looked like and why they were convincing.

## Conventions

| Rule            | Convention                                       |
|-----------------|--------------------------------------------------|
| Braces          | **Allman** (opening brace on its own line)       |
| Classes         | PascalCase                                       |
| Interfaces      | `I` + PascalCase (`IRoomSession`)                |
| Private fields  | `_` + camelCase (`_roomId`)                      |
| Constants       | UPPER_SNAKE_CASE                                 |
| Methods         | camelCase                                        |
| Imports         | `import type` for type-only imports              |
| Exports         | Named only (never `export default`)              |
| `dispose()`     | Always last method, checks `_disposed`           |
| Null safety     | `| null` (never `| undefined`)                   |
| Spacing         | `if(condition)` not `if (condition)`             |
| Logger          | `Logger.getLogger('Name')` (never `console.log`) |

Full reference: `docs/STYLEGUIDE.md`

## Path aliases

**Engine** (`vortex-engine`): `@core/` → `src/core/` | `@habbo/` → `src/habbo/` | `@room/` → `src/room/` | `@iid/` → `src/iid/`

**Client** (`vortex-client`): `@core/` `@habbo/` `@room/` `@iid/` → engine src | `@ui/` `@/` → `src/`

## Architecture and critical rules

```
vortex-engine                                   vortex-client (depends on engine)
├── core/    Low-level, communication          ├── ui/          Flash UI classes (ported)
├── habbo/   Game logic                        ├── window/      Window system (from Flash)
├── room/    Room engine                       ├── display/     Display components (PixiJS)
└── iid/     DI symbols                        └── assets/      Window layouts/skins (XML, gitignored)
```

Data flow: `Engine emits event → Client display class listens and updates`

## Critical rules

1. **AS3 is the source of truth** — Never invent code. Read `sources/WIN63-202607011411-782849652/` first, cross-referencing `sources/win63_version/` when identifiers there are obfuscated
2. **Never simplify AS3 architecture** — If AS3 has handlers/interfaces/delegation, implement them exactly
3. **Engine must NEVER import from client** — `vortex-engine` has zero UI knowledge
4. **Never override `get events()`** in Component subclasses — breaks the DI event system; use a different property name (e.g. `sessionEvents`)
5. **Use `createObjectInternal()`** not `createRoomObject()` from container (infinite recursion)
6. **Update `docs/IMPLEMENTATION_STATUS.md`** after every significant implementation
7. **Performance**: `Set`/`Map` for lookups, no allocations in render loops, cache textures, viewport culling (see `docs/STYLEGUIDE.md` Performance section and `docs/PATTERNS.md` section 0)
8. **Full port**: ALL AS3 files are ported — both logic AND display. Flash XML layouts/skins ship as XML, verbatim. No ENGINE/VIEW distinction
9. **Managers**: DI Component with IID registration, one `I<Manager>` interface per manager (see `docs/PATTERNS.md` → Manager template)

## AS3 traceability

Every TypeScript class, method, accessor, property, interface member, handler, parser, composer, or event ported from AS3 MUST include an `AS3:` source trace comment immediately above the declaration.

Required format:

```ts
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/<path>/<Class>.as::<memberName>()
```

For AS3 accessors and properties:

```ts
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/<path>/<Class>.as::get propertyName()
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/<path>/<Class>.as::propertyName
```

Always trace to the primary (`WIN63-202607011411-782849652`) path even if the member's identifier had to be recovered by cross-referencing `sources/win63_version/<path>/<Class>.as` — the trace comment must still use a real, human-readable member name, never an obfuscated `_SafeStr_N`/`_SafeCls_N` placeholder.

If the primary source does not contain the member, fall back to `sources/win63_version/...`, then `sources/PRODUCTION-201601012205-226667486/...`, and point the trace at whichever tree actually has it.

Incomplete members still require a compatible TypeScript signature and a `TODO(AS3)` comment with source path, class/member name, and exact remaining behavior. Never silently omit an AS3 member because it is currently unused; incomplete behavior must be visible as a TODO/stub, not missing from the interface.

## Communication rules (`core/communication/`, `habbo/communication/`)

You are editing wire-protocol code (`core/communication/`, `habbo/communication/`).

1. Read `docs/CLIENT-SERVER-ARCHITECTURE.md` in full for the system you are touching (handshake/encryption, or the specific composer/parser's request-response flow) before changing anything here.
2. Check that document's "known real-server bugs and protocol mismatches" list first. AS3 code that looks wrong (odd byte order, a seemingly redundant field, a workaround-looking branch) may be a deliberate compensation for a real Arcturus-Community server bug — verify before "fixing" it.
3. `Parser.parse()` read order and `Composer.getMessageArray()` field order MUST match the AS3 exactly; reordering silently breaks the wire format.
4. See `docs/PATTERNS.md` → MessageComposer / MessageParser / MessageEvent templates before adding a new message type. Quick shape reminder:
   - **Composer**: `extends MessageComposer<TupleType>` with `_data` and `getMessageArray()`
   - **Parser**: `implements IMessageParser` with `flush()` + `parse(wrapper)`
   - **Event**: `extends MessageEvent implements IMessageEvent` with `callback` parameter in constructor

## Window/UI rules (`core/window/`, `habbo/window/`, `**/widgets/**`)

---
paths:
  - "**/window/**"
  - "**/widgets/**"
---

# UI / window system rules

You are editing the ported Flash UI/window system (`core/window/`, `habbo/window/`, `habbo/*/widgets/`, client `window/`).

1. See `docs/PATTERNS.md` → "UI Window (ported from Flash)" and "Component Lifecycle" for the expected class shape. Quick shape reminder: UI Windows are ported from the AS3 `IWindow`/`IFrameWindow` hierarchy using PixiJS + the XML layouts described in rule 3.
2. Never override `get events()` in a Component subclass — it breaks the DI event system. Use a differently named property (e.g. `sessionEvents`).
3. Flash XML layouts and skins ship **as XML**, verbatim from the AS3 asset library (`vortex-client/src/assets/window-layouts`, `window-skins`), and are parsed at runtime by `WindowXmlAssetParser` — do not reintroduce a JSON compile step. `tools/build-window-assets.mjs` is the only tool that writes those two directories; it names every file after the `*Com.as` field that declares it, which is the exact string AS3 passes to `assets.getAssetByName()`. Never name an asset after the XML's own `<layout name="...">`: that is a Flash-authoring label AS3 never reads.
4. Flash UI windows/dialogs (`IWindow`, `IFrameWindow`, etc.) are ported as TypeScript classes using PixiJS; Flash display components (buttons, text fields, scrollbars, etc.) are ported as PixiJS display objects. Preserve the original AS3 class hierarchy for UI — do not collapse it into a simplified component model.

## Room engine rules (`room/`, `habbo/room/`)

`room/` (generic engine primitives: `data`, `events`, `object`, `renderer`, `utils`) and `habbo/room/` (Habbo-specific room game logic) are different layers — do not confuse them.

1. Use `createObjectInternal()`, never `createRoomObject()`, when creating room objects from a container (the latter recurses infinitely).
2. `renderer/` is a render-loop hot path: no allocations per frame, cache textures by content key, cull objects outside the viewport. See `docs/STYLEGUIDE.md` → Performance.
3. See `docs/PATTERNS.md` for Manager/Handler patterns before adding new room object types.
<!-- END:GENERATED-RULES -->
