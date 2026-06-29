import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { IWindow } from '@core/window/IWindow';
import type { IItemListWindow } from '@core/window/components/IItemListWindow';
import type { IScrollbarWindow } from '@core/window/components/IScrollbarWindow';
import type { ITextWindow } from '@core/window/components/ITextWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { GuestRoomData } from '../../communication/messages/incoming/navigator/GuestRoomData';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import type { IViewCtrl } from '../IViewCtrl';
import { UserCountRenderer } from '../UserCountRenderer';
import { RoomPopupCtrl } from '../RoomPopupCtrl';
import { Util } from '../Util';
import { AddFavouriteRoomMessageComposer } from '../../communication/messages/outgoing/navigator/AddFavouriteRoomMessageComposer';
import { DeleteFavouriteRoomMessageComposer } from '../../communication/messages/outgoing/navigator/DeleteFavouriteRoomMessageComposer';

const HILITE_COLOR = 0xFFB8B2EA;

/**
 * Displays a scrollable list of guest rooms with hover popups, favourite icons, and door-mode icons.
 *
 * @see sources/win63_version/habbo/navigator/mainview/GuestRoomListCtrl.as
 */
export class GuestRoomListCtrl implements IViewCtrl
{
    protected _navigator: IHabboTransitionalNavigator;
    private _content: IWindowContainer | null = null;
    private _itemList: IItemListWindow | null = null;
    private _scrollbar: IScrollbarWindow | null = null;
    private _roomPopupCtrl: RoomPopupCtrl;
    protected _userCountRenderer: UserCountRenderer;
    private _lastHovered: IWindowContainer | null = null;
    private _lastMouseX: number = 0;
    private _isFastHorizontalMove: boolean = false;
    private _adIndex: number;
    private _showRoomNumbers: boolean;

    private readonly _onAddFavouriteClick: (event: WindowEvent) => void;
    private readonly _onRemoveFavouriteClick: (event: WindowEvent) => void;

    constructor(navigator: IHabboTransitionalNavigator, adIndex: number, showRoomNumbers: boolean)
    {
        this._navigator = navigator;
        this._adIndex = adIndex;
        this._showRoomNumbers = showRoomNumbers;
        this._roomPopupCtrl = new RoomPopupCtrl(navigator, 5, -5);
        this._userCountRenderer = new UserCountRenderer(navigator);
        this._onAddFavouriteClick = (e) => this.handleAddFavouriteClick(e);
        this._onRemoveFavouriteClick = (e) => this.handleRemoveFavouriteClick(e);
    }

    dispose(): void
    {
        if(this._roomPopupCtrl)
        {
            this._roomPopupCtrl.dispose();
            this._roomPopupCtrl = null!;
        }

        if(this._userCountRenderer)
        {
            this._userCountRenderer.dispose();
            this._userCountRenderer = null!;
        }
    }

    get content(): IWindowContainer | null
    {
        return this._content;
    }

    set content(value: IWindowContainer | null)
    {
        this._content = value;
        this._itemList = value ? value.findChildByName('item_list') as IItemListWindow : null;
        this._scrollbar = value ? value.findChildByName('scroller') as IScrollbarWindow : null;

        if(value === null && this._roomPopupCtrl)
        {
            this._roomPopupCtrl.closePopup();
        }
    }

    refresh(): void
    {
        if(!this._itemList || !this._content) return;

        const rooms = this.getRooms();
        const prevVisibleCount = this.getVisibleEntryCount();

        this._itemList.autoArrangeItems = false;

        let i = 0;

        while(true)
        {
            if(i < rooms.length)
            {
                this.refreshEntry(true, i, rooms[i]);
            }
            else
            {
                const done = this.refreshEntry(false, i, null);

                if(done) break;
            }

            i++;
        }

        this._itemList.autoArrangeItems = true;

        if(this._scrollbar !== null && this.getVisibleEntryCount() !== prevVisibleCount)
        {
            this._scrollbar.scrollV = 0;
        }

        const noRoomsFound = this._content.findChildByName('no_rooms_found');

        if(noRoomsFound)
        {
            noRoomsFound.visible = rooms.length < 1;
        }
    }

    getRooms(): GuestRoomData[]
    {
        return this._navigator?.data?.guestRoomSearchResults?.rooms ?? [];
    }

    beforeEnterRoom(_index: number): void
    {
    }

