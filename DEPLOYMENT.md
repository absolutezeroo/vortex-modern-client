# Deploying the hotel

One Coolify resource per service, the same way the database and phpMyAdmin already are. Four of
them here, two with a public name:

```
                          ┌─────────────────────────────────────────┐
  vortex-hotel.online ───▶│  vortex-front        Caddy :80          │
                          │    /                 vortex-client      │
                          │    /webapi/*  /api/*  ──┐               │
                          │    /ws                ──┤               │
                          │    /habbo-imaging     ──┼──┐            │
                          └─────────────────────────┼──┼────────────┘
                                                    │  │
  assets.vortex-          ┌──────────────────────┐  │  │  coolify
    hotel.online   ──────▶│ vortex-assets  :80   │  │  │  network
                          │ the Nitro tree,      │  │  │
                          │ read from /assets    │  │  │
                          └──────────────────────┘  │  │
                                                    │  │
                          ┌─────────────────────────▼┐ │
                          │ vortex-emulator          │ │
                          │ :8080 web API            │ │
                          │ :30001 game WebSocket    │ │
                          └──────────────────────────┘ │
                          ┌────────────────────────────▼─┐
                          │ vortex-imager :8081          │
                          │ also reads /assets           │
                          └──────────────────────────────┘
```

The emulator and the imager have no public address: the front reaches them over the Docker network
by their **network alias**.

## Why the services share the hotel's origin

Not tidiness. The client resolves them against the origin it was served from, and it does that on
its own:

- `install.mjs` writes `url.prefix` and `pocket.api` **empty on purpose**, and
  `App.ts::fillOriginPrefixes()` fills them at boot with the origin actually serving the page.
- `packages/vortex-client/index.html` dials `wss://<that same origin>/ws` for anything that is not
  localhost.
- The shipped configuration says `web.api.en=/webapi`, an origin-root path.

So the API, the socket and the imager need **no source change to deploy**, no CORS policy and no
cross-site cookie: a client served from `vortex-hotel.online` asks `vortex-hotel.online` for all
three.

## Why the assets do not

The asset tree is the deliberate exception. It is the one part with a plausible future somewhere
else — behind a CDN, or on a box chosen for bandwidth rather than CPU — and the client already
follows URLs for it rather than assuming a path: everything it loads is a URL found inside
`gamedata/hashes.json`. Moving the tree means editing that one file, and nothing else.

The price is real and paid once: cross-origin fetches need `Access-Control-Allow-Origin` on that
host, which the Caddyfile sets. Without it the login screen works perfectly and no room ever draws.

---

## 0. DNS

At the registrar for `vortex-hotel.online`:

| Type | Name | Value |
|---|---|---|
| A | `@` | the Coolify server's IP |
| A | `www` | the same IP |
| A | `assets` | the same IP |
| A | `*` | the same IP |

Nothing for the emulator or the imager: neither is ever addressed from outside. `assets` is its own
name so the tree can move behind a CDN or onto another server later without the client learning a
new shape — only `hashes.json` would change. The wildcard makes the next subdomain free.

Do this first — Let's Encrypt validates over HTTP against each name, so Coolify cannot issue a
certificate before the record resolves.

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

## 3. The asset tree, as an image

The Nitro tree (`gamedata/`, `gordon/`, `c_images/`, `dcr/`) is a hotel's own data — the README is
explicit that this repository does not ship or generate it. On the tree this was written against it
is **2.9 GB across 218 000 files**, so how it reaches the server is a real decision and not a
detail.

It ships as a Docker image, built **on the machine where the files already live** and pushed to a
registry. Coolify then pulls an image instead of cloning gigabytes of binaries it would re-clone on
every deploy — and a registry pull moves only the layers that actually changed.

**The recipe lives with the tree, not in this repository**: `Dockerfile` and `.dockerignore` sit
inside the asset directory itself (`C:/Laragon/www/vortex-assets` on the machine this was set up
from). Nothing about the assets belongs in the client's source — and the build context has to be
that directory anyway.

