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

| Directory                                    | Priority    | Package roots                           | Files  |
|----------------------------------------------|-------------|-----------------------------------------|--------|
| `sources/WIN63-202607011411-782849652/`      | **PRIMARY** | `src/com/sulake/{habbo,room,core,iid}/` | ~3,369 |
| `sources/win63_version/`                     | Secondary   | `habbo/`, `room/`                       | ~4,465 |
| `sources/PRODUCTION-201601012205-226667486/` | Tertiary    | `com/sulake/habbo/`                     | ~7,160 |

`WIN63-202607011411-782849652` is a later, obfuscated client build and is the primary day-to-day reference. It mirrors `win63_version` one directory level deeper (`src/com/sulake/<module>/` instead of `<module>/`) and both trees line up 1:1 file-for-file. Where an identifier is obfuscated past readability (`_SafeCls_N`, `_SafeStr_N`, ...), cross-reference the same path in `win63_version` to recover the real name — never invent one. Ignore the flat `_SafeCls_N.as` files directly under its `src/` root and everything under `src/unknowns/` (`_SafePkg_N/`) — that is an unrelated, fully-obfuscated module bundled in the same dump, not part of the Habbo client.

`sources/win63_2023_version/` is not a code source — it is where the checked-in `binaryDataXml_organized/{layouts,skins}` window JSON assets are compiled from (see `packages/helium-client/tools/compile-window-*.mjs`). `sources/WIN63-202607011411-782849652/src/layouts/` and `src/_assets/` hold the same raw XML/PNG resources (same `$<hash>` filenames), but flat/unsorted — the compile scripts still default to `win63_2023_version` since it already has them split into `layouts/`/`skins/`/`non-layouts/`.

Path mapping: `sources/WIN63-202607011411-782849652/src/com/sulake/<module>/` ↔ `sources/win63_version/<module>/` ↔ `sources/PRODUCTION-201601012205-226667486/com/sulake/habbo/<module>/`

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
