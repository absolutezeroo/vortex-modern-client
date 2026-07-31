import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {Util} from './Util';
import {FriendListTabsView} from './FriendListTabsView';
import type {HabboFriendList} from './HabboFriendList';

const logger = Logger.getLogger('habbo.friendlist.FriendListView');

/**
 * FriendListView
 *
 * The friend list window itself — frame, footer, info line — and the resize loop that
 * keeps it the size of whichever tab is open.
 *
 * Sizing runs both ways and that is the subtle part. `refreshWindowSize()` sets the
 * window from the tab's content, and a user drag sets the tab's content from the
 * window; both end in a `WE_RESIZED`, so the first guards itself with
 * `_ignoreResizeEvents` to keep the second from firing on its own output.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/FriendListView.as
 */
export class FriendListView
{
    /** Left edge the window is never dragged past — the toolbar lives left of it. */
    // AS3: .../FriendListView.as::MIN_LEFT_MARGIN
    private static readonly MIN_LEFT_MARGIN: number = 110;

    // AS3: .../FriendListView.as::DEFAULT_LOCATION
    private static readonly DEFAULT_LOCATION: {x: number; y: number} = {x: 110, y: 50};

    // AS3: .../FriendListView.as::FriendListView()
    constructor(friendList: HabboFriendList)
    {
        this._friendList = friendList;
        this._tabsView = new FriendListTabsView(this._friendList);
    }

    // AS3: .../FriendListView.as::_friendList
    private _friendList: HabboFriendList;

    // AS3: .../FriendListView.as::_SafeStr_8719
    private _tabsView: FriendListTabsView;

    // AS3: .../FriendListView.as::_SafeStr_4565
    private _window: IFrameWindow | null = null;

    // AS3: .../FriendListView.as::_SafeStr_10012
    private _mainContent: IWindowContainer | null = null;

    // AS3: .../FriendListView.as::_SafeStr_5068
    private _footer: IWindowContainer | null = null;

    // AS3: .../FriendListView.as::_SafeStr_8059
    private _infoText: ITextWindow | null = null;

    // AS3: .../FriendListView.as::_SafeStr_6155
    private _lastWindowHeight: number = -1;

    // AS3: .../FriendListView.as::_lastWindowWidth
    private _lastWindowWidth: number = -1;

    // AS3: .../FriendListView.as::_ignoreResizeEvents
    private _ignoreResizeEvents: boolean = false;

