import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import type {HabboNewNavigator} from '../../../HabboNewNavigator';
import {isEventViewMode, ViewMode, ViewModeType} from '../../ViewMode';
import {RoomEntryUtils} from '../../RoomEntryUtils';

/**
 * Factory for creating room entry elements (rows and tiles) in navigator results.
 *
 * Clones templates for row/tile display and wires up event listeners
 * for go-to-room, info popup, and favorite toggle.
 *
 * @see sources/win63_version/habbo/navigator/view/search/results/RoomEntryElementFactory.as
 */
// AS3: sources/win63_version/habbo/navigator/view/search/results/RoomEntryElementFactory.as::RoomEntryElementFactory
export class RoomEntryElementFactory
{
	static readonly TILES_PER_CONTAINER: number = 3;
	private static readonly ROOM_USERCOUNT_FLASH_LABEL_OFFSET_Y: number = 1;

	private _navigator: HabboNewNavigator;

	constructor(navigator: HabboNewNavigator)
	{
		this._navigator = navigator;
	}

	private _rowEntryTemplate: IWindowContainer | null = null;

	set rowEntryTemplate(value: IWindowContainer)
	{
		this._rowEntryTemplate = value;
	}

	private _tileEntryTemplate: IWindowContainer | null = null;

	set tileEntryTemplate(value: IWindowContainer)
	{
		this._tileEntryTemplate = value;
	}

	private _tileContainerTemplate: IItemListWindow | null = null;

	set tileContainerTemplate(value: IItemListWindow)
	{
		this._tileContainerTemplate = value;
	}

	private _viewMode: ViewModeType = ViewMode.HOTEL_VIEW;

	set viewMode(value: ViewModeType)
	{
		this._viewMode = value;
	}

	get rowEntryTemplateHeight(): number
	{
		if (!this._rowEntryTemplate) return 0;

		return this._rowEntryTemplate.height;
	}

	/**
	 * Get a color representing the room's occupancy level.
	 *
	 * @param userCount - Current number of users
	 * @param maxUserCount - Maximum capacity
	 * @returns A color value (ARGB)
	 *
	 * @see sources/win63_version/habbo/window/utils/class_3822.as getUserCountColor()
	 */
	private static getUserCountColor(userCount: number, maxUserCount: number): number
	{
		let percentage = 0;

		if(maxUserCount > 0)
		{
			percentage = (100 * (userCount / maxUserCount)) | 0;
		}

		if(percentage >= 92) return 0xFFC2332C;
		if(percentage >= 50) return 0xFFFFB11B;
		if(userCount > 0) return 0xFF63B162;

		return 0xFFCBCAC1;
	}

	/**
	 * Create a new row-style room entry element.
	 *
	 * @param roomData - The guest room data
	 * @param color - The alternating color modulation value
	 * @param width - Optional fixed width override (-1 = use template default)
	 * @returns A cloned and populated row container
	 *
	 * @see sources/win63_version/habbo/navigator/view/search/results/RoomEntryElementFactory.as getNewRowElement()
	 */
	getNewRowElement(roomData: GuestRoomData, color: number, width: number = -1): IWindowContainer
	{
		const entry = this._rowEntryTemplate!.clone() as IWindowContainer;

		if (width !== -1)
		{
			entry.width = width;
		}

		entry.color = RoomEntryUtils.getModulatedBackgroundColor(color, entry.color);

		this.updateCommonEntryElements(entry, roomData, false);

		const groupIcon = entry.findChildByName('grouphome_icon');

		if (groupIcon)
		{
			groupIcon.visible = roomData.groupBadgeCode !== '';
		}

		return entry;
	}

	/**
	 * Create a new tile-style room entry element.
	 *
	 * @param roomData - The guest room data
	 * @param color - The alternating color modulation value
	 * @returns A cloned and populated tile container
	 *
	 * @see sources/win63_version/habbo/navigator/view/search/results/RoomEntryElementFactory.as getNewTileElement()
	 */
	getNewTileElement(roomData: GuestRoomData, color: number): IWindowContainer
	{
		const entry = this._tileEntryTemplate!.clone() as IWindowContainer;

		this.updateCommonEntryElements(entry, roomData, true);

		if (roomData.groupBadgeCode !== '')
		{
			const groupBadge = entry.findChildByName('room_group_badge');

			if (groupBadge)
			{
				groupBadge.visible = true;
				// Badge widget population would happen here if available
			}
		}

		// Set room thumbnail (AS3: IStaticBitmapWrapperWindow.assetUri with URL)
		const picPlaceholder = entry.findChildByName('room_pic_placeholder') as unknown as IStaticBitmapWrapperWindow | null;

		if(picPlaceholder)
		{
			if(roomData.officialRoomPicRef != null)
			{
				if(this._navigator.getBoolean('new.navigator.official.room.thumbnails.in.amazon'))
				{
					picPlaceholder.assetUri = this._navigator.getProperty('navigator.thumbnail.url_base') + roomData.officialRoomPicRef;
				}
				else
				{
					picPlaceholder.assetUri = this._navigator.getProperty('image.library.url') + roomData.officialRoomPicRef;
				}
			}
			else
			{
				picPlaceholder.assetUri = this._navigator.getProperty('navigator.thumbnail.url_base') + roomData.flatId + '.png';
			}
		}

		return entry;
	}

