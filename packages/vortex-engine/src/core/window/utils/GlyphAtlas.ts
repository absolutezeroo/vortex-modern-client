import {Logger} from '@core/utils/Logger';

/**
 * A single baked glyph inside an atlas page.
 */
interface IGlyph
{
    // Cell origin inside the atlas canvas.
    x: number;
    y: number;
    width: number;
    height: number;
    // Ink offset relative to the pen position / baseline.
    offsetX: number;
    offsetY: number;
    // Horizontal advance applied after drawing.
    advance: number;
    // Whether the cell holds any ink at all (space and friends do not).
    hasInk: boolean;
}

/**
 * A colourised copy of the atlas page, kept in sync with it by version.
 */
interface ITintedPage
{
    canvas: OffscreenCanvas;
    version: number;
}

/**
 * Rasterises glyphs once into a shared atlas page and blits them, instead of
 * calling `ctx.fillText()` on every draw.
 *
 * TS-only: there is no AS3 counterpart, and there cannot be one. In Flash a
 * `TextController` owns a real `flash.text.TextField` which rasterises its own
 * glyphs; AS3's `TextSkinRenderer.draw()` only blits the result. Canvas2D has
 * no TextField, so this class is the port's stand-in for that rasterisation
 * step — which is also the only place the four AS3 text-quality fields can
 * mean anything:
 *
 * - `antiAliasType` (`TextController.as::get antiAliasType()`) — Flash's
 *   `"normal"` is the pre-Flash-8 rasteriser: on a pixel font at its design
 *   size it produces essentially binary coverage, which is the crisp look the
 *   Habbo UI was authored against (`text_styles_css` sets `normal` on every
 *   Volter 9px style). Skia instead applies greyscale AA, so `"normal"` is
 *   reproduced here by supersampling and then sampling the CENTRE of each
 *   destination pixel — the literal "does the outline cover the pixel centre"
 *   test an aliased rasteriser performs. Averaging the supersamples instead
 *   would defeat the purpose: a half-pixel-wide stem averages to ~50% alpha
 *   and is then destroyed by the threshold, which is what mangles glyphs like
 *   `M` at 9px.
 * - `sharpness` / `thickness` (`::get sharpness()`, `::get thickness()`) —
 *   Flash's two `"advanced"` AA knobs, applied here as a contrast slope and a
 *   threshold bias on the alpha channel.
 * - `gridFitType` (`::get gridFitType()`) — `"pixel"` snaps glyph origins and
 *   advances to whole pixels.
 *
 * All of that is applied ONCE, at bake time, into the atlas page. Drawing is
 * then one `drawImage()` per glyph with no per-draw measuring, no per-draw
 * canvas, and no per-draw pixel work.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as
 */
export class GlyphAtlas
{
    private static readonly LOGGER = Logger.getLogger('core.window.utils.GlyphAtlas');

    /**
     * Off by default — measured, not assumed.
     *
     * The atlas exists to reproduce Flash's `"normal"` anti-aliasing, on the
     * reading that the pre-Flash-8 rasteriser produced near-binary coverage on
     * a pixel font at its design size (see {@link handles}). A capture of the
     * real client's own avatar menu says otherwise. Comparing the fraction of
     * partially-covered pixels against solid ink — the anti-aliasing signature,
     * and the one measure that survives a different capture size, palette and
     * background:
     *
     *     line        atlas on   atlas off   real client
     *     1             0.00       0.37        0.41
     *     2             0.00       0.42        0.50
     *     3             0.00       0.47        0.51
     *     4             0.00       0.41        0.37
     *
     * Off lands on the reference; on produces no partial pixels at all on four
     * lines out of six. Glyph heights are identical either way, so nothing is
     * traded for it — turning the atlas off hands rasterisation back to the
     * browser rather than averaging supersamples, which is the failure mode
     * the centre-sampling was guarding against.
     *
     * What the atlas still buys is speed: one `drawImage()` per glyph instead
     * of a `fillText()` with per-draw measuring. `globalThis.__vortexTextAtlas
     * = true` turns it back on (then redraw, or call `invalidateAll()`), and
     * the window debugger has a button for it.
     */
    // TS-only: the atlas has no AS3 counterpart, so neither does its default.
    private static readonly ENABLED_BY_DEFAULT: boolean = false;

