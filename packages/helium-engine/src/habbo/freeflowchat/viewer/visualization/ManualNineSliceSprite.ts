import {Container, Sprite, Texture, type Rectangle} from 'pixi.js';

/**
 * ManualNineSliceSprite
 *
 * AS3 baked a resizable nine-slice by manually copying/scaling BitmapData
 * patches into a single composite bitmap on every resize (as opposed to
 * `HabboFreeFlowChat.create9SliceSprite()`'s live Flash `scale9Grid`).
 *
 * PixiJS has no synchronous BitmapData-style pixel API, so patches are not
 * pre-extracted into separate bitmaps — `redraw()` instead draws each of the
 * 9 regions directly from the source ImageBitmap onto an OffscreenCanvas via
 * `drawImage()` (which performs the same unscaled-corner / stretched-edge
 * behavior as AS3's `copyPixels` vs `Matrix`-scaled `draw()`), then uploads
 * the composited canvas as this sprite's texture.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ManualNineSliceSprite.as
 */
export class ManualNineSliceSprite extends Container
{
    private readonly _source: ImageBitmap;
    private readonly _sprite: Sprite;
    private _bakedTexture: Texture | null = null;

    private readonly _leftWidth: number;
    private readonly _centerWidth: number;
    private readonly _rightWidth: number;
    private readonly _topHeight: number;
    private readonly _middleHeight: number;
    private readonly _bottomHeight: number;

    private _width: number;
    private _height: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ManualNineSliceSprite.as::ManualNineSliceSprite()
    constructor(scale9Grid: Rectangle, source: ImageBitmap)
    {
        super();

        this._source = source;
        this._leftWidth = scale9Grid.x;
        this._centerWidth = scale9Grid.width;
        this._rightWidth = source.width - scale9Grid.right;
        this._topHeight = scale9Grid.y;
        this._middleHeight = scale9Grid.height;
        this._bottomHeight = source.height - scale9Grid.bottom;
        this._width = source.width;
        this._height = source.height;

        this._sprite = new Sprite();
        this.addChild(this._sprite);
        this.redraw();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ManualNineSliceSprite.as::get width()
    override get width(): number
    {
        return this._width;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ManualNineSliceSprite.as::set width()
    override set width(value: number)
    {
        const next = Math.max(this._leftWidth + this._rightWidth, Math.round(value));

        if(this._width === next) return;

        this._width = next;
        this.redraw();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ManualNineSliceSprite.as::get height()
    override get height(): number
    {
        return this._height;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ManualNineSliceSprite.as::set height()
    override set height(value: number)
    {
        const next = Math.max(this._topHeight + this._bottomHeight, Math.round(value));

        if(this._height === next) return;

        this._height = next;
        this.redraw();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ManualNineSliceSprite.as::redraw()
    private redraw(): void
    {
        const width = Math.max(this._leftWidth + this._rightWidth, this._width);
        const height = Math.max(this._topHeight + this._bottomHeight, this._height);
        const centerWidth = width - this._leftWidth - this._rightWidth;
        const middleHeight = height - this._topHeight - this._bottomHeight;

        const canvas = new OffscreenCanvas(Math.max(1, width), Math.max(1, height));
        const ctx = canvas.getContext('2d');

        if(!ctx) return;

        const columns = [
            {sx: 0, sw: this._leftWidth, dx: 0, dw: this._leftWidth},
            {sx: this._leftWidth, sw: this._centerWidth, dx: this._leftWidth, dw: centerWidth},
            {sx: this._leftWidth + this._centerWidth, sw: this._rightWidth, dx: this._leftWidth + centerWidth, dw: this._rightWidth},
        ];
        const rows = [
            {sy: 0, sh: this._topHeight, dy: 0, dh: this._topHeight},
            {sy: this._topHeight, sh: this._middleHeight, dy: this._topHeight, dh: middleHeight},
            {sy: this._topHeight + this._middleHeight, sh: this._bottomHeight, dy: this._topHeight + middleHeight, dh: this._bottomHeight},
        ];

        for(const row of rows)
        {
            for(const column of columns)
            {
                this.drawPatch(ctx, column.sx, row.sy, column.sw, row.sh, column.dx, row.dy, column.dw, row.dh);
            }
        }

        const previousTexture = this._bakedTexture;

        this._bakedTexture = Texture.from(canvas as unknown as HTMLCanvasElement);
        this._sprite.texture = this._bakedTexture;
        previousTexture?.destroy();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/ManualNineSliceSprite.as::drawPatch()
    private drawPatch(ctx: OffscreenCanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void
    {
        if(sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;

        ctx.drawImage(this._source, sx, sy, sw, sh, dx, dy, dw, dh);
    }
}
