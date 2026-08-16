import {EventEmitter} from 'eventemitter3';

import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboInventory} from '@iid/IIDHabboInventory';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {UnseenItemCategory} from '@habbo/inventory/enum/UnseenItemCategory';
import {HabbiconAssetManager} from '@habbo/habbicons/assets/HabbiconAssetManager';

import type {
    OwnedHabbiconData
} from '@habbo/communication/messages/incoming/habbicons/OwnedHabbiconData';
import type {
    HabbiconShopItemData
} from '@habbo/communication/messages/incoming/habbicons/HabbiconShopItemData';
import type {
    HabbiconCollectionData
} from '@habbo/communication/messages/incoming/habbicons/HabbiconCollectionData';
import {
    UserHabbiconsMessageEvent
} from '@habbo/communication/messages/incoming/habbicons/UserHabbiconsMessageEvent';
import type {
    UserHabbiconsMessageParser
} from '@habbo/communication/messages/parser/habbicons/UserHabbiconsMessageParser';
import {
    UserHabbiconStatusChangedMessageEvent
} from '@habbo/communication/messages/incoming/habbicons/UserHabbiconStatusChangedMessageEvent';
import type {
    UserHabbiconStatusChangedMessageParser
} from '@habbo/communication/messages/parser/habbicons/UserHabbiconStatusChangedMessageParser';
import {
    HabbiconShopDataMessageEvent
} from '@habbo/communication/messages/incoming/habbicons/HabbiconShopDataMessageEvent';
import type {
    HabbiconShopDataMessageParser
} from '@habbo/communication/messages/parser/habbicons/HabbiconShopDataMessageParser';
import {
    HabbiconInfoMessageEvent
} from '@habbo/communication/messages/incoming/habbicons/HabbiconInfoMessageEvent';
import type {
    HabbiconInfoMessageParser
} from '@habbo/communication/messages/parser/habbicons/HabbiconInfoMessageParser';
import {
    RoomUseHabbiconMessageEvent
} from '@habbo/communication/messages/incoming/habbicons/RoomUseHabbiconMessageEvent';
import type {
    RoomUseHabbiconMessageParser
} from '@habbo/communication/messages/parser/habbicons/RoomUseHabbiconMessageParser';
import {
    PurchaseOKMessageEvent
} from '@habbo/communication/messages/incoming/catalog/PurchaseOKMessageEvent';
import {
    PurchaseErrorMessageEvent
} from '@habbo/communication/messages/incoming/catalog/PurchaseErrorMessageEvent';
import {
    PurchaseNotAllowedMessageEvent
} from '@habbo/communication/messages/incoming/catalog/PurchaseNotAllowedMessageEvent';

import {
    GetHabbiconShopDataMessageComposer
} from '@habbo/communication/messages/outgoing/habbicons/GetHabbiconShopDataMessageComposer';
import {
    GetHabbiconInfoMessageComposer
} from '@habbo/communication/messages/outgoing/habbicons/GetHabbiconInfoMessageComposer';
import {
    BuyHabbiconMessageComposer
} from '@habbo/communication/messages/outgoing/habbicons/BuyHabbiconMessageComposer';
import {
    BuyHabbiconCollectionMessageComposer
} from '@habbo/communication/messages/outgoing/habbicons/BuyHabbiconCollectionMessageComposer';
import {
    ClaimHabbiconMessageComposer
} from '@habbo/communication/messages/outgoing/habbicons/ClaimHabbiconMessageComposer';
import {
    FavoriteHabbiconMessageComposer
} from '@habbo/communication/messages/outgoing/habbicons/FavoriteHabbiconMessageComposer';
import {
    UnfavoriteHabbiconMessageComposer
} from '@habbo/communication/messages/outgoing/habbicons/UnfavoriteHabbiconMessageComposer';

import {HabbiconControllerEvent} from './HabbiconControllerEvent';
import {HabbiconState} from './HabbiconState';
import type {IHabbiconController} from './IHabbiconController';
import type {HabbiconEntryModel} from './HabbiconEntryModel';
import type {HabbiconSetModel} from './HabbiconSetModel';
import {HabbiconView} from './HabbiconView';
import {HabbiconPurchaseConfirmationView} from './HabbiconPurchaseConfirmationView';

