/**
 * MarketplaceModel
 *
 * The *selling* half of the marketplace. Distinct from `catalog/marketplace/MarketPlaceLogic`,
 * which is the browsing-and-buying half — the two never talk, and AS3 keeps them in different
 * packages for exactly that reason.
 *
 * The flow is three round trips, not one:
 *
 *   1. `startOfferMaking(group)` remembers the group and asks the server whether this user may list
 *      anything at all.
 *   2. `proceedOfferMaking(code, …)` receives that answer and either locks the whole stack and
 *      opens the offer dialog, or shows one of four refusals.
 *   3. `makeOffer(price, amount)` sends the listing; `endOfferMaking(result)` shows the outcome.
 *
 * Locking is what makes step 2 safe: the entire sellable stack is reserved up front so the grid
 * cannot shift under the user while they pick a quantity, and `releaseItems()` gives back whatever
 * was not sold. Every exit path calls it — including the refusals, which is why they all route
 * through here rather than straight to the view.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/marketplace/MarketplaceModel.as
 */
import type {IInventoryModel} from '../IInventoryModel';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {HabboInventory} from '../HabboInventory';
import type {GroupItem} from '../items/GroupItem';
import type {FurnitureItem} from '../items/FurnitureItem';
import type {MarketplaceItemStats} from '@habbo/catalog/marketplace/MarketplaceItemStats';
import {GetMarketplaceCanMakeOfferMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/GetMarketplaceCanMakeOfferMessageComposer';
import {BuyMarketplaceTokensMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/BuyMarketplaceTokensMessageComposer';
import {MakeOfferMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/MakeOfferMessageComposer';
import {GetMarketplaceConfigurationMessageComposer} from '@habbo/communication/messages/outgoing/marketplace/GetMarketplaceConfigurationMessageComposer';
import {GetMarketplaceItemStatsComposer} from '@habbo/communication/messages/outgoing/marketplace/GetMarketplaceItemStatsComposer';
import {MarketplaceView} from './MarketplaceView';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.inventory.marketplace.MarketplaceModel');

/**
 * AS3 declares these as bare numbers in `proceedOfferMaking()`'s switch. Names DERIVED from the
 * localization key each branch shows — the codes themselves are the server's.
 */
// AS3: .../inventory/marketplace/MarketplaceModel.as::proceedOfferMaking()
const CAN_MAKE_OFFER_OK: number = 1;
const CAN_MAKE_OFFER_NO_TRADING_PRIVILEGE: number = 2;
const CAN_MAKE_OFFER_NO_TRADING_PASS: number = 3;
const CAN_MAKE_OFFER_NEEDS_TOKENS: number = 4;
const CAN_MAKE_OFFER_CANCELLED: number = 5;
const CAN_MAKE_OFFER_TRADING_LOCK: number = 6;

export class MarketplaceModel implements IInventoryModel
{
    // AS3: .../inventory/marketplace/MarketplaceModel.as::DEFAULT_BULK_OFFER_LIMIT
    private static readonly DEFAULT_BULK_OFFER_LIMIT: number = 500;

    /**
     * Category ids the make-offer composer takes. AS3 inlines 1/2 in `makeOffer()`; the same pair
     * appears again in `resolveStatsRequestCategory()`, where a unique-serial item takes a third.
     * Names DERIVED; the literals are unnamed in AS3.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::makeOffer()
    private static readonly OFFER_CATEGORY_FLOOR: number = 1;
    // AS3: .../inventory/marketplace/MarketplaceModel.as::makeOffer()
    private static readonly OFFER_CATEGORY_WALL: number = 2;
    // AS3: .../inventory/marketplace/MarketplaceModel.as::resolveStatsRequestCategory()
    private static readonly OFFER_CATEGORY_UNIQUE: number = 3;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_4593 (name derived: the owning inventory)
    private _habboInventory: HabboInventory | null;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_communication
    private _communication: IHabboCommunicationManager | null;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_assets
    private _assets: IAssetLibrary | null;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_roomEngine
    private _roomEngine: IRoomEngine | null;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_offerGroup
    private _offerGroup: GroupItem | null = null;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_offerItems
    private _offerItems: FurnitureItem[] | null = null;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_4550 (name derived: the view it owns)
    private _view: MarketplaceView;

    /**
     * AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_6539
     *
     * Name DERIVED: obfuscated in every tree. Set while a token purchase is in flight, so a
     * "not enough credits" that arrives *because of that purchase* releases the reserved stack —
     * see `onNotEnoughCredits()`.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_6539
    private _buyingTokens: boolean = false;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_7700 (name derived: backs isEnabled)
    private _isEnabled: boolean = false;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_9745 (name derived: backs commission)
    private _commission: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_8729 (name derived: backs tokenBatchPrice)
    private _tokenBatchPrice: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_8383 (name derived: backs tokenBatchSize)
    private _tokenBatchSize: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_offerMinPrice
    private _offerMinPrice: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_offerMaxPrice
    private _offerMaxPrice: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_expirationHours
    private _expirationHours: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_9403 (name derived: backs averagePricePeriod)
    private _averagePricePeriod: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_8906 (name derived: backs sellingFeePercentage)
    private _sellingFeePercentage: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_revenueLimit
    private _revenueLimit: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::_halfTaxLimit
    private _halfTaxLimit: number = 0;

    /**
     * AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_8726 / _SafeStr_9924
     *
     * Names DERIVED: both obfuscated. The category/type the last stats request was for — the reply
     * is discarded unless it matches, since the user may have moved on to another item.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_8726
    private _pendingStatsCategory: number = 0;
    // AS3: .../inventory/marketplace/MarketplaceModel.as::_SafeStr_9924
    private _pendingStatsType: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceModel.as::MarketplaceModel()
    constructor(
        habboInventory: HabboInventory,
        windowManager: IHabboWindowManager,
        communication: IHabboCommunicationManager,
        assets: IAssetLibrary | null,
        roomEngine: IRoomEngine,
        localization: IHabboLocalizationManager
    )
    {
        this._habboInventory = habboInventory;
        this._communication = communication;
        this._windowManager = windowManager;
        this._assets = assets;
        this._roomEngine = roomEngine;

        this._view = new MarketplaceView(this, windowManager, assets, roomEngine, localization, habboInventory);
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get id()
    get id(): string
    {
        return 'marketplace';
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set isEnabled()
    set isEnabled(value: boolean)
    {
        this._isEnabled = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get isEnabled()
    get isEnabled(): boolean
    {
        return this._isEnabled;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set commission()
    set commission(value: number)
    {
        this._commission = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get commission()
    get commission(): number
    {
        return this._commission;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set tokenBatchPrice()
    set tokenBatchPrice(value: number)
    {
        this._tokenBatchPrice = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get tokenBatchPrice()
    get tokenBatchPrice(): number
    {
        return this._tokenBatchPrice;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set tokenBatchSize()
    set tokenBatchSize(value: number)
    {
        this._tokenBatchSize = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get tokenBatchSize()
    get tokenBatchSize(): number
    {
        return this._tokenBatchSize;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set offerMinPrice()
    set offerMinPrice(value: number)
    {
        this._offerMinPrice = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get offerMinPrice()
    get offerMinPrice(): number
    {
        return this._offerMinPrice;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set offerMaxPrice()
    set offerMaxPrice(value: number)
    {
        this._offerMaxPrice = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get offerMaxPrice()
    get offerMaxPrice(): number
    {
        return this._offerMaxPrice;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set expirationHours()
    set expirationHours(value: number)
    {
        this._expirationHours = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get expirationHours()
    get expirationHours(): number
    {
        return this._expirationHours;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set averagePricePeriod()
    set averagePricePeriod(value: number)
    {
        this._averagePricePeriod = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set sellingFeePercentage()
    set sellingFeePercentage(value: number)
    {
        this._sellingFeePercentage = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get sellingFeePercentage()
    get sellingFeePercentage(): number
    {
        return this._sellingFeePercentage;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set revenueLimit()
    set revenueLimit(value: number)
    {
        this._revenueLimit = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get revenueLimit()
    get revenueLimit(): number
    {
        return this._revenueLimit;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::set halfTaxLimit()
    set halfTaxLimit(value: number)
    {
        this._halfTaxLimit = value;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get halfTaxLimit()
    get halfTaxLimit(): number
    {
        return this._halfTaxLimit;
    }

    /**
     * A config value, so a hotel can raise it; the 500 is the fallback when it is unset or zero.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::get bulkOfferLimit()
    get bulkOfferLimit(): number
    {
        const configured = Number(this._habboInventory?.getProperty('marketplace.bulkOfferLimit') ?? 0);

        return configured > 0 ? configured : MarketplaceModel.DEFAULT_BULK_OFFER_LIMIT;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get controller()
    get controller(): HabboInventory | null
    {
        return this._habboInventory;
    }

    /**
     * Gives back every reserved item. Called from each exit path — cancel, refusal, completion —
     * because a stack left locked is invisible to trading and to a second sell attempt.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::releaseItems()
    releaseItems(): void
    {
        const furniModel = this._habboInventory?.furniModel ?? null;

        if(furniModel != null && this._offerItems != null && this._offerGroup != null)
        {
            // AS3 collects the item *ids* here, not the refs it sends to the server.
            const itemIds = new Set<number>(this._offerItems.map((item) => item.id));

            furniModel.removeLocksFor(this._offerGroup, itemIds);
        }

        this._offerItems = null;
        this._offerGroup = null;
    }

    /**
     * Step 1. The `_offerGroup != null` guard is what stops a second Sell click from stacking two
     * offers on one stack while the first is still waiting on the server.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::startOfferMaking()
    startOfferMaking(groupItem: GroupItem | null): void
    {
        if(this._offerGroup != null || groupItem == null) return;
        if(this._habboInventory == null || this._habboInventory.furniModel == null) return;

        this._offerGroup = groupItem;

        this.send(new GetMarketplaceCanMakeOfferMessageComposer());
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::buyMarketplaceTokens()
    buyMarketplaceTokens(): void
    {
        this.send(new BuyMarketplaceTokensMessageComposer());

        this._buyingTokens = true;
    }

    /**
     * Step 3. `amount` is clamped into the stack rather than trusted: the dialog's own field is
     * already bounded, but a stack can shrink between opening and confirming.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::makeOffer()
    makeOffer(price: number, amount: number): void
    {
        if(this._offerItems == null || this._offerItems.length === 0) return;

        const count = Math.max(1, Math.min(amount, this._offerItems.length));
        const itemRefs: number[] = [];

        for(let i = 0; i < count; i++)
        {
            itemRefs.push(this._offerItems[i].ref);
        }

        // One offer only ever holds copies of the same furni, so the first item decides.
        const category = this._offerItems[0].isWallItem
            ? MarketplaceModel.OFFER_CATEGORY_WALL
            : MarketplaceModel.OFFER_CATEGORY_FLOOR;

        this.send(new MakeOfferMessageComposer(price, category, itemRefs));

        this.releaseItems();
    }

    /**
     * Asks for the price history shown in the dialog. A poster (category 6) is keyed by its stuff
     * data rather than its type, because every poster shares one furni type.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::getItemStats()
    getItemStats(): void
    {
        const item = this.getOfferItem();

        if(item == null) return;

        const category = MarketplaceModel.resolveStatsRequestCategory(item);
        let extraData: string | null = null;

        if(item.category === 6)
        {
            if(item.stuffData != null)
            {
                extraData = item.stuffData.getLegacyString();
            }
            else if(!isNaN(item.extra))
            {
                extraData = String(Math.trunc(item.extra));
            }
        }

        this._pendingStatsCategory = category;
        this._pendingStatsType = item.type;

        this.send(new GetMarketplaceItemStatsComposer(category, item.type, extraData));
    }

    /**
     * Step 2. Only the OK branch locks anything; every other code is a refusal, and each one that
     * does not open a dialog has to release the group itself.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::proceedOfferMaking()
    proceedOfferMaking(resultCode: number, _tokenCount: number = 0): void
    {
        this._buyingTokens = false;

        switch(resultCode)
        {
            case CAN_MAKE_OFFER_OK:
            {
                if(this._offerGroup == null)
                {
                    this.releaseItems();

                    return;
                }

                this._offerItems = this._habboInventory?.furniModel?.lockAllSellable(this._offerGroup) ?? null;

                if(this._offerItems == null || this._offerItems.length === 0)
                {
                    this.releaseItems();

                    return;
                }

                this._view.showMakeOffer(this._offerItems[0], Math.min(this._offerItems.length, this.bulkOfferLimit));

                break;
            }
            case CAN_MAKE_OFFER_NO_TRADING_PRIVILEGE:
                this._view.showAlert(
                    '${inventory.marketplace.no_trading_privilege.title}',
                    '${inventory.marketplace.no_trading_privilege.info}'
                );
                break;
            case CAN_MAKE_OFFER_NO_TRADING_PASS:
                this._view.showAlert(
                    '${inventory.marketplace.no_trading_pass.title}',
                    '${inventory.marketplace.no_trading_pass.info}'
                );
                break;
            case CAN_MAKE_OFFER_NEEDS_TOKENS:
                // Note AS3 shows the *stored* batch price/size, not the token count this reply
                // carried — the count is only used by the server-side check.
                this._view.showBuyTokens(this._tokenBatchPrice, this._tokenBatchSize);
                break;
            case CAN_MAKE_OFFER_CANCELLED:
                this.releaseItems();
                break;
            case CAN_MAKE_OFFER_TRADING_LOCK:
                this._view.showAlert(
                    '${inventory.marketplace.trading_lock.title}',
                    '${inventory.marketplace.trading_lock.info}'
                );
                break;
        }
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::endOfferMaking()
    endOfferMaking(result: number): void
    {
        this._view.showResult(result);
    }

    /**
     * Discards a reply for an item the user has since moved away from — the dialog only ever shows
     * stats for what it is currently displaying.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::setItemStats()
    setItemStats(stats: MarketplaceItemStats | null): void
    {
        if(stats == null) return;
        if(stats.furniCategoryId !== this._pendingStatsCategory || stats.furniTypeId !== this._pendingStatsType) return;

        this._view.updateItemStats(stats, this._averagePricePeriod);
    }

    /**
     * A unique-serial item is priced against its own series, not against the furni type — hence a
     * third category that neither the offer composer nor the wall/floor split knows about.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::resolveStatsRequestCategory()
    private static resolveStatsRequestCategory(item: FurnitureItem | null): number
    {
        if(item != null && item.stuffData != null && item.stuffData.uniqueSerialNumber > 0)
        {
            return MarketplaceModel.OFFER_CATEGORY_UNIQUE;
        }

        return item != null && item.isWallItem
            ? MarketplaceModel.OFFER_CATEGORY_WALL
            : MarketplaceModel.OFFER_CATEGORY_FLOOR;
    }

    /**
     * Only releases when the shortfall was *our* token purchase. A "not enough credits" from
     * anywhere else must leave the reserved stack alone.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::onNotEnoughCredits()
    onNotEnoughCredits(): void
    {
        if(this._buyingTokens)
        {
            this._buyingTokens = false;

            this.releaseItems();
        }
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::requestInitialization()
    requestInitialization(): void
    {
        this.send(new GetMarketplaceConfigurationMessageComposer());
    }

    /**
     * The item whose picture and price history the dialog shows. Before the stack is locked there
     * is nothing in `_offerItems`, so it falls back to asking the group for a sellable copy.
     */
    // AS3: .../inventory/marketplace/MarketplaceModel.as::getOfferItem()
    getOfferItem(): FurnitureItem | null
    {
        if(this._offerItems != null && this._offerItems.length > 0)
        {
            return this._offerItems[0];
        }

        return this._offerGroup?.getOneForSelling() ?? null;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::getOfferItemRefs()
    getOfferItemRefs(): number[]
    {
        if(this._offerItems == null) return [];

        return this._offerItems.map((item) => item.ref);
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        return null;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::categorySwitch()
    categorySwitch(_category: string): void
    {
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::subCategorySwitch()
    subCategorySwitch(_category: string): void
    {
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::closingInventoryView()
    closingInventoryView(): void
    {
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::updateView()
    updateView(): void
    {
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::selectItemById()
    selectItemById(_itemId: string): void
    {
        log.warn('NOT SUPPORTED: MARKETPLACE SELECT BY ID');
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::send()
    private send(composer: IMessageComposer<unknown[]>): void
    {
        this._communication?.connection?.send(composer);
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../inventory/marketplace/MarketplaceModel.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.releaseItems();

        // AS3 does not dispose the view here — it only drops its own collaborators. The view holds
        // a window, and taking it down from under a dialog that may still be open is exactly what
        // AS3 avoids; kept as-is.
        this._habboInventory = null;
        this._communication = null;
        this._windowManager = null;
        this._assets = null;
        this._roomEngine = null;

        this._disposed = true;
    }
}
