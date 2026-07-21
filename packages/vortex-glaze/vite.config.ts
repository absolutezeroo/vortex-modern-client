import {defineConfig, type Plugin} from 'vite';
import {resolve} from 'path';
import {writeFileSync} from 'fs';

/**
 * Dev-server middleware: POST /glaze/save { name, xml } writes an edited layout
 * back to the client's source `window-layouts/<name>.xml`. `name` is restricted
 * to the AS3 asset-name charset and the resolved path is confined to the layouts
 * directory (no traversal).
 */
function glazeSavePlugin(): Plugin
{
    const layoutsDir = resolve(__dirname, '../vortex-client/src/assets/window-layouts');

    return {
        name: 'glaze-save',
        configureServer(server)
        {
            server.middlewares.use('/glaze/save', (req, res) =>
            {
                if(req.method !== 'POST')
                {
                    res.statusCode = 405;
                    res.end('Method Not Allowed');

                    return;
                }

                let body = '';

                req.on('data', (chunk) => { body += chunk; });
                req.on('end', () =>
                {
                    res.setHeader('Content-Type', 'application/json');

                    try
                    {
                        const {name, xml} = JSON.parse(body) as { name?: unknown; xml?: unknown };

                        if(typeof name !== 'string' || !/^[A-Za-z0-9_]+$/.test(name) || typeof xml !== 'string')
                        {
                            res.statusCode = 400;
                            res.end(JSON.stringify({message: 'Invalid name or xml'}));

                            return;
                        }

                        const file = resolve(layoutsDir, `${name}.xml`);

                        if(!file.startsWith(layoutsDir))
                        {
                            res.statusCode = 400;
                            res.end(JSON.stringify({message: 'Bad path'}));

                            return;
                        }

                        writeFileSync(file, xml, 'utf8');
                        res.statusCode = 200;
                        res.end(JSON.stringify({message: `Saved ${name}.xml`}));
                    }
                    catch (error)
                    {
                        res.statusCode = 500;
                        res.end(JSON.stringify({message: String(error)}));
                    }
                });
            });
        }
    };
}

/**
 * vortex-glaze — Vite config.
 *
 * Cloned from vortex-client's config (same monorepo depth → identical relative
 * engine paths). Two differences:
 *  - `@client` alias resolves into vortex-client/src so glaze can reuse the
 *    asset-bundle loader and the window XML parsers (single source of truth for
 *    the layout/skin XML vocabulary) instead of duplicating them.
 *  - `publicDir` points at vortex-client's built `public/` so the two
 *    `.bundle` files are served at glaze's root exactly as they are for the
 *    client. Run `pnpm --filter vortex-client build:bundle` (or `pnpm --filter
 *    vortex-glaze bundle`) once if they are missing.
 */
export default defineConfig({
    plugins: [glazeSavePlugin()],
    publicDir: resolve(__dirname, '../vortex-client/public'),
    resolve: {
        alias: {
            '@/assets': resolve(__dirname, 'src/assets'),
            '@': resolve(__dirname, 'src'),
            '@core': resolve(__dirname, '../vortex-engine/src/core'),
            '@habbo': resolve(__dirname, '../vortex-engine/src/habbo'),
            '@room': resolve(__dirname, '../vortex-engine/src/room'),
            '@iid': resolve(__dirname, '../vortex-engine/src/iid'),
            '@ui': resolve(__dirname, 'src'),
            '@client': resolve(__dirname, '../vortex-client/src'),
        },
    },
    build: {
        target: 'ES2022',
        sourcemap: true,
    },
    esbuild: {
        tsconfigRaw: {
            compilerOptions: {
                experimentalDecorators: true,
            },
        },
    },
});
