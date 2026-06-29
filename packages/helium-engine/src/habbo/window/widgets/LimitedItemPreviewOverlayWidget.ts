import type {ILimitedItemPreviewOverlayWidget} from './ILimitedItemPreviewOverlayWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Limited item preview overlay widget.
 *
 * Displays serial number and series size for limited edition items
 * in the catalog/marketplace preview view.
 *
 * Children are accessed on-demand in setters via findChildByName:
 * - "unique_item_serial_number_bitmap"
 * - "unique_item_edition_size_bitmap"
 *
 * @see sources/win63_version/habbo/window/widgets/LimitedItemPreviewOverlayWidget.as
 */
export class LimitedItemPreviewOverlayWidget implements ILimitedItemPreviewOverlayWidget
{
	public static readonly TYPE: string = 'limited_item_overlay_preview';

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _root: IWindowContainer | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;

		const root = this._windowManager.buildWidgetLayout('unique_item_overlay_preview') as IWindowContainer | null;

		if (root)
		{
			this._root = root;

			this._widgetWindow.rootWindow = this._root as unknown as IWindow;
		}
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _serialNumber: number = 0;

	public get serialNumber(): number
	{
		return this._serialNumber;
	}

	public set serialNumber(value: number)
	{
		this._serialNumber = value;

		if (this._root)
		{
			const serialBitmap = this._root.findChildByName('unique_item_serial_number_bitmap');

			if (serialBitmap)
			{
				serialBitmap.caption = String(value);
			}
		}
	}

	private _seriesSize: number = 0;

	public get seriesSize(): number
	{
		return this._seriesSize;
	}

	public set seriesSize(value: number)
	{
		this._seriesSize = value;

		if (this._root)
		{
			const editionBitmap = this._root.findChildByName('unique_item_edition_size_bitmap');

			if (editionBitmap)
			{
				editionBitmap.caption = String(value);
			}
		}
	}

	public get properties(): PropertyStruct[]
	{
		return [];
	}

	public set properties(_values: PropertyStruct[])
	{
		// AS3: properties setter is a no-op for this widget
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

		if (this._widgetWindow)
		{
			this._widgetWindow.rootWindow = null;
		}

		this._widgetWindow = null;
		this._windowManager = null;
	}
}