/**
 * The habbicon hub: what the player owns, what the shop sells, and the window that shows both.
 *
 * **`habbicons.enabled` gates everything, including construction.** `initComponent()` returns before
 * registering a single message event or link tracker when the flag is off, so a hotel without
 * habbicons pays nothing for this component beyond its dependencies. Every public method re-tests it
 * — the flag can be false at boot and true later.
 *
 * **It keeps two caches of the same habbicons and reconciles them by hand.** `_ownedHabbicons` comes
 * from the user list (3728/2019), `_shopItems` from the shop (3765/3714), and a status change has to
 * be written into both — that is what `updateCachedShopItemState()` is for. Getting one and not the
 * other leaves a tile showing the wrong price.
 *
 * **A purchase is confirmed by the generic catalog reply, not a habbicon one.** There is no
 * habbicon-specific purchase response: `_pendingPurchaseRefresh` is armed before sending, and the
 * next PurchaseOK/Error/NotAllowed to arrive is claimed as this purchase's. Two purchases in flight
 * at once would confuse them, which is why the confirmation dialog is modal.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconController.as
 */
export class HabbiconController extends Component implements ILinkEventTracker, IHabbiconController
{
    // AS3: HabbiconController.as::RECENT_HABBICON_LIMIT
    private static readonly RECENT_HABBICON_LIMIT: number = 10;

    // AS3: HabbiconController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: HabbiconController.as::_configurationManager
    private _configurationManager: IHabboConfigurationManager | null = null;

    // AS3: HabbiconController.as::_inventory
    private _inventory: IHabboInventory | null = null;

    // AS3: HabbiconController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: HabbiconController.as::_notifications
    private _notifications: IHabboNotifications | null = null;

    // AS3: HabbiconController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: HabbiconController.as::_SafeStr_4550 (name derived: the hub window)
    private _view: HabbiconView | null = null;

    // AS3: HabbiconController.as::_SafeStr_5190 (name derived: the purchase confirmation)
    private _purchaseConfirmation: HabbiconPurchaseConfirmationView | null = null;

    // AS3: HabbiconController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    /**
	 * Named `_viewEvents`, not `_events`: `Component` already declares a private `_events` and
	 * TypeScript treats two private fields of the same name as a type error, not a shadow. Same
	 * hazard the architecture rules flag for `get events()`.
	 */
    // AS3: HabbiconController.as::_SafeStr_4887 (name derived: the view-facing dispatcher)
    private _viewEvents: EventEmitter = new EventEmitter();

    // AS3: HabbiconController.as::_SafeStr_5104 (name derived: owned habbicons by id)
    private _ownedHabbicons: Map<number, OwnedHabbiconData> = new Map();

    // AS3: HabbiconController.as::_SafeStr_5260 (name derived: the recently-used ids)
    private _recentHabbiconIds: number[] = [];

    // AS3: HabbiconController.as::_SafeStr_6260 (name derived: shop collections by id)
    private _shopCollectionsById: Map<number, HabbiconCollectionData> = new Map();

    // AS3: HabbiconController.as::_SafeStr_5558 (name derived: shop items by habbicon id)
    private _shopItems: Map<number, HabbiconShopItemData> = new Map();

    // AS3: HabbiconController.as::_SafeStr_6004 (name derived: shop collections in order)
    private _shopCollections: HabbiconCollectionData[] = [];

    // AS3: HabbiconController.as::_hasLoadedOwnedHabbicons
    private _hasLoadedOwnedHabbicons: boolean = false;

    // AS3: HabbiconController.as::_SafeStr_8406 (name derived: shop data has arrived)
    private _hasLoadedShopData: boolean = false;

    /**
	 * Cleared by every user-habbicon list and never set anywhere in the dump — a write-only flag the
	 * decompiler kept. Transcribed rather than dropped: something outside this class may have set it
	 * in the original, and removing it would hide that.
	 */
    // AS3: HabbiconController.as::_SafeStr_10242 (name derived: no reader or writer but one clear)
    private _ownedHabbiconsStale: boolean = false;

