---
paths:
  - "**/window/**"
  - "**/widgets/**"
---

# UI / window system rules

You are editing the ported Flash UI/window system (`core/window/`, `habbo/window/`, `habbo/*/widgets/`, client `window/`).

1. See `docs/PATTERNS.md` → "UI Window (ported from Flash)" and "Component Lifecycle" for the expected class shape. Quick shape reminder: UI Windows are ported from the AS3 `IWindow`/`IFrameWindow` hierarchy using PixiJS + JSON layouts.
2. Never override `get events()` in a Component subclass — it breaks the DI event system. Use a differently named property (e.g. `sessionEvents`).
3. Flash XML layouts are converted to JSON and loaded at runtime (`helium-client/src/assets/window-layouts`, `window-skins`) — do not reintroduce XML parsing.
4. Flash UI windows/dialogs (`IWindow`, `IFrameWindow`, etc.) are ported as TypeScript classes using PixiJS; Flash display components (buttons, text fields, scrollbars, etc.) are ported as PixiJS display objects. Preserve the original AS3 class hierarchy for UI — do not collapse it into a simplified component model.
