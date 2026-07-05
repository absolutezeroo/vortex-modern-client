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

| Directory                | Priority    | Package roots          | Files  |
|--------------------------|-------------|------------------------|--------|
| `sources/win63_version/` | **PRIMARY** | `habbo/`, `room/`      | ~4,465 |
| `sources/flash_version/` | Secondary   | `com/sulake/habbo/`    | ~7,160 |

Path mapping: `sources/win63_version/habbo/<module>/` ↔ `sources/flash_version/com/sulake/habbo/<module>/`

## Documentation

| File                                          | Content                                       |
|-----------------------------------------------|-----------------------------------------------|
| `.claude/rules/`                               | Auto-loaded enforcement rules for Claude Code |
| `AGENTS.md`                                   | Universal AI agent instructions (generated from `.claude/rules/`, for non-Claude tools) |
| `docs/CONTEXT.md`                             | Full architecture and project context         |
| `docs/PATTERNS.md`                            | Implementation templates with code examples   |
| `docs/STYLEGUIDE.md`                          | Complete code style reference + performance   |
| `docs/IMPLEMENTATION_STATUS.md`               | Progress tracking (~35% overall, ~710+ files) |
| `docs/architectures/`                         | Per-module AS3 architecture deep-dives, created on demand — see `docs/architectures/README.md` |
| `docs/CLIENT-SERVER-ARCHITECTURE.md`          | Real client↔server protocol, message flows, and known server-side bugs (Arcturus-Community reference) |
