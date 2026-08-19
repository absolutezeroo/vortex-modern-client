import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';
import {IID_HabboNewNavigator} from '@iid/IIDHabboNewNavigator';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboNavigator} from './IHabboNavigator';
import type {IHabboNewNavigator} from './IHabboNewNavigator';
import type {RoomInfoViewCtrl} from './inroom/RoomInfoViewCtrl';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {IHabboToolbar} from '../toolbar/IHabboToolbar';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '../localization/IHabboLocalizationManager';
import type {IHabboTracking} from '../tracking/IHabboTracking';
import type {IAvatarRenderManager} from '../avatar/IAvatarRenderManager';
import type {IHabboHelp} from '../help/IHabboHelp';
import {HabboToolbarEvent} from '../toolbar/events/HabboToolbarEvent';
import {HabboToolbarIconEnum} from '../toolbar/HabboToolbarIconEnum';
import {NavigatorData} from './domain';
import {IncomingMessages} from './IncomingMessages';
import type {CompetitionRoomsData, EventCategory, GuestRoomData} from '../communication/messages/incoming/navigator';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {Logger} from '@core/utils/Logger';

// Composers
import {
    CompetitionRoomsSearchMessageComposer,
    CreateFlatMessageComposer,
    GetGuestRoomMessageComposer,
    MyFavouriteRoomsSearchMessageComposer,
    MyFrequentRoomHistorySearchMessageComposer,
    MyGuildBasesSearchMessageComposer,
    MyRoomHistorySearchMessageComposer,
    MyRoomsSearchMessageComposer,
    RemoveOwnRoomRightsRoomMessageComposer,
    RoomTextSearchMessageComposer,
} from '../communication/messages/outgoing/navigator';
import type {IMessageComposer} from "@core";

const log = Logger.getLogger('habbo.navigator.HabboNavigator');

/**
 * Habbo Navigator component
 */
