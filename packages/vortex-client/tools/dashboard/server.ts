// Local dev dashboard for packages/vortex-client/tools/*.mjs.
// Run with: pnpm --filter vortex-client tools   (see package.json "tools" script)
// Serves public/index.html and streams whichever script the user picks over SSE,
// instead of everyone having to remember the pnpm script names + flags by hand.
import {type ChildProcess, spawn} from 'node:child_process';
import fs from 'node:fs';
import http, {type IncomingMessage, type ServerResponse} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findTool, INSTALL_STEPS, type ToolDefinition, TOOLS} from './toolRegistry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOOLS_DIR = path.resolve(__dirname, '..');
const CLIENT_DIR = path.resolve(TOOLS_DIR, '..');
const REPO_ROOT = path.resolve(CLIENT_DIR, '..', '..');
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const PORT = Number(process.env.PORT ?? 4600);

const MIME: Record<string, string> =
    {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8'
    };

let currentChild: ChildProcess | null = null;

function buildArgsForTool(tool: ToolDefinition, query: URLSearchParams, extraArgs: readonly string[] = []): string[] {
    const args: string[] = [];

    for (const option of tool.options) {
        if (option.type === 'flag') {
            const raw = query.get(option.key);
            const enabled = raw === null ? option.default : raw === 'true';

            if (enabled) args.push(option.flag);
        } else if (option.type === 'text') {
            const value = query.get(option.key);

            if (value) args.push(option.flag, value);
        } else if (option.type === 'path') {
            const value = query.get(option.key) || option.default;

            args.push(option.flag, value);
        } else {
            const value = query.get(option.key);
            const choice = option.choices.find((c) => (c.flag ?? '') === (value ?? ''));

            if (choice?.flag) args.push(choice.flag);
        }
    }

    return [...args, ...extraArgs];
}

interface MissingInput {
    label: string;
    value: string;
}

// Nobody's clone of this repo ships sources/ (gitignored) or any compiled asset output on
// day one - every 'input'-kind path option can legitimately point at nothing. Catching that
// here means a friendly explanation instead of the child process crashing on a raw ENOENT.
function findMissingInputs(tool: ToolDefinition, query: URLSearchParams): MissingInput[] {
    const missing: MissingInput[] = [];

    for (const option of tool.options) {
        if (option.type !== 'path' || option.kind !== 'input') continue;

        const value = query.get(option.key) || option.default;

        if (!fs.existsSync(value)) missing.push({label: option.label, value});
    }

    return missing;
}

function reportMissingInputs(res: ServerResponse, tool: ToolDefinition, missing: readonly MissingInput[]): void {
    sendEvent(res, 'fatal', `${tool.label} : dossier(s) introuvable(s), rien n'a ete lance :`);

    for (const entry of missing) sendEvent(res, 'fatal', `  - ${entry.label} : ${entry.value}`);

    sendEvent(res, 'fatal', 'Ces fichiers ne sont pas fournis avec le depot (sources/ est ignore par git) - recupere tes propres fichiers Habbo et place-les a cet endroit, ou change le chemin a l\'etape 2 (bouton Parcourir).');
}

interface BrowseEntry {
    name: string;
    path: string;
}

function listDirectories(dir: string): BrowseEntry[] {
    return fs.readdirSync(dir, {withFileTypes: true})
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({name: entry.name, path: path.join(dir, entry.name)}))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// Backs the wizard's directory picker: browsers can't hand a real filesystem path back
// from <input type="file">, so instead the frontend walks this server-side listing (see
// public/app.js's openBrowser()) starting from the repo root, one folder at a time.
function handleBrowse(res: ServerResponse, query: URLSearchParams): void {
    const requested = query.get('dir');
    const dir = requested ? path.resolve(requested) : REPO_ROOT;

    let entries: BrowseEntry[] = [];
    let error: string | null = null;

    try {
        entries = listDirectories(dir);
    } catch (err) {
        error = err instanceof Error ? err.message : String(err);
    }

    const parentDir = path.dirname(dir);
    const parent = parentDir === dir ? null : parentDir;

    res.writeHead(200, {'Content-Type': MIME['.json']});
    res.end(JSON.stringify({path: dir, parent, entries, error}));
}

