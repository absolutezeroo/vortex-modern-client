import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboNewNavigator} from '../HabboNewNavigator';

/**
 * Lift view for promoted/lifted rooms in the navigator.
 *
 * Displays a rotating carousel of promoted rooms with pager dots,
 * auto-cycling every 8 seconds. Clicking a dot selects that page,
 * clicking the room image navigates to the room.
 *
 * @see sources/win63_version/habbo/navigator/view/LiftView.as
 */
export class LiftView implements IUpdateReceiver
{
	private static readonly AUTO_CYCLE_TIMEOUT_MS: number = 8000;

	private _navigator: HabboNewNavigator;
	private _borderWindow: IWindowContainer | null = null;
	private _pagerList: IItemListWindow | null = null;
	private _pagerIconTemplate: IWindow | null = null;
	private _selectedPage: number = -1;
	private _lastCycleTime: number;

	constructor(navigator: HabboNewNavigator)
	{
		this._lastCycleTime = Date.now();
		this._navigator = navigator;
		this._navigator.registerUpdateReceiver(this, 1000);
	}

	/**
	 * Whether this receiver has been disposed.
	 */
	get disposed(): boolean
	{
		return this._navigator === null;
	}

	/**
	 * Set the pager icon template (cloned for each page dot).
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as set pagerIconTemplate()
	 */
	set pagerIconTemplate(value: IWindow)
	{
		this._pagerIconTemplate = value;
	}

	/**
	 * Set the border window that contains the lift view elements.
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as set borderWindow()
	 */
	set borderWindow(value: IWindowContainer)
	{
		this._borderWindow = value;
		this._pagerList = this._borderWindow.findChildByName('pager_itemlist') as IItemListWindow | null;

		const clickRegion = this._borderWindow.findChildByName('room_image_click_region');

		if(clickRegion)
		{
			clickRegion.procedure = this.goToRoomRegionProcedure;
		}
	}

	/**
	 * Refresh the lift view with current data.
	 *
	 * @param resetPage - Whether to reset to the first page (default true)
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as refresh()
	 */
	refresh(resetPage: boolean = true): void
	{
		if(!this._pagerList || !this._pagerIconTemplate) return;

		this._pagerList.destroyListItems();
		this._selectedPage = resetPage ? 0 : this._selectedPage;

		const rooms = this._navigator.liftDataContainer.liftedRooms;

		for(let i = 0; i < rooms.length; i++)
		{
			this._pagerList.addListItem(this._pagerIconTemplate.clone());
		}

		this.setPagerToSelectedPage();
		this.drawSelectedPage();
	}

	/**
	 * Update callback for auto-cycling.
	 *
	 * @param _dt - Delta time (unused, we track wall clock time)
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as update()
	 */
	update(_dt: number): void
	{
		const now = Date.now();

		if(this._lastCycleTime + LiftView.AUTO_CYCLE_TIMEOUT_MS < now)
		{
			this.autoCycleToNextPage();
			this._lastCycleTime = now;
		}
	}

	/**
	 * Dispose the lift view.
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as dispose()
	 */
	dispose(): void
	{
		if(this._navigator)
		{
			this._navigator.removeUpdateReceiver(this);
		}

		this._navigator = null!;
	}

	/**
	 * Update pager dots to reflect the selected page.
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as setPagerToSelectedPage()
	 */
	private setPagerToSelectedPage(): void
	{
		if(!this._pagerList) return;

		for(let i = 0; i < this._pagerList.numListItems; i++)
		{
			const item = this._pagerList.getListItemAt(i) as IWindowContainer | null;

			if(item)
			{
				const icon = item.findChildByName('icon') as unknown as IStaticBitmapWrapperWindow | null;

				if(icon)
				{
					icon.assetUri = i === this._selectedPage ? 'progress_disk_flat_on' : 'progress_disk_flat_off';
				}

				item.id = i;
				item.procedure = this.pagerPageProcedure;
			}
		}
	}

	/**
	 * Draw the currently selected page (image + caption).
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as drawSelectedPage()
	 */
	private drawSelectedPage(): void
	{
		if(!this._borderWindow) return;

		this.setPagerToSelectedPage();

		const roomImage = this._borderWindow.findChildByName('room_image') as unknown as IStaticBitmapWrapperWindow | null;

		if(roomImage)
		{
			roomImage.assetUri = this._navigator.liftDataContainer.getUrlForLiftImageAtIndex(this._selectedPage);
		}

		const rooms = this._navigator.liftDataContainer.liftedRooms;

		if(this._selectedPage < rooms.length)
		{
			const captionText = this._borderWindow.findChildByName('caption_text');

			if(captionText)
			{
				captionText.caption = rooms[this._selectedPage].caption;
			}
		}
	}

	/**
	 * Advance to the next page, wrapping around.
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as autoCycleToNextPage()
	 */
	private autoCycleToNextPage(): void
	{
		this._selectedPage++;

		if(this._selectedPage > this._navigator.liftDataContainer.liftedRooms.length - 1)
		{
			this._selectedPage = 0;
		}

		this.refresh(false);
	}

	/**
	 * Click handler for pager dots.
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as pagerPageProcedure()
	 */
	private pagerPageProcedure = (event: WindowEvent, window: IWindow): void =>
	{
		if(event.type === 'WME_CLICK')
		{
			if(window.id !== this._selectedPage)
			{
				this._selectedPage = window.id;
				this.drawSelectedPage();
				this._lastCycleTime = Date.now();
				this._navigator.trackEventLog('browse.promotion', 'Promotion', '', this._selectedPage);
			}
		}
	};

	/**
	 * Click handler for the room image — navigates to the room.
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as goToRoomRegionProcedure()
	 */
	private goToRoomRegionProcedure = (event: WindowEvent, _window: IWindow): void =>
	{
		if(event.type === 'WME_CLICK')
		{
			const rooms = this._navigator.liftDataContainer.liftedRooms;

			if(rooms.length > this._selectedPage)
			{
				this._navigator.goToRoom(rooms[this._selectedPage].flatId, 'promotion');
			}
		}
	};
}
