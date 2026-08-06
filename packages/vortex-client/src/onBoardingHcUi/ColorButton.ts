/**
 * ColorButton
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/ColorButton.as
 *
 * A colour chip for the onboarding avatar editor's palette: the chosen colour is painted into the
 * chip's inner disc and the ring artwork is composited over it, once per state.
 *
 * AS3 sets `_color` before `super()` and only calls `setColor()` from `onAddedToStage()` — AFTER
 * `super.onAddedToStage()` has already asked for the four backgrounds. So the first build runs with
 * no tinted disc at all. That is reproduced here rather than "fixed": the skins are rebuilt on the
 * next state change anyway, and inventing an earlier `setColor()` would change what the first frame
 * looks like.
 */
import {Bitmap} from './display/Bitmap';
import {BitmapData} from './display/BitmapData';
import type {DisplayObject} from './display/DisplayObject';
import {ColorTransform, Point, Rectangle} from './display/Geom';
import {Button, type ButtonAction} from './Button';
import {LoginAssets} from './LoginAssets';

export class ColorButton extends Button
{
    // AS3: _index
    private _index: number = 0;

    // AS3: _club
    private _club: boolean = false;

    // AS3: _color
    private _color: number = -1;

    // AS3: _colorBmd
    private _colorBmd: BitmapData | null = null;

    // AS3: ColorButton(_arg_1:int, _arg_2:int, _arg_3:Function, _arg_4:uint=0xFFFFFF, _arg_5:Number=0xFFFFFF)
    constructor(x: number, y: number, action: ButtonAction, glowColour: number = 16777215, color: number = 16777215)
    {
        super('', new Rectangle(x, y, 44, 46), false, action, glowColour);

        this._color = color;
    }

    // AS3: setColor(_arg_1:Number)
    public setColor(color: number): void
    {
        this._color = color;

        const inside = LoginAssets.get('color_round_chip_in');
        const tinted = new BitmapData(inside.width, inside.height, true, 0);
        const transform = new ColorTransform();

        tinted.copyPixels(inside, inside.rect, new Point(0, 0));
        transform.color = color;
        tinted.colorTransform(new Rectangle(0, 0, tinted.width, tinted.height), transform);
        this._colorBmd = tinted;
    }

    // AS3: set index(_arg_1:int) / get index():int
    public get index(): number
    {
        return this._index;
    }

    // AS3: .../src/onBoardingHcUi/ColorButton.as::set index()
    public set index(value: number)
    {
        this._index = value;
    }

    // AS3: set club(_arg_1:Boolean) / get club():Boolean
    public get club(): boolean
    {
        return this._club;
    }

    // AS3: .../src/onBoardingHcUi/ColorButton.as::set club()
    public set club(value: boolean)
    {
        this._club = value;
    }

    // AS3: override onAddedToStage(_arg_1:Event=null)
    protected override onAddedToStage(): void
    {
        super.onAddedToStage();

        if(this._color > 0)
        {
            this.setColor(this._color);
        }
    }

    // AS3: override get defaultBackground():DisplayObject
    protected override get defaultBackground(): DisplayObject
    {
        return this.composeChip('color_chip_round_default');
    }

    // AS3: override get pressedBackground():DisplayObject
    protected override get pressedBackground(): DisplayObject
    {
        return this.composeChip('color_chip_round_selected');
    }

    // AS3: override get inactiveBackground():DisplayObject
    protected override get inactiveBackground(): DisplayObject
    {
        return this.composeChip('color_chip_round_default');
    }

    // AS3: override get rolloverBackground():DisplayObject
    protected override get rolloverBackground(): DisplayObject | null
    {
        return this.composeChip('color_chip_round_press');
    }

    /**
     * TS-only: the body all four AS3 getters repeat — paint the tinted disc, then merge the ring
     * artwork over it (`copyPixels(..., true)`).
     */
    private composeChip(ringAsset: string): Bitmap
    {
        const ring = LoginAssets.get(ringAsset);
        const chip = new BitmapData(ring.width, ring.height, true, this._color);

        if(this._colorBmd)
        {
            chip.copyPixels(this._colorBmd, this._colorBmd.rect, new Point(0, 0));
        }

        chip.copyPixels(ring, ring.rect, new Point(0, 0), true);

        return new Bitmap(chip);
    }
}
