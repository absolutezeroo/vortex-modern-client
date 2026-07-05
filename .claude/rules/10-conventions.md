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
| Logger          | `Logger.getLogger('Name')` (never `console.log`) |

Full reference: `docs/STYLEGUIDE.md`

## Path aliases

**Engine** (`helium-engine`): `@core/` → `src/core/` | `@habbo/` → `src/habbo/` | `@room/` → `src/room/` | `@iid/` → `src/iid/`

**Client** (`helium-client`): `@core/` `@habbo/` `@room/` `@iid/` → engine src | `@ui/` `@/` → `src/`