export class HabboNavigator extends Component implements IHabboNavigator 
{
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_incomingMessages
    private _incomingMessages: IncomingMessages | null = null;
    private _isOpen: boolean = false;
    /**
     * The new navigator, resolved optionally so this component can still start without
     * it. AS3's HabboNavigator implements the transitional interface itself and owns its
     * own RoomInfoViewCtrl; this port put that half on `LegacyNavigator`, which the new
     * navigator builds and holds — so the controller has to be reached through it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/HabboNavigator.as::_SafeStr_5440 (owned directly there)
    private _newNavigator: IHabboNewNavigator | null = null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_roomSessionManager
    private _roomSessionManager: IRoomSessionManager | null = null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_localization
    private _localization: IHabboLocalizationManager | null = null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_tracking
    private _tracking: IHabboTracking | null = null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_catalog
    private _catalog: IHabboCatalog | null = null;
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_avatarManager
    private _avatarManager: IAvatarRenderManager | null = null;

    constructor(context: IContext) 
    {
        super(context);
        this._data = new NavigatorData(this);
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_sessionData
    private _sessionData: ISessionDataManager | null = null;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::get sessionData()
    get sessionData(): ISessionDataManager | null 
    {
        return this._sessionData;
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_habboHelp
    private _habboHelp: IHabboHelp | null = null;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::get habboHelp()
    get habboHelp(): IHabboHelp | null 
    {
        return this._habboHelp;
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::get communication()
    get communication(): IHabboCommunicationManager 
    {
        if(!this._communication) 
        {
            throw new Error('[HabboNavigator] Communication not available');
        }
        return this._communication;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/HabboNavigator.as::_data
    private _data: NavigatorData;

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::get data()
    get data(): NavigatorData 
    {
        return this._data;
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::get homeRoomId()
    get homeRoomId(): number 
    {
        return this._data.homeRoomId;
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::get enteredGuestRoomData()
    get enteredGuestRoomData(): GuestRoomData | null 
    {
        return this._data.enteredGuestRoom;
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::get visibleEventCategories()
    get visibleEventCategories(): EventCategory[] 
    {
        return this._data.visibleEventCategories;
    }

    protected override get dependencies(): Array<ComponentDependency<any>> 
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => 
                {
                    this._communication = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: IRoomSessionManager | null) => 
                {
                    this._roomSessionManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) => 
                {
                    // Unsubscribe from previous toolbar
                    if(this._toolbar) 
                    {
                        this._toolbar.toolbarEvents.off(
                            HabboToolbarEvent.TOOLBAR_CLICK,
                            this.onHabboToolbarEvent
                        );
                    }

                    this._toolbar = toolbar;

                    // Subscribe to new toolbar's custom event emitter
                    // (toolbarEvents, NOT Component.events — see MEMORY.md)
                    if(toolbar) 
                    {
                        toolbar.toolbarEvents.on(
                            HabboToolbarEvent.TOOLBAR_CLICK,
                            this.onHabboToolbarEvent
                        );
                    }
                },
                false
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => 
                {
                    this._windowManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => 
                {
                    this._localization = manager;
                }
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) => 
                {
                    this._sessionData = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboTracking,
                (tracking: IHabboTracking | null) => 
                {
                    this._tracking = tracking;
                }
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: IHabboCatalog | null) =>
                {
                    this._catalog = catalog;
                },
                false
            ),
            new ComponentDependency(
                IID_AvatarRenderManager,
                (manager: IAvatarRenderManager | null) => 
                {
                    this._avatarManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboNewNavigator,
                (navigator: IHabboNewNavigator | null) =>
                {
                    this._newNavigator = navigator;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboHelp,
                (help: IHabboHelp | null) => 
                {
                    this._habboHelp = help;
                },
                false
            ),
        ];
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::goToHomeRoom()
    goToHomeRoom(): boolean 
    {
        if(this._data.homeRoomId < 1) 
        {
            log.warn('No home room set');

            return false;
        }

        this.goToRoom(this._data.homeRoomId, true);

        return true;
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::goToPrivateRoom()
    goToPrivateRoom(roomId: number): void 
    {
        this.send(new GetGuestRoomMessageComposer(roomId, false, true));
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::goToRoomNetwork()
    goToRoomNetwork(roomId: number, useHomeRoom: boolean): void 
    {
        this.closeRoomInfo();

        let homeRoomId = 0;

        if(useHomeRoom && this._data.homeRoomId > 0) 
        {
            homeRoomId = this._data.homeRoomId;
        }

        // Would call room session manager here
        log.debug(`Go to room network: ${roomId}, homeRoom=${homeRoomId}`);
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::goToRoom()
    goToRoom(roomId: number, closeNavigator: boolean = true, password: string = '', _roomCategory: number = -1, skipOpc: boolean = false): void 
    {
        log.info(`Going to room: ${roomId}`);

        if(closeNavigator) 
        {
            this.closeNavigator();
        }

        if(!this._roomSessionManager) 
        {
            log.error('RoomSessionManager not available');
            return;
        }

        this._roomSessionManager.gotoRoom(roomId, password, '', skipOpc);
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::performTagSearch()
    performTagSearch(tag: string): void 
    {
        let searchTag = tag;

        if(searchTag.indexOf(' ') !== -1) 
        {
            searchTag = '"' + searchTag + '"';
        }

        this.send(new RoomTextSearchMessageComposer(searchTag));

        log.debug(`Tag search: ${searchTag}`);
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::performTextSearch()
    performTextSearch(searchText: string): void 
    {
        this.send(new RoomTextSearchMessageComposer(searchText));

        log.debug(`Text search: ${searchText}`);
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::performGuildBaseSearch()
    performGuildBaseSearch(): void 
    {
        this.send(new MyGuildBasesSearchMessageComposer());

        log.debug('Guild base search');
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::performCompetitionRoomsSearch()
    performCompetitionRoomsSearch(goalId: number, pageIndex: number): void 
    {
        if(this._data.isLoading()) 
        {
            return;
        }

        // Set competition data for tracking
        this._data.competitionRoomsData = {
            goalId,
            pageIndex,
            pageCount: 0,
        } as CompetitionRoomsData;

        this.send(new CompetitionRoomsSearchMessageComposer(goalId, pageIndex));

        log.debug(`Competition rooms search: goal=${goalId}, page=${pageIndex}`);
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::showOwnRooms()
    showOwnRooms(): void 
    {
        this.send(new MyRoomsSearchMessageComposer());

        this.openNavigator();

        log.debug('Showing own rooms');
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::hasRoomRightsButIsNotOwner()
    hasRoomRightsButIsNotOwner(roomId: number): boolean 
    {
        // Would check with room session manager
        log.debug(`Checking room rights for: ${roomId}`);

        return false;
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::removeRoomRights()
    removeRoomRights(roomId: number): void 
    {
        this.send(new RemoveOwnRoomRightsRoomMessageComposer(roomId));
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::startRoomCreation()
    startRoomCreation(): void 
    {
        log.debug('Starting room creation');
    }

    createRoom(name: string, description: string, model: string, categoryId: number, maxUsers: number, tradeMode: number): void 
    {
        this.send(new CreateFlatMessageComposer(name, description, model, categoryId, maxUsers, tradeMode));
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::openNavigator()
    openNavigator(): void 
    {
        if(this._isOpen) return;

        this._isOpen = true;

        log.debug('Navigator opened');
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::closeNavigator()
    closeNavigator(): void 
    {
        if(!this._isOpen) return;

        this._isOpen = false;

        log.debug('Navigator closed');
    }

    /**
     * AS3 guards this on `roomCreateViewCtrl` — a different controller — rather than on
     * the room-info one it then toggles. Both are built together and nulled together in
     * dispose(), so the test means "not disposed"; preserved as written.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/HabboNavigator.as::toggleRoomInfoVisibility()
    toggleRoomInfoVisibility(): void
    {
        const wrapper = this._newNavigator?.legacyWrapper ?? null;

        if(wrapper === null)
        {
            log.warn('toggleRoomInfoVisibility: no legacy navigator wrapper - the room info window cannot open');

            return;
        }

        if(wrapper.roomCreateViewCtrl !== null) wrapper.roomInfoViewCtrl?.toggle();
    }

    /**
     * TS-only: the transitional half of AS3's HabboNavigator, which this port put on
     * `LegacyNavigator`. AS3 reaches `roomSettingsCtrl` and friends as its own fields
     * (HabboNavigator.as::get roomSettingsCtrl(), line 180); everything holding only this
     * component — `IncomingMessages` above all — has to come back through here.
     */
    get transitionalNavigator(): IHabboTransitionalNavigator | null
    {
        return this._newNavigator?.legacyWrapper ?? null;
    }

