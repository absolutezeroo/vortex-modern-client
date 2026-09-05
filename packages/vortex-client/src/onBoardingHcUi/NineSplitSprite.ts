/**
 * NineSplitSprite
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/NineSplitSprite.as
 *
 * Renders a bitmap as a nine-slice into a pixel buffer. Unlike `LoaderUI.createScale9GridShapeFromImage()`
 * (which produces a live scale9 Shape), this one bakes the result, which is what the balloons and
 * input-field backgrounds are made of.
 *
 * The AS3 statics are reproduced as lazy getters: AS3 builds them at class-init time from
 * `[Embed]`ed bitmaps that are ready immediately, where the port has to wait for `LoginAssets.load()`.
 */
import {BitmapData} from './display/BitmapData';
import {Point, Rectangle, rectangleTransformMatrix} from './display/Geom';
import {LoginAssets} from './LoginAssets';

export class NineSplitSprite
{
    private static _balloonHighlighted: NineSplitSprite | null = null;
    private static _balloonShaded: NineSplitSprite | null = null;
    private static _borderSunk: NineSplitSprite | null = null;
    private static _darkPopup: NineSplitSprite | null = null;
    private static _divider: NineSplitSprite | null = null;
    private static _frame: NineSplitSprite | null = null;
    private static _inputCorrected: NineSplitSprite | null = null;
    private static _inputError: NineSplitSprite | null = null;
    private static _inputField: NineSplitSprite | null = null;
    private static _inputCorrectedHitch: NineSplitSprite | null = null;
    private static _inputErrorHitch: NineSplitSprite | null = null;
    private static _inputFieldHitch: NineSplitSprite | null = null;
    private static _darkBalloon: NineSplitSprite | null = null;

    // AS3: .../src/onBoardingHcUi/NineSplitSprite.as::_bitmapData
    private readonly _bitmapData: BitmapData;
    // AS3: .../src/onBoardingHcUi/NineSplitSprite.as::_widths
    private readonly _widths: number[];
    // AS3: .../src/onBoardingHcUi/NineSplitSprite.as::_heights
    private readonly _heights: number[];

    // AS3: NineSplitSprite(_arg_1:BitmapData, _arg_2:Vector.<int>, _arg_3:Vector.<int>)
    constructor(bitmapData: BitmapData, widths: number[], heights: number[])
    {
        this._bitmapData = bitmapData;
        this._widths = widths;
        this._heights = heights;
    }

    // AS3: BALLOON_HIGHLIGHTED
    public static get BALLOON_HIGHLIGHTED(): NineSplitSprite
    {
        NineSplitSprite._balloonHighlighted ??= new NineSplitSprite(
            LoginAssets.get('white_balloon'), [5, 4, 5], [11, 1, 5]
        );

        return NineSplitSprite._balloonHighlighted;
    }

    // AS3: BALLOON_SHADED
    public static get BALLOON_SHADED(): NineSplitSprite
    {
        NineSplitSprite._balloonShaded ??= new NineSplitSprite(
            LoginAssets.get('white_balloon'), [5, 4, 5], [5, 1, 11]
        );

        return NineSplitSprite._balloonShaded;
    }

    // AS3: BORDER_SUNK
    public static get BORDER_SUNK(): NineSplitSprite
    {
        NineSplitSprite._borderSunk ??= new NineSplitSprite(
            LoginAssets.get('border_sunk'), [12, 2, 6], [14, 2, 4]
        );

        return NineSplitSprite._borderSunk;
    }

    // AS3 declares the raw `DARK_POPUP_BITMAP` public where every sibling bitmap is private, and
    // nothing outside NineSplitSprite.as reads it — here the pixels come from
    // `LoginAssets.get('dark_popup')`, which any caller can reach the same way.
    // AS3: DARK_POPUP_BITMAP
    // AS3: DARK_POPUP
    public static get DARK_POPUP(): NineSplitSprite
    {
        NineSplitSprite._darkPopup ??= new NineSplitSprite(
            LoginAssets.get('dark_popup'), [5, 5, 5], [5, 12, 5]
        );

        return NineSplitSprite._darkPopup;
    }

    // AS3: DIVIDER
    public static get DIVIDER(): NineSplitSprite
    {
        NineSplitSprite._divider ??= new NineSplitSprite(
            LoginAssets.get('divider'), [2, 2, 2], [8, 0, 0]
        );

        return NineSplitSprite._divider;
    }

    // AS3: FRAME
    public static get FRAME(): NineSplitSprite
    {
        NineSplitSprite._frame ??= new NineSplitSprite(
            LoginAssets.get('frame'), [4, 3, 4], [5, 1, 7]
        );

        return NineSplitSprite._frame;
    }

    // AS3: INPUT_CORRECTED
    public static get INPUT_CORRECTED(): NineSplitSprite
    {
        NineSplitSprite._inputCorrected ??= new NineSplitSprite(
            LoginAssets.get('input_corrected'), [5, 2, 5], [5, 2, 6]
        );

        return NineSplitSprite._inputCorrected;
    }

