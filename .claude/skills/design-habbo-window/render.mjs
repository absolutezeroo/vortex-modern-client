#!/usr/bin/env node
/**
 * Renders a window-layout XML file to a PNG, through the real window system.
 *
 * The layout is pushed into a running Glaze over the Chrome DevTools Protocol and the cropped
 * result is pulled back — so what lands on disk is what the client would draw, skins, fonts,
 * etching and all. The file does not have to be registered, or even live in the project.
 *
 *   node .claude/skills/design-habbo-window/render.mjs my_window.xml
 *   node .claude/skills/design-habbo-window/render.mjs my_window.xml --out=shots/v3.png
 *   node .claude/skills/design-habbo-window/render.mjs --layout=chooser_view --out=shots/ref.png
 *
 * `--layout=<name>` renders a layout Glaze already has instead of a file — that is how you get a
 * reference shot of the shipped window you are copying, to put next to your own.
 *
 * Requires `pnpm --filter vortex-glaze dev` to be running (default http://localhost:5174/).
 * Zero dependencies: Node 22+ has a global WebSocket, and Windows ships Edge.
 */

import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
import {dirname, resolve, join, basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const flags = {};
const positional = [];

for(const arg of process.argv.slice(2))
{
    if(arg.startsWith('--'))
    {
        const [key, value = 'true'] = arg.slice(2).split('=');
        flags[key] = value;
    }
    else positional.push(arg);
}

const PORT = Number(flags.port ?? 9334);
const URL_ = flags.url ?? 'http://localhost:5174/';
const PROFILE = join(process.env.TEMP ?? '/tmp', `glaze-render-${PORT}`);

const EDGE_PATHS = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function browserAlive()
{
    try
    {
        await fetch(`http://127.0.0.1:${PORT}/json/version`);

        return true;
    }
    catch
    {
        return false;
    }
}

async function launchBrowser()
{
    const exe = EDGE_PATHS.find((p) => existsSync(p));

    if(!exe) throw new Error(`No Edge/Chrome found. Looked in:\n${EDGE_PATHS.join('\n')}`);

    mkdirSync(PROFILE, {recursive: true});

    spawn(exe, [
        `--remote-debugging-port=${PORT}`,
        `--user-data-dir=${PROFILE}`,
        '--window-size=1400,900',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-sync',
        '--disable-extensions',
        // Glaze composites through the window system onto a 2D canvas, but the client engine it
        // boots still initialises a WebGL context; without this, newer Chromium refuses the
        // SwiftShader fallback and every shot comes back blank.
        '--enable-unsafe-swiftshader',
        'about:blank',
    ], {detached: true, stdio: 'ignore'}).unref();

    for(let i = 0; i < 60; i++)
    {
        if(await browserAlive()) return;

        await sleep(250);
    }

    throw new Error('Browser did not expose its debugging port');
}

/** Opens a CDP session on the Glaze page, creating the tab if this is the first run. */
async function connect()
{
    if(!(await browserAlive())) await launchBrowser();

    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    let page = targets.find((t) => t.type === 'page' && t.url.startsWith(URL_));

    if(!page)
    {
        await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(URL_)}`, {method: 'PUT'});

        for(let i = 0; i < 40 && !page; i++)
        {
            await sleep(250);

            const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();

            page = list.find((t) => t.type === 'page' && t.url.startsWith(URL_));
        }
    }

    if(!page) throw new Error(`No Glaze tab at ${URL_} — is \`pnpm --filter vortex-glaze dev\` running?`);

    const ws = new WebSocket(page.webSocketDebuggerUrl);

    await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = () => no(new Error('CDP socket failed')); });

    let id = 0;
    const pending = new Map();

    ws.onmessage = (event) =>
    {
        const msg = JSON.parse(event.data);
        const entry = pending.get(msg.id);

        if(entry)
        {
            pending.delete(msg.id);
            entry(msg);
        }
    };

    const send = (method, params = {}) => new Promise((ok) =>
    {
        const next = ++id;

        pending.set(next, ok);
        ws.send(JSON.stringify({id: next, method, params}));
    });

    return {
        ws,
        /**
         * Evaluates an expression in the page and returns its value, awaiting promises.
         *
         * This is CDP `Runtime.evaluate` against a local dev server — driving the page IS the
         * tool's purpose, the same as any browser automation. Nothing here evaluates remote or
         * user-supplied input: the only interpolated values are the authored XML and its name,
         * both `JSON.stringify`'d into string literals.
         */
        async eval(expression)
        {
            const res = await send('Runtime.evaluate', {
                expression,
                awaitPromise: true,
                returnByValue: true,
            });

            const details = res.result?.exceptionDetails;

            if(details) throw new Error(details.exception?.description ?? details.text);

            return res.result?.result?.value;
        },
    };
}

async function main()
{
    const file = positional[0] ?? null;
    const layoutName = flags.layout ?? null;

    if(!file && !layoutName)
    {
        console.error('Usage: render.mjs <layout.xml> [--out=shot.png]   |   render.mjs --layout=<name> [--out=shot.png]');
        process.exit(2);
    }

    // Glaze needs a name to register under. Derive it from the filename, which is also what the
    // layout will be called once it is saved into the project.
    const name = layoutName ?? basename(file).replace(/\.xml$/i, '');
    const out = resolve(flags.out ?? join(HERE, 'shots', `${name}.png`));

    const page = await connect();

    // The page may still be booting the window engine; `glaze` appears only once main() finishes.
    for(let i = 0; i < 80; i++)
    {
        if(await page.eval('typeof window.glaze !== "undefined"')) break;

        await sleep(250);
    }

    if(!(await page.eval('typeof window.glaze !== "undefined"')))
    {
        throw new Error('Glaze never finished booting — check the page for errors');
    }

    if(file)
    {
        const xml = readFileSync(resolve(file), 'utf8');
        const ok = await page.eval(`window.glaze.preview(${JSON.stringify(xml)}, ${JSON.stringify(name)})`);

        // `importLayoutXml` swallows parse errors and returns false. The usual cause is a root
        // that is not <layout><window>…, which the parser reports as an empty layout list.
        if(!ok) throw new Error(`Glaze refused the XML. Check the root is <layout><window>…</window></layout>.`);
    }
    else
    {
        await page.eval(`window.glaze.state.openLayout(${JSON.stringify(name)})`);
    }

    // One frame for the window system to composite before the snapshot is taken.
    await page.eval('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))');

    const dataUrl = await page.eval('window.glaze.screenshot()');

    if(!dataUrl) throw new Error('Nothing rendered — the layout opened but produced no root window');

    mkdirSync(dirname(out), {recursive: true});
    writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64'));

    const size = await page.eval('(() => { const r = {x:0,y:0,width:0,height:0}; window.glaze.state.rootWindow.getGlobalRectangle(r); return `${Math.round(r.width)}x${Math.round(r.height)}`; })()');

    console.log(`${out}  (${size})`);

    page.ws.close();
}

main().catch((error) =>
{
    console.error(String(error.message ?? error));
    process.exit(1);
});
