import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { IWindow } from '@core/window/IWindow';
import type { IWidgetWindow } from '@core/window/components/IWidgetWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { PromotedRoomCategoryData } from '../../communication/messages/incoming/navigator/PromotedRoomCategoryData';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import type { IAvatarImageWidget } from '../../window/widgets/IAvatarImageWidget';
import { RoomSessionTags } from '../domain/RoomSessionTags';
import { Util } from '../Util';
import { UserCountRenderer } from '../UserCountRenderer';
import { PromotedRoomsGuestRoomListCtrl } from './PromotedRoomsGuestRoomListCtrl';
import { GetExtendedProfileMessageComposer } from '../../communication/messages/outgoing/users/GetExtendedProfileMessageComposer';

/**
 * Displays promoted room categories with expandable room lists and leader avatars.
 *
 * @see sources/win63_version/habbo/navigator/mainview/PromotedRoomsListCtrl.as
 */
export class PromotedRoomsListCtrl
{
    private static readonly CATEGORY_SPACING = 5;

    private _navigator: IHabboTransitionalNavigator;
    private _userCountRenderer: UserCountRenderer;
    private _guestRoomListCtrl: PromotedRoomsGuestRoomListCtrl;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
        this._userCountRenderer = new UserCountRenderer(navigator);
        this._guestRoomListCtrl = new PromotedRoomsGuestRoomListCtrl(navigator);
    }

    get disposed(): boolean
    {
        return this._navigator === null;
    }

    dispose(): void
    {
        this._navigator = null!;

        if(this._userCountRenderer)
        {
            this._userCountRenderer.dispose();
            this._userCountRenderer = null!;
        }

        if(this._guestRoomListCtrl)
        {
            this._guestRoomListCtrl.dispose();
            this._guestRoomListCtrl = null!;
        }
    }

    refresh(container: IWindowContainer, categories: PromotedRoomCategoryData[]): void
    {
        Util.hideChildren(container);

        let y = 0;

        for(let i = 0; i < categories.length; i++)
        {
            let entry = this.getCategoryContainer(container, i);

            if(entry === null)
            {
                entry = this.createEntry(i);
                entry.id = i;
                container.addChild(entry);
            }

            this.refreshEntry(entry, categories[i]);
            entry.y = y;
            y += entry.height + PromotedRoomsListCtrl.CATEGORY_SPACING;
            entry.visible = true;
        }

        container.height = Util.getLowestPoint(container) > 0
            ? Util.getLowestPoint(container) + PromotedRoomsListCtrl.CATEGORY_SPACING
            : 0;
    }

    createEntry(index: number): IWindowContainer
    {
        const entry = this._navigator.getXmlWindow('grs_promoted_room_category') as IWindowContainer;

        this.setProcedureAndId(entry, index, 'enter_room_button', (e, w) => this.onEnterRoomButton(e, w));
        this.setProcedureAndId(entry, index, 'leader_region', (e, w) => this.onLeaderRegion(e, w));
        this.setProcedureAndId(entry, index, 'toggle_open_region', (e, w) => this.onToggleOpenRegion(e, w));
        this._navigator.refreshButton(entry, 'navi_room_icon', true, null!, 0);

        return entry;
    }

    refreshEntry(entry: IWindowContainer, category: PromotedRoomCategoryData): void
    {
        const categoryText = this._navigator.getText('promotedroomcategory.' + category.code);

        const nameText = entry.findChildByName('category_name_txt');

        if(nameText)
        {
            nameText.caption = categoryText;
        }

        const header = entry.findChildByName('category_header');

        if(header && nameText)
        {
            header.width = nameText.width + 13;
        }

        this._navigator.registerParameter('navigator.promotedrooms.hidetopten', 'category', categoryText);
        this._navigator.registerParameter('navigator.promotedrooms.viewtopten', 'category', categoryText);

        const openText = entry.findChildByName('open_txt');

        if(openText) openText.caption = this._navigator.getText('navigator.promotedrooms.viewtopten');

        const closeText = entry.findChildByName('close_txt');

        if(closeText) closeText.caption = this._navigator.getText('navigator.promotedrooms.hidetopten');

        const roomNameText = entry.findChildByName('room_name_txt');

        if(roomNameText) roomNameText.caption = category.bestRoom.roomName;

        const leaderNameText = entry.findChildByName('leader_name_txt');

        if(leaderNameText)
        {
            leaderNameText.caption = category.bestRoom.showOwner ? category.bestRoom.ownerName : '';
            leaderNameText.x = this.getLocationAfter(entry, 'leader_name_caption_txt', 0);
        }

        const arrowDown = entry.findChildByName('arrow_down_icon');
        const arrowRight = entry.findChildByName('arrow_right_icon');

        if(arrowDown)
        {
            arrowDown.visible = category.open;
            arrowDown.x = this.getLocationAfter(entry, 'close_txt');
        }

        if(arrowRight)
        {
            arrowRight.visible = !category.open;
            arrowRight.x = this.getLocationAfter(entry, 'open_txt');
        }

        if(closeText) closeText.visible = category.open;
        if(openText) openText.visible = !category.open;

        const enterRoomButton = entry.findChildByName('enter_room_button') as IWindowContainer | null;

        if(enterRoomButton)
        {
            this._userCountRenderer.refreshUserCount(
                category.bestRoom.maxUserCount,
                enterRoomButton,
                category.bestRoom.userCount,
                '${navigator.usercounttooltip.users}',
                222,
                35
            );
        }

        this.refreshAvatarImage(entry, category);

        const itemList = entry.findChildByName('item_list');

        if(itemList)
        {
            itemList.visible = category.open;

            if(category.open)
            {
                itemList.height = category.rooms.length * 17;
                this._guestRoomListCtrl.content = entry;
                this._guestRoomListCtrl.category = category;
                this._guestRoomListCtrl.refresh();
            }
        }

        entry.height = category.open ? Util.getLowestPoint(entry) + 3 : 90;
    }

    private getCategoryContainer(parent: IWindowContainer, id: number): IWindowContainer | null
    {
        return parent.getChildByID(id) as IWindowContainer | null;
    }

    private getLocationAfter(entry: IWindowContainer, name: string, padding: number = 3): number
    {
        const child = entry.findChildByName(name);

        if(!child) return 0;

        return child.x + child.width + padding;
    }

    private setProcedureAndId(
        container: IWindowContainer,
        id: number,
        childName: string,
        procedure: (event: WindowEvent, window: IWindow) => void
    ): void
    {
        const child = container.findChildByName(childName);

        if(child)
        {
            child.procedure = procedure;
            child.id = id;
        }
    }

    private onEnterRoomButton(event: WindowEvent, window: IWindow): void
    {
        if(event.type !== 'WME_CLICK') return;

        const category = this.findCategory(window);

        if(category === null) return;

        this._navigator.data.roomSessionTags = new RoomSessionTags(category.code, '1');
        this._navigator.goToPrivateRoom(category.bestRoom.flatId);
        this._navigator.closeNavigator();
    }

    private onLeaderRegion(event: WindowEvent, window: IWindow): void
    {
        if(event.type !== 'WME_CLICK') return;

        const category = this.findCategory(window);

        if(category === null) return;

        this._navigator.trackGoogle('extendedProfile', 'navigator_promotedRoom');
        this._navigator.send(new GetExtendedProfileMessageComposer(category.bestRoom.ownerId));
    }

    private onToggleOpenRegion(event: WindowEvent, window: IWindow): void
    {
        if(event.type !== 'WME_CLICK') return;

        const entries = this._navigator.data.promotedRooms?.entries ?? [];

        for(let i = 0; i < entries.length; i++)
        {
            if(window.id !== i)
            {
                entries[i].open = false;
            }
        }

        const category = this.findCategory(window);

        if(category !== null)
        {
            category.toggleOpen();
        }

        this._navigator.mainViewCtrl?.refresh();
    }

    private findCategory(window: IWindow): PromotedRoomCategoryData | null
    {
        return this._navigator.data.promotedRooms?.entries[window.id] ?? null;
    }

    private refreshAvatarImage(entry: IWindowContainer, category: PromotedRoomCategoryData): void
    {
        const widgetWindow = entry.findChildByName('avatar_image_widget') as IWidgetWindow | null;

        if(!widgetWindow) return;

        const widget = widgetWindow.widget as IAvatarImageWidget | null;

        if(widget)
        {
            widget.figure = category.leaderFigure;
        }
    }
}
