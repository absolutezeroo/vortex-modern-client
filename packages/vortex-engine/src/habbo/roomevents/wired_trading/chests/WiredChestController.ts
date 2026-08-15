import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import {
    OpenWiredChestMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/chests/OpenWiredChestMessageEvent';
import type {
    OpenWiredChestMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/OpenWiredChestMessageParser';
import {
    OpenWiredChestComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/OpenWiredChestComposer';
import {
    CloseWiredChestComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/CloseWiredChestComposer';

import type {HabboUserDefinedRoomEvents} from '../../HabboUserDefinedRoomEvents';
import type {IWiredChest} from './IWiredChest';
import type {IWiredChestControllerHost} from './IWiredChestControllerHost';
import type {IChestSubController} from './subcontrollers/IChestSubController';
import {CoinChestSubController} from './subcontrollers/CoinChestSubController';
import {FurniChestSubController} from './subcontrollers/FurniChestSubController';
import {WiredChestWrapperView} from './WiredChestWrapperView';

const log = Logger.getLogger('habbo.roomevents.chests.WiredChestController');

/**
 * Owns the one chest window and the two sub-controllers that fill it.
 *
 * **Opening is a three-step handshake and the client never opens anything by itself.** The server
 * pushes "open chest N", this asks for N's contents, and whichever sub-controller receives them
 * calls back into {@link setOpenStatus} with itself — that is the only path to a visible window.
 *
 * Two ids, deliberately: `requestedChestId` is set while a request is in flight and `activeChestId`
 * only once contents arrive. A sub-controller matches the *requested* id on its first fragment and
 * the *active* one after, so a reply for a chest the player has already left is ignored rather than
 * rendered.
 *
 * **Closing tells the server.** {@link setClosedStatus} sends 2935 whenever there was an active
 * chest — a chest left open holds server-side state, so the wrapper view calls this on every hide,
 * not only on the close button.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/WiredChestController.as
 */
export class WiredChestController extends Component implements IWiredChest, IWiredChestControllerHost
{
    // AS3: WiredChestController.as::STATUS_CLOSED
    static readonly STATUS_CLOSED: number = 0;

    // AS3: WiredChestController.as::STATUS_OPENING
    static readonly STATUS_OPENING: number = 1;

    // AS3: WiredChestController.as::STATUS_OPEN
    static readonly STATUS_OPEN: number = 2;

    /**
	 * Furniture. AS3 inlines 10 at all three call sites and never names it.
	 */
    // AS3: WiredChestController.as::setOpenStatus() — inline category (name derived)
    private static readonly CATEGORY_FLOOR: number = 10;

    // AS3: WiredChestController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: WiredChestController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: WiredChestController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: WiredChestController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: WiredChestController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: WiredChestController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredChestController.as::_catalog
    private _catalog: IHabboCatalog | null = null;

    // AS3: WiredChestController.as::_disposed
    private _controllerDisposed: boolean = false;

    // AS3: WiredChestController.as::_status
    private _status: number = WiredChestController.STATUS_CLOSED;

    // AS3: WiredChestController.as::_SafeStr_4749 (name derived: the chest window)
    private _chestWrapperView: WiredChestWrapperView | null = null;

    // AS3: WiredChestController.as::_subControllers
    private _subControllers: IChestSubController[] = [];

    // AS3: WiredChestController.as::_SafeStr_5996 (name derived: the chest being asked for)
    private _requestedChestId: number = 0;

    // AS3: WiredChestController.as::_SafeStr_5239 (name derived: the chest currently open)
    private _activeChestId: number = 0;

    // AS3: WiredChestController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: WiredChestController.as::WiredChestController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);

        this._roomEvents = roomEvents;
        this._messageEvents = [new OpenWiredChestMessageEvent((event) => this.onOpenChest(event))];

        // AS3 registers the events and builds both sub-controllers here; this port defers both to
        // initComponent(), where communication and the window manager are resolved — a sub-controller
        // pulls its contents view out of the window manager while constructing.
    }

    // AS3: WiredChestController.as::get dependencies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => { this._communicationManager = manager; },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) => { this._sessionDataManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => { this.setWindowManager(manager); }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => { this._localizationManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: IHabboCatalog | null) => { this._catalog = catalog; }
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (engine: IRoomEngine | null) => { this._roomEngine = engine; },
                false
            )
            // AS3 also depends on IIDHabboRoomSessionManager with an RSE_STARTED listener, but that
            // handler is empty (roomSessionEventHandler does nothing), so it is omitted here as inert
            // — the same call WiredRoomLogListController makes.
        ];
    }

    /**
	 * AS3's dependency list carries the three room-engine listeners; RoomEngine emits them on
	 * `events`, so they are subscribed directly here, as the sibling controllers do.
	 */
    // AS3: WiredChestController.as::initComponent() — deferred registration; AS3 does this in the constructor.
    protected override initComponent(): void
    {
        for(const messageEvent of this._messageEvents)
        {
            this.addMessageEvent(messageEvent);
        }

        this._subControllers = [new FurniChestSubController(this), new CoinChestSubController(this)];

        this._roomEngine?.events.on('REE_DISPOSED', this._onRoomEngineDisposed);
        this._roomEngine?.events.on('REOE_REMOVED', this._onRoomObjectRemoved);
        this._roomEngine?.events.on('REOE_UPDATED', this._onRoomObjectUpdated);
    }

    /**
	 * The window is built the moment the window manager arrives, not on first open — the wrapper's
	 * constructor measures the layout's chrome, which only works before anything resizes it.
	 */
    // AS3: WiredChestController.as::setWindowManager()
    private setWindowManager(windowManager: IHabboWindowManager | null): void
    {
        this._windowManager = windowManager;

        if(windowManager !== null)
        {
            this._chestWrapperView = new WiredChestWrapperView(this, windowManager);
        }
    }

    // AS3: WiredChestController.as::onOpenChest()
    private onOpenChest(event: IMessageEvent): void
    {
        this.open((event.parser as OpenWiredChestMessageParser).chestId);
    }

    /**
	 * Asking, not opening: the window appears only once a sub-controller reports contents.
	 */
    // AS3: WiredChestController.as::open()
    open(chestId: number): void
    {
        this._requestedChestId = chestId;
        this._communicationManager?.connection?.send(new OpenWiredChestComposer(chestId));
    }

    // AS3: WiredChestController.as::close()
    close(): void
    {
        this._chestWrapperView?.hide();
        this.setClosedStatus();
    }

    // AS3: WiredChestController.as::setClosedStatus()
    setClosedStatus(): void
    {
        if(this._activeChestId !== 0)
        {
            this._communicationManager?.connection?.send(new CloseWiredChestComposer(this._activeChestId));
        }

        this._activeChestId = 0;
        this._status = WiredChestController.STATUS_CLOSED;
    }

    // AS3: WiredChestController.as::setOpeningStatus()
    setOpeningStatus(chestId: number): void
    {
        this._requestedChestId = 0;
        this._activeChestId = chestId;
        this._status = WiredChestController.STATUS_OPENING;
    }

    /**
	 * The only path to a visible chest window. The furniture has to still be in the room — the
	 * ownership flags shown around the contents are read off it, so there is nothing to show without
	 * it.
	 */
    // AS3: WiredChestController.as::setOpenStatus()
    setOpenStatus(chestId: number, subController: IChestSubController): void
    {
        this._requestedChestId = 0;
        this._activeChestId = chestId;
        this._status = WiredChestController.STATUS_OPEN;

        const chestFurni = this._roomEngine?.getRoomObject(
            this._roomEngine.activeRoomId,
            this._activeChestId,
            WiredChestController.CATEGORY_FLOOR
        ) ?? null;

        if(chestFurni === null || chestFurni.getModel() === null)
        {
            log.warn("Tried to open chest, but it's not in the room");
            this._chestWrapperView?.hide();

            return;
        }

        const isChestOwner = chestFurni.getModel().getNumber('furniture_owner_id') === this._roomEvents.sessionDataManager?.userId;
        const isRoomOwner = this._roomEvents.roomSession?.isRoomOwner ?? false;

        this._chestWrapperView?.show(subController, chestFurni, this._activeChestId, isChestOwner, isRoomOwner);
    }

    // AS3: WiredChestController.as::get status()
    get status(): number
    {
        return this._status;
    }

    // AS3: WiredChestController.as::get chestWrapperView()
    get chestWrapperView(): WiredChestWrapperView | null
    {
        return this._chestWrapperView;
    }

    /**
	 * The chest was picked up while open — nothing to show it against, so the window goes.
	 */
    // AS3: WiredChestController.as::roomObjectRemovedHandler()
    private _onRoomObjectRemoved = (event: RoomEngineObjectEvent): void =>
    {
        if(event.objectId === this._chestWrapperView?.viewingChestId
            && this._status === WiredChestController.STATUS_OPEN
            && event.category === WiredChestController.CATEGORY_FLOOR)
        {
            this._chestWrapperView.hide();
        }
    };

    /**
	 * Every setting the window shows lives in the furniture's stuff data, so a room-object update is
	 * how a settings save comes back — there is no dedicated "settings changed" message for it.
	 */
    // AS3: WiredChestController.as::roomObjectUpdatedHandler()
    private _onRoomObjectUpdated = (event: RoomEngineObjectEvent): void =>
    {
        if(event.objectId === this._chestWrapperView?.viewingChestId
            && this._status === WiredChestController.STATUS_OPEN
            && event.category === WiredChestController.CATEGORY_FLOOR)
        {
            this._chestWrapperView.viewingChestUpdated();
        }
    };

    // AS3: WiredChestController.as::get activeChestId()
    get activeChestId(): number
    {
        return this._activeChestId;
    }

    // AS3: WiredChestController.as::get requestedChestId()
    get requestedChestId(): number
    {
        return this._requestedChestId;
    }

    // AS3: WiredChestController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager) return;

        this._communicationManager.addHabboConnectionMessageEvent(event);
    }

    // AS3: WiredChestController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager) return;

        this._communicationManager.removeHabboConnectionMessageEvent(event);
    }

    // AS3: WiredChestController.as::roomEventHandler()
    private _onRoomEngineDisposed = (): void =>
    {
        if(this._roomEngine === null) return;

        this._chestWrapperView?.hide();
    };

    /**
	 * The player's wired rights changed under an open chest. Losing read access closes it unless the
	 * chest is open to everyone; otherwise the window just re-reads what it may now show.
	 */
    // AS3: WiredChestController.as::onPermissionsChanged()
    onPermissionsChanged(): void
    {
        if(this._chestWrapperView === null) return;

        if(this._chestWrapperView.isShowing()
            && !this._chestWrapperView.canRead
            && !this._chestWrapperView.isVisibleForEveryone)
        {
            this._chestWrapperView.hide();
        }

        if(this._chestWrapperView.isShowing())
        {
            this._chestWrapperView.updateLayout();
            this._chestWrapperView.updateUI();
        }
    }

    /**
	 * Declared and never called in AS3 — nothing looks a sub-controller up by type, because each one
	 * hands itself to {@link setOpenStatus} when its own contents arrive. Kept so the class stays a
	 * faithful port.
	 */
    // AS3: WiredChestController.as::subControllerByType()
    private subControllerByType(type: number): IChestSubController | null
    {
        for(const subController of this._subControllers)
        {
            if(subController.type === type)
            {
                return subController;
            }
        }

        return null;
    }

    // AS3: WiredChestController.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: WiredChestController.as::get communicationManager()
    get communicationManager(): IHabboCommunicationManager | null
    {
        return this._communicationManager;
    }

    // AS3: WiredChestController.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: WiredChestController.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: WiredChestController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: WiredChestController.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this._roomEngine;
    }

    // AS3: WiredChestController.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: WiredChestController.as::get catalog()
    get catalog(): IHabboCatalog | null
    {
        return this._catalog;
    }

    // AS3: WiredChestController.as::get disposed()
    override get disposed(): boolean
    {
        return this._controllerDisposed;
    }

    // AS3: WiredChestController.as::dispose()
    override dispose(): void
    {
        if(this._controllerDisposed)
        {
            return;
        }

        this._controllerDisposed = true;

        this._roomEngine?.events.off('REE_DISPOSED', this._onRoomEngineDisposed);
        this._roomEngine?.events.off('REOE_REMOVED', this._onRoomObjectRemoved);
        this._roomEngine?.events.off('REOE_UPDATED', this._onRoomObjectUpdated);

        for(const subController of this._subControllers)
        {
            subController.dispose();
        }

        this._subControllers = [];

        for(const messageEvent of this._messageEvents)
        {
            this.removeMessageEvent(messageEvent);
        }

        this._messageEvents = [];
        this._requestedChestId = 0;
        this._activeChestId = 0;
        this._status = WiredChestController.STATUS_CLOSED;
        this._chestWrapperView?.dispose();
        this._chestWrapperView = null;
        this._communicationManager = null;
        this._localizationManager = null;
        this._sessionDataManager = null;
        this._windowManager = null;
        this._roomEngine = null;
        this._catalog = null;

        super.dispose();
    }
}
