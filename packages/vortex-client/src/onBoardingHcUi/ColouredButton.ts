/**
 * ColouredButton
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/ColouredButton.as
 *
 * The big pill buttons the login screens use — green to confirm, red to cancel. The four skins are
 * picked once from the button type and then handed back through the overridden getters.
 *
 * Two AS3 details that look like mistakes and are not:
 * - the green constant is spelled `"gfreen"`, and every call site passes that spelling;
 * - `"red"` is skinned with the PINK bitmaps (`button_skin_pink_*`), per the embed footer.
 *
 * AS3 runs this constructor's skin selection BEFORE `super()`; TypeScript cannot, but nothing reads
 * the skins until `Button.onAddedToStage()`, which runs later either way.
 */
import {Bitmap} from './display/Bitmap';
import type {DisplayObject} from './display/DisplayObject';
import {Rectangle} from './display/Geom';
import {Button, type ButtonAction} from './Button';
import {LoaderUI} from './LoaderUI';
import {LoginAssets} from './LoginAssets';

export class ColouredButton extends Button
{
    // AS3: BUTTON_RED
    public static readonly BUTTON_RED: string = 'red';

    // AS3: BUTTON_GREEN
    public static readonly BUTTON_GREEN: string = 'gfreen';

    // AS3: BUTTON_YELLOW
    public static readonly BUTTON_YELLOW: string = 'yellow';

    // AS3: defaultBg
    private _defaultBg: DisplayObject | null = null;

    // AS3: pressedBg
    private _pressedBg: DisplayObject | null = null;

    // AS3: inactiveBg
    private _inactiveBg: DisplayObject | null = null;

    // AS3: rolloverBg
    private _rolloverBg: DisplayObject | null = null;

    // AS3: _icon
    private _colouredIcon: Bitmap | null = null;

    // AS3: ColouredButton(_arg_1:String, _arg_2:String, _arg_3:Rectangle, _arg_4:Boolean, _arg_5:Function, _arg_6:uint=0xFFFFFF)
    constructor(
        type: string,
        caption: string,
        rectangle: Rectangle,
        fitWidthToText: boolean,
        action: ButtonAction,
        glowColour: number = 16777215
    )
    {
        super(caption, rectangle, fitWidthToText, action, glowColour);

        const grid = new Rectangle(8, 10, 6, 4);

        switch(type)
        {
            case 'red':
                this._defaultBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_pink'), grid);
                this._pressedBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_pink_pressed'), grid);
                this._inactiveBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_pink_inactive'), grid);
                this._rolloverBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_pink_rollover'), grid);
                break;

            case 'gfreen':
                this._defaultBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_green'), grid);
                this._pressedBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_green_pressed'), grid);
                this._inactiveBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_green_inactive'), grid);
                this._rolloverBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_green_rollover'), grid);
                break;

            case 'yellow':
                this._defaultBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_yellow'), grid);
                this._pressedBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_yellow_pressed'), grid);
                this._inactiveBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_yellow_inactive'), grid);
                this._rolloverBg = LoaderUI.createScale9GridShapeFromImage(LoginAssets.get('button_skin_yellow_rollover'), grid);
                this._colouredIcon = new Bitmap(LoginAssets.get('hc_small'));
                break;
        }
    }

    // AS3: override get defaultBackground():DisplayObject
    protected override get defaultBackground(): DisplayObject
    {
        return this._defaultBg ?? super.defaultBackground;
    }

    // AS3: override get pressedBackground():DisplayObject
    protected override get pressedBackground(): DisplayObject
    {
        return this._pressedBg ?? super.pressedBackground;
    }

    // AS3: override get inactiveBackground():DisplayObject
    protected override get inactiveBackground(): DisplayObject
    {
        return this._inactiveBg ?? super.inactiveBackground;
    }

    // AS3: override get rolloverBackground():DisplayObject
    protected override get rolloverBackground(): DisplayObject | null
    {
        return this._rolloverBg;
    }

    // AS3: override get etching():Boolean
    protected override get etching(): boolean
    {
        return false;
    }

    // AS3: override get padding():int
    protected override get padding(): number
    {
        return 64;
    }

    // AS3: override get textColour():uint
    protected override get textColour(): number
    {
        return 16777215;
    }

    // AS3: override get icon():Bitmap
    protected override get icon(): Bitmap | null
    {
        return this._colouredIcon;
    }
}