    get navigator(): IHabboTransitionalNavigator
    {
        return this._navigator;
    }

    get roomPopupCtrl(): RoomPopupCtrl
    {
        return this._roomPopupCtrl;
    }

    protected getListEntry(index: number): IWindowContainer
    {
        const entry = this._navigator.getXmlWindow('grs_guest_room_details_phase_one') as IWindowContainer;

        entry.background = true;
        entry.addEventListener('WME_MOVE', (e: WindowEvent) => this.onMouseMove(e));
        entry.addEventListener('WME_OVER', (e: WindowEvent) => this.onMouseOver(e));
        entry.addEventListener('WME_OUT', (e: WindowEvent) => this.onMouseOut(e));
        entry.addEventListener('WME_CLICK', (e: WindowEvent) => this.onMouseClick(e));
        entry.setParamFlag(1, true);
        entry.setParamFlag(128, true);
        entry.color = this.getBgColor(index);
        entry.tags.push(String(index));

        if(this._showRoomNumbers)
        {
            const roomName = entry.findChildByName('roomname');

            if(roomName)
            {
                roomName.x += 20;
                roomName.width -= 20;
            }
        }

        return entry;
    }

    protected getBgColor(index: number): number
    {
        return index % 2 !== 0 ? 0xFFFFFFFF : 0xFFBBBBB2;
    }

    protected refreshEntryDetails(entry: IWindowContainer, room: GuestRoomData): void
    {
        entry.visible = true;
        Util.hideChildren(entry);
        this.refreshFavouriteIcon(entry, room);

        const groupIconName = (room.doorMode === 1 || room.doorMode === 2 || room.doorMode === 3)
            ? 'group_base_icon'
            : 'group_base_icon_no_doormode';

        this._navigator.refreshButton(entry, groupIconName, room.habboGroupId > 0, null!, 0, 'group_base_icon');
        this._navigator.refreshButton(entry, 'home', this.isHome(room), null!, 0);
        this._navigator.refreshButton(entry, 'doormode_doorbell_small', room.doorMode === 1, null!, 0);
        this._navigator.refreshButton(entry, 'doormode_password_small', room.doorMode === 2, null!, 0);
        this._navigator.refreshButton(entry, 'doormode_invisible_small', room.doorMode === 3, null!, 0);

        if(this._showRoomNumbers)
        {
            const roomNumber = entry.findChildByName('room_number');

            if(roomNumber)
            {
                roomNumber.visible = true;
                roomNumber.caption = parseInt(entry.tags[0]) + 2 + '.';
            }
        }

        this.refreshRoomName(entry, room);
        this._userCountRenderer.refreshUserCount(room.maxUserCount, entry, room.userCount, '${navigator.usercounttooltip.users}', 308, 2);
        entry.name = 'guestroom_' + room.ownerName + '_' + room.roomName;
    }

    protected onMouseMove(event: WindowEvent): void
    {
        this.checkFastHorizontalMove(event);
    }

    protected onMouseOver(event: WindowEvent): void
    {
        const target = event.target as IWindowContainer;

        if(this._roomPopupCtrl.visible && this._isFastHorizontalMove) return;

        this.hilite(target);

        const index = parseInt(target.tags[0]);
        const room = this.getRoomAt(index);

        if(room === null) return;

        this._roomPopupCtrl.room = room;
        this._roomPopupCtrl.showPopup(target);
    }

    protected onMouseOut(event: WindowEvent): void
    {
        const target = event.target as IWindow;

        if(Util.containsMouse(target)) return;

        const index = parseInt((target as IWindowContainer).tags[0]);

        target.color = this.getBgColor(index);
        this._roomPopupCtrl.closePopup();
    }

    protected onMouseClick(event: WindowEvent): void
    {
        const target = event.target as IWindowContainer;
        const index = parseInt(target.tags[0]);
        const room = this.getRoomAt(index);

        if(room === null) return;

        if(room.ownerName !== this._navigator.sessionData?.userName)
        {
            if(room.habboGroupId !== 0)
            {
                this._navigator.goToPrivateRoom(room.flatId);
                return;
            }

            switch(room.doorMode - 1)
            {
                case 0:
                    this._navigator.doorbell?.show(room, null!);
                    return;

                case 1:
                    this._navigator.passwordInput?.show(room, null!);
                    return;
            }
        }

        this.beforeEnterRoom(index);
        this._navigator.goToRoom(room.flatId, true, '', index);
        this._roomPopupCtrl.hideInstantly();
    }

