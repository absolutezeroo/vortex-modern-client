/**
 * The colour a collection's progress is drawn in, interpolated from "just started" through to
 * "nearly done".
 *
 * Three bands, not a single gradient: red-ish to orange over the first half, orange to green over
 * the rest, and two flat colours for the ends — grey for nothing collected, green for complete.
 *
 * Name DERIVED: obfuscated in every tree (`_SafeCls_4508`), named for its one method.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/collections/_SafeCls_4508.as
 */
export class CollectionProgressColor
{
    /**
     * Declared `public static var NO_DISPLAY:uint = 0` in AS3 and referenced nowhere in the tree.
     * Kept so the class's surface matches.
     */
    // AS3: _SafeCls_4508.as::NO_DISPLAY
    public static readonly NO_DISPLAY: number = 0;

    // AS3: _SafeCls_4508.as::_SafeStr_10302 (name DERIVED: the low end of the first band)
    private static readonly START_PERCENTAGE: number = 1;
    // AS3: _SafeCls_4508.as::_SafeStr_8559 (name DERIVED: the band boundary)
    private static readonly MID_PERCENTAGE: number = 50;
    // AS3: _SafeCls_4508.as::endPercentage
    private static readonly END_PERCENTAGE: number = 99;

    // AS3: _SafeCls_4508.as::startColor
    private static readonly START_COLOR: number = 12278528;
    // AS3: _SafeCls_4508.as::midColor
    private static readonly MID_COLOR: number = 12952320;
    // AS3: _SafeCls_4508.as::endColor
    private static readonly END_COLOR: number = 8958976;
    // AS3: _SafeCls_4508.as::notStartedColor
    private static readonly NOT_STARTED_COLOR: number = 8912917;
    // AS3: _SafeCls_4508.as::completionColor
    private static readonly COMPLETION_COLOR: number = 37130;

    /**
     * Note the band maths uses `START_PERCENTAGE` (1) as the low anchor, not 0 — so a collection at
     * exactly 1% maps to `START_COLOR` and anything below it interpolates slightly *negative*,
     * which AS3 lets run. It cannot happen in practice: `collected === 0` is caught above, and one
     * item out of any real collection is already at or above 1%.
     */
    // AS3: _SafeCls_4508.as::getColor()
    public static getColor(collected: number, total: number): number
    {
        if(collected === total) return CollectionProgressColor.COMPLETION_COLOR;

        if(collected === 0) return CollectionProgressColor.NOT_STARTED_COLOR;

        const percentage = collected * 100 / total;

        if(percentage <= CollectionProgressColor.MID_PERCENTAGE)
        {
            const t = (percentage - CollectionProgressColor.START_PERCENTAGE)
                / (CollectionProgressColor.MID_PERCENTAGE - CollectionProgressColor.START_PERCENTAGE);

            return CollectionProgressColor.interpolate(
                CollectionProgressColor.START_COLOR, CollectionProgressColor.MID_COLOR, t
            );
        }

        const t = (percentage - CollectionProgressColor.MID_PERCENTAGE)
            / (CollectionProgressColor.END_PERCENTAGE - CollectionProgressColor.MID_PERCENTAGE);

        return CollectionProgressColor.interpolate(
            CollectionProgressColor.MID_COLOR, CollectionProgressColor.END_COLOR, t
        );
    }

    /**
     * AS3 interpolates each channel as a float and then shifts without rounding, so the `<<` and
     * `|` truncate. `Math.trunc()` here reproduces that exactly — rounding instead would shift
     * every mid-band colour by a unit.
     */
    // AS3: _SafeCls_4508.as::interpolate()
    private static interpolate(from: number, to: number, t: number): number
    {
        const a = CollectionProgressColor.hexToRGB(from);
        const b = CollectionProgressColor.hexToRGB(to);

        return CollectionProgressColor.rgbToHex(
            Math.trunc(a.r + t * (b.r - a.r)),
            Math.trunc(a.g + t * (b.g - a.g)),
            Math.trunc(a.b + t * (b.b - a.b))
        );
    }

    // AS3: _SafeCls_4508.as::hexToRGB()
    private static hexToRGB(color: number): {r: number, g: number, b: number}
    {
        return {
            r: (color >> 16) & 0xFF,
            g: (color >> 8) & 0xFF,
            b: color & 0xFF,
        };
    }

    // AS3: _SafeCls_4508.as::RGBToHex()
    private static rgbToHex(r: number, g: number, b: number): number
    {
        return (r << 16) | (g << 8) | b;
    }
}
