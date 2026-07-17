import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IHabboInventory, InventoryCategoryType} from './IHabboInventory';
import type {IFurniModel} from './furni/IFurniModel';
import type {IBadgesModel} from './badges/IBadgesModel';
import type {IEffectsModel} from './effects/IEffectsModel';
import type {IPetsModel} from './pets/IPetsModel';
import type {IBotsModel} from './bots/IBotsModel';
import type {ITradingModel} from './trading/ITradingModel';
import type {IPurse} from './purse/IPurse';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {FurniModel} from './furni/FurniModel';
import {BadgesModel} from './badges/BadgesModel';
import {EffectsModel} from './effects/EffectsModel';
import {PetsModel} from './pets/PetsModel';
import {BotsModel} from './bots/BotsModel';
import {TradingModel} from './trading/TradingModel';
import {Purse} from './purse/Purse';
import {UnseenItemTracker} from './UnseenItemTracker';
import {InventoryMainView} from './InventoryMainView';
import {Logger} from '@core/utils/Logger';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {RoomSessionEvent} from '@habbo/session/events/RoomSessionEvent';
import {
    GetBadgesComposer,
    GetBotInventoryComposer,
    GetPetInventoryComposer,
    RequestFurniInventoryComposer,
} from '../communication/messages/outgoing/inventory';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {FurniListMessageEvent} from '../communication/messages/incoming/inventory/furni/FurniListMessageEvent';
import {FurniListAddOrUpdateMessageEvent} from '../communication/messages/incoming/inventory/furni/FurniListAddOrUpdateMessageEvent';
import {FurniListRemoveMessageEvent} from '../communication/messages/incoming/inventory/furni/FurniListRemoveMessageEvent';
import {FurniListRemoveMultipleMessageEvent} from '../communication/messages/incoming/inventory/furni/FurniListRemoveMultipleMessageEvent';
import {FurniListInvalidateMessageEvent} from '../communication/messages/incoming/inventory/furni/FurniListInvalidateMessageEvent';
import type {FurniListMessageParser} from '../communication/messages/parser/inventory/furni/FurniListMessageParser';
import type {FurniListAddOrUpdateMessageParser} from '../communication/messages/parser/inventory/furni/FurniListAddOrUpdateMessageParser';
import type {FurniListRemoveMessageParser} from '../communication/messages/parser/inventory/furni/FurniListRemoveMessageParser';
import type {FurniListRemoveMultipleMessageParser} from '../communication/messages/parser/inventory/furni/FurniListRemoveMultipleMessageParser';
import type {FurniListItemParser} from '../communication/messages/parser/inventory/furni/FurniListItemParser';
import type {IFurnitureItemData} from './items/FurnitureItemData';
import {FurnitureItem} from './items/FurnitureItem';

const log = Logger.getLogger('Inventory');

/**
 * Main inventory controller
 *
 * Based on AS3 com.sulake.habbo.inventory.HabboInventory (ENGINE only)
 * UI is the ported window system (InventoryMainView), matching the AS3
 * class hierarchy — not SolidJS stores (SolidJS isn't a project dependency).
 */
export class HabboInventory extends Component implements IHabboInventory, ILinkEventTracker
{
    private _communication: IHabboCommunicationManager | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _catalog: IHabboCatalog | null = null;
    private _toolbar: IHabboToolbar | null = null;
    private _roomEngine: IRoomEngine | null = null;
    private _roomSessionManager: IRoomSessionManager | null = null;
    private _sessionDataManager: ISessionDataManager | null = null;
    private _localization: IHabboLocalizationManager | null = null;
    private _furniMessageEvents: IMessageEvent[] = [];
    private _furniListFragments: Map<number, FurniListItemParser> = new Map();
    private _initializedCategories: Set<string> = new Set();
    private _view!: InventoryMainView;

    constructor(context: IContext)
    {
        super(context);
    }

    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get roomSession()
    get roomSession(): IRoomSession | null
    {
        if(!this._roomSessionManager || !this._roomEngine) return null;

        return this._roomSessionManager.getSession(this._roomEngine.activeRoomId);
    }

