import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import {imageElementToBitmap} from '@core/utils/BitmapSlot';
import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboMessenger} from '@habbo/messenger/IHabboMessenger';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import {HabboFaceFocuser} from '@habbo/utils/HabboFaceFocuser';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboMessenger} from '@iid/IIDHabboMessenger';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';

import type {IHabboFriendListEvents, IHabboFriendList} from './IHabboFriendList';
import type {IFriend} from './IFriend';
import type {IFriendRequestsView} from './IFriendRequestsView';

// Data classes
import type {FriendData} from '@habbo/communication/messages/parser/friendlist/FriendData';
import type {FriendRequestData} from '@habbo/communication/messages/parser/friendlist/FriendRequestData';

// Events
import {MessengerInitEvent} from '@habbo/communication/messages/incoming/friendlist/MessengerInitEvent';
import {
    FriendListFragmentMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FriendListFragmentMessageEvent';
import {
    FriendListUpdateMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FriendListUpdateMessageEvent';
import {FriendRequestsMessageEvent} from '@habbo/communication/messages/incoming/friendlist/FriendRequestsMessageEvent';
import {
    NewFriendRequestMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/NewFriendRequestMessageEvent';
import {
    AcceptFriendResultMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/AcceptFriendResultMessageEvent';
import {
    HabboSearchResultMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/HabboSearchResultMessageEvent';
import {
    FollowFriendFailedMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/FollowFriendFailedMessageEvent';
import {
    RoomInviteErrorMessageEvent
} from '@habbo/communication/messages/incoming/friendlist/RoomInviteErrorMessageEvent';
import {MessengerErrorEvent} from '@habbo/communication/messages/incoming/friendlist/MessengerErrorEvent';
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import {UserRightsMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserRightsMessageEvent';

// Parsers
import type {MessengerInitParser} from '@habbo/communication/messages/parser/friendlist/MessengerInitParser';
import type {
    FriendListFragmentMessageParser
} from '@habbo/communication/messages/parser/friendlist/FriendListFragmentMessageParser';
import type {
    FriendRequestsMessageParser
} from '@habbo/communication/messages/parser/friendlist/FriendRequestsMessageParser';
import type {
    NewFriendRequestMessageParser
} from '@habbo/communication/messages/parser/friendlist/NewFriendRequestMessageParser';
import type {
    AcceptFriendResultMessageParser
} from '@habbo/communication/messages/parser/friendlist/AcceptFriendResultMessageParser';
import type {
    HabboSearchResultMessageParser
} from '@habbo/communication/messages/parser/friendlist/HabboSearchResultMessageParser';
import type {
    FollowFriendFailedMessageParser
} from '@habbo/communication/messages/parser/friendlist/FollowFriendFailedMessageParser';
import type {
    RoomInviteErrorMessageParser
} from '@habbo/communication/messages/parser/friendlist/RoomInviteErrorMessageParser';
import type {
    MessengerErrorMessageParser
} from '@habbo/communication/messages/parser/friendlist/MessengerErrorMessageParser';
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';

// Composers
import {
    MessengerInitMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/MessengerInitMessageComposer';
import {
    GetFriendRequestsMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/GetFriendRequestsMessageComposer';
import {
    FriendListUpdateMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/FriendListUpdateMessageComposer';
import {
    RequestFriendMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/RequestFriendMessageComposer';
import {
    AcceptFriendMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/AcceptFriendMessageComposer';
import {
    DeclineFriendMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/DeclineFriendMessageComposer';
import {
    RemoveFriendMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/RemoveFriendMessageComposer';
import {
    SetRelationshipStatusMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/SetRelationshipStatusMessageComposer';
import {
    FindNewFriendsMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/FindNewFriendsMessageComposer';
import {HabboSearchMessageComposer} from '@habbo/communication/messages/outgoing/friendlist/HabboSearchMessageComposer';

// Own module
import {FriendListLookAndFeel} from './FriendListLookAndFeel';
import {FriendListTabEnum} from './FriendListTabEnum';
import {FriendListView} from './FriendListView';
import {OpenedToWebPopup} from './OpenedToWebPopup';
import {RelationshipStatusEnum} from './RelationshipStatusEnum';
import {SearchView} from './SearchView';
import {Util} from './Util';
import {Friend} from './domain/Friend';
import {FriendCategory} from './domain/FriendCategory';
import {FriendCategories} from './domain/FriendCategories';
import {FriendCategoriesDeps} from './domain/FriendCategoriesDeps';
import {FriendRequest} from './domain/FriendRequest';
import {FriendRequests} from './domain/FriendRequests';
import {FriendRequestsDeps} from './domain/FriendRequestsDeps';
import {FriendListTabs} from './domain/FriendListTabs';
import {FriendListTabsDeps} from './domain/FriendListTabsDeps';
import {AvatarSearchResults} from './domain/AvatarSearchResults';
import {AvatarSearchDeps} from './domain/AvatarSearchDeps';
import type {HabboFriendListTrackingEvent} from './events/HabboFriendListTrackingEvent';

const log = Logger.getLogger('habbo.friendlist.HabboFriendList');

/**
 * HabboFriendList
 *
 * The friend list component: owns the categories, the pending requests, the search
 * results and the window, and is the single object every view reaches back through.
 *
 * Initialisation is in two stages and order matters. The fragments (`onFriendsListFragment`)
 * can arrive before the messenger init that creates the categories they are filed into,
 * so the two built-in categories and every listener beyond the first three are set up
 * in `onMessengerInit()`, not in `initComponent()`.
 *
 * This class also implements `IAvatarImageListener`: it asks for face bitmaps as rows
 * are painted, and repaints them here when the figure's assets finish downloading.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/HabboFriendList.as
 */
export class HabboFriendList extends Component implements IHabboFriendList, IAvatarImageListener, ILinkEventTracker
{
    // AS3: .../HabboFriendList.as::AVATAR_FACE_NAME
    static readonly AVATAR_FACE_NAME: string = 'face';

    /** How often the client asks the server for a friend list delta. */
    // AS3: .../HabboFriendList.as::onMessengerInit() `new Timer(1000000)`
    private static readonly UPDATE_INTERVAL: number = 1000000;

    // AS3: .../HabboFriendList.as::HabboFriendList()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);

        this._categories = new FriendCategories(new FriendCategoriesDeps(this));
        this._avatarSearchResults = new AvatarSearchResults(new AvatarSearchDeps(this));
        this._laf = new FriendListLookAndFeel();
    }

    // AS3: .../HabboFriendList.as::_communication
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: .../HabboFriendList.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: .../HabboFriendList.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: .../HabboFriendList.as::_messenger
    private _messenger: IHabboMessenger | null = null;

    // AS3: .../HabboFriendList.as::get messenger()
    get messenger(): IHabboMessenger | null
    {
        return this._messenger;
    }

    // AS3: .../HabboFriendList.as::_localization
    private _localization: IHabboLocalizationManager | null = null;

    // AS3: .../HabboFriendList.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._localization;
    }

    // AS3: .../HabboFriendList.as::_notifications
    private _notifications: IHabboNotifications | null = null;

    // AS3: .../HabboFriendList.as::get notifications()
    get notifications(): IHabboNotifications | null
    {
        return this._notifications;
    }

    // AS3: .../HabboFriendList.as::_tracking
    private _tracking: IHabboTracking | null = null;

    // AS3: .../HabboFriendList.as::get tracking()
    get tracking(): IHabboTracking | null
    {
        return this._tracking;
    }

    // AS3: .../HabboFriendList.as::_avatarManager
    private _avatarManager: IAvatarRenderManager | null = null;

    // AS3: .../HabboFriendList.as::get avatarManager()
    get avatarManager(): IAvatarRenderManager | null
    {
        return this._avatarManager;
    }

    // AS3: .../HabboFriendList.as::_sessionData
    private _sessionData: ISessionDataManager | null = null;

    // AS3: .../HabboFriendList.as::_SafeStr_9809
    private _laf: FriendListLookAndFeel;

    // AS3: .../HabboFriendList.as::get laf()
    get laf(): FriendListLookAndFeel
    {
        return this._laf;
    }

    // AS3: .../HabboFriendList.as::_categories
    private _categories: FriendCategories;

    // AS3: .../HabboFriendList.as::get categories()
    get categories(): FriendCategories | null
    {
        return this._categories;
    }

    // AS3: .../HabboFriendList.as::_SafeStr_4724
    private _friendRequests: FriendRequests | null = null;

    // AS3: .../HabboFriendList.as::get friendRequests()
    get friendRequests(): FriendRequests | null
    {
        return this._friendRequests;
    }

    // AS3: .../HabboFriendList.as::_avatarSearchResults
    private _avatarSearchResults: AvatarSearchResults;

    // AS3: .../HabboFriendList.as::get searchResults()
    get searchResults(): AvatarSearchResults | null
    {
        return this._avatarSearchResults;
    }

    // AS3: .../HabboFriendList.as::_SafeStr_4550
    private _view: FriendListView | null = null;

    // AS3: .../HabboFriendList.as::get view()
    get view(): FriendListView | null
    {
        return this._view;
    }

    // AS3: .../HabboFriendList.as::_SafeStr_5431
    private _tabs: FriendListTabs | null = null;

    // AS3: .../HabboFriendList.as::get tabs()
    get tabs(): FriendListTabs | null
    {
        return this._tabs;
    }

    // AS3: .../HabboFriendList.as::_openedToWebPopup
    private _openedToWebPopup: OpenedToWebPopup | null = null;

    // AS3: .../HabboFriendList.as::_SafeStr_7521
    private _avatarId: number = 0;

    // AS3: .../HabboFriendList.as::get avatarId()
    get avatarId(): number
    {
        return this._avatarId;
    }

    // AS3: .../HabboFriendList.as::_SafeStr_5800
    private _updateTimerId: ReturnType<typeof setInterval> | null = null;

    // AS3: .../HabboFriendList.as::_SafeStr_9383
    private _currentTabId: number = FriendListTabEnum.VIEW_CLOSED;

    // AS3: .../HabboFriendList.as::_SafeStr_9387
    private _initialized: boolean = false;

    // AS3: .../HabboFriendList.as::get hasfriendsListInitialized()
    get hasFriendsListInitialized(): boolean
    {
        return this._initialized;
    }

    /** Starts one full delay in the past, so the first invitation is never throttled. */
    // AS3: .../HabboFriendList.as::_lastRoomInvitationTime
    private _lastRoomInvitationTime: number = -60000;

    // AS3: .../HabboFriendList.as::get lastRoomInvitationTime()
    get lastRoomInvitationTime(): number
    {
        return this._lastRoomInvitationTime;
    }

    // AS3: .../HabboFriendList.as::resetLastRoomInvitationTime()
    resetLastRoomInvitationTime(): void
    {
        this._lastRoomInvitationTime = this.getTimer();
    }

    // AS3: flash.utils.getTimer() - TS-only helper, matching HabboCatalog.getTimer().
    getTimer(): number
    {
        if(typeof performance !== 'undefined')
        {
            return Math.floor(performance.now());
        }

        return Date.now();
    }

    /**
     * Every message event this component registered, so `dispose()` can remove them all.
     * AS3 does not track them: its component base tears the registrations down.
     */
    // TS-only: no AS3 counterpart.
    private _messageEvents: IMessageEvent[] = [];

    /**
     * Port-specific: a typed bus the rest of the client listens on. AS3 has no
     * equivalent — its consumers read the friend list directly — but several ported
     * systems were built against it, so it is kept and fed alongside the AS3 paths.
     */
    // TS-only: no AS3 counterpart.
    private _friendListEvents: EventEmitter<IHabboFriendListEvents> = new EventEmitter<IHabboFriendListEvents>();

    // TS-only: no AS3 counterpart; exposes the bus above.
    get friendListEvents(): EventEmitter<IHabboFriendListEvents>
    {
        return this._friendListEvents;
    }

    // AS3: .../HabboFriendList.as::get mainWindow()
    get mainWindow(): IWindowContainer | null
    {
        return this._view?.mainWindow ?? null;
    }

    // AS3: .../HabboFriendList.as::get dependencies()
    protected override get dependencies(): Array<ComponentDependency<unknown>>
    {
        return [
            new ComponentDependency(IID_HabboCommunicationManager, (manager: IHabboCommunicationManager | null) =>
            {
                this._communicationManager = manager;
            }, true),
            new ComponentDependency(IID_HabboTracking, (tracking: IHabboTracking | null) =>
            {
                this._tracking = tracking;
            }, true),
            // Optional in AS3 too: the messenger may not be present in every build.
            new ComponentDependency(IID_HabboMessenger, (messenger: IHabboMessenger | null) =>
            {
                this._messenger = messenger;
            }, false),
            new ComponentDependency(IID_AvatarRenderManager, (avatarManager: IAvatarRenderManager | null) =>
            {
                this._avatarManager = avatarManager;
            }, true),
            new ComponentDependency(IID_HabboLocalizationManager, (localization: IHabboLocalizationManager | null) =>
            {
                this._localization = localization;
            }, true),
            new ComponentDependency(IID_HabboNotifications, (notifications: IHabboNotifications | null) =>
            {
                this._notifications = notifications;
            }, true),
            new ComponentDependency(IID_HabboWindowManager, (windowManager: IHabboWindowManager | null) =>
            {
                this._windowManager = windowManager;
            }, true),
            new ComponentDependency(IID_SessionDataManager, (sessionData: ISessionDataManager | null) =>
            {
                this._sessionData = sessionData;
            }, true)
        ] as Array<ComponentDependency<unknown>>;
    }

    // AS3: .../HabboFriendList.as::initComponent()
    protected override initComponent(): void
    {
        log.debug('Initializing HabboFriendList...');

        this.addMessageEvent(new UserObjectMessageEvent(this.onUserObject.bind(this)));
        this.addMessageEvent(new MessengerInitEvent(this.onMessengerInit.bind(this)));
        this.addMessageEvent(new FriendListFragmentMessageEvent(this.onFriendsListFragment.bind(this)));

        this.context.addLinkEventTracker(this);

        this.send(new MessengerInitMessageComposer());
    }

    // AS3: .../HabboFriendList.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        if(this._communicationManager?.connection)
        {
            this._communicationManager.connection.send(composer);
        }
    }

    // AS3: .../HabboFriendList.as::trackGoogle()
    trackGoogle(pageId: string, action: string, value: number = -1): void
    {
        this._tracking?.trackGoogle(pageId, action, value);
    }

    /**
     * Opens a hotel web page from a link-format property, then shows the "opened in
     * your browser" bubble at the click position — the client has no way to know
     * whether the browser actually surfaced the tab.
     */
    // AS3: .../HabboFriendList.as::openHabboWebPage()
    openHabboWebPage(linkFormat: string, parameters: Map<string, string>, x: number, y: number): void
    {
        const url = this.getProperty(linkFormat, Object.fromEntries(parameters));

        try
        {
            HabboWebTools.navigateToURL(url, 'habboMain');
        }
        catch (error)
        {
            log.error(`GOT ERROR: ${error}`);
        }

        if(this._openedToWebPopup === null)
        {
            this._openedToWebPopup = new OpenedToWebPopup(this);
        }

        this._openedToWebPopup.show(x, y);
    }

    // AS3: .../HabboFriendList.as::getText()
    getText(key: string): string
    {
        return this._localization?.getLocalization(key) ?? key;
    }

    // AS3: .../HabboFriendList.as::registerParameter()
    registerParameter(key: string, parameter: string, value: string): void
    {
        this._localization?.registerParameter(key, parameter, value);
    }

    // AS3: .../HabboFriendList.as::showLimitReachedAlert()
    showLimitReachedAlert(): void
    {
        this.registerParameter('friendlist.listfull.text', 'mylimit', `${this._friendRequests?.limit ?? 0}`);
        this.registerParameter('friendlist.listfull.text', 'clublimit', `${this._friendRequests?.clubLimit ?? 0}`);
        this.simpleAlert('${friendlist.listfull.title}', '${friendlist.listfull.text}');
    }

    // AS3: .../HabboFriendList.as::showFriendRequestSentAlert()
    showFriendRequestSentAlert(userName: string): void
    {
        this.registerParameter('friendlist.friendrequestsent.text', 'user_name', userName);
        this.simpleAlert('${friendlist.friendrequestsent.title}', '${friendlist.friendrequestsent.text}');
    }

    // AS3: .../HabboFriendList.as::simpleAlert()
    simpleAlert(title: string, message: string): void
    {
        // Slot 2 is the dialog's *subtitle*, which AS3 passes as null here; this port's wrapper
        // types it as a non-null string, so it goes out empty.
        this._windowManager?.simpleAlert(title, '', message);
    }

    // AS3: .../HabboFriendList.as::getFriend()
    getFriend(id: number): IFriend | null
    {
        if(this._view === null)
        {
            log.debug('Cannot process getFriend. Friendlist not initialized.');

            return null;
        }

        return this._categories.findFriend(id);
    }

    /**
     * Whether a friend request may be sent: not already a friend, no request sent this
     * session, and the list under its limit.
     */
    // AS3: .../HabboFriendList.as::canBeAskedForAFriend()
    canBeAskedForAFriend(userId: number): boolean
    {
        if(this._view === null)
        {
            log.debug('Cannot process canBeAskedForAFriend. Friendlist not initialized.');

            return false;
        }

        return this.getFriend(userId) === null
            && !this._avatarSearchResults.isFriendRequestSent(userId)
            && this._categories.getFriendCount(false) < (this._friendRequests?.limit ?? 0);
    }

    /**
     * Returns false only when the request is refused locally; a request already sent is
     * reported as success so the caller does not alert twice.
     */
    // AS3: .../HabboFriendList.as::askForAFriend()
    askForAFriend(userId: number, userName: string): boolean
    {
        if(this._view === null)
        {
            log.debug('Cannot ask for friend. Friendlist not initialized.');

            return false;
        }

        if(this._avatarSearchResults.isFriendRequestSent(userId))
        {
            return true;
        }

        if(!this.canBeAskedForAFriend(userId))
        {
            return false;
        }

        this.send(new RequestFriendMessageComposer(userName));
        this._avatarSearchResults.setFriendRequestSent(userId);

        // TODO(AS3): AS3 also sends `_SafePkg_.../quest/_SafeCls_2290` here - the quest
        // module's "friend request sent" progress ping. No composer of that shape exists in
        // this port's outgoing/quest yet, so the quest side of adding a friend does not
        // advance. AS3: HabboFriendList.as::askForAFriend().

        return true;
    }

    // AS3: .../HabboFriendList.as::openFriendList()
    openFriendList(): void
    {
        this.openFriendListWithTab(FriendListTabEnum.TABID_FRIENDS);
    }

    // AS3: .../HabboFriendList.as::openFriendRequests()
    openFriendRequests(): void
    {
        this.openFriendListWithTab(FriendListTabEnum.TABID_FRIEND_REQUESTS);
    }

    // AS3: .../HabboFriendList.as::openFriendSearch()
    openFriendSearch(): void
    {
        this.openFriendListWithTab(FriendListTabEnum.TABID_SEARCH);

        const searchView = this._tabs?.findTab(FriendListTabEnum.TABID_SEARCH)?.tabView ?? null;

        if(searchView instanceof SearchView)
        {
            searchView.focus();
        }
    }

    // AS3: .../HabboFriendList.as::close()
    close(): void
    {
        this._view?.close();
    }

    // AS3: .../HabboFriendList.as::alignBottomLeftTo()
    alignBottomLeftTo(point: {x: number; y: number}): void
    {
        this._view?.alignBottomLeftTo(point);
    }

    // AS3: .../HabboFriendList.as::isOpen()
    isOpen(): boolean
    {
        return this._view?.isOpen() ?? false;
    }

    /** Zero while the window is shut, whichever tab was last open. */
    // AS3: .../HabboFriendList.as::currentTabId()
    currentTabId(): number
    {
        if(this._view === null || !this._view.isOpen())
        {
            return FriendListTabEnum.VIEW_CLOSED;
        }

        return this._currentTabId;
    }

    // AS3: .../HabboFriendList.as::openFriendListWithTab()
    private openFriendListWithTab(tabId: number): void
    {
        if(this._view === null)
        {
            log.warn('Cannot open friendlist. Friendlist not initialized.');

            return;
        }

        this._view.openFriendList();

        const tab = this._tabs?.findTab(tabId) ?? null;

        if(tab !== this._tabs?.findSelectedTab())
        {
            this._tabs?.toggleSelected(tab);
            this._view.refresh('openFriendList');
        }

        this._view.mainWindow?.activate();
        this._currentTabId = tabId;
    }

    /**
     * AS3 reads `assets.getAssetByName(name + "_xml")` off the component's own library,
     * so a name only ever has to be unique *within* HabboFriendListCom.
     *
     * This port registers every component's layouts in one map keyed by the `*Com.as`
     * field name, and qualifies a key with its component when the same field name exists
     * in two components — `main_window_xml` and `simple_alert_xml` ship as
     * `HabboFriendList_main_window_xml`/`HabboFriendList_simple_alert_xml` for exactly that
     * reason, while `friend_entry_xml` and the tab footers, being unique, do not. Hence
     * the two lookups: bare first, then this component's qualified form.
     */
    // AS3: .../HabboFriendList.as::getXmlWindow()
    getXmlWindow(name: string): IWindow | null
    {
        if(this._windowManager === null)
        {
            return null;
        }

        // Probed rather than tried-and-caught: buildWidgetLayout() warns on a miss, so
        // attempting the wrong key first logged "Widget layout not found: main_window_xml"
        // on every open even though the qualified key resolved straight after.
        const qualified = `HabboFriendList_${name}_xml`;

        if(this._windowManager.hasWidgetLayout(qualified))
        {
            return this._windowManager.buildWidgetLayout(qualified);
        }

        return this._windowManager.buildWidgetLayout(`${name}_xml`);
    }

    // AS3: .../HabboFriendList.as::isMessagesPersisted()
    isMessagesPersisted(): boolean
    {
        return this.getBoolean('friend_list.persistent_message_status.enabled');
    }

    // AS3: .../HabboFriendList.as::isEmbeddedMinimailEnabled()
    isEmbeddedMinimailEnabled(): boolean
    {
        return this.getProperty('client.minimail.embed.enabled') === 'true';
    }

    /**
     * A badge still downloading yields null here and paints on a later repaint — the same null
     * AS3's own `getGroupBadgeSmallImage()` returns before the BitmapData exists. The call is
     * what starts the download in the first place.
     */
    // AS3: .../HabboFriendList.as::getSmallGroupBadgeBitmap()
    getSmallGroupBadgeBitmap(badge: string): ImageBitmap | null
    {
        return imageElementToBitmap(this._sessionData?.getGroupBadgeSmallImage(badge) ?? null);
    }

    /**
     * Renders the friend's head. At zoom the avatar is drawn at high resolution and
     * focused at half scale, which is what keeps the 20x20 slot sharp.
     *
     * Passing `this` as the listener is what makes a face that is not ready yet come
     * back through `avatarImageReady()`.
     */
    // AS3: .../HabboFriendList.as::getAvatarFaceBitmap()
    getAvatarFaceBitmap(figure: string): ImageBitmap | null
    {
        const zoomEnabled = this.getBoolean('zoom.enabled');
        const avatarImage = this._avatarManager?.createAvatarImage(figure, zoomEnabled ? 'h' : 'sh', '', this, null) ?? null;

        if(avatarImage === null)
        {
            return null;
        }

        const face = HabboFaceFocuser.focusUserFace(avatarImage, 'head', 2, zoomEnabled ? 0.5 : 1, 20, 20);

        avatarImage.dispose();

        return face;
    }

    // AS3: .../HabboFriendList.as::getButtonImage()
    getButtonImage(name: string): ImageBitmap | null
    {
        // AS3 looks the asset up as `<name>_png`, because that is the field name in
        // HabboFriendListCom.as. This port registers images under the bare file
        // basename (`hdr_friends`, not `hdr_friends_png` — see App.ts::registerImageAssets),
        // so the suffix has to go; HabboGroupsManager.getButtonImage() reads them the
        // same way.
        const asset = this.assets?.getAssetByName(name) ?? null;

        if(asset === null)
        {
            log.warn(`GETTING ASSET: ${name} - not in the library`);

            return null;
        }

        return (asset.content as ImageBitmap | null) ?? null;
    }

    /**
     * Builds a standalone bitmap button sized to its own image.
     *
     * TODO(AS3): AS3 calls `_windowManager.createWindow(name, "", 21, 0, 1 | 0x10, rect,
     * procedure, id)`. This port's window manager has no `createWindow()` of that shape -
     * windows come from layouts - so nothing in the ported friend list can build one, and
     * no ported caller needs it (the AS3 method is itself unused inside the class).
     * AS3: HabboFriendList.as::getButton().
     */
    // AS3: .../HabboFriendList.as::getButton()
    getButton(_name: string, _imageName: string, _procedure: ((event: WindowEvent, window: IWindow) => void) | null, _x: number = 0, _y: number = 0, _id: number = 0): IBitmapWrapperWindow | null
    {
        return null;
    }

    // AS3: .../HabboFriendList.as::trackFriendListEvent()
    trackFriendListEvent(type: string): void
    {
        this.events.emit(type, type);
    }

    /**
     * Shows or hides a named caption child, and sets its text when shown.
     */
    // AS3: .../HabboFriendList.as::refreshText()
    refreshText(container: IWindowContainer, name: string, visible: boolean, caption: string): void
    {
        const child = container.getChildByName(name);

        if(child === null)
        {
            return;
        }

        if(!visible)
        {
            child.visible = false;
        }
        else
        {
            child.visible = true;
            child.caption = caption;
        }
    }

    // AS3: .../HabboFriendList.as::refreshButton()
    refreshButton(container: IWindowContainer, name: string, visible: boolean, procedure: ((event: WindowEvent, window: IWindow) => void) | null, id: number): void
    {
        const child = container.findChildByName(name);

        if(child === null)
        {
            return;
        }

        if(!visible)
        {
            child.visible = false;
        }
        else
        {
            this.prepareButton(child, name, procedure, id);
            child.visible = true;
        }
    }

    /**
     * The relationship badge: one region carrying the friend id, with a bitmap child
     * whose asset is picked from the status. Hidden for ids of zero or less — group
     * entries and captions have no relationship.
     */
    // AS3: .../HabboFriendList.as::refreshRelationshipRegion()
    refreshRelationshipRegion(container: IWindowContainer, name: string, status: number, procedure: ((event: WindowEvent, window: IWindow) => void) | null, id: number): void
    {
        const region = container.findChildByName(name) as IRegionWindow | null;

        if(region === null)
        {
            return;
        }

        const bitmap = (region as unknown as IWindowContainer).findChildByTag('bitmap') as IStaticBitmapWrapperWindow | null;

        let assetUri = 'relationship_status_none';

        switch(status)
        {
            case RelationshipStatusEnum.HEART:
                assetUri = 'relationship_status_heart';
                break;
            case RelationshipStatusEnum.SMILE:
                assetUri = 'relationship_status_smile';
                break;
            case RelationshipStatusEnum.BOBBA:
                assetUri = 'relationship_status_bobba';
                break;
        }

        if(bitmap !== null)
        {
            bitmap.assetUri = assetUri;
            (bitmap as unknown as IWindow).visible = true;
        }

        const regionWindow = region as unknown as IWindow;

        regionWindow.id = id;
        regionWindow.procedure = procedure;
        regionWindow.visible = id > 0 && this.getBoolean('relationship.status.enabled');
    }

    /** Like `refreshButton()` but for children that already carry their own image. */
    // AS3: .../HabboFriendList.as::refreshIcon()
    refreshIcon(container: IWindowContainer, name: string, visible: boolean, procedure: ((event: WindowEvent, window: IWindow) => void) | null, id: number): void
    {
        const child = container.findChildByName(name);

        if(child === null)
        {
            return;
        }

        if(!visible)
        {
            child.visible = false;
        }
        else
        {
            child.id = id;
            child.procedure = procedure;
            child.visible = true;
        }
    }

    /**
     * Loads a button's image once and sizes the window to it. A button that already has
     * its bitmap keeps the procedure it was given the first time — which is why the
     * procedure is only assigned on that first pass, exactly as in AS3.
     */
    // AS3: .../HabboFriendList.as::prepareButton()
    private prepareButton(window: IWindow, imageName: string, procedure: ((event: WindowEvent, window: IWindow) => void) | null, id: number): void
    {
        window.id = id;

        let bitmapWindow = window as unknown as IBitmapWrapperWindow;

        if(typeof bitmapWindow.bitmap === 'undefined')
        {
            bitmapWindow = (window as IWindowContainer).findChildByTag('bitmap') as unknown as IBitmapWrapperWindow;
        }

        if(bitmapWindow === null || typeof bitmapWindow === 'undefined')
        {
            return;
        }

        if(bitmapWindow.bitmap !== null)
        {
            return;
        }

        bitmapWindow.bitmap = this.getButtonImage(imageName);

        if(bitmapWindow.bitmap !== null)
        {
            (bitmapWindow as unknown as IWindow).width = bitmapWindow.bitmap.width;
            (bitmapWindow as unknown as IWindow).height = bitmapWindow.bitmap.height;
        }

        window.procedure = procedure;
    }

    // AS3: .../HabboFriendList.as::acceptFriendRequest()
    acceptFriendRequest(requestId: number): void
    {
        this.requestsView()?.acceptRequest(requestId);
    }

    // AS3: .../HabboFriendList.as::acceptAllFriendRequests()
    acceptAllFriendRequests(): void
    {
        this.requestsView()?.acceptAllRequests();
    }

    // AS3: .../HabboFriendList.as::declineFriendRequest()
    declineFriendRequest(requestId: number): void
    {
        this.requestsView()?.declineRequest(requestId);
    }

    // AS3: .../HabboFriendList.as::declineAllFriendRequests()
    declineAllFriendRequests(): void
    {
        this.requestsView()?.declineAllRequests();
    }

    // AS3: .../HabboFriendList.as::acceptFriendRequest() local `_loc2_`
    private requestsView(): IFriendRequestsView | null
    {
        const tabView = this._tabs?.findTab(FriendListTabEnum.TABID_FRIEND_REQUESTS)?.tabView ?? null;

        return tabView as unknown as IFriendRequestsView | null;
    }

    // AS3: .../HabboFriendList.as::setRelationshipStatus()
    setRelationshipStatus(friendId: number, status: number): void
    {
        this.send(new SetRelationshipStatusMessageComposer(friendId, status));
    }

    // AS3: .../HabboFriendList.as::getRelationshipStatus()
    getRelationshipStatus(friendId: number): number
    {
        return this._categories.findFriend(friendId)?.relationshipStatus ?? RelationshipStatusEnum.NONE;
    }

    // AS3: .../HabboFriendList.as::getFriendCount()
    getFriendCount(onlineOnly: boolean, followableOnly: boolean = false): number
    {
        if(this._view === null)
        {
            log.debug('Cannot get friend count. Friendlist not initialized.');

            return 0;
        }

        return this._categories.getFriendCount(onlineOnly, followableOnly);
    }

    // AS3: .../HabboFriendList.as::getFriendNames()
    getFriendNames(): string[]
    {
        return this._categories.getFriendNames();
    }

    /**
     * Repaints every row showing this figure once its assets have finished downloading.
     *
     * AS3 copies the new face into the slot's existing `BitmapData`; here the face is an
     * immutable `ImageBitmap` assigned to the window, and the row's cached figure tag is
     * cleared so the next list refresh does not skip it as unchanged.
     */
    // AS3: .../HabboFriendList.as::avatarImageReady()
    avatarImageReady(figureString: string): void
    {
        if(this.disposed)
        {
            return;
        }

        for(const friend of this._categories.getAllFriends().values())
        {
            if(friend === null || friend.disposed || friend.figure !== figureString)
            {
                continue;
            }

            friend.face = friend.isGroupFriend()
                ? this.getSmallGroupBadgeBitmap(friend.figure)
                : this.getAvatarFaceBitmap(friend.figure);

            if(friend.face === null)
            {
                continue;
            }

            const face = friend.view?.getChildByName(HabboFriendList.AVATAR_FACE_NAME) as IBitmapWrapperWindow | null;

            if(face === null || face.disposed)
            {
                continue;
            }

            face.bitmap = friend.face;
            face.tags.splice(0, face.tags.length);
            face.tags.push(friend.figure);
            face.invalidate();
        }
    }

    // AS3: .../HabboFriendList.as::get linkPattern()
    get linkPattern(): string
    {
        return 'friendlist/';
    }

    /**
     * `friendlist/openchat/<a>:<b>` carries both ends of a conversation and does not say
     * which is which — whichever id is not our own is the one to open.
     */
    // AS3: .../HabboFriendList.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2)
        {
            return;
        }

        switch(parts[1])
        {
            case 'open':
                this.openFriendList();
                break;

            case 'openchat':
            {
                if(parts.length < 3 || this._messenger === null)
                {
                    return;
                }

                const ids = parts[2]!.split(':');

                if(ids.length < 2)
                {
                    return;
                }

                const first = parseInt(ids[0]!, 10);
                const target = first === this._avatarId ? parseInt(ids[1]!, 10) : first;

                if(target > 0)
                {
                    this.openFriendList();
                    this._messenger.startConversation(target);
                }

                break;
            }

            default:
                log.warn(`FriendList unknown link-type received: ${parts[1]}`);
        }
    }

    // === IHabboFriendList: the port's own flat accessors, backed by the categories ===

    // AS3: .../HabboFriendList.as::getFriend()
    getFriendById(id: number): IFriend | null
    {
        return this._categories.findFriend(id);
    }

    // TS-only: no AS3 counterpart; kept for the ported consumers of `IHabboFriendList`.
    getFriendByName(name: string): IFriend | null
    {
        for(const friend of this._categories.getAllFriends().values())
        {
            if(friend.name === name)
            {
                return friend;
            }
        }

        return null;
    }

    // TS-only: no AS3 counterpart; AS3 has getFriendNames(), which returns names only.
    getFriends(): IFriend[]
    {
        return Array.from(this._categories.getAllFriends().values());
    }

    // TS-only: no AS3 counterpart; kept for the ported consumers of `IHabboFriendList`.
    isFriend(userId: number): boolean
    {
        return this._categories.findFriend(userId) !== null;
    }

    // TS-only: no AS3 counterpart; AS3's views build and send this composer themselves.
    requestFriend(userName: string): void
    {
        this.send(new RequestFriendMessageComposer(userName));
    }

    // TS-only: no AS3 counterpart; AS3's views build and send this composer themselves.
    acceptFriend(...requestIds: number[]): void
    {
        this.send(new AcceptFriendMessageComposer(...requestIds));
    }

    // TS-only: no AS3 counterpart; AS3's views build and send this composer themselves.
    declineFriend(declineAll: boolean, ...requestIds: number[]): void
    {
        this.send(new DeclineFriendMessageComposer(declineAll, ...requestIds));
    }

    // TS-only: no AS3 counterpart; AS3's views build and send this composer themselves.
    removeFriend(...friendIds: number[]): void
    {
        this.send(new RemoveFriendMessageComposer(...friendIds));
    }

    // TS-only: no AS3 counterpart; AS3's views build and send this composer themselves.
    findNewFriends(): void
    {
        this.send(new FindNewFriendsMessageComposer());
    }

    // TS-only: no AS3 counterpart; AS3's views build and send this composer themselves.
    searchUsers(query: string): void
    {
        this.send(new HabboSearchMessageComposer(query));
    }

    // TS-only: no AS3 counterpart; an alias of setRelationshipStatus() for `IHabboFriendList`.
    setRelationship(friendId: number, status: number): void
    {
        this.setRelationshipStatus(friendId, status);
    }

    // === Message handlers ===

    // AS3: .../HabboFriendList.as::onUserObject()
    private onUserObject(event: IMessageEvent): void
    {
        const parser = event?.parser as UserObjectMessageParser | null;

        if(!parser)
        {
            return;
        }

        this._avatarId = parser.id;
    }

    /**
     * The list arrives in fragments. The offline category is only opened on the last
     * one, and only when nobody is online — otherwise the list opens showing the online
     * friends alone.
     */
    // AS3: .../HabboFriendList.as::onFriendsListFragment()
    private onFriendsListFragment(event: IMessageEvent): void
    {
        const parser = event?.parser as FriendListFragmentMessageParser | null;

        if(!parser)
        {
            return;
        }

        for(const friendData of parser.friendFragment)
        {
            this._categories.addFriend(new Friend(friendData));
        }

        this._friendListEvents.emit('friendListFragment', parser.friendFragment);

        if(parser.fragmentIndex === parser.totalFragments - 1)
        {
            this._categories.sort();
            this._initialized = true;
            this._categories.findCategory(FriendCategory.CATID_OFFLINE)?.setOpen(this._categories.getFriendCount(true, false) === 0);

            log.info(`Friend list fully loaded: ${this._categories.getFriendCount(false)} friends`);
        }
    }

    // AS3: .../HabboFriendList.as::onMessengerInit()
    private onMessengerInit(event: IMessageEvent): void
    {
        const parser = event?.parser as MessengerInitParser | null;

        if(!parser)
        {
            return;
        }

        this._view = new FriendListView(this);
        this._friendRequests = new FriendRequests(new FriendRequestsDeps(this), parser.userFriendLimit, parser.extendedFriendLimit);

        // The token, not the resolved text.
        //
        // AS3 resolves eagerly here (`getText("friendlist.friends")`) and gets away with
        // it because the localization tables are loaded before the connection is opened.
        // In this port the texts arrive over HTTP and MessengerInit is one of the first
        // messages after connect, so the lookup can lose that race — and a category's
        // name is captured once, at construction, which froze it to the empty string
        // `getLocalization()` returns for a key it has not loaded yet. The row then read
        // "(0)" with no name for the whole session.
        //
        // Handing the caption a `${...}` token instead defers the lookup to draw time,
        // where CoreLocalizationManager resolves it — including inside a longer string,
        // which is what `FriendsView` builds ("${friendlist.friends} (3)"). This is the
        // same pattern DynamicLayoutManager and the landing-view widgets already use.
        this._categories.addCategory(new FriendCategory(FriendCategory.CATID_ONLINE, '${friendlist.friends}'));
        this._categories.addCategory(new FriendCategory(FriendCategory.CATID_OFFLINE, '${friendlist.friends.offlinecaption}'));

        this._tabs = new FriendListTabs(new FriendListTabsDeps(this));

        if(this._updateTimerId === null)
        {
            this._updateTimerId = setInterval(() => this.sendFriendListUpdate(), HabboFriendList.UPDATE_INTERVAL);
        }

        this.getFriendRequests();
        this.registerListeners();

        this._friendListEvents.emit('friendListInitialized');

        log.debug('FRIENDLIST INITIALIZED SUCCESSFULLY');
    }

    // AS3: .../HabboFriendList.as::registerListeners()
    private registerListeners(): void
    {
        this.addMessageEvent(new AcceptFriendResultMessageEvent(this.onAcceptFriendResult.bind(this)));
        this.addMessageEvent(new RoomInviteErrorMessageEvent(this.onRoomInviteError.bind(this)));
        this.addMessageEvent(new MessengerErrorEvent(this.onMessengerError.bind(this)));
        this.addMessageEvent(new FriendListUpdateMessageEvent(this.onFriendListUpdate.bind(this)));
        this.addMessageEvent(new UserRightsMessageEvent(this.onUserRights.bind(this)));
        this.addMessageEvent(new FollowFriendFailedMessageEvent(this.onFollowFriendFailed.bind(this)));
        this.addMessageEvent(new FriendRequestsMessageEvent(this.onFriendRequests.bind(this)));
        this.addMessageEvent(new HabboSearchResultMessageEvent(this.onHabboSearchResult.bind(this)));
        this.addMessageEvent(new NewFriendRequestMessageEvent(this.onNewFriendRequest.bind(this)));

        // FriendNotification and FindFriendsProcessResult are deliberately absent, as they
        // are from AS3's registerListeners(). Their owner is HabboFriendBarData, which
        // registers both and acts on them. This component used to register them too, on the
        // grounds that "something has to feed the typed bus" — written when the friend bar's
        // data component did not exist. It does now, so those two were a second handler on
        // the same header feeding a bus nothing subscribes to.
    }

    // AS3: .../HabboFriendList.as::getFriendRequests()
    private getFriendRequests(): void
    {
        log.debug('Sending friend requests request');

        this.send(new GetFriendRequestsMessageComposer());
    }

    // AS3: .../HabboFriendList.as::sendFriendListUpdate()
    private sendFriendListUpdate(): void
    {
        log.debug('Sending update request');

        this.send(new FriendListUpdateMessageComposer());
    }

    // AS3: .../HabboFriendList.as::onFriendRequests()
    private onFriendRequests(event: IMessageEvent): void
    {
        const parser = event?.parser as FriendRequestsMessageParser | null;

        if(!parser || this._friendRequests === null)
        {
            return;
        }

        this._friendRequests.clearAndUpdateView(false);

        for(const requestData of parser.reqs)
        {
            this._friendRequests.addRequest(new FriendRequest(requestData));
        }

        if(parser.reqs.length > 0)
        {
            this._tabs?.findTab(FriendListTabEnum.TABID_FRIEND_REQUESTS)?.setNewMessageArrived(true);
        }

        this._view?.refresh('friendRequests');
        this._friendListEvents.emit('friendRequestsReceived', parser.reqs);
    }

    // AS3: .../HabboFriendList.as::onNewFriendRequest()
    private onNewFriendRequest(event: IMessageEvent): void
    {
        log.debug('Received new friend request');

        const parser = event?.parser as NewFriendRequestMessageParser | null;

        if(!parser || parser.req === null || this._friendRequests === null)
        {
            return;
        }

        this._friendRequests.addRequestAndUpdateView(new FriendRequest(parser.req));
        this._tabs?.findTab(FriendListTabEnum.TABID_FRIEND_REQUESTS)?.setNewMessageArrived(true);
        this._view?.refresh('newFriendRequest');

        this._friendListEvents.emit('newFriendRequest', parser.req);
    }

    // AS3: .../HabboFriendList.as::onAcceptFriendResult()
    private onAcceptFriendResult(event: IMessageEvent): void
    {
        const parser = event?.parser as AcceptFriendResultMessageParser | null;

        if(!parser)
        {
            return;
        }

        for(const failure of parser.failures)
        {
            this._friendRequests?.acceptFailed(failure.senderId);
            this.showAlertView(failure.errorCode);

            this._friendListEvents.emit('acceptFriendFailed', failure.senderId, failure.errorCode);
        }
    }

    // AS3: .../HabboFriendList.as::onHabboSearchResult()
    private onHabboSearchResult(event: IMessageEvent): void
    {
        const parser = event?.parser as HabboSearchResultMessageParser | null;

        if(!parser)
        {
            return;
        }

        this._avatarSearchResults.searchReceived(parser.friends, parser.others);
        this._view?.refresh('search');

        this._friendListEvents.emit('searchResult', parser.friends, parser.others);
    }

    // AS3: .../HabboFriendList.as::onMessengerError()
    private onMessengerError(event: IMessageEvent): void
    {
        const parser = event?.parser as MessengerErrorMessageParser | null;

        if(!parser)
        {
            return;
        }

        this.showAlertView(parser.errorCode, parser.clientMessageId);

        this._friendListEvents.emit('messengerError', parser.errorCode, parser.clientMessageId);
    }

    /**
     * Error codes 5 and 6 have no text in AS3 either — they fall through to the raw
     * dump, which is kept verbatim rather than invented.
     */
    // AS3: .../HabboFriendList.as::showAlertView()
    private showAlertView(errorCode: number, clientMessageId: number = 0): void
    {
        let message: string;

        switch(errorCode)
        {
            case 1:
                message = '${friendlist.error.friendlistownlimit}';
                break;
            case 2:
                message = '${friendlist.error.friendlistlimitofrequester}';
                break;
            case 3:
                message = '${friendlist.error.friend_requests_disabled}';
                break;
            case 4:
                message = '${friendlist.error.requestnotfound}';
                break;
            case 7:
                message = '${friendlist.error.blocked_by_them}';
                break;
            case 8:
                message = '${friendlist.error.blocked_by_you}';
                break;
            default:
                message = `Received messenger error: msg: ${clientMessageId}, errorCode: ${errorCode}`;
        }

        this.simpleAlert('${friendlist.alert.title}', message);
    }

    // AS3: .../HabboFriendList.as::onRoomInviteError()
    private onRoomInviteError(event: IMessageEvent): void
    {
        const parser = event?.parser as RoomInviteErrorMessageParser | null;

        if(!parser)
        {
            return;
        }

        const message = `Received room invite error: errorCode: ${parser.errorCode}, recipients: ${Util.arrayToString(parser.failedRecipients)}`;

        this.simpleAlert('${friendlist.alert.title}', message);

        this._friendListEvents.emit('roomInviteError', parser.errorCode, parser.failedRecipients);
    }

    // AS3: .../HabboFriendList.as::onFriendListUpdate()
    private onFriendListUpdate(event: IMessageEvent): void
    {
        this._categories.onFriendListUpdate(event as FriendListUpdateMessageEvent);
        this._view?.refresh('friendListUpdate');
    }

    // AS3: .../HabboFriendList.as::onFollowFriendFailed()
    private onFollowFriendFailed(event: IMessageEvent): void
    {
        const parser = event?.parser as FollowFriendFailedMessageParser | null;

        if(!parser)
        {
            return;
        }

        const message = this.getFollowFriendErrorText(parser.errorCode);

        log.warn(`Received follow friend failed: ${parser.errorCode}, ${message}`);
        this.simpleAlert('${friendlist.alert.title}', message);

        this._friendListEvents.emit('followFriendFailed', parser.errorCode);
    }

    // AS3: .../HabboFriendList.as::getFollowFriendErrorText()
    private getFollowFriendErrorText(errorCode: number): string
    {
        if(errorCode === 0)
        {
            return '${friendlist.followerror.notfriend}';
        }

        if(errorCode === 1)
        {
            return '${friendlist.followerror.offline}';
        }

        if(errorCode === 2)
        {
            return '${friendlist.followerror.hotelview}';
        }

        if(errorCode === 3)
        {
            return '${friendlist.followerror.prevented}';
        }

        return `Unknown follow friend error ${errorCode}`;
    }

    /**
     * Club or VIP raises the friend limit to the club one. The limit is only ever
     * raised, never lowered — a membership that lapses mid-session does not shrink a
     * list already loaded.
     */
    // AS3: .../HabboFriendList.as::onUserRights()
    private onUserRights(_event: IMessageEvent): void
    {
        if(this._sessionData === null || this._friendRequests === null)
        {
            return;
        }

        let limit = 0;

        if(this._sessionData.hasVip)
        {
            limit = this._friendRequests.clubLimit;
        }
        else if(this._sessionData.hasClub)
        {
            limit = this._friendRequests.clubLimit;
        }

        if(limit > this._friendRequests.limit)
        {
            this._friendRequests.limit = limit;
        }
    }

    // TS-only: no AS3 counterpart; tracks registrations for `dispose()`.
    private addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager)
        {
            this._communicationManager.addMessageEvent(event);
            this._messageEvents.push(event);
        }
    }

    // AS3: .../HabboFriendList.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this.context.removeLinkEventTracker(this);

        if(this._updateTimerId !== null)
        {
            clearInterval(this._updateTimerId);
            this._updateTimerId = null;
        }

        if(this._communicationManager)
        {
            for(const event of this._messageEvents)
            {
                this._communicationManager.removeMessageEvent(event);
            }
        }

        this._messageEvents = [];
        this._friendListEvents.removeAllListeners();

        super.dispose();
    }
}

// Re-exported so consumers of the manager keep seeing the wire DTOs it emits.
export type {FriendData, FriendRequestData, HabboFriendListTrackingEvent};
