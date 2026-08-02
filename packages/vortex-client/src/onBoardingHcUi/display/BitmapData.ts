/**
 * Off-screen pixel buffer for the login display list.
 *
 * TS-only: stand-in for `flash.display.BitmapData`, cut down to the operations `onBoardingHcUi`
 * actually performs — `NineSplitSprite.renderOn()` (draw + copyPixels), `LoaderUI.createBalloon()`
 * (copyPixels + colorTransform), `ColorButton` (merged copyPixels), `Dimmer` (setPixel32) and
 * `WaitIndicator` (setVector). Backed by an OffscreenCanvas, so the composed result can be blitted
 * with a single `drawImage()`.
 *
 * The AS3 semantics that matter and are reproduced here:
 * - `copyPixels()` REPLACES the destination pixels unless `mergeAlpha` is set, where Canvas2D's
 *   default `drawImage()` would blend. A straight `drawImage()` for the non-merge case is how a
 *   nine-slice's centre bleeds through its own corners.
 * - `draw()` composites (source-over) and takes a clip rectangle, which is what keeps
 *   `NineSplitSprite` from smearing a stretched edge over its neighbours.
 */
import type {ColorTransform, Matrix, Point} from './Geom';
import { Rectangle} from './Geom';

export class BitmapData
{
    private readonly _canvas: OffscreenCanvas;
    private readonly _context: OffscreenCanvasRenderingContext2D;
    private readonly _width: number;
    private readonly _height: number;

    /**
     * TS-only: `new BitmapData(width, height, transparent, fillColor)`.
     *
     * `fillColor` is ARGB, as in AS3 — the widgets pass values whose alpha byte is zero
     * (`0x0D22BA`), i.e. a transparent fill, so an opaque-looking constant does not paint.
     */
    constructor(width: number, height: number, _transparent: boolean = true, fillColor: number = 0)
    {
        this._width = Math.max(1, Math.floor(width));
        this._height = Math.max(1, Math.floor(height));
        this._canvas = new OffscreenCanvas(this._width, this._height);

        const context = this._canvas.getContext('2d', {willReadFrequently: true});

        if(!context)
        {
            throw new Error('[BitmapData] Failed to acquire a 2D context');
        }

        this._context = context;
        this._context.imageSmoothingEnabled = false;

        const alpha = (fillColor >>> 24) & 0xFF;

        if(alpha > 0)
        {
            this._context.fillStyle = BitmapData.toCssColor(fillColor);
            this._context.fillRect(0, 0, this._width, this._height);
        }
    }

    /**
     * TS-only: `BitmapData.fromImage()` has no AS3 counterpart — AS3 gets its source pixels from an
     * `[Embed]`ed `Bitmap`, where the port gets them from the asset bundle as an ImageBitmap.
     */
    public static fromImage(image: ImageBitmap | HTMLImageElement): BitmapData
    {
        const data = new BitmapData(image.width, image.height, true, 0);

        data._context.drawImage(image, 0, 0);

        return data;
    }

    /**
     * TS-only: `get width()`.
     */
    public get width(): number
    {
        return this._width;
    }

    /**
     * TS-only: `get height()`.
     */
    public get height(): number
    {
        return this._height;
    }

    /**
     * TS-only: `get rect()`.
     */
    public get rect(): Rectangle
    {
        return new Rectangle(0, 0, this._width, this._height);
    }

    /**
     * TS-only: the backing canvas, so a `Bitmap` can blit this buffer straight to the stage.
     */
    public get source(): OffscreenCanvas
    {
        return this._canvas;
    }

    /**
     * TS-only: `copyPixels(sourceBitmapData, sourceRect, destPoint, ..., mergeAlpha)`.
     *
     * Without `mergeAlpha` the destination rectangle is cleared first, because AS3 replaces those
     * pixels outright while Canvas2D would alpha-blend over whatever was already there.
     */
    public copyPixels(
        source: BitmapData,
        sourceRect: Rectangle,
        destPoint: Point,
        mergeAlpha: boolean = false
    ): void
    {
        this._context.save();
        this._context.imageSmoothingEnabled = false;

        if(!mergeAlpha)
        {
            this._context.clearRect(destPoint.x, destPoint.y, sourceRect.width, sourceRect.height);
        }

        this._context.drawImage(
            source._canvas,
            sourceRect.x,
            sourceRect.y,
            sourceRect.width,
            sourceRect.height,
            destPoint.x,
            destPoint.y,
            sourceRect.width,
            sourceRect.height
        );
        this._context.restore();
    }

    /**
     * TS-only: `draw(source, matrix, colorTransform, blendMode, clipRect, smoothing)`.
     *
     * Only the argument shape `NineSplitSprite.renderOn()` uses is honoured: a scale/translate
     * matrix, a clip rectangle and nearest-neighbour sampling.
     */
    public draw(source: BitmapData, matrix: Matrix, clipRect: Rectangle | null = null, smoothing: boolean = false): void
    {
        this._context.save();
        this._context.imageSmoothingEnabled = smoothing;

        if(clipRect)
        {
            this._context.beginPath();
            this._context.rect(clipRect.x, clipRect.y, clipRect.width, clipRect.height);
            this._context.clip();
        }

        this._context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        this._context.drawImage(source._canvas, 0, 0);
        this._context.restore();
    }

    /**
     * TS-only: `colorTransform(rect, colorTransform)`, multiplier-only.
     */
    public colorTransform(rect: Rectangle, transform: ColorTransform): void
    {
        const image = this._context.getImageData(rect.x, rect.y, rect.width, rect.height);
        const pixels = image.data;

        for(let i = 0; i < pixels.length; i += 4)
        {
            pixels[i] = Math.min(255, pixels[i] * transform.redMultiplier);
            pixels[i + 1] = Math.min(255, pixels[i + 1] * transform.greenMultiplier);
            pixels[i + 2] = Math.min(255, pixels[i + 2] * transform.blueMultiplier);
            pixels[i + 3] = Math.min(255, pixels[i + 3] * transform.alphaMultiplier);
        }

        this._context.putImageData(image, rect.x, rect.y);
    }

    /**
     * TS-only: `setPixel32(x, y, colour)` — ARGB, as in AS3.
     */
    public setPixel32(x: number, y: number, color: number): void
    {
        const image = this._context.createImageData(1, 1);

        image.data[0] = (color >>> 16) & 0xFF;
        image.data[1] = (color >>> 8) & 0xFF;
        image.data[2] = color & 0xFF;
        image.data[3] = (color >>> 24) & 0xFF;

        this._context.putImageData(image, x, y);
    }

    /**
     * TS-only: `setVector(rect, colours)` — row-major ARGB, as in AS3.
     */
    public setVector(rect: Rectangle, colors: number[]): void
    {
        const image = this._context.createImageData(rect.width, rect.height);

        for(let i = 0; i < colors.length; i++)
        {
            const color = colors[i];
            const offset = i * 4;

            image.data[offset] = (color >>> 16) & 0xFF;
            image.data[offset + 1] = (color >>> 8) & 0xFF;
            image.data[offset + 2] = color & 0xFF;
            image.data[offset + 3] = (color >>> 24) & 0xFF;
        }

        this._context.putImageData(image, rect.x, rect.y);
    }

    /**
     * TS-only: CSS colour string for an ARGB value, for the few places that fill with one.
     */
    private static toCssColor(argb: number): string
    {
        const alpha = ((argb >>> 24) & 0xFF) / 255;
        const red = (argb >>> 16) & 0xFF;
        const green = (argb >>> 8) & 0xFF;
        const blue = argb & 0xFF;

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
}