    get catalog(): IHabboCatalog | null
    {
        return this._catalog;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get view()
    get view(): InventoryMainView
    {
        return this._view;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get isVisible()
    get isVisible(): boolean
    {
        return this._view.isVisible;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get isMainViewActive()
    get isMainViewActive(): boolean
    {
        return this._view.isActive;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get mergeRentFurni()
    get mergeRentFurni(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get web3tradeEnabled()
    get web3tradeEnabled(): boolean
    {
        return this.getBoolean('web3trade.enabled');
    }

    private _isInitialized: boolean = false;

    get isInitialized(): boolean
    {
        return this._isInitialized;
    }

    private _currentCategory: InventoryCategoryType | null = null;

    get currentCategory(): InventoryCategoryType | null
    {
        return this._currentCategory;
    }

    private _hasRoomSession: boolean = false;

    get hasRoomSession(): boolean
    {
        return this._hasRoomSession;
    }

    set hasRoomSession(value: boolean)
    {
        this._hasRoomSession = value;
    }

    private _furniModel!: FurniModel;

    get furniModel(): IFurniModel
    {
        return this._furniModel;
    }

    private _badgesModel!: BadgesModel;

    get badgesModel(): IBadgesModel
    {
        return this._badgesModel;
    }

    private _effectsModel!: EffectsModel;

    get effectsModel(): IEffectsModel
    {
        return this._effectsModel;
    }

    private _petsModel!: PetsModel;

    get petsModel(): IPetsModel
    {
        return this._petsModel;
    }

    private _botsModel!: BotsModel;

    get botsModel(): IBotsModel
    {
        return this._botsModel;
    }

    private _tradingModel!: TradingModel;

    get tradingModel(): ITradingModel
    {
        return this._tradingModel;
    }

    private _purse: Purse = new Purse();

    get purse(): IPurse
    {
        return this._purse;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::get clubLevel()
    get clubLevel(): number
    {
        if(this._purse.clubDays === 0 && this._purse.clubPeriods === 0)
        {
            return 0;
        }

        if(this._purse.isVIP)
        {
            return 2;
        }

        return 1;
    }

    private _unseenItemTracker: UnseenItemTracker | null = null;

    get unseenItemTracker(): UnseenItemTracker
    {
        return this._unseenItemTracker!;
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
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                },
                true
            ),
            // Required, as AS3 declares it — it omits the third argument here and
            // passes an explicit `false` for IIDHabboFriendList further down, so the
            // distinction is deliberate. init() hands this straight to FurniModel as
            // `this._catalog!`, so optional meant the model could be built around a
            // null catalog.
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: IHabboCatalog | null) =>
                {
                    this._catalog = catalog;
                },
                true
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (roomEngine: IRoomEngine | null) =>
                {
                    this._roomEngine = roomEngine;
                },
                true
            ),
            // Required, as AS3 declares it (no third argument). HeliumMain attaches
            // SessionDataManager before HabboInventory, so this neither delays init
            // nor risks a deadlock. getFurnitureData() still null-guards it, matching
            // AS3's own defensive guard.
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) =>
                {
                    this._sessionDataManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: IRoomSessionManager | null) =>
                {
                    // sessionEvents is a dedicated EventEmitter (not Component.events - see
                    // RoomSessionManager.ts), so it can't use ComponentDependency's built-in
                    // eventListeners param (that subscribes to .events). Subscribe/unsubscribe
                    // manually, matching the IID_HabboToolbar dependency below.
                    this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_STARTED, this.onRoomSessionEvent);
                    this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_ENDED, this.onRoomSessionEvent);

                    this._roomSessionManager = manager;

                    manager?.sessionEvents.on(RoomSessionEvent.RSE_STARTED, this.onRoomSessionEvent);
                    manager?.sessionEvents.on(RoomSessionEvent.RSE_ENDED, this.onRoomSessionEvent);
                },
                false
            ),
            // Required, as AS3 declares it — same reasoning as IID_HabboCatalog above.
            // init() passes this to FurniModel as `this._localization!`, and every
            // furniture name in the inventory is read back through it.
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (localization: IHabboLocalizationManager | null) =>
                {
                    this._localization = localization;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) =>
                {
                    // toolbarEvents is a dedicated EventEmitter (not Component.events —
                    // see HabboToolbar.ts), so it can't use ComponentDependency's
                    // built-in eventListeners param (that subscribes to .events).
                    // Subscribe/unsubscribe manually, matching HabboNewNavigator.ts.
                    if(this._toolbar)
                    {
                        this._toolbar.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);
                    }

                    this._toolbar = toolbar;

                    if(toolbar)
                    {
                        toolbar.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);
                    }
                },
                false
            ),
        ];
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::habboToolbarEventHandler()
    private onHabboToolbarEvent = (event: HabboToolbarEvent): void =>
    {
        this._view?.onHabboToolbarEvent(event);
    };

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::roomSessionEventHandler()
    // TODO(AS3): the RSDUE_ALLOW_PETS case (petsModel.updatePetsAllowed()) and RSE_ENDED's
    // deselectAllEffects() aren't ported - PetsModel.ts has no updatePetsAllowed() and the
    // avatar-effects inventory tab (EffectsModel) isn't ported at all yet. This only restores
    // the RSE_STARTED -> furniModel.updateView() refresh, which is what re-evaluates the
    // "place in room"/rent/use action buttons against the now-current room session - without it,
    // HabboInventory.roomSession (recomputed from roomSessionManager.getSession() on every
    // access) could still be null/stale if the inventory was opened mid room-entry, and nothing
    // ever re-ran updateActionButtons() afterwards.
    private onRoomSessionEvent = (event: RoomSessionEvent): void =>
    {
        if(!this.isVisible) return;

        if(event.type === RoomSessionEvent.RSE_STARTED)
        {
            this._furniModel?.updateView();
        }
    };

    override dispose(): void
    {
        if(this.disposed) return;

        this._toolbar?.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);
        this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_STARTED, this.onRoomSessionEvent);
        this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_ENDED, this.onRoomSessionEvent);

        for(const event of this._furniMessageEvents)
        {
            this._communication?.removeMessageEvent(event);
        }

        this._furniMessageEvents = [];
        this._furniModel?.dispose();
        this._badgesModel?.dispose();
        this._effectsModel?.dispose();
        this._petsModel?.dispose();
        this._botsModel?.dispose();
        this._tradingModel?.dispose();
        this._unseenItemTracker?.dispose();
        this._view?.dispose();

        this._initializedCategories.clear();

        log.info('Inventory disposed');
        super.dispose();
    }

    init(): void
    {
        if(this._isInitialized) return;

        this._furniModel = new FurniModel(
            this,
            this._windowManager!,
            this._roomEngine!,
            this._communication!,
            this._catalog!,
            this._localization!
        );
        this._badgesModel = new BadgesModel();
        this._effectsModel = new EffectsModel();
        this._petsModel = new PetsModel();
        this._botsModel = new BotsModel();
        this._tradingModel = new TradingModel();

        this._isInitialized = true;
    }

    switchCategory(category: InventoryCategoryType): void
    {
        if(!this._isInitialized)
        {
            this.init();
        }

        this._currentCategory = category;

        // Handle furni/rentables special case
        if(category === 'furni' || category === 'rentables')
        {
            this._furniModel.categorySwitch(category);
        }
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::getSubCategoryViewId()
    getSubCategoryViewId(): string | null
    {
        return this._view.getSubCategoryViewId();
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::closeView()
    closeView(): void
    {
        if(this._view?.isVisible)
        {
            this._view.hideInventory();
        }
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::showView()
    showView(): void
    {
        this._view?.showInventory();
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::preparingInventoryView()
    preparingInventoryView(): void
    {
        if(!this._isInitialized)
        {
            this.init();
        }
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::inventoryViewOpened()
    inventoryViewOpened(category: string): void
    {
        this._currentCategory = category as InventoryCategoryType;

        if(category === 'furni' || category === 'rentables')
        {
            this._furniModel.categorySwitch(category);
        }
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::closingInventoryView()
    // TODO(AS3): AS3 calls closingInventoryView() on every registered IInventoryModel;
    // only furni implements the shared contract until the other categories do.
    closingInventoryView(): void
    {
        this._furniModel?.closingInventoryView();
        this.events.emit('HABBO_INVENTORY_TRACKING_EVENT_CLOSED');
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::toggleInventoryPage()
    toggleInventoryPage(category: string, itemId: string | null = null, forceSwitch: boolean = false): void
    {
        const opened = this._view.toggleCategoryView(category, false, forceSwitch);

        if(opened)
        {
            this.inventoryViewOpened(category);

            if(itemId !== null && category === 'furni')
            {
                this._furniModel.selectItemById(itemId);
            }
        }
        else
        {
            this.events.emit('HABBO_INVENTORY_TRACKING_EVENT_CLOSED');
        }
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::toggleInventorySubPage()
    toggleInventorySubPage(category: string): void
    {
        this._view.toggleSubCategoryView(category, false);

        if(category === 'trading')
        {
            this._view.toggleCategoryView('furni', false);
        }
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::updateSubView()
    updateSubView(): void
    {
        this._view.updateSubCategoryView();
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::updateUnseenItemCounts()
    updateUnseenItemCounts(): void
    {
        if(!this._unseenItemTracker) return;

        this._view.updateUnseenFurniCount(this._unseenItemTracker.getCount(1));
        this._view.updateUnseenRentedFurniCount(this._unseenItemTracker.getCount(2));
        this._view.updateUnseenPetsCount(this._unseenItemTracker.getCount(3));
        this._view.updateUnseenBadgeCount(this._unseenItemTracker.getCount(4));
        this._view.updateUnseenBotCount(this._unseenItemTracker.getCount(5));
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::getCategoryWindowContainer()
    // TODO(AS3): only furni/rentables have a ported View so far. PetsView/
    // BadgesView/BotsView/EffectsView/TradingView/CollectiblesView/MarketplaceView
    // resolve to "no content" until ported, matching InventoryMainView's existing
    // null-guard (setViewToCategory returns early when this is null).
    getCategoryWindowContainer(category: string): IWindowContainer | null
    {
        if(category === 'furni' || category === 'rentables')
        {
            return this._furniModel.getWindowContainer();
        }

        return null;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::getCategorySubWindowContainer()
    getCategorySubWindowContainer(_category: string): IWindowContainer | null
    {
        return null;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::updateView()
    updateView(category: string): void
    {
        if(category === 'furni' || category === 'rentables')
        {
            this._furniModel.updateView();
        }
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::isInventoryCategoryInit()
    isInventoryCategoryInit(category: string): boolean
    {
        return this._initializedCategories.has(category);
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::setInventoryCategoryInit()
    setInventoryCategoryInit(category: string, init: boolean = true): boolean
    {
        if(init)
        {
            if(!this._initializedCategories.has(category))
            {
                this._initializedCategories.add(category);

                return true;
            }
        }
        else
        {
            this._initializedCategories.delete(category);

            if(this._view?.isVisible && category !== 'rentables')
            {
                this.requestInventoryCategoryInit(category);
            }
        }

        return false;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::checkCategoryInitilization()
    checkCategoryInitilization(category: string): boolean
    {
        if(this.isInventoryCategoryInit(category))
        {
            return true;
        }

        this.requestInventoryCategoryInit(category);

        return false;
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::requestInventoryCategoryInit()
    requestInventoryCategoryInit(category: string): void
    {
        switch(category)
        {
            case 'furni':
            case 'rentables':
                this.requestFurni();
                break;
            case 'badges':
                this.requestBadges();
                break;
            case 'pets':
                this.requestPets();
                break;
            case 'bots':
                this.requestBots();
                break;
        }
    }

    setClubStatus(
        periods: number,
        days: number,
        hasEverBeenMember: boolean,
        isVIP: boolean,
        isExpiring: boolean,
        citizenshipVipIsExpiring: boolean,
        minutesUntilExpiration: number,
        minutesSinceLastModified: number
    ): void
    {
        this._purse.clubPeriods = periods;
        this._purse.clubDays = days;
        this._purse.clubHasEverBeenMember = hasEverBeenMember;
        this._purse.isVIP = isVIP;
        this._purse.clubIsExpiring = isExpiring;
        this._purse.citizenshipVipIsExpiring = citizenshipVipIsExpiring;
        this._purse.minutesUntilExpiration = minutesUntilExpiration;
        this._purse.minutesSinceLastModified = minutesSinceLastModified;
    }

    requestFurni(): void
    {
        this._communication?.connection?.send(new RequestFurniInventoryComposer());
    }

    requestBadges(): void
    {
        this._communication?.connection?.send(new GetBadgesComposer());
    }

    requestPets(): void
    {
        this._communication?.connection?.send(new GetPetInventoryComposer());
    }

    requestBots(): void
    {
        this._communication?.connection?.send(new GetBotInventoryComposer());
    }

    // AS3: sources/win63_version/habbo/inventory/HabboInventory.as::initComponent()
    // AS3 creates `view` (var_18 = new InventoryMainView(...)) unconditionally
    // here, separately from the lazily-created models (init()) — the view must
    // exist before any toolbar click can reach it.
    protected override initComponent(): void
    {
        // AS3 registers the tracker here, before building the unseen tracker and the view
        // (HabboInventory.as:200).
        this.context.addLinkEventTracker(this);

        this._unseenItemTracker = new UnseenItemTracker(this._communication!, this.events, this);
        this._view = new InventoryMainView(this);
        this.registerFurniMessageEvents();
        log.info('Inventory initialized');
    }

    /**
	 * Resolves the furniture data for a class id and type ("s" floor / "i" wall).
	 *
	 * GroupItem.furniData calls this to recover an item's className, which every
	 * NFT check and the furni-line lookups depend on. It null-guards the session
	 * data manager exactly as AS3 does, so a call before that manager is injected
	 * returns null rather than throwing.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/HabboInventory.as::getFurnitureData()
    public getFurnitureData(classId: number, type: string): IFurnitureData | null
    {
        if(this._sessionDataManager === null)
        {
            return null;
        }

        if(type === 's')
        {
            return this._sessionDataManager.getFloorItemData(classId);
        }

        if(type === 'i')
        {
            return this._sessionDataManager.getWallItemData(classId);
        }

        return null;
    }

    // --- ILinkEventTracker ---

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/HabboInventory.as::get linkPattern()
    public get linkPattern(): string
    {
        return 'inventory/';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/HabboInventory.as::linkReceived()
    public linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2)
        {
            return;
        }

        if(parts[1] !== 'open')
        {
            log.debug(`Inventory unknown link-type received: ${parts[1]}`);
        }
        else if(parts.length === 2)
        {
            this.toggleInventoryPage('furni');
        }
        else if(parts.length === 3)
        {
            this.toggleInventoryPage(parts[2]);
        }
        else if(parts.length === 4)
        {
            this.toggleInventoryPage(parts[2], parts[3]);
        }
    }

    // TS-only: AS3's message routing happens elsewhere in the engine and simply
    // calls FurniModel.insertFurniture()/etc directly; this port wires the
    // incoming messages here since HabboInventory owns the FurniModel lifecycle.
    private registerFurniMessageEvents(): void
    {
        if(!this._communication) return;

        this._furniMessageEvents.push(
            this._communication.addMessageEvent(new FurniListMessageEvent(this.onFurniList)),
            this._communication.addMessageEvent(new FurniListAddOrUpdateMessageEvent(this.onFurniListAddOrUpdate)),
            this._communication.addMessageEvent(new FurniListRemoveMessageEvent(this.onFurniListRemove)),
            this._communication.addMessageEvent(new FurniListRemoveMultipleMessageEvent(this.onFurniListRemoveMultiple)),
            this._communication.addMessageEvent(new FurniListInvalidateMessageEvent(this.onFurniListInvalidate))
        );
    }

    private onFurniList = (event: IMessageEvent): void =>
    {
        const parser = event.parser as FurniListMessageParser | null;

        if(!parser) return;

        for(const [itemId, item] of parser.items)
        {
            this._furniListFragments.set(itemId, item);
        }

        if(parser.fragmentNo < parser.totalFragments - 1) return;

        const items = new Map<number, IFurnitureItemData>();

        for(const [itemId, item] of this._furniListFragments)
        {
            items.set(itemId, item.toFurnitureItemData());
        }

        this._furniListFragments.clear();
        this._furniModel?.insertFurniture(items);
    };

    private onFurniListAddOrUpdate = (event: IMessageEvent): void =>
    {
        const parser = event.parser as FurniListAddOrUpdateMessageParser | null;

        if(!parser || !this._furniModel) return;

        for(const item of parser.items)
        {
            this._furniModel.addOrUpdateItem(new FurnitureItem(item.toFurnitureItemData()), false);
        }
    };

    private onFurniListRemove = (event: IMessageEvent): void =>
    {
        const parser = event.parser as FurniListRemoveMessageParser | null;

        if(!parser || !this._furniModel) return;

        this._furniModel.removeFurni(parser.itemId);
    };

    // AS3: sources/win63_version/habbo/inventory/class_1762.as::onFurniListRemoveMultiple()
    private onFurniListRemoveMultiple = (event: IMessageEvent): void =>
    {
        const parser = event.parser as FurniListRemoveMultipleMessageParser | null;

        if(!parser || !this._furniModel) return;

        if(this._furniModel.removeFurnis(parser.stripIds))
        {
            this._furniModel.resetUnseenItems();
        }
    };

    private onFurniListInvalidate = (_event: IMessageEvent): void =>
    {
        this.requestFurni();
    };
}
