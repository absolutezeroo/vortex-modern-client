# `<Module>` architecture

## Overview

What this module does, one paragraph. Which AS3 package it maps to (`sources/win63_version/habbo/<module>/`).

## AS3 class map

| AS3 class | Role | TS equivalent | Status |
|-----------|------|----------------|--------|
| `<Class>.as` | ... | `<Class>.ts` | ✅ / ⚠️ partial / ❌ |

## Key interactions

Sequence of how the main classes in this module cooperate (event flow, manager → handler → view, composer/parser round-trips if networked). Diagrams welcome (ASCII or Mermaid).

## Divergences & TODOs

Any deliberate TypeScript-side divergence from the AS3 (should be rare — see `.claude/rules/20-architecture.md` critical rule #2), and any outstanding `TODO(AS3)` markers left in this module's code.
