/**
 * Turns the furniture and room query strings into the calls the room pipeline takes.
 *
 * Same shape as `avatar/AvatarRequest.ts`, and for the same reason: the URL is a public
 * contract, so the translation from it to engine constants lives in one place and nothing
 * downstream has to know what a query string looks like.
 *
 * The parameter names follow the avatar route's where they mean the same thing (`size`,
 * `direction`, `frame`), because a CMS that already builds one of these URLs should not have
 * to learn a second vocabulary.
 */
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';

export type ImagerQuery = Partial<Record<string, string | string[]>>;

/** A malformed or unanswerable request — answered 400. */
export class RoomRequestError extends Error
{}

/** A well-formed request for something that is not there — answered 404. */
export class RoomNotFoundError extends RoomRequestError
{}

export interface IFurnitureRequest
{
    /**
	 * The furni's class name — what the `.nitro` bundle is called and what
	 * `RoomContentLoader` keys everything on. Either given directly or resolved from `id`.
	 */
    type: string;

    /** `RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE` or `…_WALL`. */
    category: number;

    /** `furniture_color` — the palette index, not an RGB value. */
    colorIndex: number;

    /** Degrees, as the engine reads them: the tile rotation times 45. */
    direction: number;

    /** Room geometry scale: 64 is the room's own, 32 the half-scale asset set. */
    scale: number;

    /** Resize applied to the finished image. */
    zoom: number;

    /** Visualization state, or -1 to leave the object at its default. */
    state: number;

    /** Extra `visualization.update()` passes, to advance an animation. */
    frame: number;

    /** `furniture_extras`. Selects the variant of a multi-sprite furni. */
    extra: string | null;

    /** `0xAARRGGBB`; 0 leaves the canvas transparent. */
    backgroundColor: number;
}

export interface IRoomRequest
{
    roomId: number;
    scale: number;
    zoom: number;
    backgroundColor: number;

    /** Draw the wall planes. `hide_walls` on the room row wins when it is set. */
    walls: boolean;

    /** Draw the placed furniture. Off renders the bare model, like `getRoomImage()` does. */
    furniture: boolean;

    /**
	 * Extra `visualization.update()` passes, advancing every animated furni by that many frames.
	 *
	 * A still image has to pick one frame of an animation, and 0 — the resting frame — is the
	 * only deterministic choice. This is how you get a different one: the same knob the
	 * furniture route's `frame` is, applied to the whole room at once.
	 */
    frame: number;

    /**
	 * Decoration ids overriding the room's own, for previewing a repaint. `null` keeps what
	 * the room is painted with.
	 */
    floorType: string | null;
    wallType: string | null;
    landscapeType: string | null;
}

/** `size=` → the geometry scale to build at, and how the finished image is resized. */
const SIZE_MAP: Record<string, { scale: number; zoom: number }> = {
    s: {scale: 32, zoom: 1},
    m: {scale: 64, zoom: 1},
    l: {scale: 64, zoom: 2},
    b: {scale: 64, zoom: 3}
};

/**
 * Direction 2 is the default because it is the one the catalog previews every floor item at,
 * and it is the direction most furni have art for — `getDirectionValue()` falls back to the
 * nearest available one, so a wrong default is silently a different-looking item.
 */
const DEFAULT_DIRECTION = 2;

export function parseFurnitureRequest(
    query: ImagerQuery,
    resolve: (query: ImagerQuery) => { type: string; category: number; colorIndex: number } | null
): IFurnitureRequest
{
    const resolved = resolve(query);

    if(resolved === null)
    {
        throw new RoomRequestError('Give a furni to render: `class=<name>` or `id=<sprite id>`');
    }

    const size = SIZE_MAP[readSingle(query, 'size')?.toLowerCase() ?? 'm'] ?? SIZE_MAP.m;
    const colorOverride = readNumber(query, 'color', -1);

    return {
        type: resolved.type,
        category: resolved.category,
        colorIndex: colorOverride >= 0 ? colorOverride : resolved.colorIndex,
        direction: (((readNumber(query, 'direction', DEFAULT_DIRECTION) % 8) + 8) % 8) * 45,
        scale: size.scale,
        zoom: readZoom(query, size.zoom),
        state: readNumber(query, 'state', -1),
        frame: Math.max(0, readNumber(query, 'frame', readNumber(query, 'frame_num', 0))),
        extra: readSingle(query, 'extra'),
        backgroundColor: readColor(query, 'bg')
    };
}

