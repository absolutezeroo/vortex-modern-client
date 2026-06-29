import type { IItemListWindow } from '@core/window/components/IItemListWindow';
import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import { UserListCtrl } from './UserListCtrl';

/**
 * Displays the list of banned users in room settings tab 5 (Moderation).
 * Extends UserListCtrl with a different layout and selection highlighting.
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/BanListCtrl.as
 */
export class BanListCtrl extends UserListCtrl
{
	private _selectedRow: number = -1;

	constructor(navigator: IHabboTransitionalNavigator)
	{
		super(navigator, false);
	}

	get selectedRow(): number
	{
		return this._selectedRow;
	}

	protected override getRowView(): IWindowContainer
	{
		return this._navigator.getXmlWindow('ros_banned_user') as IWindowContainer;
	}

	protected override onBgMouseClick(event: WindowEvent): void
	{
		const target = event.target as IWindowContainer;

		this._selectedRow = target.parent?.id ?? -1;

		const list = target.findParentByName('moderation_banned_users') as IItemListWindow | null;

		if(list !== null)
		{
			this._refreshColorsAfterClick(list);
		}
	}

	protected override getBgColor(index: number, highlighted: boolean): number
	{
		if(index === this._selectedRow)
		{
			return 0xFF9988D9;
		}

		return super.getBgColor(index, highlighted);
	}

	private _refreshColorsAfterClick(list: IItemListWindow): void
	{
		for(let i = 0; i < this._userCount; i++)
		{
			const row = list.getListItemAt(i) as IWindowContainer | null;

			if(row !== null)
			{
				row.color = this.getBgColor(i, false);
			}
		}
	}
}
