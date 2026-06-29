import type {IWindow} from '../IWindow';
import {Interval} from './Interval';

/**
 * Motion that moves a window to an absolute (x, y) position.
 *
 * On start, records the window's current position and computes deltas.
 * On each update, linearly interpolates between start and target positions.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/motion/MoveTo.as
 */
export class MoveTo extends Interval
{
	protected _startX: number = 0;
	protected _startY: number = 0;
	protected _targetX: number;
	protected _targetY: number;
	protected _deltaX: number = 0;
	protected _deltaY: number = 0;

	constructor(target: IWindow, duration: number, targetX: number, targetY: number)
	{
		super(target, duration);
		this._targetX = targetX;
		this._targetY = targetY;
	}

	public override start(): void
	{
		super.start();
		this._startX = this._target!.x;
		this._startY = this._target!.y;
		this._deltaX = this._targetX - this._startX;
		this._deltaY = this._targetY - this._startY;
	}

	public override update(progress: number): void
	{
		this._target!.x = this._startX + (this._deltaX * progress);
		this._target!.y = this._startY + (this._deltaY * progress);
	}
}
