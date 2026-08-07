/**
 * The HTTP surface.
 *
 * The routes are Habbo's, not invented ones: the client's own configuration already points at
 * them — `habbo.imaging.avatar.url` at `/habbo-imaging/avatarimage`, `group.badge.url` at
 * `/habbo-imaging/badge/%imagerdata%.gif` and `group_logo_url_template` at
 * `/habbo-imaging/badge-fill/…`. Serving anything else would mean editing the hotel config to
 * match the imager, which is backwards.
 *
 * `.gif` is answered with a PNG on purpose. Every stored `group.badge.url` on a Habbo hotel
 * ends in `.gif`, and `BadgeImageManager.getBadgeImageInternal()` rewrites that extension to
 * `.png` before requesting it — but CMS templates and old links still ask for the `.gif`, so
 * both extensions resolve to the same image rather than 404ing half the callers.
 */
import Fastify from 'fastify';
import type {FastifyInstance, FastifyReply} from 'fastify';
import {Logger} from '@core/utils/Logger';
import type {IImagerConfig} from './config';
import type {AvatarRenderService} from './avatar/AvatarRenderService';
import type {BadgeRenderService} from './badge/BadgeRenderService';
import type {Database} from './db/Database';
import type {RenderCache} from './cache/RenderCache';
import {AvatarRequestError, avatarCacheKey, parseAvatarRequest} from './avatar/AvatarRequest';
import type {AvatarQuery} from './avatar/AvatarRequest';
import {BadgeCodeError} from './badge/BadgeCode';
import {BadgeRenderError} from './badge/BadgeRenderService';

const log = Logger.getLogger('imager.server');

/** Rendered images are immutable for a given query, so they cache hard downstream. */
const CACHE_CONTROL = 'public, max-age=21600';

export interface IServerDependencies
{
    config: IImagerConfig;
    avatars: AvatarRenderService;
    badges: BadgeRenderService | null;
    database: Database | null;
    cache: RenderCache;
}

interface IBadgeParams
{
    code: string;
}

interface IAvatarParams
{
    name: string;
}

export function createServer(deps: IServerDependencies): FastifyInstance
{
    const app = Fastify({logger: false});

    /**
	 * CORS is not optional here, and it is not about being permissive.
	 *
	 * The client tags every avatar and badge it loads with `crossOrigin = "anonymous"` —
	 * `login/ImageLoader`, `BadgeImageManager`, `onBoardingHcSteps/RoomPicker` — because it
	 * reads those images back off a canvas (`BadgeImageManager.renderSmallScaleBadgeBitmap()`
	 * derives the 50% badge with `toDataURL()`, which throws on a tainted canvas). That flag
	 * makes the browser discard any response without `Access-Control-Allow-Origin`, whatever
	 * its status code, so an imager on a different origin than the client serves nothing at all
	 * without this.
	 *
	 * It is an `onSend` hook rather than per-route so error responses carry it too — otherwise
	 * a 404 reaches the client as an opaque CORS failure instead of a 404.
	 */
    app.addHook('onSend', async (_request, reply) =>
    {
        reply.header('Access-Control-Allow-Origin', deps.config.corsOrigin);

        // Only meaningful when the origin is pinned rather than `*`; a shared cache must not
        // hand one hotel's allowed origin to another.
        if(deps.config.corsOrigin !== '*') reply.header('Vary', 'Origin');
    });

    app.get('/health', async () =>
    {
        return {
            status: 'ok',
            cachedImages: deps.cache.size,
            database: deps.database === null ? 'disabled' : await deps.database.ping() ? 'up' : 'down'
        };
    });

    app.get('/habbo-imaging/avatarimage', async (request, reply) =>
    {
        return renderAvatar(deps, request.query as AvatarQuery, reply);
    });

    // `/habbo-imaging/avatarimage/<name>.png` — the path form CMS templates tend to use.
    app.get<{ Params: IAvatarParams }>('/habbo-imaging/avatarimage/:name', async (request, reply) =>
    {
        const query = {...request.query as AvatarQuery};

        query.user = stripImageExtension(request.params.name);

        return renderAvatar(deps, query, reply);
    });

    app.get<{ Params: IBadgeParams }>('/habbo-imaging/badge/:code', async (request, reply) =>
    {
        return renderBadge(deps, stripImageExtension(request.params.code), request.query as AvatarQuery, reply);
    });

    app.get<{ Params: IBadgeParams }>('/habbo-imaging/badge-fill/:code', async (request, reply) =>
    {
        return renderBadge(deps, stripImageExtension(request.params.code), request.query as AvatarQuery, reply);
    });

    return app;
}

