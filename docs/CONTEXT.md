# Helium Project Context

This document provides the architecture and project context. Read it before implementation work, then use `docs/IMPLEMENTATION_STATUS.md` for the current project state.

## Overview

**Helium** is an in-progress full TypeScript/PixiJS v8 port of the Habbo Hotel Flash client, organized as a pnpm monorepo. The target is a lighter client than Nitro while staying faithful to the original AS3 architecture.

The port must reuse the lifecycle system and display/window architecture from the original AS3 source: class hierarchy, dispose patterns, flush/parse cycles, object management, message wiring, and UI window behavior should match AS3 unless a JS-specific performance divergence is explicitly documented.

### Tech stack

| Technology      | Role                                                        |
|-----------------|-------------------------------------------------------------|
| TypeScript      | Primary language                                            |
| PixiJS v8       | 2D rendering for rooms, avatars, furniture, and UI surfaces |
| EventEmitter3   | Component/event communication                               |
| pnpm workspaces | Monorepo management                                         |
| Vite            | Client bundler/dev server                                   |

### Monorepo

```
helium/
├── packages/
│   ├── helium-engine/     Engine, protocol, room engine, Habbo logic, ported Flash window/UI framework
│   └── helium-client/     Vite shell, login/bootstrap, asset bundling, converted layout/skin assets
├── sources/
│   ├── win63_2026_crypted_version/  Primary AS3 source (obfuscated 2026 build), ~3,369 .as files under src/com/sulake/
│   ├── win63_version/               Secondary AS3 source / name-recovery reference, 4,783 .as files
│   ├── flash_version/               Tertiary AS3 source, 7,159 .as files
│   └── win63_2023_version/          Not code — source of compiled window-layout/skin JSON assets
├── docs/
│   ├── CONTEXT.md
│   ├── IMPLEMENTATION_STATUS.md
│   ├── MESSAGES_PORT_BACKLOG.md
│   ├── PATTERNS.md
│   ├── STYLEGUIDE.md
│   └── audits/
├── AGENTS.md
└── package.json
```

## Current Status Rule

Do not infer completion from this context file. The current state lives in:

- `docs/IMPLEMENTATION_STATUS.md` for module/file-count status.
- `docs/MESSAGES_PORT_BACKLOG.md` for communication message gaps.
- `docs/audits/` for deeper audit notes.

Raw file counts are useful for orientation, but they do not prove AS3 parity. A module is complete only after its AS3 public API, constructor behavior, listeners, lifecycle, parser/composer behavior, and dispose contract have been checked.

## Engine Architecture

```
packages/helium-engine/src/
├── core/          Low-level runtime, assets, communication, localization, window framework
├── habbo/         Habbo managers, session, navigator, inventory, toolbar, window/UI, messages
├── room/          Low-level room manager/renderer/object support
├── iid/           Dependency injection symbols
├── Helium.ts      Application-level engine shell
└── HeliumMain.ts  Engine manager registration/orchestration
```

### Layer boundaries

- `helium-engine` must not import from `helium-client`.
- The client may import from the engine.
- UI/display state should flow from engine events into client/window classes, not from engine code reaching into client-specific UI.

### Dependency injection

The project uses a custom Component/IID system:

```typescript
export const IID_IRoomEngine = Symbol('IRoomEngine');

export class RoomEngine extends Component implements IRoomEngine
{
    // Dependencies are resolved through ComponentContext.
}
```

Critical rule: never override `get events()` in a `Component` subclass. The DI/event system depends on that getter.

### Communication protocol

```
SocketConnection
    -> CoreCommunicationManager
    -> HabboCommunicationManager
    -> HabboMessages registry
    -> MessageEvent / IMessageParser / MessageComposer
```

- Incoming messages: server ID maps to an event class and parser.
- Outgoing messages: composer `getMessageArray()` serializes payloads.
- Protocol coverage is partial; check `docs/MESSAGES_PORT_BACKLOG.md` before adding message work.

### Path aliases

| Alias     | Engine resolves to | Client resolves to            |
|-----------|--------------------|-------------------------------|
| `@core/`  | `src/core/`        | `../helium-engine/src/core/`  |
| `@habbo/` | `src/habbo/`       | `../helium-engine/src/habbo/` |
| `@room/`  | `src/room/`        | `../helium-engine/src/room/`  |
| `@iid/`   | `src/iid/`         | `../helium-engine/src/iid/`   |
| `@/`      | N/A                | `src/`                        |

## Client Architecture

