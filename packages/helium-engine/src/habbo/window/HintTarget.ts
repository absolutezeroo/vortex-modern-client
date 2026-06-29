import type {IWindow} from '@core/window/IWindow';

/**
 * Data container for a hint target.
 *
 * @see sources/win63_version/habbo/window/HintTarget.as
 */
export class HintTarget
{
	constructor(window: IWindow, key: string, style: number)
	{
		this._window = window;
		this._key = key;
		this._style = style;
	}

	private _key: string;

	public get key(): string
	{
		return this._key;
	}

	public set key(value: string)
	{
		this._key = value;
	}

	private _window: IWindow;

	public get window(): IWindow
	{
		return this._window;
	}

	public set window(value: IWindow)
	{
		this._window = value;
	}

	private _style: number;

	public get style(): number
	{
		return this._style;
	}

	public set style(value: number)
	{
		this._style = value;
	}
}
