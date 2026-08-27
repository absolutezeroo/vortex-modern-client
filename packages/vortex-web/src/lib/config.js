// Where the three services the CMS talks to live. `/api` and `/habbo-imaging` are relative on
// purpose — vite.config.js proxies them in dev and a reverse proxy is expected to in production —
// so the only absolute host here is the asset host, which serves habbo.com's c_images tree
// (promo art, badge icons, room thumbnails) and has no session to keep same-origin.

export const ASSET_BASE = import.meta.env.VITE_ASSET_BASE ?? 'http://vortex-assets.local';

export const IMAGES = `${ASSET_BASE}/c_images`;

// The client itself. /hotel drops it in an iframe with the SSO ticket on the query string, which is
// how habbo.com mounts the Flash/Nitro client too (`.client__frame`).
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL ?? 'http://localhost:5173';

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
