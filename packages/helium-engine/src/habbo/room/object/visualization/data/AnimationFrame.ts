/**
 * AnimationFrame
 *
 * @see com.sulake.habbo.room.object.visualization.data.AnimationFrame
 *
 * Runtime animation frame with object pooling. Tracks id, position, repeats, and sequence state.
 */
export class AnimationFrame
{
	public static readonly FRAME_REPEAT_FOREVER: number = -1;
	public static readonly SEQUENCE_NOT_DEFINED: number = -1;

	private static readonly POOL_SIZE_LIMIT: number = 3000;
	private static _pool: AnimationFrame[] = [];
	private _recycled: boolean = false;

	private _id: number = 0;

	get id(): number
	{
		if (this._id >= 0)
		{
			return this._id;
		}

		return Math.floor(-this._id * Math.random());
	}

	private _x: number = 0;

	get x(): number
	{
		return this._x;
	}

	private _y: number = 0;

	get y(): number
	{
		return this._y;
	}

	private _repeats: number = 1;

	get repeats(): number
	{
		return this._repeats;
	}

	private _frameRepeats: number = 1;

	get frameRepeats(): number
	{
		return this._frameRepeats;
	}

	private _remainingFrameRepeats: number = 1;

	get remainingFrameRepeats(): number
	{
		if (this._frameRepeats < 0)
		{
			return -1;
		}

		return this._remainingFrameRepeats;
	}

	set remainingFrameRepeats(value: number)
	{
		if (value < 0) value = 0;

		if (this._frameRepeats > 0 && value > this._frameRepeats)
		{
			value = this._frameRepeats;
		}

		this._remainingFrameRepeats = value;
	}

	private _activeSequence: number = -1;

	get activeSequence(): number
	{
		return this._activeSequence;
	}

	private _activeSequenceOffset: number = 0;

	get activeSequenceOffset(): number
	{
		return this._activeSequenceOffset;
	}

	private _isLastFrame: boolean = false;

	get isLastFrame(): boolean
	{
		return this._isLastFrame;
	}

	static allocate(
		id: number,
		x: number,
		y: number,
		repeats: number,
		frameRepeats: number,
		isLastFrame: boolean,
		activeSequence: number = -1,
		activeSequenceOffset: number = 0
	): AnimationFrame
	{
		const frame = AnimationFrame._pool.length > 0
			? AnimationFrame._pool.pop()!
			: new AnimationFrame();

		frame._recycled = false;
		frame._id = id;
		frame._x = x;
		frame._y = y;
		frame._isLastFrame = isLastFrame;

		if (repeats < 1) repeats = 1;
		frame._repeats = repeats;

		if (frameRepeats < 0) frameRepeats = -1;
		frame._frameRepeats = frameRepeats;
		frame._remainingFrameRepeats = frameRepeats;

		if (activeSequence >= 0)
		{
			frame._activeSequence = activeSequence;
			frame._activeSequenceOffset = activeSequenceOffset;
		}

		return frame;
	}

	recycle(): void
	{
		if (!this._recycled)
		{
			this._recycled = true;

			if (AnimationFrame._pool.length < AnimationFrame.POOL_SIZE_LIMIT)
			{
				AnimationFrame._pool.push(this);
			}
		}
	}
}
