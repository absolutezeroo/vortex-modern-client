import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import {GetHabboGroupDetailsMessageComposer} from '../communication/messages/outgoing/users/GetHabboGroupDetailsMessageComposer';
import type {GuestRoomData} from '../communication/messages/incoming/navigator';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';

/**
 * GuildInfoCtrl
 *
 * The "base of <group>" strip in a room's details — badge, name, and a click that opens
 * the group's info panel. Used by both the in-room room-info view and the navigator's
 * room popup.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/GuildInfoCtrl.as
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
        if(!this._navigator) return;

        let guildInfo = container.findChildByName(GuildInfoCtrl.GUILD_INFO_NAME) as IWindowContainer | null;

        if(!guildInfo)
        {
            const xmlWindow = this._navigator.getXmlWindow(GuildInfoCtrl.GUILD_INFO_NAME);

            if(!xmlWindow) return;

            guildInfo = xmlWindow as unknown as IWindowContainer;
            guildInfo.name = GuildInfoCtrl.GUILD_INFO_NAME;
            container.addChild(guildInfo);
            guildInfo.addEventListener('WME_CLICK', this.onGuildInfo);
        }

        if(!roomData || roomData.habboGroupId < 1)
        {
            guildInfo.visible = false;

            return;
        }

        guildInfo.visible = true;
        this._navigator.registerParameter('navigator.guildbase', 'groupName', roomData.groupName || '');

        const guildText = guildInfo.findChildByName('guild_base_txt');

        if(guildText)
        {
            guildText.caption = this._navigator.getText('navigator.guildbase');
        }

        // AS3 looks the badge up on the *outer* container, not on the guild_info window it
        // just built - keep that, the two are different windows.
        const badgeWindow = container.findChildByName('guild_badge') as IWidgetWindow | null;
        const badgeWidget = (badgeWindow?.widget ?? null) as IBadgeImageWidget | null;

        if(badgeWidget)
        {
            badgeWidget.badgeId = roomData.groupBadgeCode;
            badgeWidget.groupId = roomData.habboGroupId;
        }

        this._groupId = roomData.habboGroupId;
    }

    dispose(): void
    {
        this._navigator = null;
    }

    // AS3: .../GuildInfoCtrl.as::onGuildInfo()
    private onGuildInfo = (_event: WindowEvent): void =>
    {
        this._navigator?.send(new GetHabboGroupDetailsMessageComposer(this._groupId, true));
    };
}
