# AGENTS.md — Helium

Universal instructions for all AI assistants (Cursor, Windsurf, Codex, Copilot, Claude, etc.)

## Project

Helium: Full TypeScript/PixiJS v8 port of the Habbo Hotel Flash client. pnpm monorepo with `helium-engine` (engine) and `helium-client` (display, UI). The entire Flash client is ported — both logic and display — with original XML layouts converted to JSON.

```bash
pnpm install && pnpm dev    # Dev server
pnpm build                   # Production build
```

## The fundamental rule

**Read the AS3 source code before writing ANY implementation.**

- Primary: `sources/win63_version/habbo/<module>/<Class>.as`
- Secondary: `sources/flash_version/com/sulake/habbo/<module>/<Class>.as`

No AS3 source read = invalid implementation. Period.

We fully reuse the lifecycle system from the original AS3 source. The class hierarchy, dispose patterns, flush/parse cycles, object management, and display system must match the AS3 architecture. ALL AS3 files are ported — both logic and display. The original Flash XML layouts are converted to JSON. The only divergences allowed are JS-specific performance optimizations documented in `docs/STYLEGUIDE.md` section **Performance**.

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
- [ ] Engine code → `packages/helium-engine/src/`
- [ ] Client code → `packages/helium-client/src/`
- [ ] Preserve AS3 class names, method names, interfaces, and inheritance chains
- [ ] Preserve the complete AS3 public API: every public method, accessor, interface member, implemented interface, constructor contract, and dispose contract must exist in TypeScript
- [ ] Every TypeScript class, method, accessor, property, interface member, handler, parser, composer, or event ported from AS3 MUST include an `AS3:` source trace comment immediately above the declaration
- [ ] The `AS3:` source trace comment MUST use this exact format: `// AS3: sources/win63_version/<path>/<Class>.as::<memberName>()`
- [ ] For AS3 accessors and properties, use the exact AS3 member name: `// AS3: sources/win63_version/<path>/<Class>.as::get propertyName()` or `// AS3: sources/win63_version/<path>/<Class>.as::propertyName`
- [ ] If the primary source does not contain the member and the secondary Flash source is used, the trace MUST point to `sources/flash_version/...`
- [ ] If a member cannot be fully implemented immediately, still add the AS3-compatible TypeScript signature and an explicit `TODO(AS3)` comment with the AS3 source path, class/member name, and exact behavior that remains to port
- [ ] Never silently omit an AS3 member because it is currently unused; incomplete behavior must be visible as a TODO/stub, not missing from the interface
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

## Architecture boundaries

```
helium-engine                                   helium-client (depends on engine)
├── core/    Low-level, communication          ├── ui/          Flash UI classes (ported)
├── habbo/   Game logic                        ├── window/      Window system (from Flash)
├── room/    Room engine                       ├── display/     Display components (PixiJS)
└── iid/     DI symbols                        └── layouts/     JSON layouts (converted from XML)
```

**CRITICAL**: The engine must NEVER import from the client. The flow is strictly client → engine.

Data pattern: `Engine emits event → Client display class listens and updates`

## Display system

The entire Flash display system is ported to TypeScript/PixiJS:

- **Flash XML layouts** are converted to **JSON** and loaded at runtime
- **Flash UI windows/dialogs** (IWindow, IFrameWindow, etc.) are ported as TypeScript classes using PixiJS
- **Flash display components** (buttons, text fields, scrollbars, etc.) are ported as PixiJS display objects
- The original AS3 class hierarchy for UI is preserved

## Code style (summary)

- **Allman** braces (opening brace on its own line)
- Interfaces: `I` + PascalCase (`IRoomSession`)
- Private fields: `_` + camelCase (`_roomId`)
- Constants: UPPER_SNAKE_CASE
- Named exports only (never `export default`)
- `import type` for type-only imports
- `dispose()` always last method, checks `_disposed`

Full reference: `docs/STYLEGUIDE.md`

## AS3 sources

| Directory                | Priority  | Package roots       | Files  |
|--------------------------|-----------|---------------------|--------|
| `sources/win63_version/` | PRIMARY   | `habbo/`, `room/`   | ~4,465 |
| `sources/flash_version/` | Secondary | `com/sulake/habbo/` | ~7,160 |

ALL AS3 files are to be ported — both logic and display classes.

See `docs/architectures/<module>-architecture.md` for per-file details.

## Key patterns

See `docs/PATTERNS.md` for full templates with code examples.

- **Composers**: `extends MessageComposer<TupleType>` with `_data` and `getMessageArray()`
- **Parsers**: `implements IMessageParser` with `flush()` + `parse(wrapper)`
- **Events**: `extends MessageEvent implements IMessageEvent` with `callback` parameter in constructor
- **Managers**: DI Component with IID registration
- **UI Windows**: Ported from AS3 IWindow/IFrameWindow hierarchy using PixiJS + JSON layouts

## Known pitfalls

1. **Never override `get events()`** in Component subclasses (breaks the DI event system — use a different property name like `sessionEvents`)
2. **Use `createObjectInternal()`** not `createRoomObject()` from container classes (infinite recursion)
3. **The engine ↔ client boundary is strict**: the engine has ZERO UI knowledge
4. **Performance**: `Set`/`Map` for lookups, no allocation in render loops, cache textures, viewport culling. See `docs/STYLEGUIDE.md` section Performance and `docs/PATTERNS.md` section 0