    public static get enabled(): boolean
    {
        const override = (globalThis as unknown as { __vortexTextAtlas?: boolean }).__vortexTextAtlas;

        return override === undefined ? GlyphAtlas.ENABLED_BY_DEFAULT : override;
    }

    public static set enabled(value: boolean)
    {
        (globalThis as unknown as { __vortexTextAtlas?: boolean }).__vortexTextAtlas = value;
    }

    /**
     * Whether text of a given `antiAliasType` should be drawn through an atlas
     * at all. Only Flash's `"normal"` is — `"advanced"` deliberately stays on
     * `ctx.fillText()`.
     *
     * The reason is a browser behaviour that cannot be reproduced through a
     * cached bitmap: `fillText()` composites glyphs with a text-specific gamma
     * correction (dark-on-light coverage is lightened so stems do not read as
     * heavy), while `drawImage()` of an already-rasterised glyph composites in
     * plain linear alpha. Identical coverage therefore comes out visibly
     * bolder through the atlas — which is what made the navigator's Ubuntu tabs
     * (`button_shiny_regular`: advanced, sharpness 80, thickness -15) look bold
     * against the AS3 client.
     *
     * That trade is only worth taking where the atlas buys fidelity. It does
     * for `"normal"`: Flash's pre-Flash-8 rasteriser is near-binary, the port
     * reproduces it by centre-sampling, and binary coverage has no mid-tones
     * for gamma to act on — so the mismatch cannot arise there. It does not for
     * `"advanced"`, whose greyscale AA the browser already approximates well;
     * there the atlas would only buy speed, and it is not worth a permanently
     * heavier face. Every Volter style in `text_styles_css` — i.e. nearly the
     * whole UI — is `normal`, so the atlas still covers the bulk of the text.
     */
    public static handles(antiAliasType: string): boolean
    {
        return GlyphAtlas.enabled && antiAliasType === 'normal';
    }

    private static _registry: Map<string, GlyphAtlas> = new Map();
    private static _fontListenerAttached: boolean = false;

    /**
     * Supersampling factor used for the `"normal"` (aliased) path. Only affects
     * how precisely the pixel centre is located — it adds no blur, because the
     * samples are never averaged.
     *
     * Font hinting is deliberately left at the browser default here. Baking
     * with `ctx.textRendering = 'geometricPrecision'` was tried on the live
     * client and produced no visible difference at this factor, which is what
     * the arithmetic predicts: at 5× the bake runs at 45px for a 9px style,
     * where a hinting-snapped stem moves by at most one supersample — 1/5 of a
     * final pixel — so it can only flip pixels whose coverage already sits on
     * the centre-sample boundary. Do not re-add the option without also
     * lowering this factor, which is the only thing that would give hinting
     * any leverage.
     */
    private static readonly SUPERSAMPLE: number = 5;

    /** Alpha at or above which a `"normal"` pixel is considered covered. */
    private static readonly NORMAL_THRESHOLD: number = 128;

    /**
     * Divisors mapping Flash's `sharpness` (-400..400) and `thickness`
     * (-200..200) onto the coverage curve.
     *
     * DERIVED, not recovered: Flash's rasteriser is closed and no AS3 source
     * states how either value scales, so these are chosen to keep the effect
     * subtle across the ranges the shipped styles actually use — `sharpness:
     * 80` / `thickness: -15` on the Ubuntu button and link styles, 0 everywhere
     * else. Sharpness divided by its own full range means 80 gives a 1.2×
     * contrast slope; an earlier /50 gave 2.6×, which filled edge pixels hard
     * enough to make the navigator tabs read as bold.
     */
    private static readonly SHARPNESS_SCALE: number = 400;