function sendEvent(res: ServerResponse, event: string, data: string): void {
    for (const line of data.split(/\r?\n/)) res.write(`data: ${line}\n`);
    res.write(`event: ${event}\n\n`);
}

function runScript(res: ServerResponse, label: string, scriptFile: string, args: string[]): Promise<number> {
    return new Promise((resolve) => {
        sendEvent(res, 'log', `$ node ${scriptFile} ${args.join(' ')}`.trim());

        const child = spawn(process.execPath, [path.resolve(TOOLS_DIR, scriptFile), ...args],
            {
                cwd: TOOLS_DIR,
                shell: false
            });

        currentChild = child;

        child.stdout.on('data', (chunk: Buffer) => sendEvent(res, 'log', chunk.toString('utf8').trimEnd()));
        child.stderr.on('data', (chunk: Buffer) => sendEvent(res, 'log', chunk.toString('utf8').trimEnd()));

        child.on('close', (code) => {
            currentChild = null;
            sendEvent(res, 'log', `-- ${label} exited with code ${code ?? -1}`);
            resolve(code ?? -1);
        });
    });
}

async function handleRunTool(res: ServerResponse, query: URLSearchParams): Promise<void> {
    const id = query.get('id') ?? '';
    const tool = findTool(id);

    if (!tool) {
        sendEvent(res, 'fatal', `Unknown tool id: ${id}`);
        res.end();
        return;
    }

    const missing = findMissingInputs(tool, query);

    if (missing.length > 0) {
        reportMissingInputs(res, tool, missing);
        sendEvent(res, 'done', 'ok');
        res.end();
        return;
    }

    const args = buildArgsForTool(tool, query);

    await runScript(res, tool.label, tool.script, args);
    sendEvent(res, 'done', 'ok');
    res.end();
}

// Checks that a chosen source-folder actually looks like a Habbo dump before the installer
// lets the user move past step 1 - specifically, that '<dir>/src/layouts' (the flat raw XML
// dump the whole install sequence is built on) exists and isn't empty.
function handleValidateSource(res: ServerResponse, query: URLSearchParams): void {
    const requested = query.get('dir') ?? '';
    const root = path.resolve(requested || '.');
    const layoutsDir = path.join(root, 'src', 'layouts');

    let valid = false;
    let message: string;

    try {
        const fileCount = fs.readdirSync(layoutsDir).length;

        valid = fileCount > 0;
        message = valid
            ? `${fileCount} fichier(s) trouve(s) dans ${layoutsDir}`
            : `${layoutsDir} existe mais est vide`;
    } catch {
        message = `Introuvable : ${layoutsDir} (le dossier choisi doit contenir un sous-dossier src/layouts)`;
    }

    res.writeHead(200, {'Content-Type': MIME['.json']});
    res.end(JSON.stringify({valid, message, checkedPath: layoutsDir}));
}

function serveStatic(req: IncomingMessage, res: ServerResponse, pathname: string): void {
    const relative = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(PUBLIC_DIR, relative);

    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403).end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404).end('Not found');
            return;
        }

        const ext = path.extname(filePath);

        res.writeHead(200, {'Content-Type': MIME[ext] ?? 'application/octet-stream'});
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

    if (url.pathname === '/api/registry') {
        res.writeHead(200, {'Content-Type': MIME['.json']});
        res.end(JSON.stringify({tools: TOOLS, installSteps: INSTALL_STEPS}));
        return;
    }

    if (url.pathname === '/api/browse') {
        handleBrowse(res, url.searchParams);
        return;
    }

    if (url.pathname === '/api/validate-source') {
        handleValidateSource(res, url.searchParams);
        return;
    }

    if (url.pathname === '/api/run/tool') {
        if (currentChild) {
            res.writeHead(409, {'Content-Type': 'text/plain'}).end('A job is already running');
            return;
        }

        res.writeHead(200,
            {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            });

        void handleRunTool(res, url.searchParams);
        return;
    }

    if (url.pathname === '/api/stop' && req.method === 'POST') {
        const stopped = currentChild !== null;

        currentChild?.kill();
        res.writeHead(200, {'Content-Type': MIME['.json']});
        res.end(JSON.stringify({stopped}));
        return;
    }

    serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;

    console.log(`Tools dashboard running at ${url}`);

    if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '""', url], {
        shell: false,
        detached: true,
        stdio: 'ignore'
    }).unref();
});
