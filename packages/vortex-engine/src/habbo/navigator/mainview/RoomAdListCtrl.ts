import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { ITextWindow } from '@core/window/components/ITextWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { GuestRoomData } from '../../communication/messages/incoming/navigator/GuestRoomData';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import { GuestRoomListCtrl } from './GuestRoomListCtrl';
import { Util } from '../Util';
import { RoomAdEventTabAdClickedComposer } from '../../communication/messages/outgoing/navigator/RoomAdEventTabAdClickedComposer';

/**
 * Displays event room ads in a scrollable list.
 *
 * @see sources/win63_version/habbo/navigator/mainview/RoomAdListCtrl.as
 */
export class RoomAdListCtrl extends GuestRoomListCtrl
{
    constructor(navigator: IHabboTransitionalNavigator, adIndex: number, showRoomNumbers: boolean)
    {
        super(navigator, adIndex, showRoomNumbers);
    }

    protected override getListEntry(index: number): IWindowContainer
    {
        const entry = this._navigator.getXmlWindow('grs_room_ads_details_phase_one') as IWindowContainer;

        entry.background = true;
        entry.addEventListener('WME_MOVE', (e: WindowEvent) => this.onMouseMove(e));
        entry.addEventListener('WME_OVER', (e: WindowEvent) => this.onMouseOver(e));
        entry.addEventListener('WME_OUT', (e: WindowEvent) => this.onMouseOut(e));
        entry.addEventListener('WME_CLICK', (e: WindowEvent) => this.onMouseClick(e));
        entry.setParamFlag(1, true);
        entry.setParamFlag(128, true);
        entry.color = this.getBgColor(index);
        entry.tags.push(String(index));

        return entry;
    }

    protected override refreshEntryDetails(entry: IWindowContainer, room: GuestRoomData): void
    {
        entry.visible = true;

        const adName = entry.findChildByName('adname') as ITextWindow | null;

        if(adName)
        {
            adName.visible = true;
            Util.cutTextToWidth(adName, room.roomAdName, entry.width);
        }

        this._navigator.refreshButton(entry, 'doormode_doorbell_small', room.doorMode === 1, null!, 0);
        this._navigator.refreshButton(entry, 'doormode_password_small', room.doorMode === 2, null!, 0);
        this._navigator.refreshButton(entry, 'doormode_invisible_small', room.doorMode === 3, null!, 0);
        this._userCountRenderer.refreshUserCount(room.maxUserCount, entry, room.userCount, '${navigator.usercounttooltip.users}', 308, 2);
    }

    protected override onMouseClick(event: WindowEvent): void
    {
        const target = event.target as IWindowContainer;
        const index = parseInt(target.tags[0]);
        const room = this.getRoomAt(index);

        if(room !== null && this._navigator)
        {
            this._navigator.send(new RoomAdEventTabAdClickedComposer(room.flatId, room.roomAdName, room.roomAdExpiresInMin));
        }

        super.onMouseClick(event);
    }
}
