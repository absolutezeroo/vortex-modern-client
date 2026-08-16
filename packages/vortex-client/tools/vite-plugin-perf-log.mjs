import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

/**
 * Serve-only endpoints backing the in-client frame-budget monitor: writes a `:stresstest` run to
 * `perf/` in the repo root, and serves the runs back so the monitor's Runs tab can read them.
 *
 * The client cannot write to disk, and a browser download lands somewhere nobody can predict — so a
 * measurement taken in the client would otherwise have to be read off the screen and retyped to be
 * used. This closes that loop: the run posts itself, the file appears at a known path, and the
 * numbers can be diffed between runs instead of remembered.
 *
 * Serve-only on purpose. A production build has no writer, `POST /__perf` 404s, and
 * `FrameTimingsReporter` gives up quietly — nothing in the shipped client depends on this existing.
 */
export function perfLog({repoRoot})
{
    const outputDir = resolve(repoRoot, 'perf');

    /** Every run on disk, newest first, with just enough of each to fill the picker. */
    const listRuns = () =>
    {
        let files;

        try { files = readdirSync(outputDir).filter((f) => f.endsWith('.json')); }
        catch { return []; }

        return files.map((file) =>
        {
            try
            {
                const run = JSON.parse(readFileSync(resolve(outputDir, file), 'utf8'));

                return {
                    file,
                    when: file.slice(0, 19).replace('T', ' ').replace(/-/g, (m, i) => i > 9 ? ':' : '-'),
                    avatars: run.avatars ?? 0,
                    furniture: run.furniture ?? 0,
                    durationSeconds: run.durationSeconds ?? 0,
                    samples: run.samples?.length ?? 0
                };
            }
            catch { return null; }
        }).filter(Boolean).sort((a, b) => b.file.localeCompare(a.file));
    };

    return {
        name: 'vortex-perf-log',
        apply: 'serve',
        configureServer(server)
        {
            // Lets the page profile itself with `new Profiler()`. Without this header the
            // constructor throws, and the whole point of the Bench tab is that it can answer
            // "which function is this" without anyone opening DevTools and exporting a trace.
            server.middlewares.use((req, res, next) =>
            {
                res.setHeader('Document-Policy', 'js-profiling');
                next();
            });

            server.middlewares.use('/__perf/runs', (req, res) =>
            {
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify(listRuns()));
            });

            server.middlewares.use('/__perf/run', (req, res) =>
            {
                const name = new URL(req.url, 'http://x').searchParams.get('file') ?? '';

                // Serve only a plain filename from the runs directory — no traversal out of it.
                if(!/^[\w.:-]+\.json$/.test(name))
                {
                    res.statusCode = 400;
                    res.end('{}');

                    return;
                }

                try
                {
                    res.setHeader('content-type', 'application/json');
                    res.end(readFileSync(resolve(outputDir, name)));
                }
                catch
                {
                    res.statusCode = 404;
                    res.end('{}');
                }
            });

            server.middlewares.use('/__perf', (req, res, next) =>
            {
                if(req.method !== 'POST')
                {
                    next();

                    return;
                }

                let body = '';

                req.on('data', (chunk) => { body += chunk; });
                req.on('end', () =>
                {
                    try
                    {
                        const run = JSON.parse(body);

                        // Named from the run's own shape rather than a timestamp alone, so a
                        // directory listing reads as the experiment it was: the label, the avatar
                        // count, and when. Date.now() is the server's clock — the client's would be
                        // the honest source for `atMs`, which the samples already carry, but for a
                        // filename the server's is the one that sorts correctly across reloads.
                        const label = String(run.label ?? 'run').replace(/[^a-z0-9_-]/gi, '');
                        const name = `${new Date().toISOString().replace(/[:.]/g, '-')}-${label}.json`;

                        mkdirSync(outputDir, {recursive: true});

                        const path = resolve(outputDir, name);

                        writeFileSync(path, JSON.stringify(run, null, 2), 'utf8');

                        server.config.logger.info(`[perf] wrote ${path}`);

                        res.setHeader('content-type', 'application/json');
                        res.end(JSON.stringify({path: `perf/${name}`}));
                    }
                    catch (error)
                    {
                        server.config.logger.error(`[perf] could not write run: ${error.message}`);

                        res.statusCode = 500;
                        res.end(JSON.stringify({error: error.message}));
                    }
                });
            });
        }
    };
}
