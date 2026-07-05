/**
 * AnimationItem
 *
 * @see com.sulake.habbo.room.object.visualization.room.rasterizer.animated.AnimationItem
 *
 * Represents a single animation item in a landscape animation layer.
 * Tracks position and speed for scrolling animation effects.
 */
export class AnimationItem
{
    private _x: number = 0;
    private _y: number = 0;
    private _speedX: number = 0;
    private _speedY: number = 0;

    constructor(x: number, y: number, speedX: number, speedY: number, bitmapData: HTMLCanvasElement)
    {
        this._x = isNaN(x) ? 0 : x;
        this._y = isNaN(y) ? 0 : y;
        this._speedX = isNaN(speedX) ? 0 : speedX;
        this._speedY = isNaN(speedY) ? 0 : speedY;
        this._bitmapData = bitmapData;
    }

    private _bitmapData: HTMLCanvasElement | null = null;

    get bitmapData(): HTMLCanvasElement | null
    {
        return this._bitmapData;
    }

    /**
	 * Calculate the position of this item at a given time.
	 *
	 * @param tileWidth - Width of the tiling area
	 * @param tileHeight - Height of the tiling area
	 * @param speedXScale - Horizontal speed scale factor
	 * @param speedYScale - Vertical speed scale factor
	 * @param time - Current time in milliseconds
	 * @returns [x, y] position within the tiling area
	 */
    getPosition(tileWidth: number, tileHeight: number, speedXScale: number, speedYScale: number, time: number): [number, number]
    {
        let posX = this._x;
        let posY = this._y;

        if(speedXScale > 0)
        {
            posX += (this._speedX / speedXScale) * (time / 1000);
        }

        if(speedYScale > 0)
        {
            posY += (this._speedY / speedYScale) * (time / 1000);
        }

        const pixelX = Math.floor((posX % 1) * tileWidth);
        const pixelY = Math.floor((posY % 1) * tileHeight);

        return [pixelX, pixelY];
    }

    dispose(): void
    {
        this._bitmapData = null;
    }
}
