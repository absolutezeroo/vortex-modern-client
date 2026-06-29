import {Interval} from './Interval';

/**
 * Ease wrapper that delegates to an inner Interval motion.
 *
 * Subclasses (EaseOut, EaseRate) override update() to apply easing
 * functions to the inner motion's progress value.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/motion/Ease.as
 */
export class Ease extends Interval
{
	protected _inner: Interval;

	constructor(inner: Interval)
	{
		super(inner.target, inner.duration);
		this._inner = inner;
	}

	public override start(): void
	{
		super.start();
		this._inner.start();
	}

	public override update(progress: number): void
	{
		super.update(progress);
		this._inner.update(progress);
	}

	public override stop(): void
	{
		super.stop();
		this._inner.stop();
	}
}