    /**
	 * TS-only, and the same shape as `transitionalNavigator` above: AS3's navigator message handler
	 * (`_SafeCls_2208`) holds a `HabboNewNavigator` field of its own, where this port's
	 * `IncomingMessages` holds only this component. Members that live on the new navigator itself
	 * rather than on the legacy wrapper — `onGroupDetails()` — come back through here.
	 */
    get newNavigator(): IHabboNewNavigator | null
    {
        return this._newNavigator;
    }

    /**
     * AS3 holds the controller as its own field and returns it straight
     * (`return _SafeStr_5440`). This port keeps it on the new navigator, so the same
     * accessor reaches it through `legacyWrapper` instead.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/HabboNavigator.as::get roomInfoViewCtrl()
    private get roomInfoViewCtrl(): RoomInfoViewCtrl | null
    {
        return this._newNavigator?.legacyWrapper?.roomInfoViewCtrl ?? null;
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::canRateRoom()
    canRateRoom(): boolean 
    {
        return this._data.canRate;
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::isRoomFavorite()
    isRoomFavorite(roomId: number): boolean 
    {
        return this._data.isRoomFavourite(roomId);
    }

    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::isRoomHome()
    isRoomHome(roomId: number): boolean 
    {
        return this._data.isRoomHome(roomId);
    }

    /**
     * Sends a message composer.
     * Made public for transitional navigator access.
     *
     * @param composer - The message composer to send
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::send()
    public send(composer: IMessageComposer<unknown[]>): void 
    {
        const connection = this._communication?.connection;

        if(connection) 
        {
            connection.send(composer);
        }
    }

    /**
     * Builds a window from a registered widget layout.
     *
     * @param jsonFileName - The XML layout name
     * @param layer - Window context layer
     * @returns The window, or null
     * @see source_as_win63/habbo/navigator/HabboNavigator.as getXmlWindow()
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::getXmlWindow()
    getXmlWindow(xmlFileName: string, layer: number = 1): IWindow | null 
    {
        if(!this._windowManager) 
        {
            log.error(`Cannot build window '${xmlFileName}': window manager not available`);
            return null;
        }

        try 
        {
            return this._windowManager.buildWidgetLayout(xmlFileName + '_xml', layer);
        }
        catch (e) 
        {
            log.error(`Failed to build window '${xmlFileName}':`, e);
            return null;
        }
    }

    /**
     * Gets a localized text string.
     *
     * @param key - The localization key
     * @returns The localized text, or the key itself as fallback
     * @see source_as_win63/habbo/navigator/HabboNavigator.as getText()
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::getText()
    getText(key: string): string 
    {
        if(!this._localization) return key;

        return this._localization.getLocalization(key, key);
    }

    /**
     * Registers a localization parameter replacement.
     *
     * @param key - The localization key
     * @param param - Parameter name
     * @param value - Parameter value
     * @returns The modified string
     * @see source_as_win63/habbo/navigator/HabboNavigator.as registerParameter()
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::registerParameter()
    registerParameter(key: string, param: string, value: string): string 
    {
        if(!this._localization) return key;

        return this._localization.registerParameter(key, param, value);
    }

    /**
     * Gets a button image wrapper window.
     * Stub — returns null until asset system is wired.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::getButton()
    getButton(_assetName: string, _stateSuffix: string, _callback: (event: WindowEvent, window: IWindow) => void, _x: number = 0, _y: number = 0, _index: number = 0): IWindowContainer | null
    {
        return null;
    }

    /**
     * Refreshes a button's visibility and callback.
     * Stub — no-op until window system is wired.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::refreshButton()
    refreshButton(_container: IWindowContainer, _name: string, _visible: boolean, _callback: (event: WindowEvent, window: IWindow) => void, _index: number, _tooltip: string | null = null): void
    {
        // Stub
    }

    /**
     * Gets a button image bitmap.
     * Stub — returns null until asset system is wired.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::getButtonImage()
    getButtonImage(_assetName: string, _suffix: string = '_png'): unknown | null 
    {
        return null;
    }

    /**
     * Opens the catalog club page.
     * Stub — no-op until catalog is wired.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::openCatalogClubPage()
    openCatalogClubPage(_source: string): void 
    {
        log.debug('openCatalogClubPage');
    }

    /**
     * Opens the catalog room ads page.
     * Stub — no-op until catalog is wired.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::openCatalogRoomAdsPage()
    openCatalogRoomAdsPage(): void
    {
        this._catalog?.openCatalogPage('room_ad');
    }

    /**
     * Opens the room-ad catalog page pre-filled with the current room's event, for extending it.
     *
     * The room name comes from the navigator's own copy of the entered room rather than from the
     * caller — the in-room event panel that triggers this knows the event, not the room.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::openCatalogRoomAdsExtendPage()
    openCatalogRoomAdsExtendPage(eventName: string, eventDesc: string, eventDate: Date, eventCatId: number): void
    {
        if(this._catalog == null) return;

        const roomName = this._data.enteredGuestRoom?.roomName ?? '';

        this._catalog.openRoomAdCatalogPageInExtendedMode('room_ad', eventName, eventDesc, roomName, eventDate, eventCatId);
    }

    /**
     * Shows favourite rooms in the navigator.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::showFavouriteRooms()
    showFavouriteRooms(): void 
    {
        this.send(new MyFavouriteRoomsSearchMessageComposer());

        this.openNavigator();

        log.debug('Showing favourite rooms');
    }

    /**
     * Shows room visit history.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::showHistoryRooms()
    showHistoryRooms(): void 
    {
        this.send(new MyRoomHistorySearchMessageComposer());

        this.openNavigator();

        log.debug('Showing history rooms');
    }

    /**
     * Shows frequently visited rooms.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::showFrequentRooms()
    showFrequentRooms(): void 
    {
        this.send(new MyFrequentRoomHistorySearchMessageComposer());

        this.openNavigator();

        log.debug('Showing frequent rooms');
    }

    /**
     * Returns to the navigator main view.
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::goToMainView()
    goToMainView(): void 
    {
        log.debug('Go to main view');
    }

    /**
     * Checks if a perk is allowed for the current user.
     *
     * @param perkCode - The perk code to check
     * @returns Whether the perk is allowed
     * @see sources/win63_version/habbo/navigator/HabboNavigator.as isPerkAllowed()
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::isPerkAllowed()
    isPerkAllowed(perkCode: string): boolean 
    {
        if(this._sessionData) 
        {
            return this._sessionData.isPerkAllowed(perkCode);
        }

        return false;
    }

    /**
     * Get the current user's name from the session data.
     *
     * @returns The user name, or empty string if not available
     */
    getCurrentUserName(): string 
    {
        return this._sessionData?.userName ?? '';
    }

