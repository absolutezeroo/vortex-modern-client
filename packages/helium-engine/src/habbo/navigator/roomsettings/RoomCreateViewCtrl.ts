import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import {TextFieldManager} from '../TextFieldManager';

/**
 * Room layout definition.
 */
interface RoomLayout
{
	name: string;
	tileSize: number;
}

/**
 * Room creation view controller.
 *
 * Handles room creation UI: layout selection, name/description input,
 * category/visitors/trade dropdowns, and creation limits.
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/RoomCreateViewCtrl.as
 */
export class RoomCreateViewCtrl
{
	private static readonly ROOM_LIMIT_HC: number = 75;
	private static readonly ROOM_LIMIT_NON_SUBSCRIBER: number = 50;

	private _navigator: IHabboTransitionalNavigator | null;
	private _content: IWindowContainer | null = null;
	private _layouts: RoomLayout[] = [];
	private _selectedLayout: RoomLayout | null = null;
	private _roomNameManager: TextFieldManager | null = null;
	private _roomDescManager: TextFieldManager | null = null;

	constructor(navigator: IHabboTransitionalNavigator)
	{
		this._navigator = navigator;
		this.initLayouts();
	}

	show(): void
	{
		if (!this._navigator) return;

		if (!this._content)
		{
			const window = this._navigator.getXmlWindow('roc_create_room');

			if (!window) return;

			this._content = (window as any).content as IWindowContainer;
		}

		if (this._content)
		{
			(this._content as IWindow).visible = true;
		}

		this.refresh();
	}

	hide(): void
	{
		if (this._content)
		{
			(this._content as IWindow).visible = false;
		}
	}

	refresh(): void
	{
		this.refreshRoomThumbnails();
	}

	dispose(): void
	{
		this._roomNameManager?.dispose();
		this._roomDescManager?.dispose();

		if (this._content)
		{
			(this._content as IWindow).dispose();
			this._content = null;
		}

		this._navigator = null;
	}

	private refreshRoomThumbnails(): void
	{
		// Populate layout thumbnails from _layouts
	}

	private isMandatoryFieldsFilled(): boolean
	{
		if (!this._roomNameManager) return false;

		return this._roomNameManager.checkMandatory(
			this._navigator?.getText('navigator.createroom.nameerr') ?? 'Name required'
		);
	}

	private onCreateButtonClick = (_event: WindowEvent): void =>
	{
		if (!this._navigator || !this._selectedLayout) return;

		if (!this.isMandatoryFieldsFilled()) return;

		const name = this._roomNameManager?.getText() ?? '';
		const desc = this._roomDescManager?.getText() ?? '';

		this._navigator.goToMainView();
	};

	private onCancelButtonClick = (_event: WindowEvent): void =>
	{
		this.hide();
	};

	private initLayouts(): void
	{
		const layoutNames = ['a', 'b', 'c', 'd', 'e', 'f', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

		for (const name of layoutNames)
		{
			this._layouts.push({name: 'model_' + name, tileSize: 0});
		}
	}
}
