import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { IDropMenuWindow } from '@core/window/components/IDropMenuWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { ITabPageDecorator } from './ITabPageDecorator';
import type { ITabNavigator } from '../../domain/Tab';
import { CanCreateRoomMessageComposer } from '../../../communication/messages/outgoing/navigator/CanCreateRoomMessageComposer';

/**
 * Tab page decorator for the "Me" (My Rooms) tab.
 *
 * Manages the sub-navigation dropdown (My Rooms, Where Are My Friends, etc.)
 * and wires the "Create Room" footer button.
 *
 * @see sources/win63_version/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as
 */
export class MyRoomsTabPageDecorator implements ITabPageDecorator
{
    private static readonly SUB_ITEMS: [number, string][] = [
        [5,  'navigator.navisel.myrooms'],
        [4,  'navigator.navisel.wherearemyfriends'],
        [3,  'navigator.navisel.myfriendsrooms'],
        [18, 'navigator.navisel.roomswithrights'],
        [19, 'navigator.navisel.mygroups'],
        [6,  'navigator.navisel.myfavourites'],
        [7,  'navigator.navisel.visitedrooms'],
        [23, ''],
    ];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::_navigator
    private _navigator: ITabNavigator;
    private _filter: IDropMenuWindow | null = null;

    constructor(navigator: ITabNavigator)
    {
        this._navigator = navigator;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::refreshCustomContent()
    refreshCustomContent(container: IWindowContainer): void
    {
        const header = container.findChildByName('me_header') as IWindowContainer | null;

        if(!header) return;

        if(this._filter === null || (this._filter as unknown as { disposed?: boolean }).disposed)
        {
            this._filter = header.findChildByName('meSubNavi') as IDropMenuWindow | null;
            this.prepareSubNavi();

            if(this._filter)
            {
                this._filter.addEventListener('WE_SELECTED', this.onFilterSelected);
            }
        }

        header.visible = true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::tabSelected()
    tabSelected(): void
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return;

        this._filter.removeEventListener('WE_SELECTED', this.onFilterSelected);
        this._filter.selection = 0;
        this._filter.addEventListener('WE_SELECTED', this.onFilterSelected);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::refreshFooter()
    refreshFooter(container: IWindowContainer): void
    {
        const footer = container.findChildByName('me_footer') as IWindowContainer | null;

        if(!footer) return;

        const createRoomButton = footer.findChildByName('create_room_but');

        if(createRoomButton)
        {
            createRoomButton.addEventListener('WME_CLICK', this.onCreateRoomClick);
        }

        this._navigator.refreshButton(footer, 'create_room', true, null, 0);
        footer.visible = true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::navigatorOpenedWhileInTab()
    navigatorOpenedWhileInTab(): void
    {
        this.startSearch();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::get filterCategory()
    get filterCategory(): string | null
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return null;

        return this._filter.enumerateSelection()[this._filter.selection] ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::setSubSelection()
    setSubSelection(value: number): void
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return;

        const count = this._filter.numMenuItems;

        for(let i = 0; i < count; i++)
        {
            if(MyRoomsTabPageDecorator.SUB_ITEMS[i]?.[0] === value)
            {
                this._filter.selection = i;
                return;
            }
        }

        this._filter.selection = 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::processSearchParam()
    processSearchParam(param: string): string
    {
        return param;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::prepareSubNavi()
    private prepareSubNavi(): void
    {
        if(!this._filter || (this._filter as unknown as { disposed?: boolean }).disposed) return;

        const items = MyRoomsTabPageDecorator.SUB_ITEMS.map(([, key]) => this._navigator.getText(key));

        this._filter.populate(items);
        this._filter.selection = 0;
    }

    private onCreateRoomClick = (_event: WindowEvent): void =>
    {
        this._navigator.send(new CanCreateRoomMessageComposer());
    };

    private onFilterSelected = (_event: WindowEvent): void =>
    {
        this.startSearch();

        if(this._filter && !(this._filter as unknown as { disposed?: boolean }).disposed)
        {
            this._navigator.trackNavigationDataPoint(
                this._filter.enumerateSelection()[this._filter.selection] ?? '',
                'category.view'
            );
        }
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::startSearch()
    private startSearch(): void
    {
        const selection = (this._filter && !(this._filter as unknown as { disposed?: boolean }).disposed)
            ? this._filter.selection
            : 0;

        this._navigator.mainViewCtrl?.startSearch(3, this.getSearchTypeForIndex(selection));
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/tabpagedecorators/MyRoomsTabPageDecorator.as::getSearchTypeForIndex()
    private getSearchTypeForIndex(index: number): number
    {
        return MyRoomsTabPageDecorator.SUB_ITEMS[index]?.[0] ?? MyRoomsTabPageDecorator.SUB_ITEMS[0][0];
    }
}
