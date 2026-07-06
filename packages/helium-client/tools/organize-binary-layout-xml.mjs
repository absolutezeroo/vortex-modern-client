#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import zlib from 'node:zlib';
import {DOMParser} from '@xmldom/xmldom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const DEFAULT_INPUT = path.resolve(repoRoot, 'sources', 'win63_2023_version', 'binaryDataXml');
const DEFAULT_LAYOUT_OUTPUT = path.resolve(repoRoot, 'sources', 'win63_2023_version', 'binaryDataXml_organized', 'layouts');
const DEFAULT_SKIN_OUTPUT = path.resolve(repoRoot, 'sources', 'win63_2023_version', 'binaryDataXml_organized', 'skins');
const DEFAULT_BAD_OUTPUT = path.resolve(repoRoot, 'sources', 'win63_2023_version', 'binaryDataXml_organized', 'non-layouts');

function readArgs()
{
    const [, , ...argv] = process.argv;
    const args =
    {
        input: DEFAULT_INPUT,
        out: DEFAULT_LAYOUT_OUTPUT,
        skinsOut: DEFAULT_SKIN_OUTPUT,
        badOut: DEFAULT_BAD_OUTPUT,
        filter: null,
        move: false,
        dryRun: false,
        anyLayout: false,
        clean: null,
        quiet: false
    };

    for (let i = 0; i < argv.length; i += 1)
    {
        const key = argv[i];

        if (key === '--input' || key === '-i')
        {
            args.input = path.resolve(argv[i + 1]);
            i += 1;
        }
        else if (key === '--out' || key === '-o')
        {
            args.out = path.resolve(argv[i + 1]);
            i += 1;
        }
        else if (key === '--skins-out' || key === '-s')
        {
            args.skinsOut = path.resolve(argv[i + 1]);
            i += 1;
        }
        else if (key === '--bad-out' || key === '-b')
        {
            args.badOut = path.resolve(argv[i + 1]);
            i += 1;
        }
        else if (key === '--filter' || key === '-f')
        {
            args.filter = argv[i + 1];
            i += 1;
        }
        else if (key === '--move')
        {
            args.move = true;
        }
        else if (key === '--dry-run')
        {
            args.dryRun = true;
        }
        else if (key === '--clean')
        {
            args.clean = true;
        }
        else if (key === '--no-clean')
        {
            args.clean = false;
        }
        else if (key === '--any-layout')
        {
            args.anyLayout = true;
        }
        else if (key === '--quiet' || key === '-q')
        {
            args.quiet = true;
        }
    }

    return args;
}

function readBinaryAsXml(filePath)
{
    const buffer = fs.readFileSync(filePath);
    const utf8 = buffer.toString('utf8').trim();

    if (utf8.startsWith('<'))
    {
        return utf8;
    }

    const decoders =
    [
        () => zlib.inflateSync(buffer),
        () => zlib.inflateRawSync(buffer)
    ];

    for (const decode of decoders)
    {
        try
        {
            const inflated = decode().toString('utf8').trim();

            if (inflated.startsWith('<'))
            {
                return inflated;
            }
        }
        catch
        {
            // Try next decoder.
        }
    }

    throw new Error('Unable to decode as XML.');
}

function getParserError(document)
{
    const root = document.documentElement;

    if (root && root.nodeName === 'parsererror')
    {
        return root.textContent ?? 'XML parser error';
    }

    const errors = document.getElementsByTagName('parsererror');

    if (errors.length > 0)
    {
        return errors.item(0)?.textContent ?? 'XML parser error';
    }

    return null;
}

function parseXml(xml)
{
    return new DOMParser(
        {
            onError: (level, message) =>
            {
                if (level === 'fatalError')
                {
                    throw new Error(String(message));
                }
            }
        }
    ).parseFromString(xml, 'text/xml');
}

function getRootName(root, kind)
{
    const name = root.getAttribute('name')?.trim() ?? '';

    if (name.length === 0)
    {
        return { kind: null, name: null, reason: `${kind}-name-missing` };
    }

    return { kind, name, reason: null };
}

function getWindowXmlInfo(xml, anyLayout)
{
    const document = parseXml(xml);
    const parserError = getParserError(document);

    if (parserError)
    {
        return { kind: null, name: null, reason: `parse-error: ${parserError.trim()}` };
    }

    const root = document.documentElement;

    if (!root)
    {
        return { kind: null, name: null, reason: 'empty-document' };
    }

    if (root.nodeName === 'layout')
    {
        return getRootName(root, 'layout');
    }

    if (root.nodeName === 'skin')
    {
        return getRootName(root, 'skin');
    }

    if (!anyLayout)
    {
        return { kind: null, name: null, reason: 'root-is-not-layout-or-skin' };
    }

    const layout = document.getElementsByTagName('layout').item(0) ?? null;

    if (!layout)
    {
        return { kind: null, name: null, reason: 'no-layout-or-skin' };
    }

    return getRootName(layout, 'layout');
}