    private static readonly THICKNESS_SCALE: number = 800;

    /** Atlas page width; pages grow downwards only. */
    private static readonly PAGE_WIDTH: number = 512;

    private static readonly INITIAL_PAGE_HEIGHT: number = 128;

    /** Padding around each cell, so neighbouring glyphs cannot bleed. */
    private static readonly CELL_PADDING: number = 1;

    /** Cap on simultaneously cached tint colours per atlas. */
    private static readonly MAX_TINTS: number = 24;

    private readonly _fontString: string;
    private readonly _fontSize: number;
    private readonly _antiAliasType: string;
    private readonly _sharpness: number;
    private readonly _thickness: number;
    private readonly _gridFit: boolean;
    private readonly _alphaLut: Uint8Array;

    private _canvas: OffscreenCanvas;
    private _ctx: OffscreenCanvasRenderingContext2D;
    private _measureCtx: OffscreenCanvasRenderingContext2D;
    private _scratch: OffscreenCanvas | null = null;
    private _scratchCtx: OffscreenCanvasRenderingContext2D | null = null;

    private _glyphs: Map<string, IGlyph> = new Map();
    private _tints: Map<string, ITintedPage> = new Map();
    private _version: number = 0;

    private _shelfX: number = 0;
    private _shelfY: number = 0;
    private _shelfHeight: number = 0;

    private _ascent: number = 0;
    private _lineHeight: number = 0;

    private _disposed: boolean = false;

    private constructor(
        fontString: string,
        fontSize: number,
        antiAliasType: string,
        sharpness: number,
        thickness: number,
        gridFitType: string
    )
    {
        this._fontString = fontString;
        this._fontSize = fontSize;
        this._antiAliasType = antiAliasType === 'normal' ? 'normal' : 'advanced';
        this._sharpness = sharpness;
        this._thickness = thickness;
        this._gridFit = gridFitType === 'pixel';
        this._alphaLut = this.buildAlphaLut();

        this._canvas = new OffscreenCanvas(GlyphAtlas.PAGE_WIDTH, GlyphAtlas.INITIAL_PAGE_HEIGHT);
        this._ctx = this._canvas.getContext('2d', {willReadFrequently: true}) as OffscreenCanvasRenderingContext2D;

        this._measureCtx = new OffscreenCanvas(8, 8).getContext('2d') as OffscreenCanvasRenderingContext2D;
        this._measureCtx.font = fontString;
        this._measureCtx.textBaseline = 'alphabetic';

        const metrics = this._measureCtx.measureText('Mg');

        this._ascent = Math.ceil(metrics.fontBoundingBoxAscent);
        this._lineHeight = Math.ceil(metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);

        if(!(this._ascent > 0))
        {
            this._ascent = Math.ceil(fontSize * 0.8);
            this._lineHeight = Math.ceil(fontSize);
        }
    }

    /**
     * Returns the shared atlas for a font/quality combination, creating it on
     * first use. Atlases are keyed on everything that changes a baked pixel, so
     * two windows with the same style share one page.
     */
    public static get(
        fontString: string,
        fontSize: number,
        antiAliasType: string,
        sharpness: number,
        thickness: number,
        gridFitType: string
    ): GlyphAtlas
    {
        GlyphAtlas.attachFontListener();

        const aa = antiAliasType === 'normal' ? 'normal' : 'advanced';
        const key = aa === 'normal'
            ? `${fontString}|normal|${gridFitType}`
            : `${fontString}|advanced|${sharpness}|${thickness}|${gridFitType}`;

        let atlas = GlyphAtlas._registry.get(key);

        if(!atlas)
        {
            atlas = new GlyphAtlas(fontString, fontSize, aa, sharpness, thickness, gridFitType);
            GlyphAtlas._registry.set(key, atlas);
        }

        return atlas;
    }

