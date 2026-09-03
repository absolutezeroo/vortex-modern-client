/**
 * Translates a window's Flash filter list into a Canvas2D `ctx.filter` string.
 *
 * AS3 hands its filter array to Flash, which composites each one onto the window's own bitmap.
 * There is no such pipeline here: `WindowComposite` blits each window's buffer onto one canvas,
 * and Canvas2D's only filter hook is the CSS filter string it applies to whatever is drawn next.
 * That hook is enough for the one filter the layouts actually use — 225 shipped layouts declare
 * `<DropShadowFilter>` and nothing else — because `drop-shadow()` is the same operation.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter()
 */

/**
 * The shape `WindowParser.buildBitmapFilter()` produces, and the only one stored on a window.
 */
// AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter()
export interface IWindowDropShadowFilter
{
    // TS-only: the discriminant. AS3 has a real `DropShadowFilter` class and tests with `is`.
    type: 'DropShadowFilter';
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`distance`)
    distance: number;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`angle`)
    angle: number;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`color`)
    color: number;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`alpha`)
    alpha: number;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`blurX`)
    blurX: number;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`blurY`)
    blurY: number;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`strength`)
    strength: number;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`quality`)
    quality: number;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`inner`)
    inner: boolean;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`knockout`)
    knockout: boolean;
    // AS3: .../src/com/sulake/core/window/utils/WindowParser.as::buildBitmapFilter() (`hideObject`)
    hideObject: boolean;
}

/**
 * How many times `drop-shadow()` is repeated to approximate Flash's `strength`.
 *
 * Flash multiplies the shadow's alpha by `strength` and clamps; CSS has no such knob, and
 * stacking the same shadow darkens it the same way. Capped because each repeat is another
 * full-canvas pass, and past three the difference stops being visible.
 */
const MAX_STRENGTH_PASSES = 3;

/**
 * One CSS `drop-shadow()` per filter, joined — or `''` when the list contributes nothing.
 *
 * Returns `''` rather than `'none'` so the caller can test it as a boolean and leave
 * `ctx.filter` untouched, which is cheaper than assigning a no-op filter per window.
 *
 * `inner` and `knockout` have no Canvas2D equivalent and are skipped rather than approximated:
 * an inner shadow drawn as an outer one is not a worse version of the effect, it is a different
 * effect in a different place. No shipped layout sets either.
 */
export function windowFiltersToCss(filters: readonly unknown[] | null): string
{
    if(filters === null || filters.length === 0) return '';

    const parts: string[] = [];

    for(const entry of filters)
    {
        const filter = entry as Partial<IWindowDropShadowFilter> | null;

        if(filter == null || filter.type !== 'DropShadowFilter') continue;
        if(filter.inner === true || filter.knockout === true) continue;

        const alpha = filter.alpha ?? 1;

        if(alpha <= 0) continue;

        // Flash gives distance and angle; CSS wants x/y. The angle is in degrees, clockwise from
        // east, which is the same convention `Math.cos`/`Math.sin` use once converted to radians.
        const distance = filter.distance ?? 0;
        const radians = ((filter.angle ?? 45) * Math.PI) / 180;
        const offsetX = Math.round(Math.cos(radians) * distance * 100) / 100;
        const offsetY = Math.round(Math.sin(radians) * distance * 100) / 100;

        // CSS takes one blur radius where Flash takes two. The larger of the pair keeps a
        // deliberately-wide shadow wide; averaging would quietly shrink it.
        const blur = Math.max(filter.blurX ?? 0, filter.blurY ?? 0);

        const color = filter.color ?? 0;
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        const shadow = `drop-shadow(${offsetX}px ${offsetY}px ${blur}px rgba(${r},${g},${b},${alpha}))`;

        const passes = Math.min(MAX_STRENGTH_PASSES, Math.max(1, Math.round(filter.strength ?? 1)));

        for(let i = 0; i < passes; i++) parts.push(shadow);
    }

    return parts.join(' ');
}
