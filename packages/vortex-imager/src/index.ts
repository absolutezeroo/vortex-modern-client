/**
 * Entry point.
 *
 * The two-phase start is required, not stylistic: `installGlobals()` has to run before any
 * engine module is evaluated, because the engine's modules capture browser globals at import
 * time. A static import of the render service would be hoisted above the call and the whole
 * pipeline would come up against a Node that has no `OffscreenCanvas`.
 */
import {installGlobals} from './shim/globals';
import {loadConfig} from './config';

const config = loadConfig();

installGlobals({assetsRoot: config.assetsRoot, assetsBaseUrl: config.assetsBaseUrl});

const {Logger, LogLevel} = await import('@core/utils/Logger');
const {AvatarRenderService} = await import('./avatar/AvatarRenderService');
const {BadgeRenderService} = await import('./badge/BadgeRenderService');
const {Database} = await import('./db/Database');
const {RenderCache} = await import('./cache/RenderCache');
const {createServer} = await import('./server');

Logger.setLevel(resolveLogLevel(config.logLevel, LogLevel));

const log = Logger.getLogger('imager.main');

log.info(`Assets: ${config.assetsRoot ?? config.assetsBaseUrl}`);

const database = config.database === null ? null : new Database(config.database);

if(database === null)
{
    log.warn('No database configured — ?user= lookups and guild badges are disabled');
}

const avatars = await AvatarRenderService.boot(config);

// The badge part URL is a hotel property, so it comes from the same external_variables the
// avatar libraries do rather than from this service's own environment.
const badgePartUrl = avatars.getProperty('image.library.badgepart.url')
    || `${config.assetsBaseUrl}/c_images/Badgeparts/`;

const badges = database === null ? null : new BadgeRenderService(database, badgePartUrl);

const cache = new RenderCache(config.cacheMaxEntries, config.cacheTtlMs);
const server = createServer({config, avatars, badges, database, cache});

await server.listen({host: config.host, port: config.port});

log.info(`vortex-imager listening on http://${config.host}:${config.port}`);

for(const signal of ['SIGINT', 'SIGTERM'] as const)
{
    process.once(signal, () =>
    {
        void (async (): Promise<void> =>
        {
            log.info(`Received ${signal}, shutting down`);

            await server.close();
            await avatars.dispose();
            await database?.dispose();

            process.exit(0);
        })();
    });
}

function resolveLogLevel(name: string, levels: typeof LogLevel): number
{
    switch(name.toLowerCase())
    {
        case 'trace': return levels.TRACE;
        case 'debug': return levels.DEBUG;
        case 'warn': return levels.WARN;
        case 'error': return levels.ERROR;
        case 'silent': return levels.SILENT;
        default: return levels.INFO;
    }
}