### Publishing assets

```bash
cd C:/Laragon/www/vortex-assets
docker build -t ghcr.io/<you>/vortex-assets:latest .
docker push  ghcr.io/<you>/vortex-assets:latest
```

Then Redeploy the assets resource in Coolify, which pulls the new layers.

**What "incremental" actually means here**, because it is not automatic:

- A layer is content-addressed. One that has not changed is not rebuilt, not re-pushed and not
  re-pulled — locally, over the wire, and on the server.
- That `Dockerfile` therefore splits the tree into eleven `COPY` layers rather than one. A single
  `COPY . /assets` would make every edit cost 2.9 GB.
- **Docker invalidates a changed layer and every layer after it**, so the file orders from most
  stable to most edited. `gamedata` is last: republishing furnidata or external_variables moves
  64 MB. Put it first and every edit would rebuild the whole tree.
- The 75 000 furni bundles are split six ways by first letter, which puts a new furni at roughly
  300 MB instead of 1.8 GB. Split further if that becomes the thing you do daily.

### Nothing mounts it

No Persistent Storage on the assets resource: the files are *in* the image. And the imager does not
need the tree on disk either — `packages/vortex-imager/src/shim/globals.ts:45` only installs its
file-backed fetch when `IMAGER_ASSETS_ROOT` is set, and falls back to fetching over HTTP from
`IMAGER_ASSETS_BASE_URL` otherwise. Leave it unset and both the client and the imager read the same
served copy, which is also what stops them drifting.

### The manifest, and what Apache used to do for it

`gamedata/hashes.json` maps a logical name to **the URL that serves it**, and everything the client
loads afterwards is a URL found inside it. Get its host wrong and the login screen still works
while no room ever draws.

Under Laragon it was not a file at all. Two Apache-only pieces produced it:

| | did |
|---|---|
| `gamedata/hashes.php` | generated the manifest per request, `md5_file()` per entry, base URL hardcoded |
| `gamedata/.htaccess` | rewrote `<name>/<hash>` to the real file, seven times over |

Neither survives in a static container, so **the image generates the manifest at build time** and
the seven rewrites became Caddy matchers. Both live in that `Dockerfile`.

That is better than editing a checked-in file, not just different:

- the hashes are recomputed from the files actually being shipped, so they cannot go stale against
  the content the way a hand-edited manifest can;
- the base URL is `ARG ASSETS_BASE_URL`, so the source tree keeps naming `vortex-assets.local` and
  local development goes on working untouched;
- the build **fails** if the manifest still names the development host, rather than shipping a
  hotel where nothing draws;
- `md5sum` is what `md5_file()` produced, so a browser holding a cached copy from the Apache days
  does not re-download the world on the first boot after the move.

To point the tree somewhere else — a CDN, another host — rebuild with
`--build-arg ASSETS_BASE_URL=https://…`. Nothing else changes anywhere.

### Keep the recipe

That directory now holds `Dockerfile`, `.dockerignore`, `.gitattributes` and
`.github/workflows/publish.yml` — the layer split, the ordering that makes an edit cost 64 MB
instead of 2.9 GB, and the manifest generator. Worth version control on its own; whether the
2.9 GB goes in with it is the separate decision above.

## 4. The assets resource

In Coolify this is a **Docker Image** resource, not an application: there is no repository to clone
and nothing to build on the server — the image was built where the files are and pushed to a
registry.

- **Image** — `ghcr.io/<you>/vortex-assets:latest` (add the registry credentials in Coolify if the
  package is private).
- **Domains** — `https://assets.vortex-hotel.online`.
- **Ports Exposes** — `80`.
- **Persistent Storage** — none. The files are in the image.
- **Environment** — none. What it serves is the image, where it answers is the domain.

## 5. The imager app

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
- **Persistent Storage** — one Volume mount on `/cache`. Nothing else: it reads the asset tree over
  HTTP from the assets resource, not from disk.

