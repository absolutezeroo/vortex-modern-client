/**
 * randomizeButton
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/randomizeButton.as
 *
 * The dice button of the onboarding avatar editor. Every state uses the same bitmap — AS3 returns
 * `rnd_button_png` from all four getters — so it never changes appearance, only behaviour.
 *
 * The AS3 class name is lower-case (`randomizeButton`); the file is named for the exported class
 * to stay consistent with the rest of the port, which is PascalCase throughout.
 */
import {Bitmap} from './display/Bitmap';
import type {DisplayObject} from './display/DisplayObject';
import {Rectangle} from './display/Geom';
import {Button, type ButtonAction} from './Button';
import {LoginAssets} from './LoginAssets';

export class RandomizeButton extends Button
{
    // AS3: randomizeButton(_arg_1:int, _arg_2:int, _arg_3:Function, _arg_4:uint=0xFFFFFF)
    constructor(x: number, y: number, action: ButtonAction, glowColour: number = 16777215)
    {
        super('', new Rectangle(x, y, 50, 52), false, action, glowColour);
    }

    // AS3: override get defaultBackground():DisplayObject
    protected override get defaultBackground(): DisplayObject
    {
        return new Bitmap(LoginAssets.get('rnd_button'));
    }

    // AS3: override get pressedBackground():DisplayObject
    protected override get pressedBackground(): DisplayObject
    {
        return new Bitmap(LoginAssets.get('rnd_button'));
    }

    // AS3: override get inactiveBackground():DisplayObject
    protected override get inactiveBackground(): DisplayObject
    {
        return new Bitmap(LoginAssets.get('rnd_button'));
    }

    // AS3: override get rolloverBackground():DisplayObject
    protected override get rolloverBackground(): DisplayObject | null
    {
        return new Bitmap(LoginAssets.get('rnd_button'));
    }
}
