import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {GuestRoomData} from '../communication/messages/incoming/navigator';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';

/**
 * Displays guild badge and name in room details.
 *
 * Creates a "guild_info" container from XML if absent, and populates it
 * with group badge and name. Clicking opens group details.
 *
 * @see sources/win63_version/habbo/navigator/GuildInfoCtrl.as
 */
export class GuildInfoCtrl implements IDisposable
{
	private static readonly GUILD_INFO_NAME: string = 'guild_info';

	private _navigator: IHabboTransitionalNavigator | null;
	private _groupId: number = 0;

	constructor(navigator: IHabboTransitionalNavigator)
	{
		this._navigator = navigator;
	}

	get disposed(): boolean
	{
		return this._navigator === null;
	}

	/**
	 * Refreshes guild info in the container.
	 *
	 * @param container - Parent container
	 * @param roomData - Room data with group information
	 * @param _compact - Whether to use compact display
	 */
	refresh(container: IWindowContainer, roomData: GuestRoomData, _compact: boolean = false): void
	{
		if (!this._navigator) return;

		let guildInfo = container.findChildByName(GuildInfoCtrl.GUILD_INFO_NAME) as IWindowContainer | null;

		if (!guildInfo)
		{
			const xmlWindow = this._navigator.getXmlWindow(GuildInfoCtrl.GUILD_INFO_NAME);

			if (!xmlWindow) return;

			guildInfo = xmlWindow as unknown as IWindowContainer;
			guildInfo.name = GuildInfoCtrl.GUILD_INFO_NAME;
			container.addChild(guildInfo);
			guildInfo.addEventListener('WME_CLICK', this.onGuildInfo);
		}

		if (!roomData || roomData.habboGroupId < 1)
		{
			guildInfo.visible = false;

			return;
		}

		guildInfo.visible = true;
		this._navigator.registerParameter('navigator.guildbase', 'groupName', roomData.groupName || '');

		const guildText = guildInfo.findChildByName('guild_base_txt');

		if (guildText)
		{
			guildText.caption = this._navigator.getText('navigator.guildbase');
		}

		this._groupId = roomData.habboGroupId;
	}

	dispose(): void
	{
		this._navigator = null;
	}

	private onGuildInfo = (_event: WindowEvent): void =>
	{
		// Would send GetHabboGroupDetailsMessageComposer when available
		// this._navigator?.send(new GetHabboGroupDetailsMessageComposer(this._groupId, true));
	};
}
