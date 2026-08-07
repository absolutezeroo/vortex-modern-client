# vortex-imager

External avatar and group-badge imager for Vortex. It answers the same `/habbo-imaging/…`
routes a Habbo hotel already points at, so the client, the CMS and anything else that embeds an
avatar or a guild badge can use it without changing a URL.

**It does not reimplement the renderer.** `AvatarRenderManager`, `AvatarStructure`,
`AvatarImage` and the ~130 classes behind them are `vortex-engine`'s own, running unmodified;
only the browser APIs underneath them are replaced (`src/shim/`). A separate renderer drifts
from the client the first time either side is touched, and the drift shows up as avatars that
look subtly wrong on the website and right in the room.

## Running

```bash
pnpm imager:dev      # dev server: rebuilds and restarts on change
pnpm imager:build    # bundle to dist/
pnpm imager          # run the built bundle
```

`imager:dev` runs two watchers under one command — esbuild rewrites `dist/index.js`, and Node's
`--watch` restarts the service when it does. A restart re-downloads the figure map and the
mandatory libraries, which is about 12s against a remote asset host and near-instant with
`IMAGER_ASSETS_ROOT` set.

Configuration is environment-driven; copy `.env.example` to `.env`. The only things you
configure are where the asset host is and how to reach the database. Which avatar build is
current, where the badge parts live, what the figure map is called — all of that is read from
the hotel's own `external_variables`, exactly as the client reads it, so the imager cannot fall
a build behind.

Set `IMAGER_ASSETS_ROOT` when the imager runs on the machine that serves the assets: reads then
skip HTTP entirely, which matters because a single avatar pulls a dozen `.nitro` libraries.

## Routes

| Route | Notes |
|---|---|
| `GET /habbo-imaging/avatarimage` | `?figure=` or `?user=`, plus the parameters below |
| `GET /habbo-imaging/avatarimage/<name>.png` | Path form; equivalent to `?user=<name>` |
| `GET /habbo-imaging/badge/<code>.png` | Guild badge; `.gif` resolves to the same PNG |
| `GET /habbo-imaging/badge-fill/<code>.png` | `group_logo_url_template`'s route |
| `GET /health` | Cache size and database reachability |

Everything is answered as `image/png`. `.gif` is accepted because every stored
`group.badge.url` on a Habbo hotel ends in `.gif` — `BadgeImageManager` rewrites the extension
before requesting it, but CMS templates and old links do not.

### Avatar parameters

| Parameter | Values | Default |
|---|---|---|
| `figure` | a figure string | — |
| `user` | a username, resolved against `players` | — |
| `direction`, `head_direction` | 0–7 | 2 |
| `size` | `s`, `m`, `l`, `b` | `m` |
| `headonly` | `1` to render just the head | off |
| `crop` | `1` to trim the transparent margin | off |
| `action` | comma-separated: `std`, `sit`, `lay`, `wlk`, `swim`, `float`, `wav`, `respect`, `blow`, `laugh`, `cry`, `idle`, `sleep`, `talk`, and `crr=<id>`, `drk=<id>`, `sig=<id>`, `dance=<n>`, `fx=<n>` | `std` |
| `gesture` | `sml`, `agr`, `srp`, `sad` | — |
| `crr`, `drk`, `sign`, `dance`, `effect` | ids, as parameters of their own | — |
| `frame` (`frame_num`) | animation frame to advance to | 0 |
| `gender` | `M` / `F` | the figure's own |

`figure` wins over `user`, so a caller that already knows the look never pays for a query.

### Badge codes

Six-character segments, `b{partId:D2}{colorId:D2}{position:D1}` — the shape the emulator's
`GuildBadgeLibrary` reads and writes. The first segment is the base shape, the rest are symbols
positioned on a 3x3 grid; `s`-prefixed segments are accepted as symbols too, for codes imported
from Arcturus hotels. `?zoom=<n>` scales the 39x39 result.

## CORS

Every response carries `Access-Control-Allow-Origin` (`IMAGER_CORS_ORIGIN`, `*` by default),
including error responses — otherwise a 404 reaches the browser as an opaque CORS failure
rather than a 404.

This is required, not a convenience. The client tags avatar and badge images with
`crossOrigin = "anonymous"` (`login/ImageLoader`, `BadgeImageManager`,
`onBoardingHcSteps/RoomPicker`) because it reads them back off a canvas —
`BadgeImageManager.renderSmallScaleBadgeBitmap()` derives the 50% badge with `toDataURL()`,
which throws on a tainted canvas. With that flag set, a response without the header is
discarded whatever its status code.

## Requirements

- **Node 20+.**
- **A database**, for `?user=` and for badges. The badge part and colour catalogue
  (`group_badge_parts`, `group_colors`) is the server's data, read rather than mirrored here so
  it cannot go stale. Without `IMAGER_DB_DATABASE` the badge routes answer 503 and `?figure=`
  still works.

## Two things worth knowing

**`size=s` composites at full scale and halves the image.** It does not use
`AvatarScaleType.SMALL`. That scale asks for `sh_*` assets and this asset build has none —
`hh_human_body.nitro` holds 244 assets, every one of them `h_*` — so it renders a fully
transparent avatar with nothing logged. `LARGE_TO_SMALL` (`h_50`) is the mode meant for that
case, but the engine's port of it never halves the parts, so `h`-sized parts get positioned
against a 45x72 canvas and land almost entirely outside it. Both are open engine-side gaps; see
`src/avatar/AvatarRequest.ts`.

**Effect sprites are composited here, not by the engine.** `AvatarImage.getImage()` returns the
body only; an effect's extra sprites (the hoverboard, the emblem halo) are separate room
sprites in the client. `src/render/composeAvatar.ts` flattens them, and its one deliberate
deviation from `AvatarVisualization`'s formula — the sign of the asset offset — is explained at
the line that makes it.
