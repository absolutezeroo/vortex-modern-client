#!/usr/bin/env node
/**
 * Cuts the asset manifest's sub-rectangles out of the sheets that ship, and
 * writes each one as its own PNG.
 *
 * The WIN63 dump carries an asset manifest that names regions inside other
 * images rather than files of their own:
 *
 *   <asset mimeType="image/png" name="illumina_light_border_center_left"
 *          ref="illumina_light_border_etched_png">
 *       <param key="region" value="0,3,3,3"/>
 *   </asset>
 *
 * Flash resolved those names through the manifest at runtime. This port has no
 * manifest reader, so every one of them resolved to nothing — silently, because
 * a missing image renders as an empty window rather than an error. The nine-slice
 * borders behind the Illumina button skins are all declared this way, which is
 * how `illumina_light_border_center_left` came back as "Asset not found" on a
 * button that looked fine apart from having no border.
 *
 * Cutting at build time rather than reading the manifest at runtime means the
 * results land in `src/assets/images/` under their real names, where the URL
 * registry already picks up every file — no registration, no runtime cost, and
 * nothing new to keep in sync.
 *
 * Usage:  node tools/import-manifest-subassets.mjs [--force]
 *
 * Additive by default: an existing file is left alone, matching the other
 * importers. `--force` overwrites.
 */

import {readFileSync, existsSync, readdirSync, writeFileSync} from 'node:fs';
import {join, dirname, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLIENT = join(HERE, '..');
const REPO = join(CLIENT, '..', '..');
const IMAGES = join(CLIENT, 'src', 'assets', 'images');
const DUMP_LAYOUTS = join(REPO, 'sources', 'WIN63-202607011411-782849652', 'src', 'layouts');

const force = process.argv.includes('--force');

// ---------------------------------------------------------------------------

/**
 * Every manifest in the dump, not the first one found: there are several and
 * only some declare regions — picking one by name reported zero sub-assets and
 * looked like the feature simply was not there.
 */
function findManifests()
{
    const matches = readdirSync(DUMP_LAYOUTS).filter(name => name.includes('manifest_xml'));

    if(matches.length === 0) throw new Error(`No manifest_xml in ${DUMP_LAYOUTS}`);

    return matches.map(name => join(DUMP_LAYOUTS, name));
}

/**
 * Every `<asset>` that carries a `region` param, as {name, ref, region}.
 *
 * A regex walk rather than a DOM parse: the shape is fixed, and the file is a
 * decompiler artefact whose only structure that matters here is this one
 * element with this one child param.
 */
function readSubAssets(xml)
{
    const out = [];

    for(const match of xml.matchAll(/<asset\b([^>]*)>([\s\S]*?)<\/asset>/g))
    {
        const attributes = Object.fromEntries(
            [...match[1].matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)].map(a => [a[1], a[2]]));
        const region = match[2].match(/<param\s+key="region"\s+value="([^"]*)"/);

        if(!region || !attributes.name || !attributes.ref) continue;

        const [x, y, width, height] = region[1].split(',').map(Number);

        if(![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0)
        {
            console.warn(`  ! ${attributes.name}: unusable region "${region[1]}"`);

            continue;
        }

        out.push({name: attributes.name, ref: attributes.ref, x, y, width, height});
    }

    return out;
}

/** The dump's linkage names keep the `_png` suffix; the shipped files do not. */
function sheetFileFor(ref)
{
    const bare = ref.replace(/_png$/, '');

    for(const candidate of [`${bare}.png`, `${ref}.png`])
    {
        const path = join(IMAGES, candidate);

        if(existsSync(path)) return path;
    }

    return null;
}

// ---------------------------------------------------------------------------

const manifests = findManifests();
const subAssets = [];

for(const manifest of manifests)
{
    const found = readSubAssets(readFileSync(manifest, 'utf8'));

    if(found.length > 0) console.log(`${found.length} sub-assets in ${basename(manifest)}`);

    subAssets.push(...found);
}

console.log(`
${subAssets.length} sub-assets across ${manifests.length} manifest(s)
`);

let written = 0;
let skipped = 0;
let missing = 0;
const missingSheets = new Set();

for(const {name, ref, x, y, width, height} of subAssets)
{
    const target = join(IMAGES, `${name}.png`);

    if(existsSync(target) && !force)
    {
        skipped++;

        continue;
    }

    const sheet = sheetFileFor(ref);

    if(!sheet)
    {
        missing++;
        missingSheets.add(ref);

        continue;
    }

    const meta = await sharp(sheet).metadata();

    if(x + width > meta.width || y + height > meta.height)
    {
        console.warn(`  ! ${name}: region ${x},${y},${width},${height} falls outside ${ref} (${meta.width}x${meta.height})`);
        missing++;

        continue;
    }

    writeFileSync(target, await sharp(sheet).extract({left: x, top: y, width, height}).png().toBuffer());
    console.log(`  + ${name}.png  ${width}x${height} from ${ref} at ${x},${y}`);
    written++;
}

console.log(`\n${written} written, ${skipped} already present, ${missing} unresolved.`);

if(missingSheets.size > 0)
{
    console.log(`sheets not in src/assets/images/: ${[...missingSheets].join(', ')}`);
}