    /**
     * Drops every cached page.
     *
     * Needed because a web font that finishes loading AFTER a glyph was baked
     * would otherwise leave the fallback face cached forever — the failure mode
     * `ctx.fillText()` does not have, since it re-resolves the font on every
     * call.
     */
    public static invalidateAll(): void
    {
        for(const atlas of GlyphAtlas._registry.values()) atlas.dispose();

        GlyphAtlas._registry.clear();
    }

    /**
     * Rebakes on font load, so early UI text does not stay stuck on the
     * fallback face.
     */
    private static attachFontListener(): void
    {
        if(GlyphAtlas._fontListenerAttached) return;

        GlyphAtlas._fontListenerAttached = true;

        if(typeof document === 'undefined' || !document.fonts) return;

        document.fonts.addEventListener('loadingdone', () =>
        {
            GlyphAtlas.LOGGER.debug('Web fonts finished loading — dropping baked glyph atlases.');
            GlyphAtlas.invalidateAll();
        });
    }

    public get ascent(): number
    {
        return this._ascent;
    }

    public get lineHeight(): number
    {
        return this._lineHeight;
    }

    /**
     * Width of `text` using the atlas' own advances.
     *
     * Every measuring call site must go through this rather than
     * `ctx.measureText()`: with `gridFitType = "pixel"` the atlas rounds
     * advances to whole pixels, so a measurement taken any other way would
     * disagree with what is actually drawn and mis-size auto-sized fields.
     */
    public measure(text: string, spacing: number): number
    {
        if(!text) return 0;

        let width = 0;
        let count = 0;

        for(const char of text)
        {
            width += this.getGlyph(char).advance;
            count++;
        }

        if(spacing !== 0 && count > 1) width += (count - 1) * spacing;

        return width;
    }

    /**
     * Blits `text` at `x`, honouring the context's current `textBaseline`
     * (`'top'` — the window system's default — or `'alphabetic'`, which the
     * compact droplist rows set). `color` is any CSS colour string, including
     * `rgba()` for the etched copy.
     *
     * Returns the advanced width, so callers can keep positioning as before.
     */
    public drawText(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        color: string,
        spacing: number,
        maxX: number = Number.POSITIVE_INFINITY
    ): number
    {
        if(!text) return 0;

        const page = this.tint(color);
        const baseline = ctx.textBaseline === 'alphabetic' ? y : y + this._ascent;
        const originY = this._gridFit ? Math.round(baseline) : baseline;
        let pen = x;

        for(const char of text)
        {
            const glyph = this.getGlyph(char);

            if(pen + glyph.advance > maxX) break;

            if(glyph.hasInk)
            {
                const originX = this._gridFit ? Math.round(pen) : pen;

                ctx.drawImage(
                    page,
                    glyph.x, glyph.y, glyph.width, glyph.height,
                    originX + glyph.offsetX, originY + glyph.offsetY, glyph.width, glyph.height
                );
            }

            pen += glyph.advance + spacing;
        }

        return pen - x;
    }

    /**
     * Alpha transfer table, built once per atlas and applied at bake time.
     *
     * `normal` is a hard threshold — Flash's non-antialiased rasteriser on a
     * pixel font. `advanced` maps the two AS3 knobs onto the coverage curve:
     * `thickness` moves the 50% point (negative = thinner, Flash's own sign
     * convention), `sharpness` steepens the ramp around it.
     *
     * The `advanced` branch is currently unreachable in practice: `handles()`
     * keeps that antiAliasType on `ctx.fillText()` for the gamma reason
     * documented there. It is kept because it is the mapping that policy would
     * need the moment the gamma difference is solved or judged acceptable —
     * flipping `handles()` is the only edit required.
     */
    private buildAlphaLut(): Uint8Array
    {
        const lut = new Uint8Array(256);

        if(this._antiAliasType === 'normal')
        {
            for(let i = 0; i < 256; i++) lut[i] = i >= GlyphAtlas.NORMAL_THRESHOLD ? 255 : 0;

            return lut;
        }

        const center = 0.5 - (this._thickness / GlyphAtlas.THICKNESS_SCALE);
        const slope = Math.max(0, 1 + (this._sharpness / GlyphAtlas.SHARPNESS_SCALE));

        for(let i = 0; i < 256; i++)
        {
            const alpha = 0.5 + (((i / 255) - center) * slope);

            lut[i] = Math.max(0, Math.min(255, Math.round(alpha * 255)));
        }

        return lut;
    }

