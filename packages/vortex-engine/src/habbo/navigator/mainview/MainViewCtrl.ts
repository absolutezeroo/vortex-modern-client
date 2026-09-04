import type {IDisposable} from '@core/runtime/IDisposable';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITabButtonWindow} from '@core/window/components/ITabButtonWindow';
import type {ITabContextWindow} from '@core/window/components/ITabContextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {ErrorReportStorage} from '@core/utils/ErrorReportStorage';
import {Logger} from '@core/utils/Logger';
import {WindowToggle} from '@habbo/utils/WindowToggle';
import {
    CompetitionRoomsSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/CompetitionRoomsSearchMessageComposer';
import {
    GetOfficialRoomsMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/GetOfficialRoomsMessageComposer';
import {
    GetPopularRoomTagsMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/GetPopularRoomTagsMessageComposer';
import {
    GuildBaseSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/GuildBaseSearchMessageComposer';
import {
    MyFavouriteRoomsSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/MyFavouriteRoomsSearchMessageComposer';
import {
    MyFrequentRoomHistorySearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/MyFrequentRoomHistorySearchMessageComposer';
import {
    MyFriendsRoomsSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/MyFriendsRoomsSearchMessageComposer';
import {
    MyGuildBasesSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/MyGuildBasesSearchMessageComposer';
import {
    MyRecommendedRoomsMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/MyRecommendedRoomsMessageComposer';
import {
    MyRoomHistorySearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/MyRoomHistorySearchMessageComposer';
import {
    MyRoomRightsSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/MyRoomRightsSearchMessageComposer';
import {
    MyRoomsSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/MyRoomsSearchMessageComposer';
import {
    PopularRoomsSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/PopularRoomsSearchMessageComposer';
import {
    RoomAdEventTabViewedComposer
} from '@habbo/communication/messages/outgoing/navigator/RoomAdEventTabViewedComposer';
import {
    RoomAdSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/RoomAdSearchMessageComposer';
import {
    RoomTextSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/RoomTextSearchMessageComposer';
import {
    RoomsWhereMyFriendsAreSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/RoomsWhereMyFriendsAreSearchMessageComposer';
import {
    RoomsWithHighestScoreSearchMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/RoomsWithHighestScoreSearchMessageComposer';

import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import type {IViewCtrl} from '../IViewCtrl';
import {TextSearchInputs} from '../TextSearchInputs';
import {Util} from '../Util';
import {HabboNavigatorTrackingEvent} from '../events/HabboNavigatorTrackingEvent';
import {CategoryListCtrl} from './CategoryListCtrl';
import {GuestRoomListCtrl} from './GuestRoomListCtrl';
import type {ITransitionalMainViewCtrl} from './ITransitionalMainViewCtrl';
import {OfficialRoomListCtrl} from './OfficialRoomListCtrl';
import {PopularTagsListCtrl} from './PopularTagsListCtrl';
import {RoomAdListCtrl} from './RoomAdListCtrl';

const log = Logger.getLogger('habbo.navigator.mainview.MainViewCtrl');

/**
 * The legacy navigator window — its tabs, its five room lists, and the cross-fade between them.
 *
 * **This class is what owns `PopularTagsListCtrl`, `GuestRoomListCtrl`, `OfficialRoomListCtrl`,
 * `RoomAdListCtrl` and `CategoryListCtrl`.** All five were ported and none was ever constructed:
 * nothing else in the port instantiates them, and nothing else dispatched a single
 * `HabboNavigatorTrackingEvent` either. They come alive with this file.
 *
 * **The fade is a four-stage state machine driven by `update()`, not a tween.** `startSearch()`
 * puts the window into BLENDING_OUT (or straight into LOADING when it had to open the window
 * first), and each frame moves `blend` by `deltaTime / 150`. LOADING blinks `loading_text` every
 * tenth tick and waits on `NavigatorData.isLoading()`; REFRESHING rebuilds the lists in one frame;
 * BLENDING_IN fades back and then unregisters the update receiver, so the navigator costs nothing
 * per frame while it just sits there.
 *
 * **`_tabChanged` decides how much of the window fades.** Only the room list fades when you search
 * inside the same tab; the custom content and footer join in only when the tab itself changed,
 * which is why re-searching does not make the whole panel flash.
 *
 * Two things in the AS3 are dead and are kept as written, marked where they are:
 * `_isPhaseOneNavigator` is never assigned, and `refreshCategoryList()` is never called.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/mainview/MainViewCtrl.as
 */
export class MainViewCtrl implements ITransitionalMainViewCtrl, IUpdateReceiver, IDisposable
{
    // AS3: .../navigator/mainview/MainViewCtrl.as::SEARCHMSG_SEARCH
    public static readonly SEARCHMSG_SEARCH: number = 1;

    /**
	 * AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_11125
	 *
	 * Name derived from the branch it selects: `startSearch()`'s `param4 == 2` sends
	 * `GetPopularRoomTagsMessageComposer` (3214) instead of a room search.
	 */
    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_11125
    public static readonly SEARCHMSG_POPULARTAGS: number = 2;

    // AS3: .../navigator/mainview/MainViewCtrl.as::SEARCHMSG_OFFICIALROOMS
    public static readonly SEARCHMSG_OFFICIALROOMS: number = 4;

    /**
	 * AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_10702
	 *
	 * Name derived from the branch it selects: it is the one value `startSearch()` excludes from
	 * every send (`else if(param4 != 5)`), so a caller passing it opens the window and asks the
	 * server for nothing.
	 */
    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_10702
    public static readonly SEARCHMSG_NONE: number = 5;

    // AS3: .../navigator/mainview/MainViewCtrl.as::BLEND_STAGE_BLENDING_OUT
    private static readonly BLEND_STAGE_BLENDING_OUT: number = 1;

    // AS3: .../navigator/mainview/MainViewCtrl.as::BLEND_STAGE_LOADING
    private static readonly BLEND_STAGE_LOADING: number = 2;

    // AS3: .../navigator/mainview/MainViewCtrl.as::BLEND_STAGE_REFRESHING
    private static readonly BLEND_STAGE_REFRESHING: number = 3;

    // AS3: .../navigator/mainview/MainViewCtrl.as::BLEND_STAGE_BLENDING_IN
    private static readonly BLEND_STAGE_BLENDING_IN: number = 4;

    // AS3: .../navigator/mainview/MainViewCtrl.as::SCROLLBAR_WIDTH
    private static readonly SCROLLBAR_WIDTH: number = 22;

    // AS3: .../navigator/mainview/MainViewCtrl.as::PANIC_BUTTON_HEIGHT
    private static readonly PANIC_BUTTON_HEIGHT: number = 60;

    // AS3: .../navigator/mainview/MainViewCtrl.as::DEFAULT_VIEW_LOCATION
    private static readonly DEFAULT_VIEW_LOCATION: {x: number; y: number} = {x: 100, y: 10};

    // AS3: .../navigator/mainview/MainViewCtrl.as::RESIZE_TIMER_MS (name derived: `new Timer(300,1)`)
    private static readonly RESIZE_TIMER_MS: number = 300;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_navigator
    private _navigator: IHabboTransitionalNavigator | null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_4565 (name derived: `get mainWindow()` backs it)
    private _mainWindow: IFrameWindow | null = null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_content
    private _content: IWindowContainer | null = null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_4955 (name derived: the `custom_content` child)
    private _customContent: IWindowContainer | null = null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_5068 (name derived: the `custom_footer` child)
    private _customFooter: IWindowContainer | null = null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_4912 (name derived: the `list_content` child)
    private _listContent: IWindowContainer | null = null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_6087 (name derived: the popular-tags list)
    private _popularTags: PopularTagsListCtrl | null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_guestRooms
    private _guestRooms: GuestRoomListCtrl | null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_officialRooms
    private _officialRooms: OfficialRoomListCtrl | null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_5993 (name derived: the room-ad list)
    private _roomAds: RoomAdListCtrl | null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_8760 (name derived: the category list)
    private _categories: CategoryListCtrl | null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_tabContext
    private _tabContext: ITabContextWindow | null = null;

    /**
	 * AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_7818
	 *
	 * Name derived. `refreshTab()` sets it before calling `setSelected()` so that the
	 * `WE_SELECTED` it provokes is swallowed rather than treated as a click and re-sent as a
	 * search.
	 */
    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_7818
    private _ignoreNextTabSelect: boolean = false;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_5596 (name derived: the BLEND_STAGE_* it holds)
    private _blendStage: number = 0;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_7749 (name derived: the tab itself changed)
    private _tabChanged: boolean = true;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_7721 (name derived: the loading-blink tick)
    private _loadingTicks: number = 0;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_loadingText
    private _loadingText: IWindow | null = null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_8261 (name derived: last footer height)
    private _previousFooterHeight: number = 0;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_4880 (name derived: `get searchInput()` backs it)
    private _searchInput: TextSearchInputs | null = null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_5526 (name derived: the resize debounce timer)
    private _resizeTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_5307 (name derived: the open/close toggle)
    private _windowToggle: WindowToggle | null = null;

    /**
	 * AS3: .../navigator/mainview/MainViewCtrl.as::_SafeStr_8640
	 *
	 * Name derived from `get isPhaseOneNavigator()`, which returns it. **Assigned nowhere in any
	 * tree**, so it is permanently false and the three `if` blocks reading it — the tab filter in
	 * `prepare()`, the `#tag` prefix rewrite and the search-field write-back in `startSearch()` —
	 * are unreachable. Kept as written rather than folded away, because the perk that used to set
	 * it (`NAVIGATOR_PHASE_ONE_2014`) is still read in `HabboNavigator.as`.
	 */
    private _isPhaseOneNavigator: boolean = false;

    // AS3: .../navigator/mainview/MainViewCtrl.as::MainViewCtrl()
    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
        this._popularTags = new PopularTagsListCtrl(navigator);
        this._guestRooms = new GuestRoomListCtrl(navigator, 0, false);
        this._officialRooms = new OfficialRoomListCtrl(navigator);
        this._roomAds = new RoomAdListCtrl(navigator, 0, false);
        this._categories = new CategoryListCtrl(navigator);
    }

    /**
	 * Hides the scrollbar when the list fits, and gives its width back to the list — then undoes
	 * both when it stops fitting.
	 */
    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshScrollbar()
    private static refreshScrollbar(ctrl: IViewCtrl | null, _force: boolean): void
    {
        if(ctrl === null || ctrl.content === null || !ctrl.content.visible) return;

        const itemList = ctrl.content.findChildByName('item_list') as IItemListWindow | null;
        const scroller = ctrl.content.findChildByName('scroller');

        if(itemList === null || scroller === null) return;

        const overflows = itemList.scrollableRegion.height > itemList.height;

        if(scroller.visible)
        {
            if(!overflows)
            {
                scroller.visible = false;
                itemList.width += MainViewCtrl.SCROLLBAR_WIDTH;
            }
        }
        else if(overflows)
        {
            scroller.visible = true;
            itemList.width -= MainViewCtrl.SCROLLBAR_WIDTH;
        }
    }

    /**
	 * A list entry added while the scrollbar is hidden has to be widened by hand — the list itself
	 * was widened once, when the scrollbar went away, and new children do not inherit that.
	 */
    // AS3: .../navigator/mainview/MainViewCtrl.as::stretchNewEntryIfNeeded()
    public static stretchNewEntryIfNeeded(ctrl: IViewCtrl, entry: IWindowContainer): void
    {
        const scroller = ctrl.content?.findChildByName('scroller') ?? null;

        if(scroller === null || scroller.visible) return;

        entry.width += MainViewCtrl.SCROLLBAR_WIDTH;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::onNavigatorToolBarIconClick()
    onNavigatorToolBarIconClick(): void
    {
        if(this._mainWindow === null)
        {
            this.reloadData();

            return;
        }

        if(this._windowToggle === null || this._windowToggle.disposed)
        {
            const desktop = (this._mainWindow as unknown as IWindow).desktop;

            if(desktop === null) return;

            this._windowToggle = new WindowToggle(
                this._mainWindow as unknown as IWindow,
                desktop as unknown as IWindowContainer,
                () => this.reloadData(),
                () => this.close()
            );
        }

        this._windowToggle.toggle();
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::reloadData()
    private reloadData(): void
    {
        this._navigator?.tabs.getSelected()?.tabPageDecorator.navigatorOpenedWhileInTab();
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::open()
    open(): void
    {
        if(this._mainWindow === null) this.prepare();

        this.refresh();

        if(this._mainWindow === null) return;

        const window = this._mainWindow as unknown as IWindow;

        window.visible = true;
        window.y = Math.max(window.y, MainViewCtrl.PANIC_BUTTON_HEIGHT);
        window.activate();
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::isOpen()
    isOpen(): boolean
    {
        return this._mainWindow !== null && (this._mainWindow as unknown as IWindow).visible;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::close()
    close(): void
    {
        if(this._mainWindow === null) return;

        if(this._searchInput !== null)
        {
            this._searchInput.dispose();
            this._searchInput = null;
        }

        if(this._windowToggle !== null)
        {
            this._windowToggle.dispose();
            this._windowToggle = null;
        }

        (this._mainWindow as unknown as IWindow).dispose();
        this._mainWindow = null;
        this._tabContext = null;
        this._content = null;
        this._customContent = null;
        this._listContent = null;
        this._customFooter = null;
        this._loadingText = null;

        if(this._popularTags !== null) this._popularTags.content = null;
        if(this._guestRooms !== null) this._guestRooms.content = null;
        if(this._officialRooms !== null) this._officialRooms.content = null;
        if(this._categories !== null) this._categories.content = null;
        if(this._roomAds !== null) this._roomAds.content = null;

        this._previousFooterHeight = 0;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::get mainWindow()
    get mainWindow(): IWindow | null
    {
        return (this._mainWindow as unknown as IWindow | null) ?? null;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::prepare()
    private prepare(): void
    {
        const navigator = this._navigator;

        if(navigator === null) return;

        const eventInfoEnabled = navigator.getBoolean('eventinfo.enabled');

        this._mainWindow = navigator.getXmlWindow('grs_main_window_new') as unknown as IFrameWindow | null;

        if(this._mainWindow === null)
        {
            log.warn('Missing layout "grs_main_window_new_xml" — the legacy navigator is not built');

            return;
        }

        const window = this._mainWindow as unknown as IWindowContainer;

        this._tabContext = window.findChildByName('tab_context') as ITabContextWindow | null;
        this._content = window.findChildByName('tab_content') as IWindowContainer | null;
        this._customContent = window.findChildByName('custom_content') as IWindowContainer | null;
        this._listContent = window.findChildByName('list_content') as IWindowContainer | null;
        this._customFooter = window.findChildByName('custom_footer') as IWindowContainer | null;
        this._loadingText = window.findChildByName('loading_text');

        const closeButton = window.findChildByTag('close');

        if(closeButton !== null) closeButton.addEventListener('WME_CLICK', this.onWindowClose);

        (this._mainWindow as unknown as IWindow).addEventListener('WE_RESIZED', this.onWindowResized);

        if(this._tabContext !== null && (!eventInfoEnabled || !this._isPhaseOneNavigator))
        {
            // The tabs cannot be filtered in place: removing one shifts the rest, so AS3 empties
            // the context first and puts back only the ones that survive.
            const removed: ITabButtonWindow[] = [];

            while(this._tabContext.numTabItems > 0)
            {
                const item = this._tabContext.getTabItemAt(0);

                if(item === null) break;

                removed.push(item);
                this._tabContext.removeTabItem(item);
            }

            for(const item of removed)
            {
                const id = (item as unknown as IWindow).id;

                if(!((id === 1 && !eventInfoEnabled) || id === 6)) this._tabContext.addTabItem(item);
            }
        }

        for(const tab of navigator.tabs.tabs)
        {
            const button = this._tabContext?.getTabItemByID(tab.id) ?? null;

            if(button !== null)
            {
                (button as unknown as IWindow).addEventListener('WE_SELECTED', this.onTabSelected);
                tab.button = button;
            }
        }

        this._mainWindow.scaler.setParamFlag(12288, false);
        this._mainWindow.scaler.setParamFlag(8192, true);
        (this._mainWindow as unknown as IWindow).position = MainViewCtrl.DEFAULT_VIEW_LOCATION;

        this.createSearchInput();
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::createSearchInput()
    private createSearchInput(): void
    {
        if(this._navigator === null || this._mainWindow === null) return;

        const window = this._mainWindow as unknown as IWindowContainer;

        if(this._searchInput === null)
        {
            const header = window.findChildByName('search_header') as IWindowContainer | null;

            if(header !== null) this._searchInput = new TextSearchInputs(this._navigator, header);
        }

        const header = window.findChildByName('search_header');

        if(header !== null) header.visible = true;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refresh()
    refresh(): void
    {
        if(this._mainWindow === null || this._content === null) return;
        if(this._customContent === null || this._customFooter === null || this._listContent === null) return;

        this.refreshTab();
        this.refreshCustomContent();
        this.refreshListContent(true);
        this.refreshFooter();

        this._customContent.height = Util.getLowestPoint(this._customContent);
        this._customFooter.height = Util.getLowestPoint(this._customFooter);

        const listTop = Math.trunc((this._listContent as unknown as IWindow).y);

        Util.moveChildrenToColumn(
            this._content,
            ['custom_content', 'list_content'],
            (this._customContent as unknown as IWindow).y,
            8
        );

        this._listContent.height = this._listContent.height
            + listTop
            - (this._listContent as unknown as IWindow).y
            - this._customFooter.height
            + this._previousFooterHeight;

        Util.moveChildrenToColumn(
            this._content,
            ['list_content', 'custom_footer'],
            (this._listContent as unknown as IWindow).y,
            0
        );

        this._previousFooterHeight = this._customFooter.height;

        this.onResizeTimer();
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshTab()
    private refreshTab(): void
    {
        const selected = this._navigator?.tabs.getSelected() ?? null;
        const current = this._tabContext?.selector?.getSelected() ?? null;

        if(selected === null || selected.button === current) return;

        this._ignoreNextTabSelect = true;

        if(selected.button !== null)
        {
            this._tabContext?.selector?.setSelected(selected.button as unknown as ISelectableWindow);
        }
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshCustomContent()
    private refreshCustomContent(): void
    {
        if(this._customContent === null) return;

        Util.hideChildren(this._customContent);

        this._navigator?.tabs.getSelected()?.tabPageDecorator.refreshCustomContent(this._customContent);

        if(Util.hasVisibleChildren(this._customContent))
        {
            this._customContent.visible = true;
        }
        else
        {
            this._customContent.visible = false;
            (this._customContent as unknown as IWindow).blend = 1;
        }
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshFooter()
    private refreshFooter(): void
    {
        if(this._customFooter === null) return;

        Util.hideChildren(this._customFooter);

        this._navigator?.tabs.getSelected()?.tabPageDecorator.refreshFooter(this._customFooter);

        this._customFooter.visible = Util.hasVisibleChildren(this._customFooter);
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshListContent()
    private refreshListContent(doRefresh: boolean): void
    {
        if(this._listContent === null || this._navigator === null) return;

        Util.hideChildren(this._listContent);

        const selected = this._navigator.tabs.getSelected();
        const data = this._navigator.data;
        const adTab = data.guestRoomSearchArrived && selected?.defaultSearchType === 16;

        this.refreshRoomAds(doRefresh, adTab);
        this.refreshGuestRooms(doRefresh, !adTab);
        this.refreshPopularTags(doRefresh, data.popularTagsArrived);
        this.refreshOfficialRooms(doRefresh, data.officialRoomsArrived);
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshGuestRooms()
    private refreshGuestRooms(doRefresh: boolean, show: boolean): void
    {
        this.refreshList(doRefresh, show, this._guestRooms, 'guest_rooms');
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshPopularTags()
    private refreshPopularTags(doRefresh: boolean, show: boolean): void
    {
        this.refreshList(doRefresh, show, this._popularTags, 'popular_tags');
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshOfficialRooms()
    private refreshOfficialRooms(doRefresh: boolean, show: boolean): void
    {
        this.refreshList(doRefresh, show, this._officialRooms, 'official_rooms');
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshRoomAds()
    private refreshRoomAds(doRefresh: boolean, show: boolean): void
    {
        this.refreshList(doRefresh, show, this._roomAds, 'room_ads');
    }

    /**
	 * Called from nowhere in any tree — `refreshListContent()` refreshes the other four and skips
	 * this one, so `CategoryListCtrl` is constructed, has its `content` cleared on close, and is
	 * never filled. Kept because the container it names exists in the layout and the controller is
	 * otherwise complete.
	 */
    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshCategoryList()
    private refreshCategoryList(doRefresh: boolean, show: boolean): void
    {
        this.refreshList(doRefresh, show, this._categories, 'categories_container');
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::refreshList()
    private refreshList(doRefresh: boolean, show: boolean, ctrl: IViewCtrl | null, childName: string): void
    {
        if(!show || ctrl === null) return;

        if(ctrl.content === null)
        {
            ctrl.content = (this._listContent?.findChildByName(childName) as IWindowContainer | null) ?? null;
        }

        if(doRefresh) ctrl.refresh();

        if(ctrl.content !== null) ctrl.content.visible = true;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::onWindowClose()
    private onWindowClose = (): void =>
    {
        log.debug('Close navigator window');
        this.close();
    };

    // AS3: .../navigator/mainview/MainViewCtrl.as::onTabSelected()
    private onTabSelected = (event: WindowEvent): void =>
    {
        if(this._ignoreNextTabSelect)
        {
            this._ignoreNextTabSelect = false;

            return;
        }

        const target = event.target as IWindow | null;
        const id = target?.id ?? 0;
        const tab = this._navigator?.tabs.getTab(id) ?? null;

        if(tab === null) return;

        tab.sendSearchRequest();

        switch(tab.id - 1)
        {
            case 0:
                this._navigator?.events.emit(HabboNavigatorTrackingEvent.EVENTS);
                this._navigator?.send(new RoomAdEventTabViewedComposer());
                break;
            case 1:
                this._navigator?.events.emit(HabboNavigatorTrackingEvent.ROOMS);
                break;
            case 2:
                this._navigator?.events.emit(HabboNavigatorTrackingEvent.ME);
                break;
            case 3:
                this._navigator?.events.emit(HabboNavigatorTrackingEvent.OFFICIAL);
                break;
            case 4:
                this._navigator?.events.emit(HabboNavigatorTrackingEvent.SEARCH);
                break;
            case 5:
                this._navigator?.events.emit(HabboNavigatorTrackingEvent.CATEGORIES);
                break;
        }
    };

    // AS3: .../navigator/mainview/MainViewCtrl.as::reloadRoomList()
    reloadRoomList(searchType: number): boolean
    {
        ErrorReportStorage.addDebugData('MainViewCtrl', 'Reloading RoomList');

        const results = this._navigator?.data.guestRoomSearchResults ?? null;

        if(this.isOpen() && results !== null && results.searchType === searchType)
        {
            const selectedId = this._navigator?.tabs.getSelected()?.id ?? 0;

            this.startSearch(selectedId, searchType, '');

            return true;
        }

        return false;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::startSearch()
    startSearch(tabId: number, searchType: number, query: string = '-1', searchMsg: number = 1): void
    {
        const navigator = this._navigator;

        if(navigator === null) return;

        const previous = navigator.tabs.getSelected();

        navigator.tabs.setSelectedTab(tabId);

        const current = navigator.tabs.getSelected();

        ErrorReportStorage.addDebugData(
            'StartSearch', `Start search ${previous?.id ?? -1} => ${current?.id ?? -1}`
        );

        if(this._isPhaseOneNavigator && query.substr(0, 1) === '#')
        {
            searchType = 9;
            query = query.substr(1, query.length - 1);
        }

        this._tabChanged = previous !== current;

        if(previous !== current) current?.tabPageDecorator.tabSelected();

        navigator.data.startLoading();

        if(searchMsg === MainViewCtrl.SEARCHMSG_SEARCH)
        {
            const composer = this.getSearchMsg(searchType, query);

            if(composer !== null) navigator.send(composer);
        }
        else if(searchMsg === MainViewCtrl.SEARCHMSG_POPULARTAGS)
        {
            navigator.send(new GetPopularRoomTagsMessageComposer());
        }
        else if(searchMsg !== MainViewCtrl.SEARCHMSG_NONE)
        {
            navigator.send(new GetOfficialRoomsMessageComposer(navigator.data.adIndex));
        }

        if(!this.isOpen())
        {
            this.open();

            this._blendStage = MainViewCtrl.BLEND_STAGE_LOADING;

            if(this._listContent !== null) (this._listContent as unknown as IWindow).blend = 0;

            if(this._customContent !== null && this._customContent.visible)
            {
                (this._customContent as unknown as IWindow).blend = 0;

                if(this._customFooter !== null) (this._customFooter as unknown as IWindow).blend = 0;
            }
        }
        else
        {
            this._blendStage = MainViewCtrl.BLEND_STAGE_BLENDING_OUT;
        }

        this._loadingTicks = 0;

        navigator.registerUpdateReceiver(this, 2);
        this.sendTrackingEvent(searchType);

        navigator.data.competitionRoomsData = null;

        if(this._isPhaseOneNavigator && this._searchInput !== null && query !== '-1' && searchType !== 1)
        {
            this._searchInput.setText(query, searchType);
        }
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::sendTrackingEvent()
    private sendTrackingEvent(searchType: number): void
    {
        const events = this._navigator?.events ?? null;

        if(events === null) return;

        switch(searchType)
        {
            case 6:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_MY_FAVOURITES);
                break;
            case 3:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_MY_FRIENDS_ROOMS);
                break;
            case 7:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_MY_HISTORY);
                break;
            case 5:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_MY_ROOMS);
                break;
            case 11:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_OFFICIALROOMS);
                break;
            case 1:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_POPULAR_ROOMS);
                break;
            case 4:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_ROOMS_WHERE_MY_FRIENDS_ARE);
                break;
            case 2:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_ROOMS_WITH_HIGHEST_SCORE);
                break;
            case 9:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_TAG_SEARCH);
                break;
            case 8:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_TEXT_SEARCH);
                break;
            case 23:
                events.emit(HabboNavigatorTrackingEvent.SEARCHTYPE_MY_FREQUENT_HISTORY);
                break;
        }
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::getSearchMsg()
    private getSearchMsg(searchType: number, query: string): IMessageComposer<unknown[]> | null
    {
        const data = this._navigator?.data ?? null;

        if(data === null) return null;

        switch(searchType)
        {
            case 6:
                return new MyFavouriteRoomsSearchMessageComposer();
            case 3:
                return new MyFriendsRoomsSearchMessageComposer();
            case 7:
                return new MyRoomHistorySearchMessageComposer();
            case 5:
                return new MyRoomsSearchMessageComposer();
            case 1:
                return new PopularRoomsSearchMessageComposer(query, data.adIndex);
            case 4:
                return new RoomsWhereMyFriendsAreSearchMessageComposer();
            case 2:
                return new RoomsWithHighestScoreSearchMessageComposer(data.adIndex);
            case 9:
                return new RoomTextSearchMessageComposer(`tag:${query}`);
            case 8:
                return new RoomTextSearchMessageComposer(query);
            case 13:
                return new RoomTextSearchMessageComposer(`group:${query}`);
            case 10:
                return new RoomTextSearchMessageComposer(`roomname:${query}`);
            case 14:
                return new GuildBaseSearchMessageComposer(data.adIndex);
            case 15:
            {
                const competition = data.competitionRoomsData;

                if(competition === null) return null;

                return new CompetitionRoomsSearchMessageComposer(competition.goalId, competition.pageIndex);
            }
            case 16:
            case 17:
                return new RoomAdSearchMessageComposer(data.adIndex, searchType);
            case 18:
                return new MyRoomRightsSearchMessageComposer();
            case 19:
                return new MyGuildBasesSearchMessageComposer();
            case 20:
                return new RoomTextSearchMessageComposer(`owner:${query}`);
            case 22:
                return new MyRecommendedRoomsMessageComposer();
            case 23:
                return new MyFrequentRoomHistorySearchMessageComposer();
            default:
                log.warn(`No message for searchType: ${searchType}`);

                return null;
        }
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::update()
    update(deltaTime: number): void
    {
        if(this._listContent === null) return;

        const listContent = this._listContent as unknown as IWindow;
        const customContent = this._customContent as unknown as IWindow | null;
        const customFooter = this._customFooter as unknown as IWindow | null;
        const step = deltaTime / 150;

        if(this._blendStage === MainViewCtrl.BLEND_STAGE_BLENDING_OUT)
        {
            const blend = Math.min(1, Math.max(0, listContent.blend - step));

            listContent.blend = blend;

            if(customContent !== null) customContent.blend = this._tabChanged ? blend : 1;
            if(customFooter !== null) customFooter.blend = this._tabChanged ? blend : 1;

            if(blend === 0) this._blendStage = MainViewCtrl.BLEND_STAGE_LOADING;
        }
        else if(this._blendStage === MainViewCtrl.BLEND_STAGE_LOADING)
        {
            if(this._loadingTicks % 10 === 1 && this._loadingText !== null)
            {
                this._loadingText.visible = !this._loadingText.visible;
            }

            this._loadingTicks = this._loadingTicks + 1;

            if(!(this._navigator?.data.isLoading() ?? false))
            {
                this._blendStage = MainViewCtrl.BLEND_STAGE_REFRESHING;
            }
        }
        else if(this._blendStage === MainViewCtrl.BLEND_STAGE_REFRESHING)
        {
            this.refresh();
            this._blendStage = MainViewCtrl.BLEND_STAGE_BLENDING_IN;
        }
        else
        {
            if(this._loadingText !== null) this._loadingText.visible = false;

            const blend = Math.min(1, Math.max(0, listContent.blend + step));

            listContent.blend = blend;

            if(customContent !== null) customContent.blend = this._tabChanged ? blend : 1;
            if(customFooter !== null) customFooter.blend = this._tabChanged ? blend : 1;

            if(listContent.blend >= 1) this._navigator?.removeUpdateReceiver(this);
        }
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::onWindowResized()
    private onWindowResized = (event: WindowEvent): void =>
    {
        if(event.target !== (this._mainWindow as unknown as IWindow)) return;

        if(this._resizeTimer === null)
        {
            this._resizeTimer = setTimeout(() =>
            {
                this._resizeTimer = null;
                this.onResizeTimer();
            }, MainViewCtrl.RESIZE_TIMER_MS);
        }
    };

    /**
	 * AS3 ends this with an empty `if(_navigator.isPerkAllowed("NAVIGATOR_PHASE_ONE_2014")){}` —
	 * the branch has no body in any tree. Not reproduced; noted so nobody goes looking for what it
	 * was meant to do.
	 */
    // AS3: .../navigator/mainview/MainViewCtrl.as::onResizeTimer()
    private onResizeTimer(): void
    {
        MainViewCtrl.refreshScrollbar(this._popularTags, false);
        MainViewCtrl.refreshScrollbar(this._guestRooms, false);
        MainViewCtrl.refreshScrollbar(this._roomAds, false);
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::get searchInput()
    get searchInput(): TextSearchInputs | null
    {
        return this._searchInput;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::openAtPosition()
    openAtPosition(x: number, y: number): void
    {
        this.reloadData();

        if(this._mainWindow === null) return;

        const window = this._mainWindow as unknown as IWindow;

        if(!Number.isNaN(x) && !Number.isNaN(y))
        {
            window.position = {x, y};
        }
        else if(window.position.x === 0)
        {
            window.position = MainViewCtrl.DEFAULT_VIEW_LOCATION;
        }
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::get isPhaseOneNavigator()
    get isPhaseOneNavigator(): boolean
    {
        return this._isPhaseOneNavigator;
    }

    // AS3: .../navigator/mainview/MainViewCtrl.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._navigator = null;

        if(this._mainWindow !== null)
        {
            (this._mainWindow as unknown as IWindow).dispose();
            this._mainWindow = null;
        }

        if(this._windowToggle !== null)
        {
            this._windowToggle.dispose();
            this._windowToggle = null;
        }

        if(this._content !== null)
        {
            (this._content as unknown as IWindow).dispose();
            this._content = null;
        }

        if(this._resizeTimer !== null)
        {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = null;
        }

        if(this._popularTags !== null)
        {
            this._popularTags.dispose();
            this._popularTags = null;
        }

        if(this._guestRooms !== null)
        {
            this._guestRooms.dispose();
            this._guestRooms = null;
        }

        if(this._officialRooms !== null)
        {
            this._officialRooms.dispose();
            this._officialRooms = null;
        }

        if(this._roomAds !== null)
        {
            this._roomAds.dispose();
            this._roomAds = null;
        }

        if(this._searchInput !== null)
        {
            this._searchInput.dispose();
            this._searchInput = null;
        }
    }
}
