import type {IWidget} from './IWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Pixel limit display widget.
 *
 * Displays a challenge meter image based on a percentage limit value.
 * The limit value (0-100) is rounded to the nearest 20% step and
 * used to select the corresponding meter asset.
 *
 * In the AS3 version, reuses the badge_image layout and extends
 * IStaticBitmapWrapperWindow properties.
 *
 * @see sources/win63_version/habbo/window/widgets/PixelLimitWidget.as
 */
export class PixelLimitWidget implements IWidget
{
	public static readonly TYPE: string = 'pixel_limit';

	private static readonly LIMIT_KEY: string = 'pixel_limit:limit';
	private _batchUpdate: boolean = false;
	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _root: IWindowContainer | null = null;
	private _bitmap: IStaticBitmapWrapperWindow | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;

		const root = this._windowManager.buildWidgetLayout('badge_image') as IWindowContainer | null;

		if (root)
		{
			this._root = root;

			const bitmap = root.findChildByName('bitmap') as IStaticBitmapWrapperWindow | null;

			if (bitmap)
			{
				this._bitmap = bitmap;
			}

			this._widgetWindow.rootWindow = this._root as unknown as IWindow;
			this._root.width = this._widgetWindow.width;
			this._root.height = this._widgetWindow.height;
		}
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _limit: number = 0;

	public get limit(): number
	{
		return this._limit;
	}

	public set limit(value: number)
	{
		this._limit = Math.max(0, Math.min(100, value));
	}

	/**
	 * Compute the asset URI for the current limit value.
	 */
	public get assetUri(): string
	{
		let step = Math.floor(this._limit / 20) * 20;
		step = Math.max(step, 20);

		return '${image.library.url}reception/challenge_meter_' + step.toString() + '.png';
	}

	public get properties(): PropertyStruct[]
	{
		if (this._disposed) return [];

		return [
			new PropertyStruct(PixelLimitWidget.LIMIT_KEY, this._limit),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		this._batchUpdate = true;

		for (const prop of values)
		{
			if (prop.key === PixelLimitWidget.LIMIT_KEY)
			{
				this.limit = Number(prop.value);
			}
		}

		this._batchUpdate = false;
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		if (this._root)
		{
			this._root.dispose();
			this._root = null;
		}

		this._bitmap = null;

		if (this._widgetWindow)
		{
			this._widgetWindow.rootWindow = null;
		}

		this._widgetWindow = null;
		this._windowManager = null;
	}
}