    private getGlyph(char: string): IGlyph
    {
        let glyph = this._glyphs.get(char);

        if(!glyph)
        {
            glyph = this.bakeGlyph(char);
            this._glyphs.set(char, glyph);
            this._version++;
        }

        return glyph;
    }

    private bakeGlyph(char: string): IGlyph
    {
        const metrics = this._measureCtx.measureText(char);
        const advanceRaw = metrics.width;
        const advance = this._gridFit ? Math.round(advanceRaw) : advanceRaw;

        const pad = GlyphAtlas.CELL_PADDING;
        const left = Math.ceil(metrics.actualBoundingBoxLeft);
        const right = Math.ceil(metrics.actualBoundingBoxRight);
        const ascent = Math.ceil(metrics.actualBoundingBoxAscent);
        const descent = Math.ceil(metrics.actualBoundingBoxDescent);
        const inkWidth = left + right;
        const inkHeight = ascent + descent;

        if(!(inkWidth > 0) || !(inkHeight > 0) || !Number.isFinite(inkWidth) || !Number.isFinite(inkHeight))
        {
            return {x: 0, y: 0, width: 0, height: 0, offsetX: 0, offsetY: 0, advance, hasInk: false};
        }

        const width = inkWidth + (pad * 2);
        const height = inkHeight + (pad * 2);
        const penX = left + pad;
        const penY = ascent + pad;

        const cell = this.allocateCell(width, height);

        this.rasterizeInto(char, cell.x, cell.y, width, height, penX, penY);

        return {
            x: cell.x,
            y: cell.y,
            width,
            height,
            offsetX: -penX,
            offsetY: -penY,
            advance,
            hasInk: true,
        };
    }

    /**
     * Renders one glyph and writes it into the page.
     *
     * The `normal` branch never averages samples: it renders at N× and reads
     * back only the sub-pixel sitting at each destination pixel's centre. The
     * supersampling exists purely to shrink the browser's own antialiasing to
     * 1/N of a pixel before that read, so the threshold decides on nearly-clean
     * coverage instead of on a blurred edge.
     */
    private rasterizeInto(
        char: string,
        cellX: number,
        cellY: number,
        width: number,
        height: number,
        penX: number,
        penY: number
    ): void
    {
        if(this._antiAliasType === 'advanced')
        {
            const ctx = this.getScratch(width, height);

            ctx.clearRect(0, 0, width, height);
            ctx.font = this._fontString;
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(char, penX, penY);

            const image = ctx.getImageData(0, 0, width, height);

            this.applyLut(image.data);
            this._ctx.putImageData(image, cellX, cellY);

            return;
        }

        const scale = GlyphAtlas.SUPERSAMPLE;
        const hiWidth = width * scale;
        const hiHeight = height * scale;
        const ctx = this.getScratch(hiWidth, hiHeight);

        ctx.clearRect(0, 0, hiWidth, hiHeight);
        ctx.font = this.scaledFontString(scale);
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(char, penX * scale, penY * scale);

        const source = ctx.getImageData(0, 0, hiWidth, hiHeight).data;
        const target = this._ctx.createImageData(width, height);
        const data = target.data;
        const half = Math.floor(scale / 2);

        for(let y = 0; y < height; y++)
        {
            const sourceRow = ((y * scale) + half) * hiWidth;

            for(let x = 0; x < width; x++)
            {
                const sourceIndex = (sourceRow + (x * scale) + half) * 4;
                const targetIndex = ((y * width) + x) * 4;

                data[targetIndex] = 255;
                data[targetIndex + 1] = 255;
                data[targetIndex + 2] = 255;
                data[targetIndex + 3] = this._alphaLut[source[sourceIndex + 3]];
            }
        }

        this._ctx.putImageData(target, cellX, cellY);
    }

