/**
 * gen-layout-slots.mjs — generates `src/ui/GlazeLayoutSlots.ts` from Glaze's own
 * editor-UI layouts in `src/assets/window-layouts/*.xml`.
 *
 * Every `name="..."` attribute in a layout is a slot the UI code looks up at
 * runtime through `findChildByName()`. Those were plain strings, so a renamed or
 * mistyped node failed silently at runtime (the lookup just returns null).
 * This emits one string-literal union per layout so the compiler checks them.
 *
 * The layout key is the file basename (e.g. `glaze_hierarchy_row_xml`) because
 * that is what `registerGlazeLayouts()` registers and what `buildWidgetLayout()`
 * is called with — never the `<layout name="...">` attribute, which is a
 * Flash-authoring label nothing reads.
 *
 * Run: `pnpm --filter vortex-glaze gen:slots` (also runs as part of `build`).
 */
import {readdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LAYOUT_DIR = join(ROOT, 'src/assets/window-layouts');
const OUTPUT = join(ROOT, 'src/ui/GlazeLayoutSlots.ts');

/** `<tag ... name="value" ...>` — the `<layout>` root is excluded by the caller. */
const TAG_PATTERN = /<([a-zA-Z_][\w-]*)\b([^>]*)>/g;
const NAME_PATTERN = /\bname\s*=\s*"([^"]*)"/;

/**
 * Collects every element `name` in a layout, keyed by the element tag so the
 * generated file can document what each slot actually is.
 */
const collectSlots = (xml) =>
{
    const slots = new Map();

    for(const [, tag, attributes] of xml.matchAll(TAG_PATTERN))
    {
        if(tag === 'layout' || tag === 'var')
        {
            continue;
        }

        const name = attributes.match(NAME_PATTERN)?.[1];

        if(!name)
        {
            continue;
        }

        if(!slots.has(name))
        {
            slots.set(name, tag);
        }
    }

    return slots;
};

const main = async () =>
{
    const files = (await readdir(LAYOUT_DIR)).filter(file => file.endsWith('.xml')).sort();
    const layouts = [];

    for(const file of files)
    {
        const xml = await readFile(join(LAYOUT_DIR, file), 'utf8');
        const slots = collectSlots(xml);

        if(!slots.size)
        {
            console.warn(`[gen-layout-slots] ${file} declares no named element — skipped.`);
            continue;
        }

        layouts.push({key: file.replace(/\.xml$/, ''), slots});
    }

    const entries = layouts.map(({key, slots}) =>
    {
        const names = [...slots.keys()].sort();
        const union = names.map(name => `        | '${name}'`).join('\n');
        const legend = names.map(name => `${name}: ${slots.get(name)}`).join(', ');

        return `    /** ${legend} */\n    ${key}:\n${union};`;
    }).join('\n\n');

    const source = `/* eslint-disable */
/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source: src/assets/window-layouts/*.xml
 * Regenerate: pnpm --filter vortex-glaze gen:slots
 *
 * One string-literal union per editor layout, listing the elements that layout
 * declares a \`name\` for. Use with \`findSlot()\` / \`findSlotAs()\` from
 * \`./LayoutSlots\` so slot lookups are checked at compile time instead of
 * silently returning null.
 */

export interface GlazeLayoutSlots
{
${entries}
}

/** Every registered editor layout, keyed as \`buildWidgetLayout()\` expects. */
export type GlazeLayoutName = keyof GlazeLayoutSlots;

/** The slots a given editor layout declares. */
export type GlazeSlot<TLayout extends GlazeLayoutName> = GlazeLayoutSlots[TLayout];
`;

    await writeFile(OUTPUT, source, 'utf8');

    const slotCount = layouts.reduce((total, layout) => total + layout.slots.size, 0);

    console.log(`[gen-layout-slots] ${layouts.length} layouts, ${slotCount} slots -> src/ui/GlazeLayoutSlots.ts`);
};

main().catch(error =>
{
    console.error(error);
    process.exitCode = 1;
});