    // AS3: HabbiconController.as::_SafeStr_7555 (name derived: a shop-data request is in flight)
    private _shopDataRequested: boolean = false;

    // AS3: HabbiconController.as::_pendingPurchaseRefresh
    private _pendingPurchaseRefresh: boolean = false;

    // AS3: HabbiconController.as::HabbiconController()
    constructor(context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);
    }

    // AS3: HabbiconController.as::get dependencies()
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
                IID_HabboConfigurationManager,
                (manager: IHabboConfigurationManager | null) => { this._configurationManager = manager; },
                true
            ),
            new ComponentDependency(
                IID_HabboInventory,
                (inventory: IHabboInventory | null) => { this._inventory = inventory; },
                false
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => { this._localizationManager = manager; },
                true
            ),
            new ComponentDependency(
                IID_HabboNotifications,
                (manager: IHabboNotifications | null) => { this._notifications = manager; },
                false
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => { this._windowManager = manager; }
            ),
        ];
    }

    // AS3: HabbiconController.as::initComponent()
    protected override initComponent(): void
    {
        this._messageEvents = [];
        this._viewEvents = new EventEmitter();
        this._ownedHabbicons = new Map();
        this._recentHabbiconIds = [];
        this._shopCollectionsById = new Map();
        this._shopItems = new Map();
        this._shopCollections = [];

        if(!this.habbiconsEnabled()) return;

        this.context.addLinkEventTracker(this);

        this.addMessageEvent(new UserHabbiconsMessageEvent((event) => this.onUserHabbicons(event)));
        this.addMessageEvent(new UserHabbiconStatusChangedMessageEvent((event) => this.onUserHabbiconStatusChanged(event)));
        this.addMessageEvent(new HabbiconShopDataMessageEvent((event) => this.onHabbiconShopData(event)));
        this.addMessageEvent(new HabbiconInfoMessageEvent((event) => this.onHabbiconInfo(event)));
        this.addMessageEvent(new RoomUseHabbiconMessageEvent((event) => this.onRoomUseHabbicon(event)));
        this.addMessageEvent(new PurchaseOKMessageEvent(() => this.onPurchaseOk()));
        this.addMessageEvent(new PurchaseErrorMessageEvent(() => this.onPurchaseFailed()));
        this.addMessageEvent(new PurchaseNotAllowedMessageEvent(() => this.onPurchaseFailed()));

        HabbiconAssetManager.configure(this._configurationManager);
        HabbiconAssetManager.addEventListener(HabbiconAssetManager.ASSETS_LOADED, this.onHabbiconAssetsLoaded);
        HabbiconAssetManager.preload();
    }

    // AS3: HabbiconController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'habbicons/';
    }

    // AS3: HabbiconController.as::get configuration()
    get configuration(): IHabboConfigurationManager | null
    {
        return this._configurationManager;
    }

    // AS3: HabbiconController.as::linkReceived()
    linkReceived(link: string): void
    {
        if(!this.habbiconsEnabled()) return;

        const parts = link.split('/');

        if(parts.length < 2) return;

        if(parts[1] === 'open') this.openHabbiconHub();
    }

    /**
	 * Opening the hub clears the unseen badge before the window is built — the player is about to see
	 * everything it was counting.
	 */
    // AS3: HabbiconController.as::openHabbiconHub()
    openHabbiconHub(): void
    {
        if(!this.habbiconsEnabled()) return;

        this.resetUnseenHabbicons();

        if(this._view === null || this._view.disposed)
        {
            this._view = new HabbiconView(this, this._windowManager);
        }

        this._view.showWindow();
    }

    // AS3: HabbiconController.as::get hasLoadedOwnedHabbicons()
    get hasLoadedOwnedHabbicons(): boolean
    {
        return this._hasLoadedOwnedHabbicons;
    }

    // AS3: HabbiconController.as::get hasLoadedShopData()
    get hasLoadedShopData(): boolean
    {
        return this._hasLoadedShopData;
    }

    // AS3: HabbiconController.as::get ownedHabbicons()
    get ownedHabbicons(): OwnedHabbiconData[]
    {
        return Array.from(this._ownedHabbicons.values());
    }

    // AS3: HabbiconController.as::get recentHabbiconIds()
    get recentHabbiconIds(): number[]
    {
        return this._recentHabbiconIds.slice();
    }

    // AS3: HabbiconController.as::get shopCollections()
    get shopCollections(): HabbiconCollectionData[]
    {
        return this._shopCollections.slice();
    }

    // AS3: HabbiconController.as::get unseenHabbiconCount()
    get unseenHabbiconCount(): number
    {
        const tracker = this._inventory?.unseenItemTracker ?? null;

        if(tracker === null) return 0;

        return tracker.getCount(UnseenItemCategory.HABBICON);
    }

    // AS3: HabbiconController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // TS-only: the views reach the window manager through the controller, as AS3's do via `_windowManager`.
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: HabbiconController.as::addEventListener()
    addEventListener(type: string, listener: (event: HabbiconControllerEvent) => void): void
    {
        this._viewEvents.on(type, listener);
    }

    // AS3: HabbiconController.as::removeEventListener()
    removeEventListener(type: string, listener: (event: HabbiconControllerEvent) => void): void
    {
        this._viewEvents.off(type, listener);
    }

    /**
	 * With data already cached and no force, this re-announces it rather than re-asking — a view that
	 * opens later still gets its update event.
	 */
    // AS3: HabbiconController.as::getShopData()
    getShopData(force: boolean = false): void
    {
        if(!this.habbiconsEnabled()) return;

        if(this._hasLoadedShopData && !force)
        {
            this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.SHOP_DATA_UPDATED));

            return;
        }

        if(this._shopDataRequested) return;

        this._shopDataRequested = this.send(new GetHabbiconShopDataMessageComposer());
    }

    // AS3: HabbiconController.as::getHabbiconInfo()
    getHabbiconInfo(habbiconId: number): void
    {
        if(!this.habbiconsEnabled()) return;

        this.send(new GetHabbiconInfoMessageComposer(habbiconId));
    }

    // AS3: HabbiconController.as::noteHabbiconUsed()
    noteHabbiconUsed(habbiconId: number): void
    {
        if(!this.habbiconsEnabled() || habbiconId <= 0) return;

        this.addRecentHabbiconId(habbiconId);
        this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.RECENT_HABBICONS_UPDATED, habbiconId));
    }

    // AS3: HabbiconController.as::isUnseenHabbicon()
    isUnseenHabbicon(habbiconId: number): boolean
    {
        const tracker = this._inventory?.unseenItemTracker ?? null;

        return tracker !== null && tracker.isUnseen(UnseenItemCategory.HABBICON, habbiconId);
    }

    // AS3: HabbiconController.as::removeUnseenHabbicon()
    removeUnseenHabbicon(habbiconId: number): void
    {
        const tracker = this._inventory?.unseenItemTracker ?? null;

        if(tracker === null) return;

        tracker.removeUnseen(UnseenItemCategory.HABBICON, habbiconId);
        tracker.resetCategoryIfEmpty(UnseenItemCategory.HABBICON);
    }

    // AS3: HabbiconController.as::resetUnseenHabbicons()
    resetUnseenHabbicons(): void
    {
        const tracker = this._inventory?.unseenItemTracker ?? null;

        if(tracker === null) return;

        tracker.resetCategory(UnseenItemCategory.HABBICON);
    }

    // AS3: HabbiconController.as::buyHabbicon()
    buyHabbicon(habbiconId: number): void
    {
        if(!this.habbiconsEnabled()) return;

        this._pendingPurchaseRefresh = true;
        this.send(new BuyHabbiconMessageComposer(habbiconId));
    }

    // AS3: HabbiconController.as::buyHabbiconCollection()
    buyHabbiconCollection(collectionId: number): void
    {
        if(!this.habbiconsEnabled()) return;

        this._pendingPurchaseRefresh = true;
        this.send(new BuyHabbiconCollectionMessageComposer(collectionId));
    }

    // AS3: HabbiconController.as::openHabbiconPurchaseConfirmation()
    openHabbiconPurchaseConfirmation(entry: HabbiconEntryModel | null): void
    {
        if(!this.habbiconsEnabled() || entry === null || !entry.purchasable) return;

        this.closeHabbiconPurchaseConfirmation();
        this._purchaseConfirmation = new HabbiconPurchaseConfirmationView(this, this._windowManager);
        this._purchaseConfirmation.initializeForHabbicon(entry);
        this._purchaseConfirmation.show();
    }

    // AS3: HabbiconController.as::openHabbiconSetPurchaseConfirmation()
    openHabbiconSetPurchaseConfirmation(set: HabbiconSetModel | null): void
    {
        if(!this.habbiconsEnabled() || set === null || !set.canBuy) return;

        this.closeHabbiconPurchaseConfirmation();
        this._purchaseConfirmation = new HabbiconPurchaseConfirmationView(this, this._windowManager);
        this._purchaseConfirmation.initializeForSet(set);
        this._purchaseConfirmation.show();
    }

    // AS3: HabbiconController.as::closeHabbiconPurchaseConfirmation()
    closeHabbiconPurchaseConfirmation(): void
    {
        if(this._purchaseConfirmation === null) return;

        this._purchaseConfirmation.dispose();
        this._purchaseConfirmation = null;
    }

    // AS3: HabbiconController.as::claimHabbicon()
    claimHabbicon(habbiconId: number): void
    {
        if(!this.habbiconsEnabled()) return;

        this._pendingPurchaseRefresh = true;
        this.send(new ClaimHabbiconMessageComposer(habbiconId));
    }

    // AS3: HabbiconController.as::favoriteHabbicon()
    favoriteHabbicon(habbiconId: number): void
    {
        if(!this.habbiconsEnabled()) return;

        this.send(new FavoriteHabbiconMessageComposer(habbiconId));
    }

    // AS3: HabbiconController.as::unfavoriteHabbicon()
    unfavoriteHabbicon(habbiconId: number): void
    {
        if(!this.habbiconsEnabled()) return;

        this.send(new UnfavoriteHabbiconMessageComposer(habbiconId));
    }

    // AS3: HabbiconController.as::tryGetOwnedHabbicon()
    tryGetOwnedHabbicon(habbiconId: number): OwnedHabbiconData | null
    {
        return this._ownedHabbicons.get(habbiconId) ?? null;
    }

    // AS3: HabbiconController.as::tryGetShopItem()
    tryGetShopItem(habbiconId: number): HabbiconShopItemData | null
    {
        return this._shopItems.get(habbiconId) ?? null;
    }

    // AS3: HabbiconController.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager === null) return;

        this._communicationManager.addHabboConnectionMessageEvent(event);
        this._messageEvents.push(event);
    }

    // AS3: HabbiconController.as::removeMessageEvent()
    private removeMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager === null) return;

        this._communicationManager.removeHabboConnectionMessageEvent(event);
    }

    // AS3: HabbiconController.as::send()
    private send(composer: unknown): boolean
    {
        const connection = this._communicationManager?.connection ?? null;

        if(connection === null) return false;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- AS3's send() takes an untyped composer
        connection.send(composer as any);

        return true;
    }

    // TS-only: AS3 dispatches on a flash EventDispatcher; eventemitter3 needs the type split out.
    private dispatch(event: HabbiconControllerEvent): void
    {
        this._viewEvents.emit(event.type, event);
    }

    /**
	 * The previous dictionary is kept alive across the rebuild so each row can be compared with what
	 * it replaces. A habbicon appearing for the first time only raises a notification once the *first*
	 * list has been seen — otherwise logging in would notify for the player's whole collection.
	 */
    // AS3: HabbiconController.as::onUserHabbicons()
    private onUserHabbicons(event: IMessageEvent): void
    {
        const parser = event.parser as UserHabbiconsMessageParser | null;

        if(!parser) return;

        const hadLoaded = this._hasLoadedOwnedHabbicons;
        const previous = this._ownedHabbicons;

        this._ownedHabbicons = new Map();

        for(const habbicon of parser.habbicons)
        {
            if(habbicon === null) continue;

            const before = previous.get(habbicon.habbiconId) ?? null;

            this._ownedHabbicons.set(habbicon.habbiconId, habbicon);

            if(hadLoaded
                && HabbiconState.isStoredUserState(habbicon.habbiconState)
                && (before === null
                    || HabbiconState.isClaimedRewardTransition(before.habbiconState, habbicon.habbiconState)))
            {
                this.handleNewOwnedHabbicon(habbicon.habbiconId);
            }
        }

        this.setRecentHabbiconIds(parser.recentHabbiconIds);
        this._hasLoadedOwnedHabbicons = true;
        this._ownedHabbiconsStale = false;

        this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.OWNED_HABBICONS_UPDATED));
        this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.SHOP_DATA_UPDATED));
    }

    /**
	 * Three events go out for one change, and all three carry the habbicon id: the hub listens for the
	 * first, the tiles for the second, the shop rail for the third.
	 */
    // AS3: HabbiconController.as::onUserHabbiconStatusChanged()
    private onUserHabbiconStatusChanged(event: IMessageEvent): void
    {
        const parser = event.parser as UserHabbiconStatusChangedMessageParser | null;

        if(!parser) return;

        const state = parser.habbiconState;
        const habbiconId = parser.habbiconId;

        if(HabbiconState.isStoredUserState(state))
        {
            let owned = this._ownedHabbicons.get(habbiconId) ?? null;
            let previousState = 0;

            if(owned === null)
            {
                owned = {habbiconId, habbiconState: 0};
                this._ownedHabbicons.set(habbiconId, owned);
                this.handleNewOwnedHabbicon(habbiconId);
            }
            else
            {
                previousState = owned.habbiconState;
            }

            owned.habbiconState = state;

            if(HabbiconState.isClaimedRewardTransition(previousState, state))
            {
                this.handleNewOwnedHabbicon(habbiconId);
            }
        }
        else
        {
            this._ownedHabbicons.delete(habbiconId);
        }

        this.updateCachedShopItemState(habbiconId, state, null);

        this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.HABBICON_STATUS_CHANGED, habbiconId));
        this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.OWNED_HABBICONS_UPDATED, habbiconId));
        this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.SHOP_DATA_UPDATED, habbiconId));
    }

    // AS3: HabbiconController.as::onHabbiconShopData()
    private onHabbiconShopData(event: IMessageEvent): void
    {
        const parser = event.parser as HabbiconShopDataMessageParser | null;

        if(!parser) return;

        this._shopCollectionsById = new Map();
        this._shopItems = new Map();
        this._shopCollections = [];

        for(const collection of parser.collections)
        {
            if(collection === null) continue;

            this._shopCollectionsById.set(collection.collectionId, collection);
            this._shopCollections.push(collection);

            for(const item of collection.habbicons)
            {
                if(item === null) continue;

                this._shopItems.set(item.habbiconId, item);
            }
        }

        this._hasLoadedShopData = true;
        this._shopDataRequested = false;

        this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.SHOP_DATA_UPDATED));
    }

    // AS3: HabbiconController.as::onHabbiconInfo()
    private onHabbiconInfo(event: IMessageEvent): void
    {
        const parser = event.parser as HabbiconInfoMessageParser | null;
        const habbicon = parser?.habbicon ?? null;

        if(habbicon === null) return;

        this._shopItems.set(habbicon.habbiconId, habbicon);
        this.updateCachedShopItemState(habbicon.habbiconId, habbicon.state, habbicon);

        this.dispatch(new HabbiconControllerEvent(
            HabbiconControllerEvent.SHOP_DATA_UPDATED, habbicon.habbiconId, habbicon.collectionId
        ));
    }

    // AS3: HabbiconController.as::onRoomUseHabbicon()
    private onRoomUseHabbicon(event: IMessageEvent): void
    {
        if(!this.habbiconsEnabled()) return;

        const parser = event.parser as RoomUseHabbiconMessageParser | null;

        if(!parser) return;

        this.dispatch(new HabbiconControllerEvent(
            HabbiconControllerEvent.ROOM_USE_HABBICON, parser.habbiconId, 0, parser.roomIndex
        ));
    }

    // AS3: HabbiconController.as::onPurchaseOk()
    private onPurchaseOk(): void
    {
        if(!this._pendingPurchaseRefresh) return;

        this._pendingPurchaseRefresh = false;
        this.closeHabbiconPurchaseConfirmation();
        this.getShopData(true);
    }

    // AS3: HabbiconController.as::onPurchaseFailed()
    private onPurchaseFailed(): void
    {
        if(!this._pendingPurchaseRefresh) return;

        this._pendingPurchaseRefresh = false;

        if(this._purchaseConfirmation !== null) this._purchaseConfirmation.purchaseFailed();
    }

    /**
	 * The artwork arriving late is treated as a data change, because every tile draws from it — the
	 * views redraw on the same two events they already listen for.
	 */
    // AS3: HabbiconController.as::onHabbiconAssetsLoaded()
    private onHabbiconAssetsLoaded = (): void =>
    {
        if(!this.habbiconsEnabled()) return;

        this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.OWNED_HABBICONS_UPDATED));
        this.dispatch(new HabbiconControllerEvent(HabbiconControllerEvent.SHOP_DATA_UPDATED));
    };

    // AS3: HabbiconController.as::handleNewOwnedHabbicon()
    private handleNewOwnedHabbicon(habbiconId: number): void
    {
        const tracker = this._inventory?.unseenItemTracker ?? null;

        if(tracker !== null) tracker.setUnseenItem(UnseenItemCategory.HABBICON, habbiconId);

        this.showNewHabbiconNotification(habbiconId);
    }

    // AS3: HabbiconController.as::showNewHabbiconNotification()
    private showNewHabbiconNotification(habbiconId: number): void
    {
        if(this._notifications === null || this._localizationManager === null) return;

        const name = this.resolveHabbiconDisplayName(habbiconId);

        this._localizationManager.registerParameter('notification.new.habbicon', 'habbicon_name', name);

        const content = this._localizationManager.getLocalization('notification.new.habbicon');

        this._notifications.addItemWithBitmap(
            content,
            'habbicon_received',
            HabbiconController.createHabbiconNotificationIcon(habbiconId),
            'habbicons/open'
        );
    }

    /**
	 * The id is the last resort: a habbicon whose metadata has not loaded is announced by number
	 * rather than not at all.
	 */
    // AS3: HabbiconController.as::resolveHabbiconDisplayName()
    private resolveHabbiconDisplayName(habbiconId: number): string
    {
        const key = HabbiconAssetManager.getHabbiconNameKey(habbiconId);

        if(key !== null && key.length > 0)
        {
            return this._localizationManager?.getLocalization(`habbicon_${key}_name`, key) ?? key;
        }

        return String(habbiconId);
    }

    /**
	 * AS3 clones the bitmap because the notification owns and disposes what it is given, and the
	 * preview is cached. `createImageBitmap` is async, so this port hands over the cached bitmap
	 * itself — the notification layer here does not dispose its icon, so there is nothing to guard.
	 */
    // AS3: HabbiconController.as::createHabbiconNotificationIcon()
    private static createHabbiconNotificationIcon(habbiconId: number): ImageBitmap | null
    {
        return HabbiconAssetManager.getPreviewBitmap(habbiconId, false);
    }

    // AS3: HabbiconController.as::habbiconsEnabled()
    private habbiconsEnabled(): boolean
    {
        return this._configurationManager !== null && this._configurationManager.getBoolean('habbicons.enabled');
    }

    /**
	 * Reward habbicons live on the collection, not in its item list, so they are tried first and the
	 * item walk is skipped entirely when one matches.
	 *
	 * Note the shop item is written back into the collection's array by identity: the array may hold a
	 * *different* object with the same id, from an earlier shop-data message.
	 */
    // AS3: HabbiconController.as::updateCachedShopItemState()
    private updateCachedShopItemState(
        habbiconId: number, state: number, item: HabbiconShopItemData | null = null
    ): void
    {
        if(this.updateCachedRewardState(habbiconId, state)) return;

        if(item !== null)
        {
            this._shopItems.set(habbiconId, item);
        }
        else
        {
            item = this._shopItems.get(habbiconId) ?? null;

            if(item === null) return;
        }

        item.state = state;

        const collection = this._shopCollectionsById.get(item.collectionId) ?? null;

        if(collection === null) return;

        for(let i = 0; i < collection.habbicons.length; i++)
        {
            const candidate = collection.habbicons[i];

            if(candidate === null || candidate.habbiconId !== habbiconId) continue;

            collection.habbicons[i] = item;
            break;
        }

        collection.completed = HabbiconController.isCollectionCompleted(collection);

        if(collection.completed) this.markCollectionRewardClaimable(collection);
    }

    // AS3: HabbiconController.as::updateCachedRewardState()
    private updateCachedRewardState(habbiconId: number, state: number): boolean
    {
        for(const collection of this._shopCollections)
        {
            if(collection === null || collection.rewardHabbiconId !== habbiconId) continue;

            collection.rewardState = state;

            return true;
        }

        return false;
    }

    /**
	 * Already-claimed rewards are left alone — completing a collection a second time (a habbicon
	 * regained after being traded away) must not offer the reward again.
	 */
    // AS3: HabbiconController.as::markCollectionRewardClaimable()
    private markCollectionRewardClaimable(collection: HabbiconCollectionData | null): void
    {
        if(collection === null || collection.rewardHabbiconId <= 0) return;

        if(collection.rewardState === HabbiconState.OWNED
            || collection.rewardState === HabbiconState.FAVOURITED)
        {
            return;
        }

        collection.rewardState = HabbiconState.CLAIMABLE;

        let owned = this._ownedHabbicons.get(collection.rewardHabbiconId) ?? null;

        if(owned === null)
        {
            owned = {habbiconId: collection.rewardHabbiconId, habbiconState: 0};
            this._ownedHabbicons.set(collection.rewardHabbiconId, owned);
        }

        owned.habbiconState = HabbiconState.CLAIMABLE;
    }

    // AS3: HabbiconController.as::isCollectionCompleted()
    private static isCollectionCompleted(collection: HabbiconCollectionData | null): boolean
    {
        if(collection === null || collection.habbicons.length === 0) return false;

        for(const item of collection.habbicons)
        {
            if(item === null || !HabbiconState.isStoredUserState(item.state)) return false;
        }

        return true;
    }

    // AS3: HabbiconController.as::setRecentHabbiconIds()
    private setRecentHabbiconIds(ids: number[] | null): void
    {
        this._recentHabbiconIds = [];

        if(ids === null) return;

        for(const id of ids)
        {
            this._recentHabbiconIds.push(id);
        }
    }

    /**
	 * Most-recent-first, deduplicated by moving rather than skipping, and capped — an id already in
	 * the list jumps back to the front.
	 */
    // AS3: HabbiconController.as::addRecentHabbiconId()
    private addRecentHabbiconId(habbiconId: number): void
    {
        if(habbiconId <= 0) return;

        const index = this._recentHabbiconIds.indexOf(habbiconId);

        if(index >= 0) this._recentHabbiconIds.splice(index, 1);

        this._recentHabbiconIds.unshift(habbiconId);

        if(this._recentHabbiconIds.length > HabbiconController.RECENT_HABBICON_LIMIT)
        {
            this._recentHabbiconIds.length = HabbiconController.RECENT_HABBICON_LIMIT;
        }
    }

    // AS3: HabbiconController.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        for(const event of this._messageEvents)
        {
            this.removeMessageEvent(event);
        }

        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        this.closeHabbiconPurchaseConfirmation();
        HabbiconAssetManager.removeEventListener(HabbiconAssetManager.ASSETS_LOADED, this.onHabbiconAssetsLoaded);

        this._messageEvents = [];
        this._viewEvents.removeAllListeners();
        this._ownedHabbicons = new Map();
        this._recentHabbiconIds = [];
        this._shopCollectionsById = new Map();
        this._shopItems = new Map();
        this._shopCollections = [];
        this._communicationManager = null;
        this._configurationManager = null;
        this._localizationManager = null;
        this._windowManager = null;

        super.dispose();
    }
}