```
packages/helium-client/src/
├── App.ts                         Browser/Pixi app shell
├── index.ts                       Client entry
├── AssetBundle.ts                 Bundled asset access
├── HeliumLoadingScreen.ts         Loading screen implementation
├── login/                         Login flow and SSO views
├── window/WindowXmlAssetParser.ts Converted window layout parser bridge
└── assets/
    ├── window-layouts/            1,045 converted Flash XML layouts
    ├── window-skins/              97 converted skin definitions
    ├── images/
    └── webfonts/
```

Most ported Flash window/controller code currently lives in `packages/helium-engine/src/core/window`, `packages/helium-engine/src/habbo/window`, and `packages/helium-engine/src/habbo/ui`. The client package is mainly the browser shell plus converted assets.

## AS3 Sources

| Directory                                | Count        | Package roots                             | Usage                                                                   |
|--------------------------------------------|--------------|--------------------------------------------|--------------------------------------------------------------------------|
| `sources/win63_2026_crypted_version/`       | ~3,369 `.as` | `src/com/sulake/{core,habbo,room,iid}/`   | Primary source; read first.                                             |
| `sources/win63_version/`                    | 4,783 `.as`  | `core/`, `habbo/`, `room/`, `iid/`        | Secondary; also the name-recovery reference for obfuscated identifiers. |
| `sources/flash_version/`                    | 7,159 `.as`  | `src/com/sulake/...` plus embedded assets | Tertiary source when neither WIN63 tree has the file.                   |
| `sources/win63_2023_version/`               | —            | `binaryDataXml_organized/{layouts,skins}` | Not code; source of compiled window-layout/skin JSON assets.            |

`win63_2026_crypted_version` mirrors `win63_version` one directory level deeper and both line up 1:1 file-for-file. When a name there is obfuscated (`_SafeCls_N`, `_SafeStr_N`, ...), cross-reference the same path in `win63_version` to recover it. Ignore the flat `_SafeCls_N.as` files under its `src/` root and `src/unknowns/` (`_SafePkg_N/`) — an unrelated, fully-obfuscated module bundled in the same dump.

`win63_2026_crypted_version/src/layouts/` and `src/_assets/` hold the same raw window-layout XML / PNG resources as `win63_2023_version` (matching `$<hash>` filenames), just not split into `layouts/`/`skins/`/`non-layouts/` — the compile scripts keep defaulting to `win63_2023_version` because it already has that split.

Path mapping examples:

```
sources/win63_2026_crypted_version/src/com/sulake/habbo/<module>/<Class>.as
sources/win63_version/habbo/<module>/<Class>.as
sources/flash_version/src/com/sulake/habbo/<module>/<Class>.as

sources/win63_2026_crypted_version/src/com/sulake/room/<Class>.as
sources/win63_version/room/<Class>.as
sources/flash_version/src/com/sulake/room/<Class>.as
```

## Porting Protocol

For implementation tasks:

1. Read `docs/STYLEGUIDE.md` and `docs/PATTERNS.md` for local conventions.
2. Read the relevant AS3 file in full before writing TypeScript.
3. Preserve AS3 public API, constructor contract, inheritance intent, listener lifecycle, and dispose behavior.
4. Add the required `// AS3: ...` trace comments for ported declarations.
5. Update `docs/IMPLEMENTATION_STATUS.md` and any relevant backlog/audit doc when the implementation changes project status.
6. Validate code changes with the appropriate build/test command.

## Key Entry Points

| File                                                                          | Role                        |
|-------------------------------------------------------------------------------|-----------------------------|
| `packages/helium-client/index.html`                                           | Browser entry HTML          |
| `packages/helium-client/src/index.ts`                                         | Client bootstrap            |
| `packages/helium-client/src/App.ts`                                           | Browser/Pixi app shell      |
| `packages/helium-engine/src/Helium.ts`                                        | Engine application shell    |
| `packages/helium-engine/src/HeliumMain.ts`                                    | Engine manager registration |
| `packages/helium-engine/src/habbo/communication/HabboMessages.ts`             | Message registry            |
| `packages/helium-engine/src/habbo/communication/HabboCommunicationManager.ts` | Habbo protocol layer        |
| `packages/helium-engine/src/habbo/room/RoomEngine.ts`                         | Habbo room engine facade    |
| `packages/helium-engine/src/room/RoomManager.ts`                              | Low-level room manager      |
| `packages/helium-engine/src/iid/index.ts`                                     | DI symbol exports           |
