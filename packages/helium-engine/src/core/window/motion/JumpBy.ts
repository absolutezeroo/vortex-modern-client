import type {IWindow} from '../IWindow';
import {Interval} from './Interval';

/**
 * Motion that produces a jump animation by moving a window with
 * a sinusoidal bounce in the Y axis while translating in X and Y.
 *
 * The height parameter controls the peak of each bounce arc, and
 * the jumps parameter controls how many bounces occur during the motion.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/motion/JumpBy.as
 */
export class JumpBy extends Interval
{
	protected _startX: number = 0;
	protected _startY: number = 0;
	protected _deltaX: number;
	protected _deltaY: number;
	protected _height: number;
	protected _jumps: number;

	constructor(target: IWindow, duration: number, dx: number, dy: number, height: number, jumps: number)
	{
		super(target, duration);
		this._deltaX = dx;
		this._deltaY = dy;
		this._height = -height;
		this._jumps = jumps;
	}

	public override start(): void
	{
		super.start();
		this._startX = this._target!.x;
		this._startY = this._target!.y;
	}

	public override update(progress: number): void
	{
		super.update(progress);
		this._target!.x = this._startX + (this._deltaX * progress);
		this._target!.y = (this._startY + (this._height * Math.abs(Math.sin(progress * Math.PI * this._jumps)))) + (this._deltaY * progress);
	}
}