Environment:

```
IMAGER_PORT=8081
IMAGER_ASSETS_BASE_URL=https://assets.vortex-hotel.online
IMAGER_CACHE_DIR=/cache
IMAGER_DB_HOST=<the hotel's MySQL host>
IMAGER_DB_PORT=3306
IMAGER_DB_USER=<user>
IMAGER_DB_PASSWORD=<password>
IMAGER_DB_DATABASE=<database>
```

**Do not set `IMAGER_HOST` here.** It is the imager's own bind address (`0.0.0.0` by default), not
where anything else finds it — the front reaches it through `IMAGER_UPSTREAM`, which is a variable
on the *front's* app.

`IMAGER_ASSETS_BASE_URL` is not the same thing as `IMAGER_ASSETS_ROOT`, and both are needed. The
root is where it reads asset files from disk; the base URL is where it *downloads* the hotel's
configuration over HTTP at boot, and its default (`http://vortex-assets.local`) resolves nowhere in
a container — the imager exits on the 404 rather than starting without it.

That makes the front a startup dependency: until it serves `/gamedata`, the imager crashloops.
Deploy the front first, or expect this container to restart until it is up.

It reads the same database the emulator does — group badges and furni definitions live there.
Read-only in practice, but give it its own MySQL user if you want that guaranteed rather than
assumed.

## 6. The front app

New Coolify application, same repository.

- **Build Pack** — `Dockerfile`. Same warning as above: the auto-detected pack ignores this file.
- **Dockerfile Location** — `/Dockerfile`, **Base Directory** `/`.
- **Domains** — `https://vortex-hotel.online`.
- **Ports Exposes** — `80`, and **Port** `80` in the build configuration — not the 3000 the form
  offers by default. Caddy listens on 80.
- **Persistent Storage** — none. This container never reads the asset tree; the client fetches it
  from the assets host directly.

Environment:

```
EMULATOR_UPSTREAM=vortex-emulator
IMAGER_UPSTREAM=vortex-imager
```

Those are the network aliases from step 1, and Caddy reads them out of the environment at load
time. Named `*_UPSTREAM` and not `*_HOST` on purpose: `IMAGER_HOST` is the imager's own bind
address, so the same name across two resources would mean opposite things.

This is the heaviest build in the deployment — `tsc && vite build` over the whole client. See
[If the front build dies](#if-the-front-build-dies).

---

## Order, and how to know each step worked

Do them in this order — each one is only checkable once the previous is up.

1. **The tree on disk**, `hashes.json` rewritten.
   `ls /data/vortex-assets/gamedata/hashes.json` — everything below reads it.
2. **Emulator**, with the four listener variables. Nothing to check from outside; the container log
   reaching `Starting Vortex Emulator` without an `OptionsValidationException` is the signal.
3. **Assets app.** Seconds to build. Then, from your own machine:

```bash
curl -sI https://assets.vortex-hotel.online/gamedata/hashes.json | head -1              # 200
curl -sI https://assets.vortex-hotel.online/gamedata/hashes.json | grep -i access-contr # the header
```

4. **Imager** — after the assets app, whose host it downloads its configuration from at boot; it
   crashloops until that answers. Its log should reach a listening line on 8081 with no
   `Missing embedded avatar asset` warnings.
5. **Front.** Then:

```bash
curl -sS https://vortex-hotel.online/webapi/api/public/info/hello        # JSON, not HTML
npx wscat -c wss://vortex-hotel.online/ws                                # opens and stays open
```

If `/webapi/...` answers HTML with a 200, the prefix was not stripped and the request fell through
to the SPA fallback — that is `handle_path` vs `handle` in the Caddyfile, and it is the single
most confusing failure in this setup because it does not look like a failure.

If the asset host answers 200 but `access-control-allow-origin` is missing, the client will still
show its login screen and no room will ever draw: the browser fetches the tree cross-origin, and
without that header it refuses the reads without anything obvious in the network tab.

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
