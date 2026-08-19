# Per-module architecture docs

This directory holds one deep-dive document per AS3 module: `<module>-architecture.md` (e.g. `catalog-architecture.md`, `navigator-architecture.md`, `avatar-architecture.md`).

These are **created on demand**, not written upfront for all ~30 modules. Write one when a module's AS3 architecture is non-obvious enough that a plain port would risk missing structure (deep handler chains, multiple cooperating managers, non-trivial state machines). Use `_TEMPLATE.md` as the starting structure.

Do not duplicate content already covered by `docs/PATTERNS.md` (generic class-shape templates) or `docs/STYLEGUIDE.md` (code conventions) — this directory is for module-specific class maps and interactions, not general patterns.

## Every doc here maps to an AS3 module

There is deliberately no document for a client-side invention. `room-lighting-architecture.md` used
to be one — a dynamic light/cast-shadow subsystem with no counterpart in the Flash client — and it
was removed with the code on 2026-08-19: the port renders what Habbo renders. Anything without an
AS3 counterpart does not get an architecture doc here, because having one makes an experiment look
like part of the port.
