/**
 * Decodes a stored guild badge code into its layers.
 *
 * The code is a run of 6-character segments, `b{partId:D2}{colorId:D2}{position:D1}`. The
 * first segment is the base shape, the rest are symbols drawn over it — the same split the
 * badge editor shows, where layer 0 is the base and layers 1–4 are overlays
 * (`BadgeEditorCtrl` builds exactly five `BadgeLayerCtrl`s, and only layer 0 hides its
 * position picker).
 *
 * `s`-prefixed segments are accepted as symbols too: that is the older Arcturus spelling
 * (`b05114s09114`), and badge codes imported from other hotels still carry it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge/BadgeLayerCtrl.as
 */

/** Layers past the fifth are ignored — the editor cannot produce them. */
const MAX_LAYERS = 5;

const SEGMENT_LENGTH = 6;

export interface IBadgeLayer
{
    /** `base` for the first segment, `symbol` for the rest — the `group_badge_parts.type`. */
    type: 'base' | 'symbol';

    partId: number;
    colorId: number;

    /** 0–8, read as a 3x3 grid. */
    position: number;

    /** `position % 3` — `BadgeLayerOptions.setGrid()`. */
    gridX: number;

    /** `floor(position / 3)` — `BadgeLayerOptions.setGrid()`. */
    gridY: number;
}

export class BadgeCodeError extends Error {}

export function parseBadgeCode(code: string): IBadgeLayer[]
{
    const normalised = code.trim();

    if(normalised.length === 0)
    {
        throw new BadgeCodeError('Badge code is empty');
    }

    const layers: IBadgeLayer[] = [];

    // Counted separately from `layers`: an unused base still occupies segment 0, so keying
    // "is this the base?" off how many layers were kept would promote the first symbol.
    let segmentIndex = 0;
    let offset = 0;

    while(offset + SEGMENT_LENGTH <= normalised.length && layers.length < MAX_LAYERS)
    {
        const marker = normalised[offset].toLowerCase();

        if(marker !== 'b' && marker !== 's')
        {
            offset++;

            continue;
        }

        const partId = Number(normalised.slice(offset + 1, offset + 3));
        const colorId = Number(normalised.slice(offset + 3, offset + 5));
        const position = Number(normalised.slice(offset + 5, offset + 6));

        offset += SEGMENT_LENGTH;

        const index = segmentIndex++;

        if(!Number.isFinite(partId) || !Number.isFinite(colorId) || !Number.isFinite(position)) continue;

        // Part 0 is how the editor encodes an unused layer.
        if(partId === 0) continue;

        const isBase = index === 0 && marker === 'b';

        layers.push({
            type: isBase ? 'base' : 'symbol',
            partId,
            colorId,
            position,
            gridX: Math.floor(position % 3),
            gridY: Math.floor(position / 3)
        });
    }

    if(layers.length === 0)
    {
        throw new BadgeCodeError(`Badge code has no drawable layers: "${code}"`);
    }

    return layers;
}
