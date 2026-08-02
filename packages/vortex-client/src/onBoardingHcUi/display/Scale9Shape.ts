/**
 * Nine-slice shape node of the login display list.
 *
 * TS-only: stand-in for the `flash.display.Shape` that
 * `LoaderUI.createScale9GridShapeFromImage()` returns. AS3 builds a Shape out of nine
 * bitmap-filled rectangles and then assigns `shape.scale9Grid`, which makes Flash re-slice the
 * artwork whenever `width`/`height` change instead of scaling it as a whole. Reproducing that is
 * the point of this class: every `Button` skin is sized by assignment
 * (`_defaultBackground.width = _rectangle.width`), so a plain scale would smear the rounded
 * corners of every button in the login flow.
 */
import type {BitmapData} from './BitmapData';
import {DisplayObject} from './DisplayObject';
import {Rectangle} from './Geom';

export class Scale9Shape extends DisplayObject
{
    private readonly _source: BitmapData;
    private readonly _grid: Rectangle;
    private _width: number;
    private _height: number;

    constructor(source: BitmapData, grid: Rectangle)
    {
        super();

        this._source = source;
        this._grid = grid;
        this._width = source.width;
        this._height = source.height;
    }

    /**
     * TS-only: `width` re-slices rather than scaling — see the class comment.
     */
    public override get width(): number
    {
        return this._width * this._scaleX;
    }

    public override set width(value: number)
    {
        this._width = value;
    }

    /** TS-only: `height`, same reasoning as `width`. */
    public override get height(): number
    {
        return this._height * this._scaleY;
    }

    public override set height(value: number)
    {
        this._height = value;
    }

    public getContentBounds(): Rectangle
    {
        return new Rectangle(0, 0, this._width, this._height);
    }

    protected draw(context: CanvasRenderingContext2D): void
    {
        const source = this._source.source;
        const sourceWidth = this._source.width;
        const sourceHeight = this._source.height;
        const left = this._grid.x;
        const top = this._grid.y;
        const right = sourceWidth - (this._grid.x + this._grid.width);
        const bottom = sourceHeight - (this._grid.y + this._grid.height);

        // Source columns/rows, then the destination ones: the centre band absorbs whatever is
        // left after the fixed edges, exactly as Flash's scale9Grid does.
        const sourceColumns = [0, left, left + this._grid.width, sourceWidth];
        const sourceRows = [0, top, top + this._grid.height, sourceHeight];
        const destColumns = [0, left, Math.max(left, this._width - right), this._width];
        const destRows = [0, top, Math.max(top, this._height - bottom), this._height];

        context.imageSmoothingEnabled = false;

        for(let column = 0; column < 3; column++)
        {
            for(let row = 0; row < 3; row++)
            {
                const sourceX = sourceColumns[column];
                const sourceY = sourceRows[row];
                const sliceWidth = sourceColumns[column + 1] - sourceX;
                const sliceHeight = sourceRows[row + 1] - sourceY;
                const destX = destColumns[column];
                const destY = destRows[row];
                const destWidth = destColumns[column + 1] - destX;
                const destHeight = destRows[row + 1] - destY;

                if(sliceWidth <= 0 || sliceHeight <= 0 || destWidth <= 0 || destHeight <= 0) continue;

                context.drawImage(
                    source,
                    sourceX,
                    sourceY,
                    sliceWidth,
                    sliceHeight,
                    destX,
                    destY,
                    destWidth,
                    destHeight
                );
            }
        }
    }
}
