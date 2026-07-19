import type { IWindow } from '@core/window/IWindow';
import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { IItemListWindow } from '@core/window/components/IItemListWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import { AssignRightsMessageComposer } from '@habbo/communication/messages/outgoing/room/action/AssignRightsMessageComposer';
import { RemoveRightsMessageComposer } from '@habbo/communication/messages/outgoing/room/action/RemoveRightsMessageComposer';
import { GetExtendedProfileMessageComposer } from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';

const DISPLAY_LIMIT = 200;

/** Minimal user data from room settings (class_2565). */
export interface IRoomSettingsUserData
{
    readonly userId: number;
    readonly userName: string;
}

/**
 * Displays a scrollable list of users (room rights holders or banned users).
 * Used by RoomSettingsCtrl tabs 3 and 5.
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/UserListCtrl.as
 */
export class UserListCtrl
{
    private static readonly DISPLAY_LIMIT: number = DISPLAY_LIMIT;

    protected _navigator: IHabboTransitionalNavigator;
    private _isFriendList: boolean;
    protected _userCount: number = 0;

    constructor(navigator: IHabboTransitionalNavigator, isFriendList: boolean)
    {
        this._navigator = navigator;
        this._isFriendList = isFriendList;
    }

    get disposed(): boolean
    {
        return this._navigator === null;
    }

    get userCount(): number
    {
        return this._userCount;
    }

    refresh(list: IItemListWindow, users: IRoomSettingsUserData[], filter: string, highlightUserId: number): void
    {
        const filtered: IRoomSettingsUserData[] = [];

        for(const user of users)
        {
            if(filter === '' || user.userName.toLowerCase().indexOf(filter) > -1)
            {
                filtered.push(user);
            }

            if(filtered.length >= DISPLAY_LIMIT) break;
        }

        list.autoArrangeItems = false;

        let i = 0;

        while(true)
        {
            const done = this.refreshEntry(list, i, filtered[i] ?? null, highlightUserId);

            if(done) break;

            i++;
        }

        list.autoArrangeItems = true;
        (list as unknown as { invalidate?(): void }).invalidate?.();

        this._userCount = filtered.length;
    }

    protected getRowView(): IWindowContainer
    {
        const layoutName = this._isFriendList ? 'ros_friend' : 'ros_flat_controller';

        return this._navigator.getXmlWindow(layoutName) as IWindowContainer;
    }

    protected getBgColor(index: number, highlighted: boolean): number
    {
        if(highlighted) return 0xFFBBCCFF;

        return index % 2 !== 0 ? 0xFFFFFFFF : 0xFFEEEEE1;
    }

    protected onBgMouseClick(event: WindowEvent): void
    {
        const region = event.target as IWindowContainer;
        const userId = region.id;

        if(this._isFriendList)
        {
            this._navigator.send(new AssignRightsMessageComposer(userId));
        }
        else
        {
            this._navigator.send(new RemoveRightsMessageComposer([userId]));
        }
    }

    private refreshEntry(
        list: IItemListWindow,
        index: number,
        user: IRoomSettingsUserData | null,
        highlightUserId: number
    ): boolean
    {
        let entry = list.getListItemAt(index) as IWindowContainer | null;

        if(entry === null)
        {
            if(user === null) return true;

            entry = this.getListEntry(index);
            list.addListItem(entry);
        }

        if(user !== null)
        {
            entry.color = this.getBgColor(index, user.userId === highlightUserId);
            this.refreshEntryDetails(entry, user);
            entry.visible = true;
            entry.height = 20;
        }
        else
        {
            entry.height = 0;
            entry.visible = false;
        }

        return false;
    }

    private getListEntry(index: number): IWindowContainer
    {
        const entry = this.getRowView();

        const bg = entry.findChildByName('bg_region');

        if(bg)
        {
            bg.addEventListener('WME_CLICK', (e: WindowEvent) => this.onBgMouseClick(e));
            bg.addEventListener('WME_OVER', (e: WindowEvent) => this._onBgMouseOver(e));
            bg.addEventListener('WME_OUT', (e: WindowEvent) => this._onBgMouseOut(e));
        }

        // TODO: wire user_info_region click via class_2323.setup() equivalent
        const infoRegion = entry.findChildByName('user_info_region');

        if(infoRegion)
        {
            infoRegion.addEventListener('WME_CLICK', (e: WindowEvent) => this._onUserInfoMouseClick(e));
        }

        entry.id = index;

        return entry;
    }

    private refreshEntryDetails(entry: IWindowContainer, user: IRoomSettingsUserData): void
    {
        const nameEl = entry.findChildByName('user_name_txt');

        if(nameEl) nameEl.caption = user.userName;

        const bg = entry.findChildByName('bg_region');

        if(bg) bg.id = user.userId;

        const infoRegion = entry.findChildByName('user_info_region');

        if(infoRegion) infoRegion.id = user.userId;
    }

    private _onBgMouseOver = (event: WindowEvent): void =>
    {
        const region = event.target as IWindowContainer;
        const row = region.parent as IWindowContainer | null;

        if(row === null) return;

        row.color = this.getBgColor(-1, true);

        const arrow = row.findChildByName('arrow_icon');

        if(arrow) arrow.visible = true;
    };

    private _onBgMouseOut = (event: WindowEvent): void =>
    {
        const region = event.target as IWindowContainer;
        const row = region.parent as IWindowContainer | null;

        if(row === null) return;

        row.color = this.getBgColor(row.id, false);

        const arrow = row.findChildByName('arrow_icon');

        if(arrow) arrow.visible = false;
    };

    private _onUserInfoMouseClick = (event: WindowEvent): void =>
    {
        const target = event.target as IWindow;

        this._navigator.trackGoogle('extendedProfile', 'navigator_roomSettingsUsersList');
        this._navigator.send(new GetExtendedProfileMessageComposer(target.id));
    };

    dispose(): void
    {
        this._navigator = null!;
    }
}
