import type {IMargins} from './IMargins';

/**
 * Text margin implementation with change callback support.
 *
 * When any margin value is modified via setters, the registered
 * callback is invoked with this instance.
 *
 * @see sources/win63_version/com/sulake/core/window/utils/TextMargins.as
 */
export class TextMargins implements IMargins
{
	private _callback: ((margins: IMargins) => void) | null;

	constructor(left: number = 0, top: number = 0, right: number = 0, bottom: number = 0, callback: ((margins: IMargins) => void) | null = null)
	{
		this._left = left;
		this._top = top;
		this._right = right;
		this._bottom = bottom;
		this._callback = callback ?? TextMargins.nullCallback;
	}

	private _left: number;

	public get left(): number
	{
		return this._left;
	}

	public set left(value: number)
	{
		this._left = value;

		if (this._callback)
		{
			this._callback(this);
		}
	}

	private _top: number;

	public get top(): number
	{
		return this._top;
	}

	public set top(value: number)
	{
		this._top = value;

		if (this._callback)
		{
			this._callback(this);
		}
	}

	private _right: number;

	public get right(): number
	{
		return this._right;
	}

	public set right(value: number)
	{
		this._right = value;

		if (this._callback)
		{
			this._callback(this);
		}
	}

	private _bottom: number;

	public get bottom(): number
	{
		return this._bottom;
	}

	public set bottom(value: number)
	{
		this._bottom = value;

		if (this._callback)
		{
			this._callback(this);
		}
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Returns true if all margins are zero.
	 */
	public get isZeroes(): boolean
	{
		return this._left === 0 && this._right === 0 && this._top === 0 && this._bottom === 0;
	}

	private static nullCallback(_margins: IMargins): void
	{
		// No-op
	}

	/**
	 * Reassigns all margins and the callback.
	 */
	public assign(left: number, top: number, right: number, bottom: number, callback: ((margins: IMargins) => void) | null = null): void
	{
		this._left = left;
		this._top = top;
		this._right = right;
		this._bottom = bottom;
		this._callback = callback ?? TextMargins.nullCallback;
	}

	public clone(callback: ((margins: IMargins) => void) | null = null): TextMargins
	{
		return new TextMargins(this._left, this._top, this._right, this._bottom, callback);
	}

	public dispose(): void
	{
		this._callback = null;
		this._disposed = true;
	}
}
