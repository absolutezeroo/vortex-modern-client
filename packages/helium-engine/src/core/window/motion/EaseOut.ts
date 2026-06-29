import {EaseRate} from './EaseRate';
import type {Interval} from './Interval';

/**
 * Ease-out motion using a power curve.
 *
 * Applies `Math.pow(progress, 1/rate)` to produce deceleration easing,
 * where the animation starts fast and slows down toward the end.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/motion/EaseOut.as
 */
export class EaseOut extends EaseRate
{
	constructor(inner: Interval, rate: number)
	{
		super(inner, rate);
	}

	public override update(progress: number): void
	{
		this._inner.update(Math.pow(progress, 1 / this._rate));
	}
}