	/**
	 * Create a new tile container (holds up to TILES_PER_CONTAINER tiles).
	 *
	 * @returns A cloned tile container item list
	 *
	 * @see sources/win63_version/habbo/navigator/view/search/results/RoomEntryElementFactory.as getNewTileContainerElement()
	 */
	getNewTileContainerElement(): IItemListWindow
	{
		return this._tileContainerTemplate!.clone() as IItemListWindow;
	}

	/**
	 * Update the common elements shared between row and tile entries.
	 *
	 * Sets room name, user count, door mode icon, and wires event listeners
	 * for go-to-room and info popup clicks.
	 *
	 * @param container - The entry container to update
	 * @param roomData - The guest room data
	 * @param isTile - Whether this is a tile element (affects mouse over behavior)
	 */
	// AS3: sources/win63_version/habbo/navigator/view/search/results/RoomEntryElementFactory.as::updateCommonEntryElements()
	private updateCommonEntryElements(container: IWindowContainer, roomData: GuestRoomData, isTile: boolean): void
	{
		const userCountEl = container.findChildByName('room_usercount');

		if (userCountEl)
		{
			userCountEl.caption = roomData.userCount.toString();
			userCountEl.y = RoomEntryElementFactory.ROOM_USERCOUNT_FLASH_LABEL_OFFSET_Y;
		}

		const userCountList = container.findChildByName('usercount') as IItemListWindow | null;

		if(userCountList)
		{
			userCountList.arrangeListItems();
		}

		const roomNameEl = container.findChildByName('room_name');

		if (roomNameEl)
		{
			roomNameEl.caption = isEventViewMode(this._viewMode) ? roomData.roomAdName : roomData.roomName;
		}

		const goToRoomRegion = container.findChildByName('go_to_room_region');

		if(goToRoomRegion)
		{
			goToRoomRegion.id = roomData.flatId;
			goToRoomRegion.addEventListener('WME_CLICK', this.onGoButtonClicked);
			goToRoomRegion.addEventListener('WME_OVER', isTile ? this.onTileGoToRoomMouseOver : this.onGoToRoomMouseOver);
		}

		const infoPopupRegion = container.findChildByName('info_popup_click_region');

		if(infoPopupRegion)
		{
			infoPopupRegion.id = roomData.flatId;
			infoPopupRegion.addEventListener('WME_CLICK', this.onMouseClicked);
			infoPopupRegion.addEventListener('WME_OVER', this.onRoomInfoMouseOver);
		}

		// Set user count color indicator
		const usercountBorder = container.findChildByName('room_info_usercount_border');

		if (usercountBorder)
		{
			usercountBorder.color = RoomEntryElementFactory.getUserCountColor(roomData.userCount, roomData.maxUserCount);
		}

		// Set door mode icon (AS3: IStaticBitmapWrapperWindow.assetUri)
		const doorModeIcon = container.findChildByName('doormode_icon') as unknown as IStaticBitmapWrapperWindow | null;

		if(doorModeIcon)
		{
			doorModeIcon.assetUri = RoomEntryUtils.getDoorModeIconAsset(roomData.doorMode);
		}
	}

	private onGoButtonClicked = (event: WindowEvent): void =>
	{
		if (event.window)
		{
			this._navigator.goToRoom(event.window.id);
		}
	};

	private onMouseClicked = (event: WindowEvent): void =>
	{
		if(event.window)
		{
			const rect = { x: 0, y: 0, width: 0, height: 0 };
			event.window.getGlobalRectangle(rect);

			const roomData = this._navigator.currentResults?.findGuestRoom(event.window.id);

			if(roomData)
			{
				this._navigator.view?.showRoomInfoBubbleAt(roomData, rect.x + rect.width, (rect.height) / 2 + rect.y);
			}
		}
	};

	private onRoomInfoMouseOver = (event: WindowEvent): void =>
	{
		if(this._navigator.view?.isRoomInfoBubbleVisible && event.window)
		{
			const rect = { x: 0, y: 0, width: 0, height: 0 };
			event.window.getGlobalRectangle(rect);

			const roomData = this._navigator.currentResults?.findGuestRoom(event.window.id);

			if(roomData)
			{
				this._navigator.view?.showRoomInfoBubbleAt(roomData, rect.x + rect.width, (rect.height) / 2 + rect.y, true);
			}
		}
	};

	private onTileGoToRoomMouseOver = (event: WindowEvent): void =>
	{
		if(this._navigator.view?.isRoomInfoBubbleVisible && event.window)
		{
			const rect = { x: 0, y: 0, width: 0, height: 0 };
			event.window.getGlobalRectangle(rect);

			const roomData = this._navigator.currentResults?.findGuestRoom(event.window.id);

			if(roomData)
			{
				this._navigator.view?.showRoomInfoBubbleAt(roomData, rect.x + rect.width - 6, (rect.height) / 2 + rect.y + 56, true);
			}
		}
	};

	private onGoToRoomMouseOver = (event: WindowEvent): void =>
	{
		if(this._navigator.view?.isRoomInfoBubbleVisible && event.window)
		{
			const rect = { x: 0, y: 0, width: 0, height: 0 };
			event.window.getGlobalRectangle(rect);

			const roomData = this._navigator.currentResults?.findGuestRoom(event.window.id);

			if(roomData)
			{
				this._navigator.view?.showRoomInfoBubbleAt(roomData, rect.x + rect.width + 20, (rect.height) / 2 + rect.y, true);
			}
		}
	};
}