function sanitizeFileName(value)
{
    return value
        .trim()
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/^\.+$/, '_');
}

function findXmlFiles(dir, filter)
{
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries)
    {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory())
        {
            files.push(...findXmlFiles(fullPath, filter));
            continue;
        }

        if (!entry.isFile())
        {
            continue;
        }

        const lower = entry.name.toLowerCase();

        if (!lower.endsWith('.xml') && !lower.endsWith('.bin'))
        {
            continue;
        }

        if (filter && !entry.name.includes(filter))
        {
            continue;
        }

        files.push(fullPath);
    }

    return files.sort((a, b) => path.basename(a).localeCompare(path.basename(b), 'en'));
}

function writeFile(sourcePath, targetPath, move, dryRun)
{
    if (dryRun)
    {
        return;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    if (move)
    {
        fs.renameSync(sourcePath, targetPath);
        return;
    }

    fs.copyFileSync(sourcePath, targetPath);
}

function isSameOrInsidePath(childPath, parentPath)
{
    const relative = path.relative(parentPath, childPath);

    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function cleanOutputDirs(args)
{
    const shouldClean = args.clean === true || (args.clean === null && !args.filter);

    if (!shouldClean || args.dryRun)
    {
        return;
    }

    const inputDir = path.resolve(args.input);
    const outputDirs = Array.from(new Set([
        path.resolve(args.out),
        path.resolve(args.skinsOut),
        path.resolve(args.badOut)
    ]));

    for (const outputDir of outputDirs)
    {
        if (isSameOrInsidePath(outputDir, inputDir))
        {
            throw new Error(`Refusing to clean output inside input directory: ${outputDir}`);
        }

        fs.rmSync(outputDir, { recursive: true, force: true });
        fs.mkdirSync(outputDir, { recursive: true });
    }
}

function main()
{
    const args = readArgs();
    const files = findXmlFiles(args.input, args.filter);
    let layoutIndex = 0;
    let skinIndex = 0;
    let layoutCount = 0;
    let skinCount = 0;
    let badCount = 0;

    if (files.length === 0)
    {
        console.warn('No XML files found.');
        return;
    }

    cleanOutputDirs(args);

    for (const filePath of files)
    {
        const relative = path.relative(repoRoot, filePath);

        try
        {
            const xml = readBinaryAsXml(filePath);
            const result = getWindowXmlInfo(xml, args.anyLayout);

            if (!result.name)
            {
                const badTarget = path.join(args.badOut, path.basename(filePath));

                writeFile(filePath, badTarget, args.move, args.dryRun);
                badCount += 1;

                if (!args.quiet)
                {
                    console.log(`Skipped ${relative} -> ${path.relative(repoRoot, badTarget)} (${result.reason})`);
                }

                continue;
            }

            const safeName = sanitizeFileName(result.name);
            const index = result.kind === 'skin' ? skinIndex : layoutIndex;
            const outDir = result.kind === 'skin' ? args.skinsOut : args.out;
            const target = path.join(outDir, `${index}_${safeName}.xml`);

            writeFile(filePath, target, args.move, args.dryRun);

            if (result.kind === 'skin')
            {
                skinIndex += 1;
                skinCount += 1;
            }
            else
            {
                layoutIndex += 1;
                layoutCount += 1;
            }

            if (!args.quiet)
            {
                const label = result.kind === 'skin' ? 'Skin' : 'Layout';

                console.log(`${label} ${relative} -> ${path.relative(repoRoot, target)}`);
            }
        }
        catch (error)
        {
            const badTarget = path.join(args.badOut, path.basename(filePath));

            writeFile(filePath, badTarget, args.move, args.dryRun);
            badCount += 1;

            if (!args.quiet)
            {
                console.log(`Skipped ${relative} -> ${path.relative(repoRoot, badTarget)} (${error.message})`);
            }
        }
    }

    const action = args.dryRun ? 'Would organize' : (args.move ? 'Moved' : 'Copied');

    console.log(`${action} ${layoutCount} layout XML files, ${skinCount} skin XML files and ${badCount} other files.`);
}

main();