async function renderAvatar(deps: IServerDependencies, query: AvatarQuery, reply: FastifyReply): Promise<void>
{
    try
    {
        const figure = await resolveFigure(deps, query);

        if(figure === null)
        {
            await reply.code(404).send({error: 'No such user, and no figure given'});

            return;
        }

        const request = parseAvatarRequest(figure.figure, {
            // A looked-up player's own gender wins over the query string, which is usually
            // absent for `?user=` calls; an explicit `gender=` still overrides it.
            gender: figure.gender ?? undefined,
            ...query
        });

        const {buffer, hit} = await deps.cache.resolve(
            `avatar:${avatarCacheKey(request)}`,
            () => deps.avatars.render(request)
        );

        sendImage(reply, buffer, hit);
    }
    catch (error)
    {
        await sendError(reply, error, 'avatar');
    }
}

async function renderBadge(
    deps: IServerDependencies,
    code: string,
    query: AvatarQuery,
    reply: FastifyReply
): Promise<void>
{
    if(deps.badges === null)
    {
        await reply.code(503).send({
            error: 'Guild badges need a database connection — set IMAGER_DB_DATABASE'
        });

        return;
    }

    const badges = deps.badges;

    try
    {
        const zoom = readZoom(query);
        const {buffer, hit} = await deps.cache.resolve(
            `badge:${code}:${zoom}`,
            () => badges.render(code, zoom)
        );

        sendImage(reply, buffer, hit);
    }
    catch (error)
    {
        await sendError(reply, error, 'badge');
    }
}

/**
 * Resolves what to render from: an explicit `figure=`, or a `user=` looked up in the hotel
 * database. `figure=` wins, so a caller that already knows the look never pays for a query.
 */
async function resolveFigure(
    deps: IServerDependencies,
    query: AvatarQuery
): Promise<{ figure: string; gender: string | null } | null>
{
    const figure = readSingle(query, 'figure');

    if(figure !== null) return {figure, gender: null};

    const user = readSingle(query, 'user');

    if(user === null || deps.database === null) return null;

    const player = await deps.database.findPlayerLook(user);

    return player === null ? null : {figure: player.figure, gender: player.gender};
}

function sendImage(reply: FastifyReply, buffer: Buffer, cacheHit: boolean): void
{
    reply
        .header('Content-Type', 'image/png')
        .header('Cache-Control', CACHE_CONTROL)
        .header('X-Imager-Cache', cacheHit ? 'hit' : 'miss')
        .send(buffer);
}

async function sendError(reply: FastifyReply, error: unknown, kind: string): Promise<void>
{
    const message = error instanceof Error ? error.message : String(error);

    if(error instanceof AvatarRequestError || error instanceof BadgeCodeError)
    {
        await reply.code(400).send({error: message});

        return;
    }

    if(error instanceof BadgeRenderError)
    {
        await reply.code(404).send({error: message});

        return;
    }

    log.error(`Failed to render ${kind}: ${message}`, error);

    await reply.code(500).send({error: message});
}

/** `b0101 4.gif` and `b01014.png` and `b01014` are all the same badge. */
function stripImageExtension(value: string): string
{
    return value.replace(/\.(png|gif|jpe?g)$/i, '');
}

function readSingle(query: AvatarQuery, key: string): string | null
{
    const value = query[key];
    const single = Array.isArray(value) ? value[0] : value;

    return single === undefined || single === '' ? null : single;
}

function readZoom(query: AvatarQuery): number
{
    const value = readSingle(query, 'zoom') ?? readSingle(query, 'scale');

    if(value === null) return 1;

    const parsed = Number(value);

    return Number.isFinite(parsed) ? Math.min(8, Math.max(1, Math.trunc(parsed))) : 1;
}
