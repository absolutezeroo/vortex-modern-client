# vortex-skins

Vortex's own authored window skins. **Not a port** — nothing here comes from the AS3 dump, so no
file in this directory carries an `AS3:` trace.

This is the skin counterpart of `src/vortex-layouts/`, and exists for the same reason:
`src/assets/window-skins/` is gitignored and rewritten from the dump by
`tools/build-window-assets.mjs`, so a hand-authored file placed there is wiped on the next asset
build.

Loaded by `App.readVortexSkins()`, after the dump's skins, via `import.meta.glob`.

## Naming

**The file's basename is the skin id**, i.e. the string an element descriptor's `asset` field
points at (`HabboWindowManager.loadSkinAssets()`).

- `habbo_skin_frame.xml` → replaces the dump's `habbo_skin_frame` for every descriptor that uses
  it, wholesale (there is no merge).
- a brand-new id renders nothing on its own: skins are reached only through the element
  description, never by name from a layout.

## Binding a new skin id

Add `habbo_element_description_xml.xml` here. That file replaces the dump's element description
**entirely** — it is one XML document, not a merge, so it must describe every type/style/intent
triplet the client needs, not just the new one. Start from the built
`src/assets/window-skins/habbo_element_description_xml.xml` and edit it.

## Bitmaps

A skin's `<template>` resolves its bitmap out of the atlases decoded at boot, so it can only
reference an atlas already listed in `ATLAS_NAMES` (`src/App.ts`). A new spritesheet needs an entry
there *and* the PNG in the image bundle.
