import {Logger} from '@core/utils/Logger';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {OrderedMap} from '@core/utils/OrderedMap';
import {WiredTradeUpdateItemsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/WiredTradeUpdateItemsComposer';
import {WiredTradeAcceptComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/WiredTradeAcceptComposer';
import {WiredTradeCancelComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/WiredTradeCancelComposer';
import type {TradingItemListMessageParser} from '@habbo/communication/messages/parser/inventory/trading/TradingItemListMessageParser';
import type {TradeRequirement} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirement';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {HabboInventory} from '../HabboInventory';
import type {IInventoryModel} from '../IInventoryModel';
import type {ITradingModel} from '../trading/ITradingModel';
import type {GroupItem} from '../items/GroupItem';
import {WiredTradeRequirementsModel} from './requirements/WiredTradeRequirementsModel';
import type {IWiredTradingView} from './IWiredTradingView';
import {WiredTradingViewStub} from './WiredTradingViewStub';

const log = Logger.getLogger('habbo.inventory.wired_trading.WiredTradingModel');

/**
 * A trade against the room rather than against another player: a wired chest offers a contract, and
 * this drives the five-state machine that accepts it.
 *
 * It is both an `IInventoryModel` (so the inventory can host it as the `wired_trading` sub-page)
 * and an `ITradingModel` (so the furni grid can offer items into it without knowing which kind of
 * trade is open). `HabboInventory.activeTradingModel` picks between this and the ordinary one.
 *
 * Two fields of AS3's are deliberately absent: a public static int that nothing reads, and an
 * assets reference stored and never used.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/WiredTradingModel.as
 */
export class WiredTradingModel implements IInventoryModel, ITradingModel
{
    // AS3: WiredTradingModel.as::STATE_READY
    public static readonly STATE_READY: number = 0;

    // AS3: WiredTradingModel.as::STATE_ADDING_ITEMS
    public static readonly STATE_ADDING_ITEMS: number = 1;

    // AS3: WiredTradingModel.as::STATE_COUNTDOWN
    public static readonly STATE_COUNTDOWN: number = 2;

    // AS3: WiredTradingModel.as::STATE_CONFIRMING
    public static readonly STATE_CONFIRMING: number = 3;

    // AS3: WiredTradingModel.as::STATE_CONFIRMED
    public static readonly STATE_CONFIRMED: number = 4;

    // AS3: WiredTradingModel.as::_inventory
    private _inventory: HabboInventory | null;

    // AS3: WiredTradingModel.as::_SafeStr_4608 (from `get tradingView()`)
    private _view: IWiredTradingView | null;

    // AS3: WiredTradingModel.as::_SafeStr_5281 (from `get tradeRequirementsModel()`)
    private _requirementsModel: WiredTradeRequirementsModel | null;

    // AS3: WiredTradingModel.as::_SafeStr_5444 (from `get running()`)
    private _running: boolean = false;

    // AS3: WiredTradingModel.as::_SafeStr_4597 (from `get state()`)
    private _state: number = WiredTradingModel.STATE_READY;

    // AS3: WiredTradingModel.as::_ownUserItems
    private _ownUserItems: OrderedMap<number, GroupItem> = new OrderedMap<number, GroupItem>();

    // AS3: WiredTradingModel.as::_ownUserNumItems
    private _ownUserNumItems: number = 0;

    // AS3: WiredTradingModel.as::_SafeStr_6417 (from `get ownUserNumCredits()`)
    private _ownUserNumCredits: number = 0;

    // AS3: WiredTradingModel.as::_wiredItems
    private _wiredItems: OrderedMap<number, GroupItem> = new OrderedMap<number, GroupItem>();

    // AS3: WiredTradingModel.as::_wiredNumItems
    private _wiredNumItems: number = 0;

    // AS3: WiredTradingModel.as::_SafeStr_7645 (from `get wiredNumCredits()`)
    private _wiredNumCredits: number = 0;

    // AS3: WiredTradingModel.as::_canAccept
    private _canAccept: boolean = false;

    // AS3: WiredTradingModel.as::_SafeStr_7590 (from `get extra()`)
    private _extra: number = 0;

    // AS3: WiredTradingModel.as::_SafeStr_8329 (the trade's allowance, from `get secondsLeft()`)
    private _timeoutSeconds: number = 0;

    // AS3: WiredTradingModel.as::_tradeStartTime
    private _tradeStartTime: number = 0;

    // AS3: WiredTradingModel.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredTradingModel.as::_communication
    private _communication: IHabboCommunicationManager | null;

    // AS3: WiredTradingModel.as::_localization
    private _localization: IHabboLocalizationManager | null;

    /**
     * AS3 also takes the window manager, assets, the room engine, the sound manager and
     * notifications — all five for the view it builds here, or stored and never read. Left out
     * until `WiredTradingView` is ported, exactly as `TradingModel` documents for its own view.
     *
     * The view is still built in the constructor, as AS3 does, so `running` and `getWindowContainer()`
     * are answerable from the moment the model exists.
     */
    // AS3: WiredTradingModel.as::WiredTradingModel()
    constructor(
        inventory: HabboInventory | null,
        communication: IHabboCommunicationManager | null,
        localization: IHabboLocalizationManager | null
    )
    {
        this._inventory = inventory;
        this._communication = communication;
        this._localization = localization;
        this._view = new WiredTradingViewStub();
        this._requirementsModel = new WiredTradeRequirementsModel(this);
    }

    /**
     * The server opening a trade.
     *
     * `overridePreviousTrade` closes whatever was open *before* anything else, and closing sends no
     * cancellation — the server already knows, it is the one replacing the trade. The clear-and-
     * reset that follows is separate and fires whenever the state machine is not idle, which is how
     * a second initiate on an already-clean model stays cheap.
     */
    // AS3: WiredTradingModel.as::onWiredTradeInitiate()
    onWiredTradeInitiate(
        requirement: TradeRequirement,
        showRequirementsImmediate: boolean,
        overridePreviousTrade: boolean,
        timeoutSeconds: number
    ): void
    {
        if(overridePreviousTrade) this.close(false, false, false);

        this._running = false;

        if(this._state !== WiredTradingModel.STATE_READY)
        {
            this.clear();
            this.state = WiredTradingModel.STATE_READY;
        }

        this._timeoutSeconds = timeoutSeconds;
        this._tradeStartTime = performance.now();

        this._view?.startSecondsLeftTimer();
        this._requirementsModel?.setRequirements(requirement, showRequirementsImmediate);
        this._inventory?.toggleInventorySubPage('wired_trading');

        if(overridePreviousTrade) this._requirementsModel?.highlightRefresh();
    }

    // AS3: WiredTradingModel.as::set state()
    set state(value: number)
    {
        this._state = value;

        this._view?.tradeStateUpdated();
    }

    // AS3: WiredTradingModel.as::get state()
    get state(): number
    {
        return this._state;
    }

    // AS3: WiredTradingModel.as::get inventory()
    get inventory(): HabboInventory | null
    {
        return this._inventory;
    }

    // AS3: WiredTradingModel.as::get running()
    get running(): boolean
    {
        return this._running;
    }

    // AS3: WiredTradingModel.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        return this._view?.getWindowContainer() ?? null;
    }

    // AS3: WiredTradingModel.as::requestInitialization()
    requestInitialization(): void
    {
        // AS3 is empty: the trade arrives from the server, it is never asked for.
    }

    // AS3: WiredTradingModel.as::categorySwitch()
    categorySwitch(_category: string): void
    {
        // AS3 is empty.
    }

    /**
     * Entering the tab starts a trade; leaving it while one is live cancels that trade — and unlike
     * the close on `closingInventoryView()`, this one *does* tell the server, because the player
     * chose to walk away rather than having the window taken from them.
     */
    // AS3: WiredTradingModel.as::subCategorySwitch()
    subCategorySwitch(category: string): void
    {
        if(!this._running && category === 'wired_trading')
        {
            // AS3 logs and continues rather than bailing: a stale state is recoverable, and
            // refusing to open the tab would not be.
            if(this._state !== WiredTradingModel.STATE_READY)
            {
                log.warn("opened wired trade but wasn't ready");
            }

            this.initializeNewTrade();
        }
        else if(this._running && category !== 'wired_trading' && this._state !== WiredTradingModel.STATE_READY)
        {
            this.close(false, true);
        }
    }

    // AS3: WiredTradingModel.as::closingInventoryView()
    closingInventoryView(): void
    {
        if(this._running) this.close(true, true);
    }

    // AS3: WiredTradingModel.as::initializeNewTrade()
    initializeNewTrade(): void
    {
        this._running = true;

        this.clear();

        this.state = WiredTradingModel.STATE_ADDING_ITEMS;

        this._inventory?.onWiredTradeActiveChanged();
        this._inventory?.view.activate();
        this._inventory?.furniModel.updateView();
    }

    /**
     * The five trailing parameters are `ITradingModel`'s, carried for the ordinary trade's benefit;
     * a wired trade sends only the ids. AS3 ignores them here too.
     */
    // AS3: WiredTradingModel.as::requestAddItemsToTrading()
    requestAddItemsToTrading(
        itemIds: number[],
        _isWallItem: boolean,
        _classId: number,
        _category: number,
        _isGroupable: boolean,
        _stuffData: IStuffData | null
    ): void
    {
        if(this._state !== WiredTradingModel.STATE_ADDING_ITEMS) return;

        this.send(new WiredTradeUpdateItemsComposer(false, itemIds));
    }

    /**
     * Takes the *index* of a group, not an id: the view lists groups, and only the top item of the
     * chosen group comes back out.
     */
    // AS3: WiredTradingModel.as::requestRemoveItemFromTrading()
    requestRemoveItemFromTrading(index: number): void
    {
        if(this._state !== WiredTradingModel.STATE_ADDING_ITEMS) return;

        const groupItem = this._ownUserItems.getWithIndex(index);
        const item = groupItem?.peek() ?? null;

        if(item) this.send(new WiredTradeUpdateItemsComposer(true, [item.id]));
    }

    // AS3: WiredTradingModel.as::requestAccept()
    requestAccept(): boolean
    {
        if(this._state !== WiredTradingModel.STATE_ADDING_ITEMS) return false;

        this.send(new WiredTradeAcceptComposer(false));
        this.state = WiredTradingModel.STATE_COUNTDOWN;

        return true;
    }

    /** The view calls this when its countdown reaches zero. */
    // AS3: WiredTradingModel.as::confirmCountdownReady()
    confirmCountdownReady(): void
    {
        if(this._state === WiredTradingModel.STATE_COUNTDOWN) this.state = WiredTradingModel.STATE_CONFIRMING;
    }

    // AS3: WiredTradingModel.as::requestConfirm()
    requestConfirm(): boolean
    {
        if(this._state !== WiredTradingModel.STATE_CONFIRMING) return false;

        this.send(new WiredTradeAcceptComposer(true));
        this.state = WiredTradingModel.STATE_CONFIRMED;

        return true;
    }

    // AS3: WiredTradingModel.as::get tradingView()
    get tradingView(): IWiredTradingView | null
    {
        return this._view;
    }

    // AS3: WiredTradingModel.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communication?.connection?.send(composer);
    }

    /**
     * Ends the trade. Three independent switches, and the defaults matter:
     * `switchToEmptyPage` returns the inventory to its blank sub-page, `notifyServer` sends the
     * cancellation, `refreshFurni` repaints the grid. `onWiredTradeInitiate()` passes false to all
     * three — the server is replacing the trade, so telling it would be wrong, and the page and
     * grid are about to be rebuilt anyway.
     */
    // AS3: WiredTradingModel.as::close()
    close(switchToEmptyPage: boolean, notifyServer: boolean, refreshFurni: boolean = true): void
    {
        if(!this._running) return;

        this._view?.stopSecondsLeftTimer();

        if(this._state !== WiredTradingModel.STATE_READY && notifyServer) this.requestCancelTrading();

        this.clear();

        this.state = WiredTradingModel.STATE_READY;
        this._running = false;

        this._inventory?.onWiredTradeActiveChanged();

        if(switchToEmptyPage) this._inventory?.toggleInventorySubPage('empty');

        if(refreshFurni) this._inventory?.furniModel.updateView();
    }

    // AS3: WiredTradingModel.as::requestCancelTrading()
    requestCancelTrading(): void
    {
        this.send(new WiredTradeCancelComposer());
    }

    /**
     * The server's picture of the table, applied wholesale. The grid's locks are refreshed last,
     * because `updateItemLocks()` reads back what this just stored.
     */
    // AS3: WiredTradingModel.as::updateItemGroupMaps()
    updateItemGroupMaps(
        items: TradingItemListMessageParser,
        ownUserItems: OrderedMap<number, GroupItem>,
        wiredItems: OrderedMap<number, GroupItem>,
        canAccept: boolean,
        extra: number
    ): void
    {
        if(this._inventory == null || !this._running) return;

        this._ownUserItems = ownUserItems;
        this._ownUserNumItems = items.firstUserNumItems;
        this._ownUserNumCredits = items.firstUserNumCredits;
        this._wiredItems = wiredItems;
        this._wiredNumItems = items.secondUserNumItems;
        this._wiredNumCredits = items.secondUserNumCredits;
        this._canAccept = canAccept;
        this._extra = extra;

        this._view?.updateAllUI();
        this._requirementsModel?.requirementsStateUpdated();

        this._inventory.furniModel?.updateItemLocks();
    }

    /**
     * Note the order: the trade is closed *before* the player is told why. AS3 routes both through
     * `inventory.wiredTradingModel` rather than `this` — the same object, so it is written here as
     * the direct call it is.
     */
    // AS3: WiredTradingModel.as::tradeIsCancelled()
    tradeIsCancelled(transactionFailureTypeId: number): void
    {
        this.close(true, false);

        this._view?.alertTradeCancelled(transactionFailureTypeId);
    }

    // AS3: WiredTradingModel.as::tradeIsCompleted()
    tradeIsCompleted(): void
    {
        this.close(true, false);
    }

    // AS3: WiredTradingModel.as::updateView()
    updateView(): void
    {
        // AS3 is empty: the view repaints from updateItemGroupMaps(), not from the tab switch.
    }

    /**
     * The message says TRADING VIEW rather than WIRED TRADING VIEW. That is AS3's own text, kept
     * verbatim so a log line found in the wild still greps back to its source — the same
     * copy-paste that put MARKETPLACE in the recycler's.
     */
    // AS3: WiredTradingModel.as::selectItemById()
    selectItemById(_itemId: string): void
    {
        log.warn('NOT SUPPORTED: TRADING VIEW SELECT BY ID');
    }

    // AS3: WiredTradingModel.as::getInventory()
    getInventory(): HabboInventory | null
    {
        return this._inventory;
    }

    /**
     * Every item ref on the player's side, flattened out of the groups — the furni grid locks by
     * ref, not by group.
     */
    // AS3: WiredTradingModel.as::getOwnItemIdsInTrade()
    getOwnItemIdsInTrade(): number[]
    {
        const refs: number[] = [];

        if(this._ownUserItems == null) return refs;

        for(let i = 0; i < this._ownUserItems.length; i++)
        {
            const groupItem = this._ownUserItems.getWithIndex(i);

            if(groupItem == null) continue;

            for(let j = 0; j < groupItem.getTotalCount(); j++)
            {
                const item = groupItem.getAt(j);

                if(item != null) refs.push(item.ref);
            }
        }

        return refs;
    }

    // AS3: WiredTradingModel.as::get tradeRequirementsModel()
    get tradeRequirementsModel(): WiredTradeRequirementsModel | null
    {
        return this._requirementsModel;
    }

    /** No contract means "payment only" — there is nothing promised in return. */
    // AS3: WiredTradingModel.as::isPayment()
    isPayment(): boolean
    {
        const requirement = this._requirementsModel?.requirement ?? null;

        if(requirement == null) return true;

        return requirement.isPaymentOnly();
    }

    // AS3: WiredTradingModel.as::get paymentLayoutType()
    get paymentLayoutType(): string | null
    {
        return this._requirementsModel?.requirement?.layoutType ?? null;
    }

    // AS3: WiredTradingModel.as::get tradeTypeLocalization()
    get tradeTypeLocalization(): string
    {
        const key = this.isPayment() ? 'inventory.wired_trading.payment' : 'inventory.wired_trading.trade';

        return this._localization?.getLocalization(key) ?? key;
    }

    // AS3: WiredTradingModel.as::get ownUserItems()
    get ownUserItems(): OrderedMap<number, GroupItem>
    {
        return this._ownUserItems;
    }

    // AS3: WiredTradingModel.as::get ownUserNumItems()
    get ownUserNumItems(): number
    {
        return this._ownUserNumItems;
    }

    // AS3: WiredTradingModel.as::get ownUserNumCredits()
    get ownUserNumCredits(): number
    {
        return this._ownUserNumCredits;
    }

    // AS3: WiredTradingModel.as::get wiredItems()
    get wiredItems(): OrderedMap<number, GroupItem>
    {
        return this._wiredItems;
    }

    // AS3: WiredTradingModel.as::get wiredNumItems()
    get wiredNumItems(): number
    {
        return this._wiredNumItems;
    }

    // AS3: WiredTradingModel.as::get wiredNumCredits()
    get wiredNumCredits(): number
    {
        return this._wiredNumCredits;
    }

    // AS3: WiredTradingModel.as::get canAccept()
    get canAccept(): boolean
    {
        return this._canAccept;
    }

    // AS3: WiredTradingModel.as::get extra()
    get extra(): number
    {
        return this._extra;
    }

    /**
     * -1 means "no deadline", which is a different answer from 0 ("expired") and the view treats it
     * as such. `performance.now()` stands in for AS3's `getTimer()`; both are milliseconds since
     * start, so the arithmetic is unchanged.
     */
    // AS3: WiredTradingModel.as::get secondsLeft()
    get secondsLeft(): number
    {
        if(this._timeoutSeconds <= 0 || this._tradeStartTime <= 0) return -1;

        const elapsed = Math.trunc((performance.now() - this._tradeStartTime) / 1000);

        return Math.max(0, this._timeoutSeconds - elapsed);
    }

    // AS3: WiredTradingModel.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Resets the table without touching `running` or the state machine — `close()` and
     * `onWiredTradeInitiate()` both drive those themselves around a call to this.
     */
    // AS3: WiredTradingModel.as::clear()
    private clear(): void
    {
        this._ownUserItems = new OrderedMap<number, GroupItem>();
        this._ownUserNumCredits = 0;
        this._ownUserNumItems = 0;
        this._wiredItems = new OrderedMap<number, GroupItem>();
        this._wiredNumCredits = 0;
        this._wiredNumItems = 0;
        this._canAccept = false;
        this._extra = 0;

        this._view?.updateAllUI();
    }

    // AS3: WiredTradingModel.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._requirementsModel?.dispose();
        this._requirementsModel = null;
        this._view?.dispose();
        this._view = null;
        this._inventory = null;
        this._communication = null;
        this._localization = null;
        this._disposed = true;
    }
}