export function parseRoomRequest(roomId: number, query: ImagerQuery): IRoomRequest
{
    if(!Number.isFinite(roomId) || roomId <= 0)
    {
        throw new RoomRequestError('Room id must be a positive number');
    }

    const size = SIZE_MAP[readSingle(query, 'size')?.toLowerCase() ?? 'm'] ?? SIZE_MAP.m;

    return {
        roomId,
        scale: size.scale,
        zoom: readZoom(query, size.zoom),
        backgroundColor: readColor(query, 'bg'),
        walls: readFlag(query, 'walls', true),
        furniture: readFlag(query, 'furni', true),

        // Capped: every extra pass re-runs every visualization in the room, so an unbounded
        // value is a request that renders one frame per CPU-second.
        frame: Math.min(600, Math.max(0, readNumber(query, 'frame', 0))),
        floorType: readSingle(query, 'floor'),
        wallType: readSingle(query, 'wall'),
        landscapeType: readSingle(query, 'landscape')
    };
}

/** Cache key for a furniture render. Every field that changes the pixels has to be in it. */
export function furnitureCacheKey(request: IFurnitureRequest): string
{
    return [
        request.type,
        request.category,
        request.colorIndex,
        request.direction,
        request.scale,
        request.zoom,
        request.state,
        request.frame,
        request.extra ?? '',
        request.backgroundColor
    ].join(':');
}

/**
 * Cache key for a room render.
 *
 * Deliberately does *not* include the room's contents: a room changes every time someone moves
 * a chair, and the imager has no way to hear about it. The TTL is what keeps this honest —
 * see `IMAGER_ROOM_CACHE_TTL_MS`, which is short for exactly this reason.
 */
export function roomCacheKey(request: IRoomRequest): string
{
    return [
        request.roomId,
        request.scale,
        request.zoom,
        request.backgroundColor,
        request.walls ? 1 : 0,
        request.furniture ? 1 : 0,
        request.frame,
        request.floorType ?? '',
        request.wallType ?? '',
        request.landscapeType ?? ''
    ].join(':');
}

export {RoomObjectCategoryEnum};

function readSingle(query: ImagerQuery, key: string): string | null
{
    const value = query[key];
    const single = Array.isArray(value) ? value[0] : value;

    return single === undefined || single === '' ? null : single;
}

function readNumber(query: ImagerQuery, key: string, fallback: number): number
{
    const raw = readSingle(query, key);

    if(raw === null) return fallback;

    const parsed = Number(raw);

    return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function readFlag(query: ImagerQuery, key: string, fallback: boolean): boolean
{
    const raw = readSingle(query, key);

    if(raw === null) return fallback;

    return raw !== '0' && raw.toLowerCase() !== 'false';
}

function readZoom(query: ImagerQuery, fallback: number): number
{
    const raw = readSingle(query, 'zoom') ?? readSingle(query, 'scale');

    if(raw === null) return fallback;

    const parsed = Number(raw);

    // Capped because the caller controls it and the output is allocated at that size: a room
    // at zoom 20 is a several-hundred-megabyte canvas.
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(4, parsed) : fallback;
}

/**
 * `bg=` accepts `RRGGBB`, `AARRGGBB` and the `#` forms. A six-digit value is taken as fully
 * opaque, since asking for a background and getting a transparent one is never what was meant.
 */
function readColor(query: ImagerQuery, key: string): number
{
    const raw = readSingle(query, key);

    if(raw === null) return 0;

    const cleaned = raw.replace(/^#/, '');

    if(!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(cleaned)) return 0;

    const value = Number.parseInt(cleaned, 16);

    return cleaned.length === 6 ? (0xFF000000 | value) >>> 0 : value >>> 0;
}
