// Where the three services the CMS talks to live. `/api` and `/habbo-imaging` are relative on
// purpose — vite.config.js proxies them in dev and a reverse proxy is expected to in production —
// so the only absolute host here is the asset host, which serves habbo.com's c_images tree
// (promo art, badge icons, room thumbnails) and has no session to keep same-origin.

// c_images is PROXIED like /api and /habbo-imaging, not addressed absolutely. It used to point
// straight at `http://vortex-assets.local`, which only works on the machine whose hosts file knows
// that name: open the site from a phone on the same network and every promo image, badge and room
// shot 404s, because the phone resolves the URL, not the dev server. Going through the proxy makes
// the page work from any device, and in production a reverse proxy answers the same path.
//
// VITE_ASSET_BASE still overrides it, for a deployment that serves c_images from a CDN.
export const ASSET_BASE = import.meta.env.VITE_ASSET_BASE ?? '';

export const IMAGES = `${ASSET_BASE}/c_images`;

// The client itself. /hotel drops it in an iframe with the SSO ticket on the query string, which is
// how habbo.com mounts the Flash/Nitro client too (`.client__frame`).
//
// Defaulted to whatever host the site is being VIEWED from, on the client's port — `localhost` on
// this machine, the LAN address from a phone. A hard-coded `localhost:5173` sends the phone's
// browser to its own localhost, where nothing is listening.
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL
    ?? `${window.location.protocol}//${window.location.hostname}:5173`;

// packages/vortex-imager answers the same routes a real hotel points at, so an avatar URL built
// here is the same string the client builds.
export function avatarUrl(options = {})
{
    const query = new URLSearchParams({
        size: options.size ?? 'm',
        direction: options.direction ?? 2,
        head_direction: options.headDirection ?? options.direction ?? 2,
        ...(options.figure ? {figure: options.figure} : {}),
        ...(options.user ? {user: options.user} : {}),
        ...(options.headOnly ? {headonly: 1} : {}),
        ...(options.action ? {action: options.action} : {}),
        ...(options.gesture ? {gesture: options.gesture} : {}),
    });

    return `/habbo-imaging/avatarimage?${query}`;
}

export function badgeUrl(code)
{
    return `${IMAGES}/album1584/${code}.gif`;
}

export function groupBadgeUrl(code)
{
    return `/habbo-imaging/badge/${code}.png`;
}

// The appart render habbo.com puts under a room page (`habbo-room-picture`). packages/vortex-imager
// serves it at the same shape as everything else it draws — `GET /habbo-imaging/room/:roomId`, the
// room's own furniture through the client's own renderer.
export function roomUrl(roomId)
{
    return `/habbo-imaging/room/${roomId}`;
}

// The imager is a separate process and is routinely not running while the site is worked on. A
// broken-image glyph in its place reads as a bug in the page; an empty slot reads as what it is.
export function hideOnError(event)
{
    event.currentTarget.style.visibility = 'hidden';
}