    // AS3: INPUT_ERROR
    public static get INPUT_ERROR(): NineSplitSprite
    {
        NineSplitSprite._inputError ??= new NineSplitSprite(
            LoginAssets.get('input_error'), [5, 2, 5], [5, 2, 6]
        );

        return NineSplitSprite._inputError;
    }

    // AS3: INPUT_FIELD
    public static get INPUT_FIELD(): NineSplitSprite
    {
        NineSplitSprite._inputField ??= new NineSplitSprite(
            LoginAssets.get('input_field'), [5, 4, 5], [7, 2, 5]
        );

        return NineSplitSprite._inputField;
    }

    /**
     * AS3: INPUT_CORRECTED_HITCH
     *
     * Built from INPUT_FIELD_HITCH_BITMAP, not from the corrected-hitch bitmap — that is what the
     * source says, and the identifier footer confirms the two embeds are distinct. Ported as-is.
     */
    public static get INPUT_CORRECTED_HITCH(): NineSplitSprite
    {
        NineSplitSprite._inputCorrectedHitch ??= new NineSplitSprite(
            LoginAssets.get('input_field_hitch'), [10, 310, 10], [5, 21, 5]
        );

        return NineSplitSprite._inputCorrectedHitch;
    }

    // AS3: INPUT_ERROR_HITCH
    public static get INPUT_ERROR_HITCH(): NineSplitSprite
    {
        NineSplitSprite._inputErrorHitch ??= new NineSplitSprite(
            LoginAssets.get('input_error_hitch'), [10, 310, 10], [5, 21, 5]
        );

        return NineSplitSprite._inputErrorHitch;
    }

    // AS3: INPUT_FIELD_HITCH
    public static get INPUT_FIELD_HITCH(): NineSplitSprite
    {
        NineSplitSprite._inputFieldHitch ??= new NineSplitSprite(
            LoginAssets.get('input_field_hitch'), [10, 310, 10], [5, 21, 5]
        );

        return NineSplitSprite._inputFieldHitch;
    }

    // AS3: DARK_BALLOON
    public static get DARK_BALLOON(): NineSplitSprite
    {
        NineSplitSprite._darkBalloon ??= new NineSplitSprite(
            LoginAssets.get('block_dark_base'), [5, 4, 5], [11, 1, 5]
        );

        return NineSplitSprite._darkBalloon;
    }

    // AS3: get bitmapData()
    public get bitmapData(): BitmapData
    {
        return this._bitmapData;
    }

    // AS3: render(_arg_1:int, _arg_2:int):Bitmap
    public render(width: number, height: number): BitmapData
    {
        const target = new BitmapData(width, height, true, 0xFFFFFF);

        this.renderOn(target, new Rectangle(0, 0, width, height));

        return target;
    }

    // AS3: renderOn(_arg_1:Bitmap, _arg_2:Rectangle):void
    public renderOn(target: BitmapData, area: Rectangle): void
    {
        const areaX = area.x;
        const areaY = area.y;
        const areaWidth = area.width;
        const areaHeight = area.height;
        const sourceColumns = [0, this._widths[0], this._widths[0] + this._widths[1]];
        const sourceRows = [0, this._heights[0], this._heights[0] + this._heights[1]];
        const sourceWidths = this._widths;
        const sourceHeights = this._heights;
        const destColumns = [areaX, areaX + this._widths[0], areaX + areaWidth - this._widths[2]];
        const destRows = [areaY, areaY + this._heights[0], areaY + areaHeight - this._heights[2]];
        const destWidths = [this._widths[0], areaWidth - this._widths[0] - this._widths[2], this._widths[2]];
        const destHeights = [this._heights[0], areaHeight - this._heights[0] - this._heights[2], this._heights[2]];

        for(let column = 0; column < 3; column++)
        {
            for(let row = 0; row < 3; row++)
            {
                if(destWidths[column] < 1 || destHeights[row] < 1) continue;

                if(sourceWidths[column] < 1 || sourceHeights[row] < 1) continue;

                const sourceRect = new Rectangle(
                    sourceColumns[column],
                    sourceRows[row],
                    sourceWidths[column],
                    sourceHeights[row]
                );

                // The corners are copied 1:1; the edges and centre are stretched. Copying the
                // corners instead of drawing them is what keeps them from resampling.
                if(column !== 1 && row !== 1)
                {
                    target.copyPixels(this._bitmapData, sourceRect, new Point(destColumns[column], destRows[row]));

                    continue;
                }

                const destRect = new Rectangle(
                    destColumns[column],
                    destRows[row],
                    destWidths[column],
                    destHeights[row]
                );

                target.draw(this._bitmapData, rectangleTransformMatrix(sourceRect, destRect), destRect, false);
            }
        }
    }
}