    /**
     * Tracks a Google Analytics event.
     *
     * @param category - The event category
     * @param action - The event action
     * @param value - Optional numeric value
     * @see sources/win63_version/habbo/navigator/HabboNavigator.as trackGoogle()
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::trackGoogle()
    trackGoogle(category: string, action: string, value: number = -1): void 
    {
        if(this._tracking) 
        {
            this._tracking.trackGoogle(category, action, value);
        }
    }

    /**
     * Tracks a navigation data point via the event log.
     *
     * @param category - The event category
     * @param action - The event action
     * @param label - Optional label
     * @param value - Optional numeric value
     * @see sources/win63_version/habbo/navigator/HabboNavigator.as trackNavigationDataPoint()
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::trackNavigationDataPoint()
    trackNavigationDataPoint(category: string, action: string, label: string = '', value: number = 0): void 
    {
        if(this._tracking) 
        {
            this._tracking.trackEventLog('Navigation', category, action, label, value);
        }
    }

    /**
     * Handles incoming navigation links.
     *
     * @param link - The link URL to handle
     * @see sources/win63_version/habbo/navigator/HabboNavigator.as linkReceived()
     */
    // AS3: .../src/com/sulake/habbo/navigator/HabboNavigator.as::linkReceived()
    linkReceived(link: string): void 
    {
        log.trace(`Link received: ${link}`);

        const parts = link.split('/');

        if(parts.length < 2) return;

        switch(parts[1]) 
        {
            case 'goto':
                if(parts.length >= 3) 
                {
                    const roomId = parseInt(parts[2], 10);

                    if(!isNaN(roomId)) 
                    {
                        this.goToRoom(roomId, true);
                    }
                }
                break;
            case 'search':
                if(parts.length >= 3) 
                {
                    this.performTextSearch(parts[2]);
                }
                break;
            case 'tag':
                if(parts.length >= 3) 
                {
                    this.performTagSearch(parts[2]);
                }
                break;
        }
    }

