import type {IWindow} from '../IWindow';
import type {IRectLimiter} from './IRectLimiter';

/**
 * Rectangle size limits for a window.
 *
 * Enforces min/max constraints on the owner window's dimensions.
 * Setting a limit that violates the current size will resize the window.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/WindowRectLimits.as
 */
export class WindowRectLimits implements IRectLimiter
{
	private _owner: IWindow;

	constructor(owner: IWindow)
	{
		this._owner = owner;
	}

	private _minWidth: number = -2147483648;

	public get minWidth(): number
	{
		return this._minWidth;
	}

	public set minWidth(value: number)
	{
		this._minWidth = value;

		if (this._minWidth > -2147483648 && !this._owner.disposed && this._owner.width < this._minWidth)
		{
			this._owner.width = this._minWidth;
		}
	}

	private _maxWidth: number = 2147483647;

	public get maxWidth(): number
	{
		return this._maxWidth;
	}

	public set maxWidth(value: number)
	{
		this._maxWidth = value;

		if (this._maxWidth < 2147483647 && !this._owner.disposed && this._owner.width > this._maxWidth)
		{
			this._owner.width = this._maxWidth;
		}
	}

	private _minHeight: number = -2147483648;

	public get minHeight(): number
	{
		return this._minHeight;
	}

	public set minHeight(value: number)
	{
		this._minHeight = value;

		if (this._minHeight > -2147483648 && !this._owner.disposed && this._owner.height < this._minHeight)
		{
			this._owner.height = this._minHeight;
		}
	}

	private _maxHeight: number = 2147483647;

	public get maxHeight(): number
	{
		return this._maxHeight;
	}

	public set maxHeight(value: number)
	{
		this._maxHeight = value;

		if (this._maxHeight < 2147483647 && !this._owner.disposed && this._owner.height > this._maxHeight)
		{
			this._owner.height = this._maxHeight;
		}
	}

	public get isEmpty(): boolean
	{
		return (
			this._minWidth === -2147483648 &&
			this._maxWidth === 2147483647 &&
			this._minHeight === -2147483648 &&
			this._maxHeight === 2147483647
		);
	}

	public setEmpty(): void
	{
		this._minWidth = -2147483648;
		this._maxWidth = 2147483647;
		this._minHeight = -2147483648;
		this._maxHeight = 2147483647;
	}

	public limit(): void
	{
		if (!this.isEmpty && this._owner)
		{
			if (this._owner.width < this._minWidth)
			{
				this._owner.width = this._minWidth;
			}
			else if (this._owner.width > this._maxWidth)
			{
				this._owner.width = this._maxWidth;
			}

			if (this._owner.height < this._minHeight)
			{
				this._owner.height = this._minHeight;
			}
			else if (this._owner.height > this._maxHeight)
			{
				this._owner.height = this._maxHeight;
			}
		}
	}

	public assign(minWidth: number, maxWidth: number, minHeight: number, maxHeight: number): void
	{
		this._minWidth = minWidth;
		this._maxWidth = maxWidth;
		this._minHeight = minHeight;
		this._maxHeight = maxHeight;
		this.limit();
	}

	public clone(owner?: unknown): WindowRectLimits
	{
		const result = new WindowRectLimits(owner as IWindow);
		result._minWidth = this._minWidth;
		result._maxWidth = this._maxWidth;
		result._minHeight = this._minHeight;
		result._maxHeight = this._maxHeight;

		return result;
	}
}
