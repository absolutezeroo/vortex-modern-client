import type { GuestRoomData } from '../../communication/messages/incoming/navigator/GuestRoomData';
import type { PromotedRoomCategoryData } from '../../communication/messages/incoming/navigator/PromotedRoomCategoryData';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import { RoomSessionTags } from '../domain/RoomSessionTags';
import { GuestRoomListCtrl } from './GuestRoomListCtrl';

/**
 * Displays the room list for an expanded promoted room category.
 *
 * @see sources/win63_version/habbo/navigator/mainview/PromotedRoomsGuestRoomListCtrl.as
 */
export class PromotedRoomsGuestRoomListCtrl extends GuestRoomListCtrl
{
    private _category: PromotedRoomCategoryData | null = null;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        super(navigator, -6, false);
    }

    set category(value: PromotedRoomCategoryData)
    {
        this._category = value;
    }

    override getRooms(): GuestRoomData[]
    {
        return this._category?.rooms ?? [];
    }

    override beforeEnterRoom(index: number): void
    {
        if(this._category === null) return;

        this.navigator.data.roomSessionTags = new RoomSessionTags(this._category.code, '' + (index + 2));
    }
}
