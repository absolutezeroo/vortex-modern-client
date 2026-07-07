# Architecture and critical rules

```
helium-engine                                   helium-client (depends on engine)
├── core/    Low-level, communication          ├── ui/          Flash UI classes (ported)
├── habbo/   Game logic                        ├── window/      Window system (from Flash)
├── room/    Room engine                       ├── display/     Display components (PixiJS)
└── iid/     DI symbols                        └── layouts/     JSON layouts (from Flash XML)
```

Data flow: `Engine emits event → Client display class listens and updates`

## Critical rules

1. **AS3 is the source of truth** — Never invent code. Read `sources/win63_2026_crypted_version/` first, cross-referencing `sources/win63_version/` when identifiers there are obfuscated
2. **Never simplify AS3 architecture** — If AS3 has handlers/interfaces/delegation, implement them exactly
3. **Engine must NEVER import from client** — `helium-engine` has zero UI knowledge
4. **Never override `get events()`** in Component subclasses — breaks the DI event system; use a different property name (e.g. `sessionEvents`)
5. **Use `createObjectInternal()`** not `createRoomObject()` from container (infinite recursion)
6. **Update `docs/IMPLEMENTATION_STATUS.md`** after every significant implementation
7. **Performance**: `Set`/`Map` for lookups, no allocations in render loops, cache textures, viewport culling (see `docs/STYLEGUIDE.md` Performance section and `docs/PATTERNS.md` section 0)
8. **Full port**: ALL AS3 files are ported — both logic AND display. Flash XML → JSON. No ENGINE/VIEW distinction
9. **Managers**: DI Component with IID registration, one `I<Manager>` interface per manager (see `docs/PATTERNS.md` → Manager template)
