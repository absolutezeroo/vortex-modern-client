/**
 * PlaneTextureBitmap
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.rasterizer.basic.PlaneTextureBitmap
 *
 * Holds a single bitmap texture with normal range constraints.
 */
export class PlaneTextureBitmap
{
    public static readonly MIN_NORMAL_COORDINATE_VALUE: number = -1;
    public static readonly MAX_NORMAL_COORDINATE_VALUE: number = 1;

    constructor(
        bitmap: HTMLCanvasElement,
        normalMinX: number = -1,
        normalMaxX: number = 1,
        normalMinY: number = -1,
        normalMaxY: number = 1,
        assetName: string | null = null
    )
    {
        this._bitmap = bitmap;
        this._normalMinX = normalMinX;
        this._normalMaxX = normalMaxX;
        this._normalMinY = normalMinY;
        this._normalMaxY = normalMaxY;
        this._assetName = assetName;
    }

    private _bitmap: HTMLCanvasElement;

    get bitmap(): HTMLCanvasElement
    {
        return this._bitmap;
    }

    private _normalMinX: number;

    get normalMinX(): number
    {
        return this._normalMinX;
    }

    private _normalMaxX: number;

    get normalMaxX(): number
    {
        return this._normalMaxX;
    }

    private _normalMinY: number;

    get normalMinY(): number
    {
        return this._normalMinY;
    }

    private _normalMaxY: number;

    get normalMaxY(): number
    {
        return this._normalMaxY;
    }

    private _assetName: string | null;

    get assetName(): string | null
    {
        return this._assetName;
    }

    dispose(): void
    {
        // Canvas will be GC'd
    }
}