    override dispose(): void 
    {
        if(this.disposed) return;

        // Unsubscribe from toolbar events
        if(this._toolbar) 
        {
            this._toolbar.toolbarEvents.off(
                HabboToolbarEvent.TOOLBAR_CLICK,
                this.onHabboToolbarEvent
            );
            this._toolbar = null;
        }

        this._incomingMessages?.dispose();
        this._data.dispose();

        log.debug('Navigator disposed');
        super.dispose();
    }

    protected override initComponent(): void 
    {
        this._incomingMessages = new IncomingMessages(this);

        log.debug('Navigator initialized');
    }

    /**
     * Handle toolbar click events.
     *
     * Switches on the icon ID to perform the appropriate navigator action.
     * @param event The toolbar event
     * @see sources/win63_version/habbo/navigator/HabboNavigator.as onHabboToolbarEvent()
     */
    private onHabboToolbarEvent = (event: HabboToolbarEvent): void => 
    {
        if(event.type !== HabboToolbarEvent.TOOLBAR_CLICK) return;

        switch(event.iconId) 
        {
            case HabboToolbarIconEnum.ROOMINFO:
                this.toggleRoomInfoVisibility();
                break;
            case HabboToolbarIconEnum.NAVIGATOR_ME_TAB:
                this.showOwnRooms();
                break;
            case HabboToolbarIconEnum.GAMES:
                if(this.getBoolean('game.center.enabled')) 
                {
                    this.closeNavigator();
                }
                break;
            case HabboToolbarIconEnum.HOME:
                this.goToHomeRoom();
                break;
        }
    };

    /**
     * AS3 has no open/close pair of its own — it closes the controller directly, from
     * `goToRoomNetwork()` among other places (HabboNavigator.as lines 404, 558, 742).
     * Kept as one method because that is what this port's call sites already use.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/navigator/HabboNavigator.as::goToRoomNetwork() (the _SafeStr_5440.close() call)
    private closeRoomInfo(): void
    {
        this.roomInfoViewCtrl?.close();
    }
}
