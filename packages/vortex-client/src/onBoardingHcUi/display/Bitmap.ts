/**
 * Bitmap node of the login display list.
 *
 * TS-only: stand-in for `flash.display.Bitmap`. Sizing goes through `DisplayObject`'s scale-based
 * `width`/`height`, which is what Flash does — `RoundButton` hands its skins straight to
 * `Button.onAddedToStage()`, which stretches them to the button rectangle.
 */
import type {BitmapData} from './BitmapData';
import {DisplayObject} from './DisplayObject';
import {Rectangle} from './Geom';

export class Bitmap extends DisplayObject
{
    private _bitmapData: BitmapData | null;

    /** TS-only: `smoothing` — off, matching the widgets' pixel art. */
    public smoothing: boolean = false;

    constructor(bitmapData: BitmapData | null = null)
    {
        super();

        this._bitmapData = bitmapData;
    }

    /** TS-only: `get bitmapData()` / `set bitmapData()` — `RadioButton` swaps its mark this way. */
    public get bitmapData(): BitmapData | null
    {
        return this._bitmapData;
    }

    public set bitmapData(value: BitmapData | null)
    {
        this._bitmapData = value;
    }

    public getContentBounds(): Rectangle
    {
        if(!this._bitmapData) return new Rectangle(0, 0, 0, 0);

        return new Rectangle(0, 0, this._bitmapData.width, this._bitmapData.height);
    }

    protected draw(context: CanvasRenderingContext2D): void
    {
        if(!this._bitmapData) return;

        context.imageSmoothingEnabled = this.smoothing;
        context.drawImage(this._bitmapData.source, 0, 0);
    }
}
