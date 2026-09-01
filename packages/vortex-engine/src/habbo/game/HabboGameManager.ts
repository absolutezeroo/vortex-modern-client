import {Component} from '@core/runtime/Component';
import {ComponentDependency} from '@core/runtime/ComponentDependency';
import type {IContext} from '@core/runtime/IContext';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import {Logger} from '@core/utils/Logger';
import {releaseProvider} from '@core/runtime/releaseProvider';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';
import {IID_HabboInventory} from '@iid/IIDHabboInventory';
import {IID_HabboLandingView} from '@iid/IIDHabboLandingView';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboHelp} from '@habbo/help/IHabboHelp';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {IHabboLandingView} from '@habbo/friendbar/IHabboLandingView';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import type {RoomObjectTileMouseEvent} from '@habbo/room/events/RoomObjectTileMouseEvent';
import {
    GetSnowWarGameTokensOfferComposer
} from '@habbo/communication/messages/outgoing/catalog/GetSnowWarGameTokensOfferComposer';
import {
    Game2CheckGameDirectoryStatusMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2CheckGameDirectoryStatusMessageComposer';
import {
    Game2QuickJoinGameMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2QuickJoinGameMessageComposer';
import {
    Game2StartSnowWarMessageComposer
} from '@habbo/communication/messages/outgoing/game/directory/Game2StartSnowWarMessageComposer';
import type {IHabboGameManager} from './IHabboGameManager';
import {IncomingMessages} from './IncomingMessages';
import {SnowWarEngine} from './snowwar/SnowWarEngine';
import {WindowUtils} from './snowwar/utils/WindowUtils';

const log = Logger.getLogger('habbo.game.HabboGameManager');

/**
 * The games component. It owns `SnowWarEngine` and is the only thing outside `habbo/game` that
 * talks to it — the room engine forwards clicks here, the toolbar's games icon lands here, and the
 * landing view holds it so a finished arena can hand the screen back.
 *
 * Almost every method is a two-line forward to the engine. The two that are not are the games
 * icon's handler and `onSnowWarArenaSessionEnded()`, which is the one place that decides whether
 * finishing a game returns the player to the hotel view.
 *
 * `gameCenterEnabled` is two config keys, not one: the feature can be on for everyone or on for
 * staff, and the staff arm needs `hasSecurity(4)` as well.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/HabboGameManager.as
 */
export class HabboGameManager extends Component implements IHabboGameManager
{
    // AS3: HabboGameManager.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: HabboGameManager.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: HabboGameManager.as::_localization
    private _localization: IHabboLocalizationManager | null = null;

    // AS3: HabboGameManager.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: HabboGameManager.as::_roomSessionManager
    private _roomSessionManager: IRoomSessionManager | null = null;

    // AS3: HabboGameManager.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;

    // AS3: HabboGameManager.as::_avatarManager
    private _avatarManager: IAvatarRenderManager | null = null;

    // AS3: HabboGameManager.as::_catalog
    private _catalog: IHabboCatalog | null = null;

    // AS3: HabboGameManager.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: HabboGameManager.as::_habboHelp
    private _habboHelp: IHabboHelp | null = null;

    // AS3: HabboGameManager.as::_inventory
    private _inventory: IHabboInventory | null = null;

    // AS3: HabboGameManager.as::_navigator
    private _navigator: IHabboNavigator | null = null;

    /** Derived name — `_SafeStr_4554`, the snow-war engine this manager owns. */
    // AS3: HabboGameManager.as::_SafeStr_4554
    private _snowWarEngine: SnowWarEngine | null = null;

    // AS3: HabboGameManager.as::_incomingMessages
    private _incomingMessages: IncomingMessages | null = null;

    /** Derived name — `_SafeStr_9302`; `game.center.enabled`. */
    // AS3: HabboGameManager.as::_SafeStr_9302
    private _gameCenterEnabled: boolean = false;

    /** Derived name — `_SafeStr_9015`; `game.center.enabled.forStaff`. */
    // AS3: HabboGameManager.as::_SafeStr_9015
    private _gameCenterEnabledForStaff: boolean = false;

    /** Derived name — `_SafeStr_9362`, behind `isHotelClosed`. */
    // AS3: HabboGameManager.as::_SafeStr_9362
    private _hotelClosed: boolean = false;

    // AS3: HabboGameManager.as::_landingView
    private _landingView: IHabboLandingView | null = null;

    // AS3: HabboGameManager.as::_activeGame
    private _activeGame: number = -1;

    // TS-only: AS3 subscribes a method reference; the port needs a stable bound one to unsubscribe.
    private readonly _onToolbarClick: (event: HabboToolbarEvent) => void;

    // AS3: HabboGameManager.as::HabboGameManager()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);

        this._onToolbarClick = (event: HabboToolbarEvent): void => this.onToolbarClick(event);

        // AS3 constructs the engine with this manager, the same context and asset library, and the
        // same flags — the engine is a Component in its own right and needs its own DI.
        this._snowWarEngine = new SnowWarEngine(this, context, 0, assetLibrary);

        log.debug(`HabboGameManager initialized: ${assetLibrary?.name ?? 'no asset library'}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            ...super.dependencies,
            new ComponentDependency(IID_HabboWindowManager, (manager: IHabboWindowManager | null) =>
            {
                this._windowManager = manager;
                WindowUtils.init(this.assets, this._windowManager);
            }),
            new ComponentDependency(IID_HabboCommunicationManager, (manager: IHabboCommunicationManager | null) =>
            {
                this._communication = manager;
                this._incomingMessages = new IncomingMessages(this);
            }),
            new ComponentDependency(IID_HabboConfigurationManager, () =>
            {
                this._gameCenterEnabled = this.getBoolean('game.center.enabled');
                this._gameCenterEnabledForStaff = this.getBoolean('game.center.enabled.forStaff');
            }),
            new ComponentDependency(IID_HabboLocalizationManager, (manager: IHabboLocalizationManager | null) =>
            {
                this._localization = manager;
            }),
            new ComponentDependency(IID_SessionDataManager, (manager: ISessionDataManager | null) =>
            {
                this._sessionDataManager = manager;
            }),
            new ComponentDependency(IID_RoomSessionManager, (manager: IRoomSessionManager | null) =>
            {
                this._roomSessionManager = manager;
            }),
            new ComponentDependency(IID_AvatarRenderManager, (manager: IAvatarRenderManager | null) =>
            {
                this._avatarManager = manager;
            }),
            new ComponentDependency(IID_HabboToolbar, (toolbar: IHabboToolbar | null) =>
            {
                this._toolbar = toolbar;
                this._toolbar?.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this._onToolbarClick);
            }),
            new ComponentDependency(IID_HabboCatalog, (catalog: IHabboCatalog | null) =>
            {
                this._catalog = catalog;
            }),
            new ComponentDependency(IID_HabboLandingView, (landingView: IHabboLandingView | null) =>
            {
                if(this.disposed) return;

                this._landingView = landingView;
            }),
            new ComponentDependency(IID_RoomEngine, (engine: IRoomEngine | null) =>
            {
                this._roomEngine = engine;
            }),
            new ComponentDependency(IID_HabboHelp, (help: IHabboHelp | null) =>
            {
                if(this.disposed) return;

                this._habboHelp = help;
            }),
            new ComponentDependency(IID_HabboInventory, (inventory: IHabboInventory | null) =>
            {
                if(this.disposed) return;

                this._inventory = inventory;
            }),
            new ComponentDependency(IID_HabboNavigator, (navigator: IHabboNavigator | null) =>
            {
                if(this.disposed) return;

                this._navigator = navigator;
            })
        ];
    }

    // AS3: HabboGameManager.as::get windowManager()
    public get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: HabboGameManager.as::get sessionDataManager()
    public get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: HabboGameManager.as::get communication()
    public get communication(): IHabboCommunicationManager | null
    {
        return this._communication;
    }

    // AS3: HabboGameManager.as::get localization()
    public get localization(): IHabboLocalizationManager | null
    {
        return this._localization;
    }

    // AS3: HabboGameManager.as::get avatarManager()
    public get avatarManager(): IAvatarRenderManager | null
    {
        return this._avatarManager;
    }

    // AS3: HabboGameManager.as::get roomEngine()
    public get roomEngine(): IRoomEngine | null
    {
        return this._roomEngine;
    }

    // AS3: HabboGameManager.as::get inventory()
    public get inventory(): IHabboInventory | null
    {
        return this._inventory;
    }

    // AS3: HabboGameManager.as::get navigator()
    public get navigator(): IHabboNavigator | null
    {
        return this._navigator;
    }

    /** On for everyone, or on for staff *and* this session has the staff flag. */
    // AS3: HabboGameManager.as::get gameCenterEnabled()
    public get gameCenterEnabled(): boolean
    {
        return this._gameCenterEnabled
            || (this._gameCenterEnabledForStaff && (this._sessionDataManager?.hasSecurity(4) ?? false));
    }

    // AS3: HabboGameManager.as::get isHotelClosed()
    public get isHotelClosed(): boolean
    {
        return this._hotelClosed;
    }

    // AS3: HabboGameManager.as::set hotelClosed()
    public set hotelClosed(hotelClosed: boolean)
    {
        this._hotelClosed = hotelClosed;
    }

    // AS3: HabboGameManager.as::initGameDirectoryConnection()
    public initGameDirectoryConnection(): void
    {
        this.send(new Game2CheckGameDirectoryStatusMessageComposer());
    }

    // AS3: HabboGameManager.as::startSnowWarGame()
    public startSnowWarGame(arenaName: string): void
    {
        this.initGameDirectoryConnection();
        this.send(new Game2StartSnowWarMessageComposer(arenaName));
    }

    // AS3: HabboGameManager.as::startQuickSnowWarGame()
    public startQuickSnowWarGame(): void
    {
        this.send(new Game2QuickJoinGameMessageComposer());
    }

    /**
     * The arena is over. The session is reset and the landing view reactivated — but only if a new
     * game is not already starting, which is what the `isGameStarting` guard is for.
     */
    // AS3: HabboGameManager.as::onSnowWarArenaSessionEnded()
    public onSnowWarArenaSessionEnded(): void
    {
        if(this._snowWarEngine?.isGameStarting) return;

        this._snowWarEngine?.resetSession();
        this._landingView?.activate();
    }

    // AS3: HabboGameManager.as::generateChecksumMismatch()
    public generateChecksumMismatch(): void
    {
        this._snowWarEngine?.generateChecksumMismatch();
    }

    // AS3: HabboGameManager.as::handleClickOnTile()
    public handleClickOnTile(event: RoomObjectTileMouseEvent): void
    {
        this._snowWarEngine?.handleClickOnTile(event);
    }

    // AS3: HabboGameManager.as::handleClickOnHuman()
    public handleClickOnHuman(gameObjectId: number, altKey: boolean, shiftKey: boolean): void
    {
        this._snowWarEngine?.handleClickOnHuman(gameObjectId, altKey, shiftKey);
    }

    // AS3: HabboGameManager.as::handleMouseOverOnHuman()
    public handleMouseOverOnHuman(gameObjectId: number, altKey: boolean, shiftKey: boolean): void
    {
        this._snowWarEngine?.handleMouseOverOnHuman(gameObjectId, altKey, shiftKey);
    }

    // AS3: HabboGameManager.as::send()
    public send(composer: IMessageComposer<unknown[]>): void
    {
        this._communication?.connection?.send(composer);
    }

    /**
     * The toolbar's games icon. AS3 also lists `HTIE_ICON_RECEPTION` as an empty case — a
     * fall-through with no body, kept here as the comment it effectively is.
     */
    // AS3: HabboGameManager.as::onToolbarClick()
    private onToolbarClick(event: HabboToolbarEvent): void
    {
        if(event.iconId !== 'HTIE_ICON_GAMES') return;

        this.initGameDirectoryConnection();
        this.send(new GetSnowWarGameTokensOfferComposer());
    }

    // AS3: HabboGameManager.as::dispose()
    public override dispose(): void
    {
        if(this._communication)
        {
            releaseProvider(this._communication, IID_HabboCommunicationManager);
            this._communication = null;
        }

        if(this._windowManager)
        {
            releaseProvider(this._windowManager, IID_HabboWindowManager);
            this._windowManager = null;
        }

        if(this._localization)
        {
            releaseProvider(this._localization, IID_HabboLocalizationManager);
            this._localization = null;
        }

        if(this._sessionDataManager !== null)
        {
            releaseProvider(this._sessionDataManager, IID_SessionDataManager);
            this._sessionDataManager = null;
        }

        if(this._roomSessionManager !== null)
        {
            releaseProvider(this._roomSessionManager, IID_RoomSessionManager);
            this._roomSessionManager = null;
        }

        if(this._habboHelp !== null)
        {
            releaseProvider(this._habboHelp, IID_HabboHelp);
            this._habboHelp = null;
        }

        if(this._toolbar)
        {
            this._toolbar.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this._onToolbarClick);
            releaseProvider(this._toolbar, IID_HabboToolbar);
            this._toolbar = null;
        }

        if(this._avatarManager !== null)
        {
            releaseProvider(this._avatarManager, IID_AvatarRenderManager);
            this._avatarManager = null;
        }

        if(this._catalog !== null)
        {
            releaseProvider(this._catalog, IID_HabboCatalog);
            this._catalog = null;
        }

        if(this._incomingMessages)
        {
            this._incomingMessages.dispose();
            this._incomingMessages = null;
        }

        if(this._landingView)
        {
            releaseProvider(this._landingView, IID_HabboLandingView);
            this._landingView = null;
        }

        if(this._roomEngine)
        {
            releaseProvider(this._roomEngine, IID_RoomEngine);
            this._roomEngine = null;
        }

        if(this._inventory)
        {
            releaseProvider(this._inventory, IID_HabboInventory);
            this._inventory = null;
        }

        if(this._navigator)
        {
            releaseProvider(this._navigator, IID_HabboNavigator);
            this._navigator = null;
        }

        // TS-only: AS3 leaves the engine to the DI container, which disposes every component it
        // built. This port constructs it directly, so it is disposed with its owner.
        if(this._snowWarEngine)
        {
            this._snowWarEngine.dispose();
            this._snowWarEngine = null;
        }

        this._activeGame = -1;

        super.dispose();
    }
}
