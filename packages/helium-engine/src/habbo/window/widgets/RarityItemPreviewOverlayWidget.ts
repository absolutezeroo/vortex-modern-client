import type {IRarityItemPreviewOverlayWidget} from './IRarityItemPreviewOverlayWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Rarity item preview overlay widget.
 *
 * Displays the rarity level as text in preview/catalog views.
 *
 * @see sources/win63_version/habbo/window/widgets/RarityItemPreviewOverlayWidget.as
 */
export class RarityItemPreviewOverlayWidget implements IRarityItemPreviewOverlayWidget
{
	public static readonly TYPE: string = 'rarity_item_overlay_preview';

	private static readonly RARITY_LEVEL_KEY: string = 'rarity_item_overlay_preview:level';

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	private _root: IWindowContainer | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;

		const root = this._windowManager.buildWidgetLayout('rarity_item_overlay_preview') as IWindowContainer | null;

		if (root)
		{
			this._root = root;

			this._widgetWindow.rootWindow = root as unknown as IWindow;
		}
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _rarityLevel: number = 0;

	public get rarityLevel(): number
	{
		return this._rarityLevel;
	}

	public set rarityLevel(value: number)
	{
		this._rarityLevel = value;
	}

	public get properties(): PropertyStruct[]
	{
		if (this._disposed) return [];

		return [
			new PropertyStruct(RarityItemPreviewOverlayWidget.RARITY_LEVEL_KEY, this._rarityLevel),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		for (const prop of values)
		{
			if (prop.key === RarityItemPreviewOverlayWidget.RARITY_LEVEL_KEY)
			{
				this.rarityLevel = Number(prop.value);
			}
		}
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
