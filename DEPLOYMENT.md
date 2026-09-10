# Deploying the hotel

Three containers on one Coolify server, and **one public domain**. Everything else is reached over
the Docker network.

```
                      ┌──────────────────────────────────────────────┐
  hotel.example.com ──▶│  vortex-front  (this repo's Dockerfile)      │
        (the only      │  Caddy :80                                   │
         public name)  │                                              │
                       │  /              built vortex-client          │
                       │  /gamedata …    the Nitro tree, from /assets │
                       │  /webapi/*  ────┐                            │
                       │  /api/*     ────┤                            │
                       │  /ws        ────┤                            │
                       │  /habbo-imaging ┤                            │
                       └─────────────────┼────────────────────────────┘
                                         │  coolify network
                       ┌─────────────────▼──────────┐  ┌──────────────────────┐
                       │ vortex-emulator            │  │ vortex-imager        │
                       │ :8080 web API              │  │ :8081                │
                       │ :30001 game WebSocket      │  │                      │
                       │ no public domain           │  │ no public domain     │
                       └────────────────────────────┘  └──────────────────────┘
```

## Why one origin

Not tidiness. The client resolves every service against the origin it was served from:

- `install.mjs` writes `url.prefix` and `pocket.api` **empty on purpose**, and
  `App.ts::fillOriginPrefixes()` fills them at boot with the origin actually serving the page.
- `packages/vortex-client/index.html` dials `wss://<that same origin>/ws` for anything that is not
  localhost.
- The shipped configuration says `web.api.en=/webapi`, an origin-root path.

So a client served from `hotel.example.com` asks `hotel.example.com` for everything, and **no
source change is needed to deploy it**. What that buys: no CORS policy to keep in sync, no
cross-site cookie, one certificate, and an emulator with no public address at all.

---

## 1. Stable names on the network

Coolify names a container `<uuid>-<timestamp>`, and the timestamp changes on every deploy — an
internal hostname copied out of the Access panel today is wrong after the next redeploy.

For the **emulator** and the **imager**, open Access → *Edit Networking* and set a **Network
alias**:

| App | Network alias |
|---|---|
| the emulator | `vortex-emulator` |
| the imager | `vortex-imager` |

Those two names are what the front container dials, and they survive redeploys.

## 2. The emulator app

It no longer needs to be reachable from outside. In Coolify:

- **Domains** — remove both. Nothing public points here any more.
- **Ports Exposes** — `8080,30001` (Traefik no longer routes to them, but Coolify still uses this
  list to publish them on the internal network).
- **Ports Mappings** — empty. A host-published port is what caused
  `Bind for 0.0.0.0:8080 failed: port is already allocated`, and it also disables rolling updates.