    private refreshEntry(show: boolean, index: number, room: GuestRoomData | null): boolean
    {
        let entry = this._itemList!.getListItemAt(index) as IWindowContainer | null;

        if(entry === null)
        {
            if(!show) return true;

            entry = this.getListEntry(index);
            this._itemList!.addListItem(entry);
        }

        Util.hideChildren(entry);

        if(show && room !== null)
        {
            this.refreshEntryDetails(entry, room);
            entry.visible = true;
            entry.height = 17;
        }
        else
        {
            entry.height = 0;
            entry.visible = false;
        }

        return false;
    }

    private getVisibleEntryCount(): number
    {
        if(!this._itemList) return 0;

        let count = 0;

        for(let i = 0; i < this._itemList.numListItems; i++)
        {
            if(this._itemList.getListItemAt(i)?.visible)
            {
                count++;
            }
        }

        return count;
    }

    protected getRoomAt(index: number): GuestRoomData | null
    {
        return this.getRooms()[index] ?? null;
    }

    private hilite(entry: IWindowContainer): void
    {
        if(this._lastHovered !== null && !this._lastHovered.disposed)
        {
            const prevIndex = parseInt(this._lastHovered.tags[0]);

            this._lastHovered.color = this.getBgColor(prevIndex);
        }

        this._lastHovered = entry;
        entry.color = HILITE_COLOR;
    }

    private checkFastHorizontalMove(event: WindowEvent): void
    {
        const stageX = (event as unknown as { stageX?: number }).stageX ?? 0;
        const delta = Math.abs(this._lastMouseX - stageX);

        this._lastMouseX = stageX;
        this._isFastHorizontalMove = delta > 2;
    }

    private refreshRoomName(entry: IWindowContainer, room: GuestRoomData): void
    {
        const nameText = entry.findChildByName('roomname') as ITextWindow | null;

        if(!nameText) return;

        nameText.visible = true;

        const hasIcons = entry.findChildByName('home')?.visible
            || entry.findChildByName('favourite')?.visible
            || entry.findChildByName('make_favourite')?.visible;

        const maxWidth = hasIcons ? nameText.width - 20 : nameText.width;

        Util.cutTextToWidth(nameText, room.roomName, maxWidth);
    }

    private refreshFavouriteIcon(entry: IWindowContainer, room: GuestRoomData): void
    {
        const isFav = this._navigator.data.isRoomFavourite(room.flatId);
        const isHome = this.isHome(room);

        this.refreshRegion(entry, 'make_favourite', !isFav && !isHome, this._onAddFavouriteClick);
        this.refreshRegion(entry, 'favourite', isFav && !isHome, this._onRemoveFavouriteClick);
    }

    private isHome(room: GuestRoomData): boolean
    {
        return room.flatId === this._navigator.data.homeRoomId;
    }

    private refreshRegion(
        entry: IWindowContainer,
        name: string,
        visible: boolean,
        handler: (event: WindowEvent) => void
    ): void
    {
        const region = entry.findChildByName(name);

        if(!region) return;

        if(!visible)
        {
            region.visible = false;
            region.removeEventListener('WME_CLICK', handler);
        }
        else
        {
            region.addEventListener('WME_CLICK', handler);
            region.visible = true;
            this._navigator.refreshButton(region as IWindowContainer, name, true, null!, 0);
        }
    }

    private handleRemoveFavouriteClick(event: WindowEvent): void
    {
        const target = event.target as IWindow;
        const parent = (target as unknown as { parent?: IWindowContainer }).parent;

        if(!target || !parent) return;

        const index = parseInt(parent.tags[0]);
        const room = this.getRoomAt(index);

        if(room !== null)
        {
            this._navigator.send(new DeleteFavouriteRoomMessageComposer(room.flatId));
        }
    }

    private handleAddFavouriteClick(event: WindowEvent): void
    {
        const target = event.target as IWindow;
        const parent = (target as unknown as { parent?: IWindowContainer }).parent;

        if(!target || !parent) return;

        const index = parseInt(parent.tags[0]);
        const room = this.getRoomAt(index);

        if(room !== null)
        {
            this._navigator.send(new AddFavouriteRoomMessageComposer(room.flatId));
        }
    }
}
