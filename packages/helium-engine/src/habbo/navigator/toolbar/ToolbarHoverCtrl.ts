import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {
    CanCreateRoomMessageComposer
} from '../../communication/messages/outgoing/navigator/CanCreateRoomMessageComposer';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';

/**
 * Toolbar hover menu controller for navigator quick-access.
 *
 * Displays a dropdown menu with 6 items: Navigator, Home, Favorites,
 * Create Room, History, and Frequent Rooms. Supports hover color states.
 *
 * @see sources/win63_version/habbo/navigator/toolbar/ToolbarHoverCtrl.as
 */
export class ToolbarHoverCtrl
{
    private static readonly ITEM_BG_COLOR_OVER: number = 7433577;
    private static readonly ITEM_BG_COLOR_OUT: number = 5723213;

    private _disposed: boolean = false;
    private _navigator: IHabboTransitionalNavigator | null;
    private _window: IWindowContainer | null = null;
    private _itemList: IItemListWindow | null = null;
    private _simpleItemBase: IWindowContainer | null = null;
    private _hideTimeout: ReturnType<typeof setTimeout> | null = null;
    private _isHovering: boolean = false;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;

        const xmlWindow = navigator.getXmlWindow('toolbar_hover');

        if(!xmlWindow) return;

        this._window = xmlWindow as unknown as IWindowContainer;
        this._itemList = this._window.findChildByName('item_list') as IItemListWindow | null;

        if(!this._itemList) return;

        this._simpleItemBase = (this._itemList as any).getListItemByTag?.('SIMPLE_ITEM') as IWindowContainer | null;

        if(this._simpleItemBase)
        {
            (this._itemList as any).removeListItem?.(this._simpleItemBase);
        }

        this._window.addEventListener('WME_OVER', this.onHoverOverWindow);
        this._window.addEventListener('WME_HOVERING', this.onHoverOverWindow);
        this._window.addEventListener('WME_OUT', this.onHoverOutWindow);

        this.addSimpleItem('navigator', navigator.getText('${navigator.title}'), this.onNavigatorClick);
        this.addSimpleItem('home', navigator.getText('${toolbar.icon.label.exitroom.home}'), this.onHomeClick);
        this.addSimpleItem('favorites', navigator.getText('${navigator.navisel.myfavourites}'), this.onFavouritesClick);
        this.addSimpleItem('create', navigator.getText('${navigator.createroom.create}'), this.onCreateRoomClick);
        this.addSimpleItem('history', navigator.getText('${navigator.navisel.visitedrooms}'), this.onHistoryClick);
        this.addSimpleItem('frequent', navigator.getText('${navigator.navisel.frequentvisits}'), this.onFrequentHistoryClick);
    }

    /**
	 * Shows the hover menu at the given position.
	 *
	 * @param x - X position
	 * @param y - Y position
	 */
    show(x: number, y: number): void
    {
        if(!this._window) return;

        this.stopHideTimeout();
        this._window.visible = true;
        this._window.x = x;
        this._window.y = y;
    }

    /**
	 * Hides the menu (respects hover state).
	 */
    hide(): void
    {
        if(this._disposed || this._isHovering) return;

        this.stopHideTimeout();
        this._isHovering = false;

        if(this._window)
        {
            this._window.visible = false;
        }
    }

    /**
	 * Starts a delayed hide (500ms timeout).
	 */
    hideDelayed(): void
    {
        if(this._disposed || this._isHovering) return;

        this.startHideTimeout();
    }

    /**
	 * Forces the menu to hide immediately, ignoring hover state.
	 */
    hideForced(): void
    {
        if(this._disposed) return;

        this.stopHideTimeout();
        this._isHovering = false;

        if(this._window)
        {
            this._window.visible = false;
        }
    }

    dispose(): void
    {
        this._disposed = true;
        this.stopHideTimeout();
        this._itemList = null;
        this._window = null;
        this._simpleItemBase = null;
        this._navigator = null;
    }

    /**
	 * Adds a simple menu item.
	 *
	 * @param id - Item identifier
	 * @param label - Display text
	 * @param callback - Click handler
	 */
    private addSimpleItem(id: string, label: string, callback: (event: WindowEvent) => void): void
    {
        if(!this._simpleItemBase || !this._itemList) return;

        const item = this._simpleItemBase.clone() as IWindowContainer;

        item.name = id;

        const textWindow = item.getChildByName('text') as ITextWindow | null;

        if(textWindow)
        {
            textWindow.text = label;
        }

        item.addEventListener('WME_CLICK', callback);
        item.addEventListener('WME_OVER', this.setItemBgHoverState);
        item.addEventListener('WME_OUT', this.setItemBgHoverState);
        (this._itemList as any).addListItem?.(item);
    }

    private startHideTimeout(): void
    {
        this.stopHideTimeout();
        this._hideTimeout = setTimeout(() => this.hide(), 500);
    }

    private stopHideTimeout(): void
    {
        if(this._hideTimeout !== null)
        {
            clearTimeout(this._hideTimeout);
            this._hideTimeout = null;
        }
    }

    private setItemBgHoverState = (event: WindowEvent): void =>
    {
        const target = (event as any).target as IWindowContainer;

        if(!target) return;

        const bg = target.findChildByName('background');

        if(bg)
        {
            const isHover = event.type === 'WME_OVER';

            bg.color = isHover ? ToolbarHoverCtrl.ITEM_BG_COLOR_OVER : ToolbarHoverCtrl.ITEM_BG_COLOR_OUT;
        }
    };

    private onHoverOverWindow = (_event: WindowEvent): void =>
    {
        this._isHovering = true;
    };

    private onHoverOutWindow = (_event: WindowEvent): void =>
    {
        this._isHovering = false;
        this.hideDelayed();
    };

    private onNavigatorClick = (_event: WindowEvent): void =>
    {
        this._navigator?.openNavigator();
        this._navigator?.goToMainView();
        this.hideForced();
    };

    private onHomeClick = (_event: WindowEvent): void =>
    {
        if(!this._navigator) return;

        const homeRoomId = this._navigator.data.homeRoomId;

        if(homeRoomId > -1)
        {
            this._navigator.goToPrivateRoom(homeRoomId);
            this.hideForced();
        }
    };

    private onFavouritesClick = (_event: WindowEvent): void =>
    {
        this._navigator?.showFavouriteRooms();
        this.hideForced();
    };

    private onCreateRoomClick = (_event: WindowEvent): void =>
    {
        this._navigator?.send(new CanCreateRoomMessageComposer());
        this.hideForced();
    };

    private onHistoryClick = (_event: WindowEvent): void =>
    {
        this._navigator?.showHistoryRooms();
        this.hideForced();
    };

    private onFrequentHistoryClick = (_event: WindowEvent): void =>
    {
        this._navigator?.showFrequentRooms();
        this.hideForced();
    };
}
