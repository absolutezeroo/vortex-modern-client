# Helium Project Context

This document provides the complete architecture and project context. Read BEFORE any implementation.

## Overview

**Helium** is a full TypeScript/PixiJS v8 port of the Habbo Hotel Flash client, organized as a pnpm monorepo. The goal is to create a lighter client than Nitro while staying faithful to the original AS3 architecture.

We fully reuse the lifecycle system AND the display system from the original AS3 source. The class hierarchy, dispose patterns, flush/parse cycles, object management, and UI window system must match the AS3 architecture. The original Flash XML layouts are converted to JSON.

### Tech stack

| Technology      | Role                                         |
|-----------------|----------------------------------------------|
| TypeScript      | Primary language (strict mode)               |
| PixiJS v8       | 2D rendering (rooms, avatars, furniture, UI) |
| EventEmitter3   | Inter-component communication in the engine  |
| pnpm workspaces | Monorepo management                          |
| Vite            | Bundler and dev server                       |

### Monorepo

```
helium/
├── packages/
│   ├── helium-engine/     Engine (logic, protocol, data)
│   └── helium-client/     Client (display, UI, PixiJS rendering)
├── sources/
│   ├── source_as_win63/   Primary AS3 source (~4,465 files)
│   └── source_as_flash/   Secondary AS3 source (~7,160 files)
├── docs/
│   ├── CONTEXT.md          This file
│   ├── PATTERNS.md         Implementation templates
│   ├── STYLEGUIDE.md       Complete style guide
│   ├── IMPLEMENTATION_STATUS.md  Progress tracking
│   └── architectures/     Per-module AS3 architecture
├── CLAUDE.md              Claude Code instructions
└── AGENTS.md              Universal AI agent instructions
```

## Engine architecture

### Layer structure

```
packages/helium-engine/src/
│
├── core/                   @core/    LOW-LEVEL
│   ├── communication/      WebSocket, protocol, encryption
│   │   ├── connections/    SocketConnection, pool management
│   │   ├── encryption/     Diffie-Hellman, ArcFour
│   │   └── messages/       MessageComposer, MessageParser, MessageEvent
│   ├── assets/             Asset loading and management
│   │   ├── loaders/        AssetManager, GraphicAssetCollection
│   │   └── content/        RoomContentLoader
│   ├── di/                 Dependency injection system
│   │   ├── Component.ts    Base class for all managers
│   │   └── ComponentContext.ts  Dependency resolution
│   ├── common/             Shared utilities (Point, Vector3d, etc.)
│   └── utils/              ByteArray, compression, crypto
│
├── habbo/                  @habbo/   GAME LOGIC
│   ├── communication/      HabboCommunicationManager, HabboMessages
│   ├── session/            SessionDataManager, RoomSessionManager
│   ├── avatar/             AvatarRenderManager, figure, animations
│   ├── catalog/            CatalogManager, pages, offers
│   ├── inventory/          InventoryManager, trading, marketplace
│   ├── navigator/          HabboNewNavigator, search, filters
│   ├── room/               HabboRoomFactory (bridge habbo ↔ room engine)
│   └── [other modules]/    friendlist, sound, groups, etc.
│
├── room/                   @room/    ROOM ENGINE
│   ├── RoomManager.ts      Room instance management
│   ├── RoomInstance.ts      Individual room instance
│   ├── object/             Room objects (furniture, avatars, tiles)
│   │   ├── RoomObject.ts   Base object
│   │   ├── logic/          Object logic (FurnitureLogic, AvatarLogic)
│   │   └── visualization/  Visualizations (FurnitureVisualization, etc.)
│   ├── renderer/           PixiJS rendering (RoomRenderer, RoomSpriteCanvas)
│   ├── utils/              Geometry, stacking, cameras
│   └── floorplan/          Floor plan parsing and rendering
│
└── iid/                    @iid/     DI SYMBOLS
    └── index.ts            All IIDs (Symbol) for the Component system
```

### Dependency injection (Component system)

The project uses a custom DI system based on `Component`:

```typescript
// IID definition
export const IID_IRoomEngine = Symbol('IRoomEngine');

// A manager is a Component
export class RoomEngine extends Component implements IRoomEngine
{
    // Dependencies are resolved via ComponentContext
    // Component.unlock() is called when all deps are ready
}
```

**Critical rule**: NEVER override `get events()` in a Component subclass. The `events` getter is used by the DI system for dependency resolution.

### Communication protocol

```
Client WebSocket
    → SocketConnection (WebSocket + EventEmitter3)
    → CoreCommunicationManager (connection pool)
    → HabboCommunicationManager (Habbo protocol layer)
    → Message Registry (server ID → Event/Composer)
```