    private applyLut(data: Uint8ClampedArray): void
    {
        for(let i = 0; i < data.length; i += 4)
        {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = this._alphaLut[data[i + 3]];
        }
    }

    /**
     * Same font string at N× the size, for the supersampled bake. Rebuilt by
     * substituting the size token rather than reassembling the declaration, so
     * the family list and its quoting survive untouched.
     */
    private scaledFontString(scale: number): string
    {
        return this._fontString.replace(/(\d+(?:\.\d+)?)px/, (_match, size: string) => `${Number(size) * scale}px`);
    }

    private getScratch(width: number, height: number): OffscreenCanvasRenderingContext2D
    {
        if(!this._scratch || this._scratch.width < width || this._scratch.height < height)
        {
            this._scratch = new OffscreenCanvas(
                Math.max(width, this._scratch?.width ?? 0),
                Math.max(height, this._scratch?.height ?? 0)
            );
            this._scratchCtx = this._scratch.getContext('2d', {willReadFrequently: true}) as OffscreenCanvasRenderingContext2D;
        }

        return this._scratchCtx!;
    }

    /**
     * Shelf allocator: fills a row left to right, then starts a new row below
     * it, growing the page height when the last row runs out.
     */
    private allocateCell(width: number, height: number): { x: number; y: number }
    {
        if(this._shelfX + width > GlyphAtlas.PAGE_WIDTH)
        {
            this._shelfX = 0;
            this._shelfY += this._shelfHeight;
            this._shelfHeight = 0;
        }

        if(this._shelfY + height > this._canvas.height)
        {
            this.growPage(Math.max(this._canvas.height * 2, this._shelfY + height));
        }

        const cell = {x: this._shelfX, y: this._shelfY};

        this._shelfX += width;
        this._shelfHeight = Math.max(this._shelfHeight, height);

        return cell;
    }

    private growPage(height: number): void
    {
        const grown = new OffscreenCanvas(GlyphAtlas.PAGE_WIDTH, height);
        const ctx = grown.getContext('2d', {willReadFrequently: true}) as OffscreenCanvasRenderingContext2D;

        ctx.drawImage(this._canvas, 0, 0);

        this._canvas = grown;
        this._ctx = ctx;
    }

    /**
     * Colourised copy of the page. Rebuilt only when a new glyph has been baked
     * since the copy was made — two `drawImage`/`fillRect` calls, not a
     * per-glyph pass — and capped so an unbounded colour set cannot grow
     * without limit.
     */
    private tint(color: string): OffscreenCanvas
    {
        const cached = this._tints.get(color);

        if(cached && cached.version === this._version && cached.canvas.height === this._canvas.height)
        {
            return cached.canvas;
        }

        if(!cached && this._tints.size >= GlyphAtlas.MAX_TINTS)
        {
            const oldest = this._tints.keys().next();

            if(!oldest.done) this._tints.delete(oldest.value);
        }

        const canvas = new OffscreenCanvas(this._canvas.width, this._canvas.height);
        const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

        ctx.drawImage(this._canvas, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this._tints.set(color, {canvas, version: this._version});

        return canvas;
    }

    // AS3: .../src/com/sulake/core/window/components/TextController.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._glyphs.clear();
        this._tints.clear();
        this._scratch = null;
        this._scratchCtx = null;
    }
}