Environment (the ones that decide whether anything answers at all — every listener defaults to the
container's own loopback):

```
serverOptions__WebSocketServer__listeners__0__ip=0.0.0.0
serverOptions__TcpServer__listeners__0__ip=0.0.0.0
VORTEX__Vortex__WebApi__Host=0.0.0.0
VORTEX__Vortex__WebApi__AllowInsecureRemoteHttp=true
```

The first two carry **no `VORTEX__` prefix** — they are read by the SuperSocket child hosts, not by
the main host, and a prefixed copy is ignored in silence.

`AllowInsecureRemoteHttp` stays on: the hop from Caddy to the emulator is plain HTTP inside the
Docker network. TLS is terminated at the edge, which is where it belongs, but the emulator has to
be told that it is deliberate rather than refuse to start.

## 3. The asset tree

The Nitro tree (`gamedata/`, `gordon/`, `c_images/`, `dcr/`) is a hotel's own data — the README is
explicit that this repository does not ship or generate it. Put it on the server once:

```bash
rsync -avz --progress ./vortex-assets/ root@<vps>:/data/vortex-assets/
```

Then mount that **same host path** into both containers, through Persistent Storage:

| App | Host path | Container path |
|---|---|---|
| vortex-front | `/data/vortex-assets` | `/assets` |
| vortex-imager | `/data/vortex-assets` | `/assets` |

A host bind, not a named volume: two apps must see the same bytes, or the imager renders against
assets the client does not have and the two drift without any error.

### The one file that will bite you

`gamedata/hashes.json` maps a logical name to **the URL that serves it**, and everything else the
client loads is a URL found inside it. A tree built for local development carries absolute
`http://vortex-assets.local/...` URLs — a hostname that resolves to the *visitor's own* loopback,
so every asset fails and the room stays blank while the login screen works perfectly.

Rewrite it once on the server:

```bash
cd /data/vortex-assets/gamedata
cp hashes.json hashes.json.bak
sed -i 's#http://vortex-assets\.local#https://hotel.example.com#g' hashes.json
grep -c 'vortex-assets.local' hashes.json    # must print 0
```

## 4. The imager app

New Coolify application, same Git repository:

- **Dockerfile Location** — `/packages/vortex-imager/Dockerfile` (base directory stays `/`: the
  imager depends on `vortex-engine` through the workspace protocol and cannot build alone).
- **Domains** — none.
- **Ports Exposes** — `8081`.
- **Persistent Storage** — `/data/vortex-assets` → `/assets`, plus a named volume on `/cache`.

Environment:

```
IMAGER_PORT=8081
IMAGER_ASSETS_ROOT=/assets
IMAGER_CACHE_DIR=/cache
IMAGER_DB_HOST=<the hotel's MySQL host>
IMAGER_DB_PORT=3306
IMAGER_DB_USER=<user>
IMAGER_DB_PASSWORD=<password>
IMAGER_DB_DATABASE=<database>
```

It reads the same database the emulator does — group badges and furni definitions live there.
Read-only in practice, but give it its own MySQL user if you want that guaranteed rather than
assumed.

## 5. The front app

New Coolify application, same repository, `Dockerfile` at the root.

- **Domains** — `https://hotel.example.com`. This is the only public name in the whole setup;
  Coolify obtains the certificate.
- **Ports Exposes** — `80`.
- **Persistent Storage** — `/data/vortex-assets` → `/assets`.

Environment:

```
EMULATOR_HOST=vortex-emulator
IMAGER_HOST=vortex-imager
```

Those are the network aliases from step 1, and Caddy reads them out of the environment at load
time.

---

## Order, and how to know each step worked

Do them in this order — each one is only checkable once the previous is up.

1. **Emulator**, with the four listener variables. Nothing to check from outside yet; the container
   log reaching `Starting Vortex Emulator` without an `OptionsValidationException` is the signal.
2. **Assets** on disk, `hashes.json` rewritten. `ls /data/vortex-assets/gamedata/hashes.json`.
3. **Imager**. Its log should reach a listening line on 8081.
4. **Front**. Then, from your own machine:

```bash
curl -sS https://hotel.example.com/webapi/api/public/info/hello        # JSON, not HTML
curl -sI https://hotel.example.com/gamedata/hashes.json | head -1      # 200
npx wscat -c wss://hotel.example.com/ws                                # opens and stays open
```

If `/webapi/...` answers HTML with a 200, the prefix was not stripped and the request fell through
to the SPA fallback — that is `handle_path` vs `handle` in the Caddyfile, and it is the single
most confusing failure in this setup because it does not look like a failure.

Then open `https://hotel.example.com` in a browser. The login screen proves the API; a room that
draws proves the assets; an avatar on the selection screen proves the imager.

---

## What this does not cover

Honest list, so nothing here reads as more finished than it is.

- **No backup of the database.** Coolify can schedule one on the MySQL resource; nothing in this
  setup does it for you, and an open beta is exactly when you find out.
- **`vortex-web` (the CMS) is not deployed.** A built `vortex-client` sets its base to `/` and
  wants the root, so the two cannot share an origin without changing `base` in
  `packages/vortex-client/vite.config.ts`. Registration and login live in the client itself
  (`RegisterView`, `/api/public/registration/new`), so a beta does not need the site — but this is
  the decision to make before adding it, not after.
- **The imager's font rendering is unverified in a slim image.** `@napi-rs/canvas` ships its own
  Skia, but text drawn without fontconfig can fall back oddly. If badges come out with the wrong
  glyphs, `apt-get install -y fontconfig` in its runtime stage is the fix.
- **One silo, `AllowUnclusteredOutsideDevelopment`.** Fine for a beta; it is a deliberate
  single-node deployment, and `MultiSiloReady` refuses a second silo anyway.
