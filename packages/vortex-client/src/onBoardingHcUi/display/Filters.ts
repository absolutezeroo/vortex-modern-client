/**
 * Display filters for the login display list.
 *
 * TS-only: stand-ins for `flash.filters.DropShadowFilter` / `GlowFilter`, the only two the login
 * screens use — `LoaderUI.addEtching()` puts a 1px drop shadow under every caption, and
 * `Button.refresh()` glows on rollover when the skin has no rollover bitmap.
 *
 * Both are expressed as CSS `filter` strings rather than a pixel pass: Canvas2D applies
 * `drop-shadow()` to the drawn shape's alpha exactly like Flash does, and it costs one context
 * assignment instead of an off-screen blur per frame.
 */

/**
 * TS-only: base of the two filters, so `DisplayObject.filters` can hold either.
 */
export abstract class BitmapFilter
{
    /**
     * TS-only: the CSS `filter` fragment this filter contributes.
     */
    public abstract toCssFilter(): string;

    /**
     * TS-only: AS3 clones filters before assigning them (`ETCHING_FILTER.clone()`), because a
     * `filters` array copies its entries on write.
     */
    public abstract clone(): BitmapFilter;

    /**
     * TS-only: `rgba()` string for an RGB colour plus a separate alpha, the form both filters take.
     */
    protected static toCssColor(color: number, alpha: number): string
    {
        const red = (color >> 16) & 0xFF;
        const green = (color >> 8) & 0xFF;
        const blue = color & 0xFF;

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
}

/**
 * TS-only: `flash.filters.DropShadowFilter`.
 */
export class DropShadowFilter extends BitmapFilter
{
    private readonly _distance: number;
    private readonly _angle: number;
    private readonly _color: number;
    private readonly _alpha: number;
    private readonly _blurX: number;
    private readonly _blurY: number;

    constructor(
        distance: number = 4,
        angle: number = 45,
        color: number = 0,
        alpha: number = 1,
        blurX: number = 4,
        blurY: number = 4
    )
    {
        super();

        this._distance = distance;
        this._angle = angle;
        this._color = color;
        this._alpha = alpha;
        this._blurX = blurX;
        this._blurY = blurY;
    }

    public toCssFilter(): string
    {
        const radians = (this._angle * Math.PI) / 180;
        const offsetX = Math.round(this._distance * Math.cos(radians) * 100) / 100;
        const offsetY = Math.round(this._distance * Math.sin(radians) * 100) / 100;

        // Flash's blurX/blurY is a box-blur diameter; CSS takes a standard deviation.
        const blur = Math.max(this._blurX, this._blurY) / 2;

        return `drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${BitmapFilter.toCssColor(this._color, this._alpha)})`;
    }

    public clone(): DropShadowFilter
    {
        return new DropShadowFilter(this._distance, this._angle, this._color, this._alpha, this._blurX, this._blurY);
    }
}

/**
 * TS-only: `flash.filters.GlowFilter`.
 *
 * A glow is a shadow with no offset; Flash's `strength` (which the buttons leave at its default)
 * is reproduced by stacking the same shadow twice, which is what makes the rollover halo read at
 * the alpha the AS3 asks for rather than as a faint outline.
 */
export class GlowFilter extends BitmapFilter
{
    private readonly _color: number;
    private readonly _alpha: number;
    private readonly _blurX: number;
    private readonly _blurY: number;

    constructor(color: number = 0xFF0000, alpha: number = 1, blurX: number = 6, blurY: number = 6)
    {
        super();

        this._color = color;
        this._alpha = alpha;
        this._blurX = blurX;
        this._blurY = blurY;
    }

    public toCssFilter(): string
    {
        const blur = Math.max(this._blurX, this._blurY) / 2;
        const shadow = `drop-shadow(0 0 ${blur}px ${BitmapFilter.toCssColor(this._color, this._alpha)})`;

        return `${shadow} ${shadow}`;
    }

    public clone(): GlowFilter
    {
        return new GlowFilter(this._color, this._alpha, this._blurX, this._blurY);
    }
}
