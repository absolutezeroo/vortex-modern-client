# Vortex

A full TypeScript / PixiJS v8 port of the Habbo Hotel Flash client — engine and display both, with
the original Flash window layouts and skins shipped as XML rather than reimplemented.

---

## Read this before you clone

**A fresh clone cannot run on its own.** Almost everything the client draws is derived from a Habbo
Flash dump that is not in this repository, and never will be: the window layouts, the skins, the
sound effects, the avatar configurations and every PNG are generated per checkout from
`sources/`, which is gitignored. Without that dump you get a client that boots to a blank canvas.

Three things live outside this repository and you need all three:

| What | Why | Where |
|---|---|---|
| An AS3 dump | every asset is generated from it | `sources/WIN63-202607011411-782849652/` |
| An asset host | serves `/gordon`, `/c_images`, `/gamedata`, `/dcr` | `http://vortex-assets.local` |
| The server | game socket + web API | `vortex-emulator`, a sibling checkout |

If you have those, the rest is four commands.

---

## Requirements

- **Node ≥ 22** — verified on 24.14
- **pnpm ≥ 11** — this is a pnpm workspace; npm and yarn will not resolve it
- A web server for the assets (Laragon, nginx, anything) answering on `http://vortex-assets.local`
- [`vortex-emulator`](../vortex-emulator) running: game socket on `40001`, web API on `8080`

---

## Setup

```bash
pnpm install
```

Put the dump in place — the tools read it by this exact path:

```
sources/WIN63-202607011411-782849652/
```

Then generate the assets. Each of these reads the dump and writes into
`packages/vortex-client/src/assets/`, all of it gitignored and safe to re-run:

```bash
pnpm --filter vortex-client build:window-data              # 788 layouts + 133 skins
pnpm --filter vortex-client import:crypted-images          # PNGs, named as AS3 names them
pnpm --filter vortex-client import:crypted-sounds          # 21 sound effects
pnpm --filter vortex-client import:avatar-configurations   # 7 avatar XML configurations
pnpm --filter vortex-client import:chatstyles              # the 89-style chat catalogue
```

They are idempotent: run them again after a new dump and they report what changed and what was
already current.

---

## Running

```bash
pnpm dev
```

Then open **`http://localhost:5173/client/`**. The dev server serves the client under that base path
so the same build can also be reached through the CMS proxy — `/` redirects there, so either works.

The dev server proxies to the two services for you:

| Path | Goes to | Serving |
|---|---|---|
| `/gordon`, `/c_images`, `/gamedata`, `/dcr` | `vortex-assets.local` | furni, avatars, gamedata |
| `/webapi` | `localhost:8080` | the emulator's web API |
| `/habbo-imaging` | `localhost:8081` | the imager, started for you |

The game socket is dialled directly at `127.0.0.1:40001`.

Other packages:

```bash
pnpm web          # the CMS (vortex-web)
pnpm imager:dev   # the standalone avatar/furni imager
pnpm build        # production build of the client
pnpm lint         # eslint over the workspace
```

---

## Packages

| Package | What it is |
|---|---|
| `vortex-engine` | the port itself — core, communication, room engine, Habbo game logic |
| `vortex-client` | the shell: display classes, window system, assets, boot |
| `vortex-web` | the hotel's CMS, a port of habbo-web (Svelte 5) |
| `vortex-imager` | avatar and furni image rendering as a service |
| `vortex-glaze` | a window-layout editor built out of the client's own widgets |

The engine never imports from the client. Data flows one way: the engine raises an event, a client
display class listens and draws.

---

## When it does not work

**Blank canvas, no windows.** The asset generation has not run, or ran against a missing dump.
Check `packages/vortex-client/src/assets/window-layouts/` — it should hold 788 files.

**The room opens but has no walls, no furni.** The asset host is not answering. Test it directly:
`curl -I http://vortex-assets.local/gordon/`.

**Stuck on the loading screen, or the login goes nowhere.** The emulator is not running, or not on
`40001`. The client dials the socket before it can do anything else.

**`pnpm install` refuses, or the build fails in odd ways.** Check `node -v` and `pnpm -v` against
the requirements above. npm and yarn cannot resolve this workspace at all.

---

## Contributing

The port has rules, and they are not optional — read `.claude/rules/00-mandate.md` first. The short
version: the AS3 source is the truth, it is read before anything is written, and every ported member
carries a comment naming the file and member it came from. `CLAUDE.md` explains why, and documents
the traps in the decompiled sources that have cost real time.

## Licence

GPL-3.0
