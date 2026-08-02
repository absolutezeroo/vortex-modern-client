/**
 * RoundButton
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/RoundButton.as
 *
 * The 50×53 icon button of the onboarding avatar editor's part grid. Its skins are plain bitmaps,
 * not nine-slices, and the icon is re-added after every rebuild.
 */
import {Bitmap} from './display/Bitmap';
import type {BitmapData} from './display/BitmapData';
import type {DisplayObject} from './display/DisplayObject';
import {Rectangle} from './display/Geom';
import {Button, type ButtonAction} from './Button';
import {LoginAssets} from './LoginAssets';

export class RoundButton extends Button
{
    // AS3: _icon
    private _iconData: BitmapData | null = null;

    // AS3: RoundButton(_arg_1:int, _arg_2:int, _arg_3:Function, _arg_4:uint=0xFFFFFF)
    constructor(x: number, y: number, action: ButtonAction, glowColour: number = 16777215)
    {
        super('', new Rectangle(x, y, 50, 53), false, action, glowColour);
    }

    // AS3: addIcon(_arg_1:BitmapData)
    public addIcon(icon: BitmapData): void
    {
        this._iconData = icon;

        const bitmap = new Bitmap(icon);

        bitmap.x = (this.width - bitmap.width) / 2;
        bitmap.y = (this.height - bitmap.height) / 2;
        this.addChild(bitmap);
    }

    // AS3: override onAddedToStage(_arg_1:Event=null)
    protected override onAddedToStage(): void
    {
        super.onAddedToStage();

        if(this._iconData)
        {
            this.addIcon(this._iconData);
        }
    }

    // AS3: override get defaultBackground():DisplayObject
    protected override get defaultBackground(): DisplayObject
    {
        return new Bitmap(LoginAssets.get('button_grid'));
    }

    // AS3: override get pressedBackground():DisplayObject
    protected override get pressedBackground(): DisplayObject
    {
        return new Bitmap(LoginAssets.get('button_grid_selected_inactive'));
    }

    // AS3: override get inactiveBackground():DisplayObject
    protected override get inactiveBackground(): DisplayObject
    {
        return new Bitmap(LoginAssets.get('button_grid'));
    }

    // AS3: override get rolloverBackground():DisplayObject
    protected override get rolloverBackground(): DisplayObject | null
    {
        return new Bitmap(LoginAssets.get('button_grid_over'));
    }

    // AS3: override get currentlyActive():DisplayObject
    protected override get currentlyActive(): DisplayObject
    {
        return new Bitmap(LoginAssets.get('button_grid_selected_active'));
    }
}
