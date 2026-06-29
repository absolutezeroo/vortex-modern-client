# Helium

Full TypeScript/PixiJS v8 port of the Habbo Hotel Flash client. pnpm monorepo: `helium-engine` (engine) + `helium-client` (display, UI). The entire Flash client is ported — both logic and display — with original XML layouts converted to JSON.

## Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Dev server (Vite)
pnpm build        # Production build (TSC + Vite)
```

## MANDATORY: Read before coding

Before writing any implementation code, you MUST complete these steps IN ORDER:

1. **Read the AS3 source file** — Find and read the corresponding AS3 file IN ITS ENTIRETY
   - Primary: `sources/win63_version/habbo/<module>/<Class>.as`
   - Secondary: `sources/flash_version/com/sulake/habbo/<module>/<Class>.as`
2. **Read the AS3 interface** — `I<Class>.as` + `handler/` directory if present
3. **Check `docs/PATTERNS.md`** if implementing a Composer, Parser, Event, Manager, or UI Window
4. **Check `docs/IMPLEMENTATION_STATUS.md`** for the current module status

If you haven't read the AS3 source, your implementation is invalid. No exceptions.

## Quick conventions

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

**Engine** (`helium-engine`): `@core/` → `src/core/` | `@habbo/` → `src/habbo/` | `@room/` → `src/room/` | `@iid/` → `src/iid/`

**Client** (`helium-client`): `@core/` `@habbo/` `@room/` `@iid/` → engine src | `@ui/` `@/` → `src/`

## Critical rules

1. **AS3 is the source of truth** — Never invent code. Read `sources/win63_version/` first
2. **Never simplify AS3 architecture** — If AS3 has handlers/interfaces/delegation, implement them exactly
3. **Engine must NEVER import from client** — `helium-engine` has zero UI knowledge
4. **Never override `get events()`** in Component subclasses (breaks the DI system)
5. **Use `createObjectInternal()`** not `createRoomObject()` from container (infinite recursion)
6. **Update `docs/IMPLEMENTATION_STATUS.md`** after every significant implementation
7. **Performance**: `Set`/`Map` for lookups, no allocations in render loops, cache textures, viewport culling (see `docs/STYLEGUIDE.md` Performance section)
8. **Full port**: ALL AS3 files are ported — both logic AND display. Flash XML → JSON. No ENGINE/VIEW distinction

## AS3 traceability

Every TypeScript class, method, accessor, property, interface member, handler, parser, composer, or event ported from AS3 MUST include an `AS3:` source trace comment immediately above the declaration.

Required format:

```ts
// AS3: sources/win63_version/<path>/<Class>.as::<memberName>()
```

For AS3 accessors and properties:

```ts
// AS3: sources/win63_version/<path>/<Class>.as::get propertyName()
// AS3: sources/win63_version/<path>/<Class>.as::propertyName
```

If the primary source does not contain the member and the secondary Flash source is used, the trace MUST point to `sources/flash_version/...`.

Incomplete members still require a compatible TypeScript signature and a `TODO(AS3)` comment with source path, class/member name, and exact remaining behavior.

## Architecture

```
helium-engine                                   helium-client (depends on engine)
├── core/    Low-level, communication          ├── ui/          Flash UI classes (ported)
├── habbo/   Game logic                        ├── window/      Window system (from Flash)
├── room/    Room engine                       ├── display/     Display components (PixiJS)
└── iid/     DI symbols                        └── layouts/     JSON layouts (from Flash XML)
```

Data flow: `Engine emits event → Client display class listens and updates`

## AS3 sources

| Directory                | Priority    | Package roots          | Files  |
|--------------------------|-------------|------------------------|--------|
| `sources/win63_version/` | **PRIMARY** | `habbo/`, `room/`      | ~4,465 |
| `sources/flash_version/` | Secondary   | `com/sulake/habbo/`    | ~7,160 |

Path mapping: `sources/win63_version/habbo/<module>/` ↔ `sources/flash_version/com/sulake/habbo/<module>/`

## Documentation

| File                                          | Content                                       |
|-----------------------------------------------|-----------------------------------------------|
| `AGENTS.md`                                   | Universal AI agent instructions (all editors) |
| `.claude/rules/`                              | Auto-loaded enforcement rules for Claude Code |
| `docs/CONTEXT.md`                             | Full architecture and project context         |
| `docs/PATTERNS.md`                            | Implementation templates with code examples   |
| `docs/STYLEGUIDE.md`                          | Complete code style reference + performance   |
| `docs/IMPLEMENTATION_STATUS.md`               | Progress tracking (~35% overall, ~710+ files) |
| `docs/architectures/<module>-architecture.md` | Per-module AS3 architecture analysis          |