    // AS3: .../FriendListView.as::get mainWindow()
    get mainWindow(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../FriendListView.as::openFriendList()
    openFriendList(): void
    {
        if(this._window === null)
        {
            this.prepare();

            if(this._window !== null)
            {
                (this._window as IWindow).position = FriendListView.DEFAULT_LOCATION;
            }
        }
        else
        {
            this._window.visible = true;
            this._window.activate();
        }
    }

    /**
     * The hover help line at the bottom of the window: filled on `WME_OVER`, blanked
     * on `WME_OUT`. Every control that has a tip routes its own events through here.
     */
    // AS3: .../FriendListView.as::showInfo()
    showInfo(event: WindowEvent, text: string): void
    {
        const mouseEvent = event as WindowMouseEvent;

        if(mouseEvent === null || this._infoText === null)
        {
            return;
        }

        if(mouseEvent.type === 'WME_OUT')
        {
            this._infoText.text = '';
        }
        else if(mouseEvent.type === 'WME_OVER')
        {
            this._infoText.text = text;
        }
    }

    // AS3: .../FriendListView.as::refresh()
    refresh(reason: string): void
    {
        if(this._window === null)
        {
            return;
        }

        this._tabsView.refresh(reason);
        this.refreshWindowSize();
    }

    // AS3: .../FriendListView.as::close()
    close(): void
    {
        if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    // AS3: .../FriendListView.as::isOpen()
    isOpen(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    /**
     * Puts the window's bottom-left corner at `point`, clamped so it stays on the
     * desktop and clear of the toolbar — this is how the toolbar button opens it.
     */
    // AS3: .../FriendListView.as::alignBottomLeftTo()
    alignBottomLeftTo(point: {x: number; y: number}): void
    {
        if(this._window === null)
        {
            return;
        }

        const target = {x: point.x, y: point.y - this._window.height};
        const desktopWidth = this._friendList.windowManager?.getWindowContext(1).getDesktopWindow()?.width ?? 0;

        target.x = Math.min(desktopWidth - this._window.width, target.x);
        target.x = Math.max(FriendListView.MIN_LEFT_MARGIN, target.x);

        (this._window as IWindow).position = target;
    }

    // AS3: .../FriendListView.as::prepare()
    private prepare(): void
    {
        const window = this._friendList.getXmlWindow('main_window') as IFrameWindow | null;

        if(window === null)
        {
            logger.error('prepare: getXmlWindow("main_window") returned null - layout not registered?');

            return;
        }

        this._window = window;

        const closeButton = window.findChildByTag('close');

        if(closeButton !== null)
        {
            closeButton.procedure = this.onWindowClose;
        }

        this._mainContent = window.content.findChildByName('main_content') as IWindowContainer | null;
        this._footer = window.content.findChildByName('footer') as IWindowContainer | null;

        if(this._mainContent !== null)
        {
            this._tabsView.prepare(this._mainContent);
        }

        window.procedure = this.onWindow;
        window.content.setParamFlag(3072, false);
        window.content.setParamFlag(0, true);
        window.header.setParamFlag(192, false);
        window.header.setParamFlag(0, true);
        window.content.setParamFlag(192, false);
        window.content.setParamFlag(0, true);

        // The category editor is a web page, so it is hidden both when the feature is
        // off and when the client is running inside the SPA web wrapper, which has no
        // place to open it.
        const categoryManagementEnabled = this._friendList.getBoolean('friendship.category.management.enabled');
        const editCategoriesButton = window.findChildByName('open_edit_ctgs_but');

        if(editCategoriesButton !== null)
        {
            if(categoryManagementEnabled && this._friendList.getInteger('spaweb', 0) !== 1)
            {
                editCategoriesButton.procedure = this.onEditCategoriesButtonClick;
            }
            else
            {
                editCategoriesButton.visible = false;
            }
        }

        this._infoText = window.findChildByName('info_text') as ITextWindow | null;

        if(this._infoText !== null)
        {
            this._infoText.text = '';
        }

        this._friendList.refreshButton(window, 'open_edit_ctgs', true, null, 0);
        this.refresh('prepare');

        window.height = 350;
        window.width = 230;
    }

    // AS3: .../FriendListView.as::onWindowClose()
    private onWindowClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug('Close window');

        if(this._window !== null)
        {
            this._window.visible = false;
        }

        this._friendList.trackFriendListEvent('HABBO_FRIENDLIST_TRACKING_EVENT_CLOSED');
        this._friendList.categories?.view.refreshed();
    };

    /**
     * A drag or a resize invalidates every row position the friends tab cached, hence
     * the `refreshed()` on both. Only a resize of the window itself feeds back into
     * the tab's own size.
     */
    // AS3: .../FriendListView.as::onWindow()
    private onWindow = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WE_RELOCATE' || event.type === 'WE_RESIZED')
        {
            this._friendList.categories?.view.refreshed();
        }

        if(event.type !== 'WE_RESIZED' || window !== (this._window as unknown as IWindow))
        {
            return;
        }

        if(this._ignoreResizeEvents || this._window === null)
        {
            return;
        }

        const tabs = this._friendList.tabs;

        if(tabs === null)
        {
            return;
        }

        const deltaHeight = this._lastWindowHeight === -1 ? 0 : this._window.height - this._lastWindowHeight;
        const deltaWidth = this._lastWindowWidth === -1 ? 0 : this._window.width - this._lastWindowWidth;

        tabs.tabContentHeight = Math.max(100, tabs.tabContentHeight + deltaHeight);
        tabs.windowWidth = Math.max(147, tabs.windowWidth + deltaWidth);

        this.refresh(`resize: ${deltaHeight}`);
    };

    /**
     * Sizes the window bottom-up: the footer goes below the lowest visible child, the
     * content box is cut to that height, and the frame adds its 30px of chrome.
     *
     * The scaler is only enabled while a tab is open — a closed friend list is just a
     * header strip and has nothing to resize.
     */
    // AS3: .../FriendListView.as::refreshWindowSize()
    private refreshWindowSize(): void
    {
        if(this._window === null || this._footer === null)
        {
            return;
        }

        const tabs = this._friendList.tabs;

        if(tabs === null)
        {
            return;
        }

        this._ignoreResizeEvents = true;

        this._footer.visible = false;
        this._footer.y = Util.getLowestPoint(this._window.content);
        this._footer.width = tabs.windowWidth;
        this._footer.visible = true;

        this._window.content.height = Util.getLowestPoint(this._window.content);
        this._window.content.width = tabs.windowWidth - 10;
        this._window.header.width = tabs.windowWidth - 10;
        this._window.height = this._window.content.height + 30;
        this._window.width = tabs.windowWidth;

        this._ignoreResizeEvents = false;

        const scaler = this._window.scaler;

        scaler.setParamFlag(12288, false);
        scaler.setParamFlag(12288, tabs.findSelectedTab() !== null);
        scaler.setParamFlag(192, false);
        scaler.setParamFlag(3072, false);
        scaler.x = this._window.width - scaler.width;
        scaler.y = this._window.height - scaler.height;

        this._lastWindowHeight = this._window.height;
        this._lastWindowWidth = this._window.width;

        logger.trace(`RESIZED: ${tabs.windowWidth}`);
    }

    // AS3: .../FriendListView.as::onEditCategoriesButtonClick()
    private onEditCategoriesButtonClick = (event: WindowEvent, _window: IWindow): void =>
    {
        this._friendList.view?.showInfo(event, '${friendlist.tip.preferences}');

        if(event.type !== 'WME_CLICK')
        {
            return;
        }

        logger.debug('Edit categories clicked');

        const mouseEvent = event as WindowMouseEvent;

        this._friendList.openHabboWebPage('link.format.friendlist.pref', new Map<string, string>(), mouseEvent.stageX, mouseEvent.stageY);
    };
}
