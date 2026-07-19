import type {IWindow} from '../IWindow';
import {MoveTo} from './MoveTo';

/**
 * Motion that moves a window by a relative (dx, dy) offset.
 *
 * On start, converts the relative offset to an absolute target position
 * by adding the offset to the window's current position, then delegates
 * to MoveTo for the interpolation.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/motion/MoveBy.as
 */
export class MoveBy extends MoveTo
{
    constructor(target: IWindow, duration: number, dx: number, dy: number)
    {
        super(target, duration, dx, dy);
    }

    public override start(): void
    {
        this._targetX = this._target!.x + this._targetX;
        this._targetY = this._target!.y + this._targetY;
        super.start();
    }
}
