# vortex-web

The hotel's website — a port of **habbo-web**, the modern habbo.com site, on the emulator's own
web API.

```bash
node tools/fetch-assets.mjs      # first: the sprite sheet and the site's bitmaps
node tools/fetch-web-pages.mjs   # then: habbo.com's editorial pages + their images
pnpm web                         # dev server on http://localhost:5174
pnpm web:build                   # bundle to dist/
```

The two fetchers are **required on a fresh checkout**: `*.png` is gitignored repo-wide, like every
other dump-derived asset here, so without `fetch-assets.mjs` the sprite sheet is missing and every
icon — the logo included — is a blank box.

Same stack as the emulator's dashboard (`../../../vortex-emulator/Vortex.Dashboard.Web`): Svelte 5
runes, Vite, Tailwind 4, `svelte-spa-router`. No SvelteKit — this is a static SPA, and the emulator
serves it the same way it serves the dashboard.

## Where it comes from

Three reference files, all under `sources/` (gitignored, like the AS3 dumps — fetch them per
checkout):

| File | What it settles |
|---|---|
| `sources/app.5ac3d2f8.css` | habbo.com's compiled stylesheet. Every colour, radius, shadow, font stack, breakpoint and sprite offset. (`mockup/habbo.css` is the same stylesheet, beautified — 2299 rules either way.) |
| `sources/habbo.js` | habbo.com's AngularJS bundle. Its route table, its module tree, and — inline, in the minified `templates` module — **every one of its 210 HTML templates**. `node tools/extract-templates.mjs` writes them to `sources/templates/`. |
| `sources/fr.json` | habbo.com's French localisation, 1688 keys, from `images.habbo.com/habbo-web-l10n/fr.json`. Copied to `src/lib/fr.json` so it ships. |
| `src/webpages/` + `public/webpages/` | habbo.com's **editorial pages**, which are in none of the above: `habbo-web-pages` fetches them at runtime from `images.habbo.com/habbo-web-pages/production/<key>.fr.html`. `node tools/fetch-web-pages.mjs` mirrors them and every image they reference. |

Use them in that order for any question: the CSS says how a thing looks, the templates say what is
inside it and in what order, and fr.json says what it is called. A template names its own key in a
`translate="…"` attribute, so a label is never a guess.

What the port keeps is habbo-web's **values and structure**; what it drops is its **delivery**: the
site is written in Tailwind utilities against the tokens in `src/styles.css`, not in
`.navigation__link--home` classes.

Things the templates settled that guesswork had got wrong here: there is no `/me` (the home is `/`,
and being signed out changes the HEADER, not the route); every section is **tabbed**, and its tabs
are real routes; the sign-in is a **modal**, not a header form, except on the front page where it is
the register banner's drawer; the home has no purse/friends/badges sidebar (the purse is a shop
component); the navigation is Accueil / Communauté / **Habbo Shopping** / Les clés du jeu /
Collectibles, in that order; and habbo.com has no group page at all — a group links into the client.

Two things stay real CSS because a utility cannot express them:

- **The sprite sheet.** `src/assets/sprite.png` is habbo.com's own 473 KB sheet, and
  `src/lib/sprite.js` is its index — one `[x, y, w, h]` per icon, straight out of habbo.css.
  `components/Sprite.svelte` turns an entry into an element. Navigation and user-menu icons have
  three states (idle / hover / active); an icon that does not change on hover means a state was
  dropped.
- **`src/assets/price_tag.png`**, the shop's price ribbon.

Everything else pictorial is the hotel's own: `c_images` (promo art, badges, room art) off the asset
host, avatars and group badges off `vortex-imager`.

## What is real and what is mocked

Real, against `Vortex.WebApi` (see `src/lib/api.js`, which mirrors
`Vortex.WebApi/Hosting/WebApiEndpoints.cs`):

| Flow | Route |
|---|---|
| Sign in, incl. the 2FA second step | `POST /api/public/authentication/login` |
| Registration (signs in in the same call) | `POST /api/public/registration/new` |
| Password change (revokes every session) | `POST /api/public/authentication/password` |
| Sign out | `POST /api/public/authentication/logout` |
| Avatar list — also the identity probe | `GET /api/user/avatars` |
| Avatar creation | `POST /api/user/avatars` |
| Avatar selection | `POST /api/user/avatars/select` |
| Name availability | `POST /api/newuser/name/check` |
| The ticket `/hotel` enters with | `GET /api/ssotoken` |

Mocked, in `src/lib/mock.js`, because the web API has no route for them: articles, badges, friends,
groups, rooms, the purse counters, the shop's price list. The shapes match a habbo.com response, so
wiring a real endpoint later is a swap in one page.

The API has **no identity route**. `GET /api/user/avatars` is it: 401 means signed out, a list means
signed in. `src/lib/session.js` is built on that.

## /hotel

The page asks for a fresh SSO ticket on every mount — it is single use, the emulator burns it on the
handshake — and hands it to the client on the frame's query string:

```
http://localhost:5173/?sso=<ticket>
```

`packages/vortex-client/index.html` reads `?sso=` into `VortexConfig.connection.ssoTicket`. That is
the same mechanism the real hotel uses (FlashVars there, a query string here), and with no ticket the
client still runs its own login flow exactly as before.

## Services it expects

| Service | Where | Proxied in dev |
|---|---|---|
| `Vortex.WebApi` | `http://localhost:8080` | yes, `/api` — the session cookie must stay same-origin |
| `vortex-imager` | `http://localhost:8081` | yes, `/habbo-imaging` |
| asset host (`c_images`) | `http://vortex-assets.local` | no — override with `VITE_ASSET_BASE` |
| the client | `http://localhost:5173` | no — override with `VITE_CLIENT_URL` |

With the API down the site still runs: the editorial half needs nothing from the emulator, so the
failed probe becomes a strip across the top rather than a wall.
