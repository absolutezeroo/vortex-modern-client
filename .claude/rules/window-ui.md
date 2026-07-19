---
paths:
  - "**/window/**"
  - "**/widgets/**"
---

# UI / window system rules

You are editing the ported Flash UI/window system (`core/window/`, `habbo/window/`, `habbo/*/widgets/`, client `window/`).

1. See `docs/PATTERNS.md` → "UI Window (ported from Flash)" and "Component Lifecycle" for the expected class shape. Quick shape reminder: UI Windows are ported from the AS3 `IWindow`/`IFrameWindow` hierarchy using PixiJS + the XML layouts described in rule 3.
2. Never override `get events()` in a Component subclass — it breaks the DI event system. Use a differently named property (e.g. `sessionEvents`).
3. Flash XML layouts and skins ship **as XML**, verbatim from the AS3 asset library (`vortex-client/src/assets/window-layouts`, `window-skins`), and are parsed at runtime by `WindowXmlAssetParser` — do not reintroduce a JSON compile step. `tools/build-window-assets.mjs` is the only tool that writes those two directories; it names every file after the `*Com.as` field that declares it, which is the exact string AS3 passes to `assets.getAssetByName()`. Never name an asset after the XML's own `<layout name="...">`: that is a Flash-authoring label AS3 never reads.
4. Flash UI windows/dialogs (`IWindow`, `IFrameWindow`, etc.) are ported as TypeScript classes using PixiJS; Flash display components (buttons, text fields, scrollbars, etc.) are ported as PixiJS display objects. Preserve the original AS3 class hierarchy for UI — do not collapse it into a simplified component model.
