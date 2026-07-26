# Conventions

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
| Logger          | `Logger.getLogger('habbo.room.RoomEngine')` — dotted module path, never `console.log` |

Full reference: `docs/STYLEGUIDE.md`

## Logging

The level decides whether anyone ever reads it — `docs/STYLEGUIDE.md` → Logging has the table.
Short version: `trace` for anything per-frame/per-packet/per-item, `debug` for a subsystem's own
commentary (including "X initialized"), `info` only for milestones worth seeing while working on
something *else*, `warn` for data or a code path the client does not handle (unknown enum, unported
branch, missing asset — these render nothing and throw nothing, so `debug` buries them), `error`
when the user will notice. Dev shows `info` and up; production `warn` and up.

## Path aliases

**Engine** (`vortex-engine`): `@core/` → `src/core/` | `@habbo/` → `src/habbo/` | `@room/` → `src/room/` | `@iid/` → `src/iid/`

**Client** (`vortex-client`): `@core/` `@habbo/` `@room/` `@iid/` → engine src | `@ui/` `@/` → `src/`
