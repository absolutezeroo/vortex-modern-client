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
 * A glow, which Flash models as a shadow with no offset.
 *
 * `WindowParser` never builds one — no shipped layout declares `<GlowFilter>` — but
 * `BadgeImageWidget` builds them from code, which is what this exists for.
 */
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/BadgeImageWidget.as::createOuterGlowFilter()
export interface IWindowGlowFilter
{
    // TS-only: the discriminant; AS3 has a real `flash.filters.GlowFilter` and tests with `is`.
    type: 'GlowFilter';
    // AS3: .../widgets/BadgeImageWidget.as::createOuterGlowFilter() (`param1`)
    color: number;
    // AS3: .../widgets/BadgeImageWidget.as::createOuterGlowFilter() (`0.7 * param2`)
    alpha: number;
    // AS3: .../widgets/BadgeImageWidget.as::createOuterGlowFilter() (`4 + param2 * 4`)
    blurX: number;
    // AS3: .../widgets/BadgeImageWidget.as::createOuterGlowFilter() (`4 + param2 * 4`)
    blurY: number;
    // AS3: .../widgets/BadgeImageWidget.as::createOuterGlowFilter() (`1 + param2 * 1.2`)
    strength: number;
    // AS3: .../widgets/BadgeImageWidget.as::createInnerGlowFilter() (`true`)
    inner: boolean;
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
 * A `GlowFilter` is a shadow with no offset — Flash models it exactly that way — so it takes the
 * same path with `distance` absent and reading as zero.
 *
 * `inner` and `knockout` have no Canvas2D equivalent and are skipped rather than approximated:
 * an inner shadow drawn as an outer one is not a worse version of the effect, it is a different
 * effect in a different place. No shipped layout sets either, and `BadgeImageWidget`'s inner
 * glow is the one filter of its three that goes unrendered as a result.
 */
export function windowFiltersToCss(filters: readonly unknown[] | null): string
{
    if(filters === null || filters.length === 0) return '';

    const parts: string[] = [];

    for(const entry of filters)
    {
        // Read structurally rather than as `A & B`: the two discriminants exclude each other, so
        // the intersection is `never` and every field read off it fails.
        const filter = entry as Partial<Omit<IWindowDropShadowFilter, 'type'>> & {type?: string} | null;

        if(filter == null) continue;
        if(filter.type !== 'DropShadowFilter' && filter.type !== 'GlowFilter') continue;
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

        // No blur and no offset means the shadow lands exactly behind the source and is never
        // seen — a filter pass for nothing. Flash draws it too; skipping is the cheaper identity.
        if(blur === 0 && offsetX === 0 && offsetY === 0) continue;

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
