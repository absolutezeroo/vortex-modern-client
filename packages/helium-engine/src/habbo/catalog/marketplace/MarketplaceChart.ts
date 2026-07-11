/**
 * Draws the small price-history/trade-volume line chart shown in the
 * marketplace offer-details panel.
 *
 * TS deviation: AS3 draws directly into a synchronously-returned
 * `BitmapData` via `flash.display.Shape`/`TextField`/`BitmapData.draw()`.
 * The browser has no synchronous canvas -> ImageBitmap path (see
 * `ImageResult.ts`'s doc comment on the same constraint), so `draw()`
 * returns `Promise<ImageBitmap>` here instead of `BitmapData` - callers
 * `await` it (AS3's callers are all synchronous event handlers, so this is
 * the one unavoidable signature change in this class).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceChart.as
 */
export class MarketplaceChart
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceChart.as::_xMin
    private static readonly X_MIN: number = -30;

    private static readonly GRID_COLOR: string = '#cccccc';

    private static readonly LINE_COLOR: string = '#0000ff';

    private _xValues: number[];

    private _yValues: number[];

    private _chartWidth: number = 0;

    private _chartHeight: number = 0;

    private _maxY: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceChart.as::MarketplaceChart()
    constructor(xValues: number[], yValues: number[])
    {
        this._xValues = xValues.slice();
        this._yValues = yValues.slice();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceChart.as::get available()
    get available(): boolean
    {
        return this._xValues != null && this._yValues != null && this._xValues.length > 1;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceChart.as::draw()
    async draw(width: number, height: number): Promise<ImageBitmap>
    {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        if(!this.available) return createImageBitmap(canvas);

        this._maxY = 0;

        for(const value of this._yValues)
        {
            if(value > this._maxY) this._maxY = value;
        }

        const magnitude = Math.pow(10, this._maxY.toString().length - 1);

        this._maxY = Math.ceil(this._maxY / magnitude) * magnitude;

        ctx.font = '9px Volter';

        const maxYLabel = this._maxY.toString();
        const maxYMetrics = ctx.measureText(maxYLabel);
        const textHeight = (maxYMetrics.fontBoundingBoxAscent ?? 9) + (maxYMetrics.fontBoundingBoxDescent ?? 2);
        const maxYWidth = maxYMetrics.width;

        this._chartWidth = width - maxYWidth - 2;
        this._chartHeight = height - textHeight;

        ctx.fillStyle = 'black';
        ctx.textBaseline = 'top';
        ctx.fillText(maxYLabel, 0, 0);

        const zeroLabel = '0';
        const zeroWidth = ctx.measureText(zeroLabel).width;

        ctx.fillText(zeroLabel, maxYWidth - zeroWidth + 1, height - textHeight - 1);

        ctx.save();
        ctx.translate(width - this._chartWidth, (height - this._chartHeight) / 2);

        ctx.strokeStyle = MarketplaceChart.GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this._chartHeight);

        for(let i = 0; i <= 5; i++)
        {
            const y = (this._chartHeight - 1) / 5 * i;

            ctx.moveTo(0, y);
            ctx.lineTo(this._chartWidth - 1, y);
        }

        ctx.stroke();

        ctx.strokeStyle = MarketplaceChart.LINE_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.getX(0), this.getY(0));

        for(let i = 1; i < this._xValues.length; i++)
        {
            ctx.lineTo(this.getX(i), this.getY(i));
        }

        ctx.stroke();
        ctx.restore();

        return createImageBitmap(canvas);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceChart.as::getX()
    private getX(index: number): number
    {
        return this._chartWidth + this._chartWidth / -MarketplaceChart.X_MIN * this._xValues[index];
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceChart.as::getY()
    private getY(index: number): number
    {
        return this._chartHeight - this._chartHeight / this._maxY * this._yValues[index];
    }
}
