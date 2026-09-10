# Deploying the hotel

Three containers on one Coolify server, and **one public domain**. Everything else is reached over
the Docker network.

```
                      ┌──────────────────────────────────────────────┐
  vortex-hotel.online ──▶│  vortex-front  (this repo's Dockerfile)      │
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

So a client served from `vortex-hotel.online` asks `vortex-hotel.online` for everything, and **no
source change is needed to deploy it**. What that buys: no CORS policy to keep in sync, no
cross-site cookie, one certificate, and an emulator with no public address at all.

---

## 0. DNS

One name, because there is one public service. At the registrar for `vortex-hotel.online`:

| Type | Name | Value |
|---|---|---|
| A | `@` | the Coolify server's IP |
| A | `www` | the same IP |

Nothing for the emulator, the imager or the assets: they are all paths under this one host. Do this
first — Let's Encrypt validates over HTTP against the name, so Coolify cannot issue the certificate
before the record resolves.

`www` is optional but cheap, and Coolify will redirect it to the apex.

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

**Persistent Storage** — one named volume on `/app/logs`. The emulator logs to the console only,
so `docker logs` is the live view and Coolify shows it; what this volume is actually for is
`logs/audit-dead-letter.jsonl`, where `AuditWriterService` writes the audit records whose database
write failed. Those are the events you most want after an incident, and without the volume they
die with the container that could not persist them.

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
sed -i 's#http://vortex-assets\.local#https://vortex-hotel.online#g' hashes.json
grep -c 'vortex-assets.local' hashes.json    # must print 0
```

## 4. The imager app

New Coolify application, same Git repository:

- **Build Pack** — `Dockerfile`, not the auto-detected one. Anything else builds the repository its
  own way and never reads `Dockerfile` or `Caddyfile` at all — a build that succeeds and ships
  nothing you wrote.
- **Dockerfile Location** — `/Dockerfile.imager`, **Base Directory** `/`. The file sits at the root
  rather than beside the package on purpose: given a Dockerfile deeper in the tree, the builder
  took that directory as the build context, and every `COPY` from the root failed with
  `"/pnpm-workspace.yaml": not found`. The imager cannot be installed from its own directory — the
  `workspace:` protocol needs the lockfile and every manifest in the tree.
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

New Coolify application, same repository.

- **Build Pack** — `Dockerfile`. Same warning as above: the auto-detected pack ignores this file.
- **Dockerfile Location** — `/Dockerfile`, **Base Directory** `/`.
- **Domains** — `https://vortex-hotel.online`. This is the only public name in the whole setup;
  Coolify obtains the certificate.
- **Ports Exposes** — `80`, and **Port** `80` in the build configuration — not the 3000 the form
  offers by default. Caddy listens on 80.
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
curl -sS https://vortex-hotel.online/webapi/api/public/info/hello        # JSON, not HTML
curl -sI https://vortex-hotel.online/gamedata/hashes.json | head -1      # 200
npx wscat -c wss://vortex-hotel.online/ws                                # opens and stays open
```

If `/webapi/...` answers HTML with a 200, the prefix was not stripped and the request fell through
to the SPA fallback — that is `handle_path` vs `handle` in the Caddyfile, and it is the single
most confusing failure in this setup because it does not look like a failure.

Then open `https://vortex-hotel.online` in a browser. The login screen proves the API; a room that
draws proves the assets; an avatar on the selection screen proves the imager.

---

## Before opening it to testers

### Back up the database

Not optional for a beta, and not something any file here can do for you. On the MySQL resource in
Coolify: **Backups → add a scheduled backup**, daily, with a retention you can live with, and an
S3 destination if you have one — a backup on the same disk as the database survives a mistake but
not a dead disk. Then **restore one into a scratch database once**, before you need to. An untested
backup is a belief, not a backup.

### Know where the bug reports land

`POST /api/user/reports` records what a player tells you, as an audit record with category
**`PlayerReport`** and action `player.bug_report`. In the dashboard, that is the investigation /
audit view, filtered on that category.

They arrive with the page, the browser, and the tail of the browser console alongside the player's
own words — enough to tell a rendering bug from a connection one without a second exchange. The
button is in the client itself (`packages/vortex-client/src/BugReporter.ts`), plain DOM rather than
the client's window manager, so it still works when the canvas is what is broken.

The route is authenticated, so a report is always attached to an account, and rate-limited to 10
per five minutes per address (`Vortex:WebApi:ReportRateLimit`) — loose enough not to swallow honest
reports, tight enough that a stuck retry loop cannot fill the audit table.

## If the front build dies

Two failures look alike and are not:

| Exit | Meaning | Fix |
|---|---|---|
| **134**, trace ending in `Heap::CollectGarbage`, `Aborted (core dumped)` | V8's JavaScript heap filled up | `NODE_OPTIONS=--max-old-space-size` in the Dockerfile — already set to 4096 |
| **137**, killed with no trace | the *kernel* or the container limit took the process | raise Coolify's Resource Limits for the app, add swap on the server, or build elsewhere |

`tsc && vite build` over this client is the heaviest thing in the whole deployment. Check what the
server actually has before assuming a setting will fix it:

```bash
free -h            # total memory and swap
nproc              # cores; the build is mostly single-threaded, so this matters less
```

Under about 4 GB with no swap, no flag will make that step fit. The way out is to build the image
somewhere with more memory and push it to a registry, rather than building on the deployment
server.

## What this does not cover

Honest list, so nothing here reads as more finished than it is.

- **A bug report does not carry the room id.** Reading it would mean coupling the reporter to the
  room engine, and the endpoint already accepts the field: `RoomId` on the audit record is there,
  and wiring it is one line the day the reports say it is worth it.
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
