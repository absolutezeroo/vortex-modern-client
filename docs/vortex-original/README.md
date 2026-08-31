# Vortex-original systems

Design documents for features **this hotel invents**, with no counterpart in any Flash client.

This directory exists because `docs/architectures/` deliberately refuses them:

> There is deliberately no document for a client-side invention. `room-lighting-architecture.md` used
> to be one — a dynamic light/cast-shadow subsystem with no counterpart in the Flash client — and it
> was removed with the code on 2026-08-19 […] because having one makes an experiment look like part
> of the port.

That rule is right and this directory does not weaken it. It separates the two kinds of work instead
of mixing them:

- `docs/architectures/` — how the **Flash client** is built, one doc per AS3 module. Reference
  material for porting.
- `docs/vortex-original/` — how a **Vortex feature** should be built. Design material for inventing.

## Rules for anything documented here

1. **Its code lives under a `vortex/` namespace**, never inside a ported module's tree. A reader
   must be able to tell invented code from ported code by its path alone.
2. **Every member carries `// TS-only:`** with a reason. There is no AS3 to cite, and a missing
   trace must not read as an oversight.
3. **It is excluded from the parity measures.** `audit-as3-traces.mjs` and `as3-member-coverage.mjs`
   both work off `AS3:` citations; invented code has none, and letting it into those counts destroys
   the only instrument that says how far the port is from 1:1.
4. **It reserves its ids in a documented range** that no client dump can collide with. See each
   document's own allocation section.
5. **It ships on its own branch** until the port reaches 1:1. Mixing invention into a fidelity port
   is how both goals get lost.

## Documents

| Document | System | Status |
|---|---|---|
| `fishing.md` | Habbo Origins fishing | **Not an invention** — a real Habbo feature with no client dump. See below |

## When a document here is *not* an invention

`fishing.md` is the case that broke this directory's own premise: fishing is a **real Habbo feature**
from Habbo Hotel: Origins, and no dump of that client exists in `sources/`. So it is neither a port
(nothing to trace to) nor an invention (somebody else designed it).

It stays here because the five rules above still apply — the code has no AS3 to cite, it must not
pollute the parity measures, and its ids are allocated rather than recovered. But its status line
says what it is, and its evidence table says how well it is known. **A reconstruction from community
documentation is a different kind of debt from an invention**, and conflating the two is how a guess
ends up looking like a decision.