- **Encryption**: Diffie-Hellman key exchange + ArcFour
- **Incoming messages**: The server sends an ID → the registry finds the matching Event → the Parser extracts data
- **Outgoing messages**: Code creates a Composer → `getMessageArray()` serializes → sent via WebSocket
- **Registry**: `HabboMessages.ts` maps server IDs to Event/Composer classes

### Path aliases

| Alias     | Engine resolves to        | Client resolves to            |
|-----------|---------------------------|-------------------------------|
| `@core/`  | `src/core/`               | `../helium-engine/src/core/`  |
| `@habbo/` | `src/habbo/`              | `../helium-engine/src/habbo/` |
| `@room/`  | `src/room/`               | `../helium-engine/src/room/`  |
| `@iid/`   | `src/iid/`                | `../helium-engine/src/iid/`   |
| `@ui/`    | N/A (forbidden in engine) | `src/`                        |
| `@/`      | N/A (forbidden in engine) | `src/`                        |

## Client architecture

### Display system

The entire Flash display and UI system is ported to TypeScript/PixiJS. There is no third-party UI framework — the Flash window system (IWindow, IFrameWindow, etc.) is faithfully ported.

### XML → JSON layouts

The original Flash XML layout files that defined UI structure (window positions, element layouts, sizes, etc.) are converted to JSON and loaded at runtime. The JSON structure mirrors the original XML hierarchy.

### Structure

```
packages/helium-client/src/
├── Helium.ts          Application singleton shell, bootstraps engine + PixiJS
├── HeliumMain.ts      Engine orchestrator (creates and registers all managers)
├── ui/                Flash UI system ported (IWindow, IFrameWindow, etc.)
├── window/            Window management (from AS3 window framework)
├── display/           PixiJS display components (buttons, text, scrollbars, etc.)
├── layouts/           JSON layouts (converted from Flash XML)
└── api/               Engine ↔ UI bridge (typed access to managers)
```

### Data flow

```typescript
// 1. Engine class emits an event
class HabboNewNavigator extends Component
{
    onSearchResults(data: SearchResultData): void
    {
        this.emit('searchResults', data);
    }
}

// 2. UI class listens and updates display
class NavigatorWindow extends FrameWindow
{
    constructor(navigator: IHabboNewNavigator)
    {
        navigator.on('searchResults', (data: SearchResultData) =>
        {
            this.updateResults(data);
        });
    }
}
```

The engine NEVER knows about UI classes. The separation is strict.

## AS3 sources

### Two available directories

| Directory                | Files  | Package roots       | Usage                                        |
|--------------------------|--------|---------------------|----------------------------------------------|
| `sources/win63_version/` | ~4,465 | `habbo/`, `room/`   | **PRIMARY** — contains entire core engine    |
| `sources/flash_version/` | ~7,160 | `com/sulake/habbo/` | **SECONDARY** — Nitro version, more detailed |

### Path mapping

```
sources/win63_version/habbo/<module>/   ↔   sources/flash_version/com/sulake/habbo/<module>/
sources/win63_version/room/             ↔   sources/flash_version/com/sulake/room/
```

### Full port

ALL AS3 files are ported — both logic and display classes. The original ENGINE/VIEW distinction no longer applies; everything is implemented in TypeScript.

### Global statistics

~2,000+ AS3 files to implement (logic + display combined).

## Per-module documentation

| Doc                         | Files | Description                            |
|-----------------------------|-------|----------------------------------------|
| `room-architecture.md`      | 313+  | Room engine (CORE)                     |
| `session-architecture.md`   | 77    | Session management                     |
| `ui-architecture.md`        | 369   | UI handlers, events, messages, windows |
| `avatar-architecture.md`    | ~120  | Avatar rendering system                |
| `catalog-architecture.md`   | 105   | Catalog system                         |
| `inventory-architecture.md` | 51    | Inventory management                   |
| `sound-architecture.md`     | 28    | Audio system                           |
| `navigator-architecture.md` | 70+   | Room navigator                         |
| `game-architecture.md`      | 58    | SnowWar                                |
| Others (20+ modules)        | ~700  | See `docs/architectures/`              |

## Key entry points

| File                                                                          | Role                             |
|-------------------------------------------------------------------------------|----------------------------------|
| `packages/helium-client/index.html`                                           | HTML entry point                 |
| `packages/helium-client/src/Helium.ts`                                        | Application singleton, bootstrap |
| `packages/helium-client/src/HeliumMain.ts`                                    | Engine manager registration      |
| `packages/helium-engine/src/habbo/communication/HabboMessages.ts`             | All message registry             |
| `packages/helium-engine/src/habbo/communication/HabboCommunicationManager.ts` | Protocol layer                   |
| `packages/helium-engine/src/room/RoomManager.ts`                              | Room manager                     |
| `packages/helium-engine/src/iid/index.ts`                                     | All DI symbols                   |