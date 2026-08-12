import type {IWindowContainer} from '@core/window/IWindowContainer';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {CollectibleAsset} from '@habbo/communication/messages/parser/collectibles/CollectibleAsset';
import {RequestNftAssetsComposer} from '@habbo/communication/messages/outgoing/collectibles/RequestNftAssetsComposer';

import type {HabboInventory} from '../HabboInventory';
import {UnseenItemCategory} from '../enum/UnseenItemCategory';
import type {ICollectiblesModel} from './ICollectiblesModel';
import type {CollectibleGroupedItem} from './CollectibleGroupedItem';
import {CollectiblesView} from './CollectiblesView';

/**
 * The collectibles (NFT) inventory tab — an IInventoryModel.
 *
 * Unlike the other category models, this one does not own its item grouping: `CollectibleGroupedItem`
 * lives in the view, and the model calls back *into* the view (`findGroupedItem()`) to reach it.
 * That is AS3's own shape, and it is why the model/stub split used for wired trading does not apply
 * here — a stubbed view would leave the model with nothing to query.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/collectibles/CollectiblesModel.as
 */
export class CollectiblesModel implements ICollectiblesModel
{
    // AS3: .../CollectiblesModel.as::_SafeStr_4593 (the owning HabboInventory)
    private _controller: HabboInventory;
    // AS3: .../CollectiblesModel.as::_SafeStr_4550 (the view)
    private _view: CollectiblesView;
    // AS3: .../CollectiblesModel.as::_communication
    private _communication: IHabboCommunicationManager | null;
    // AS3: .../CollectiblesModel.as::_disposed
    private _disposed: boolean = false;
    // AS3: .../CollectiblesModel.as::_isLoaded
    private _isLoaded: boolean = false;
    // AS3: .../CollectiblesModel.as::_items (assetId -> asset)
    private _items: OrderedMap<number, CollectibleAsset> = new OrderedMap<number, CollectibleAsset>();
    // AS3: .../CollectiblesModel.as::_requestedInventoryThisTrade
    private _requestedInventoryThisTrade: boolean = false;
    // AS3: .../CollectiblesModel.as::_selected
    private _selected: CollectibleGroupedItem | null = null;

    /**
     * AS3 also takes `assets`, `roomEngine`, `catalog` and `avatarRenderer`, stores all four and
     * reads none of them — the catalog it does use comes through `controller.catalog`. They are
     * left out here for the same reason RecyclerModel leaves out its five.
     */
    // AS3: .../CollectiblesModel.as::CollectiblesModel()
    constructor(
        controller: HabboInventory,
        windowManager: IHabboWindowManager | null,
        communication: IHabboCommunicationManager | null
    )
    {
        this._controller = controller;
        this._communication = communication;
        this._view = new CollectiblesView(this, windowManager);
    }

    // AS3: .../CollectiblesModel.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../CollectiblesModel.as::get controller()
    get controller(): HabboInventory
    {
        return this._controller;
    }

    // AS3: .../CollectiblesModel.as::isListInitialized()
    isListInitialized(): boolean
    {
        return this._isLoaded;
    }

    // AS3: .../CollectiblesModel.as::setListInitialized()
    setListInitialized(): void
    {
        this._isLoaded = true;
        this._view.updateState();
    }

    /**
     * A finished trade invalidates the whole tab: the assets that changed hands are stale, so the
     * category is marked uninitialised and the next `categorySwitch()` re-requests it.
     */
    // AS3: .../CollectiblesModel.as::onTradeComplete()
    onTradeComplete(): void
    {
        this._isLoaded = false;
        this._controller.setInventoryCategoryInit('collectibles', false);
        this._view.updateState();
    }

    // AS3: .../CollectiblesModel.as::get items()
    get items(): OrderedMap<number, CollectibleAsset>
    {
        return this._items;
    }

    /**
     * Applies a full server snapshot as a diff: what the snapshot dropped, and what it added. The
     * view only ever sees the difference, so an unchanged asset keeps its grid cell — and with it
     * its already-rendered product icon.
     */
    // AS3: .../CollectiblesModel.as::initCollectibles()
    initCollectibles(incoming: OrderedMap<number, CollectibleAsset>): void
    {
        const incomingIds = incoming.getKeys();
        const currentIds = this._items.getKeys();
        const removed: CollectibleAsset[] = [];
        const added: CollectibleAsset[] = [];

        for(const assetId of currentIds)
        {
            if(incomingIds.indexOf(assetId) === -1)
            {
                const asset = this._items.remove(assetId);

                if(asset !== null) removed.push(asset);
            }
        }

        for(const assetId of incomingIds)
        {
            if(currentIds.indexOf(assetId) === -1)
            {
                const asset = incoming.getValue(assetId);

                if(asset === null) continue;

                this._items.add(assetId, asset);
                added.push(asset);
            }
        }

        this._view.initCollectibles(added, removed);

        if(!this._controller.checkCategoryInitilization('collectibles'))
        {
            this._controller.setInventoryCategoryInit('collectibles');
            this.setListInitialized();
        }
    }

    /**
     * Offers `amount` copies of this group into the open trade. The amount is validated against the
     * *unlocked* count, so copies already in the trade cannot be offered twice.
     */
    // AS3: .../CollectiblesModel.as::requestAddTrading()
    requestAddTrading(group: CollectibleGroupedItem | null, amount: number): void
    {
        if(group === null) return;

        if(amount < 1 || amount > group.unlockedAssetCount) return;

        const assetIds = group.pop(amount);

        if(assetIds.length < 1) return;

        this._controller.tradingModel.requestAddNftsToTrading(assetIds);
    }

    /**
     * Re-derives which copies are locked from the trading model's own NFT lists.
     *
     * The `false` on `findGroupedItem()` is load-bearing: by the time this runs the asset is
     * already inside the trade, so the default "must still hold this unlocked copy" test would
     * reject the very group that needs locking.
     */
    // AS3: .../CollectiblesModel.as::updateItemLocks()
    updateItemLocks(): void
    {
        this._view.unlockAll();

        const trading = this._controller.tradingModel;

        if(!trading.running) return;

        const ownNftItems = trading.ownUserNftItems;

        if(ownNftItems === null) return;

        for(const tradedGroup of ownNftItems.getValues())
        {
            const group = this._view.findGroupedItem(tradedGroup.item, false);

            if(group === null) continue;

            for(const assetId of tradedGroup.assetIds) group.lockAsset(assetId);
        }

        this._view.updatePreview();
    }

    // AS3: .../CollectiblesModel.as::setSelected()
    setSelected(group: CollectibleGroupedItem | null): void
    {
        if(group === this._selected) return;

        if(this._selected !== null)
        {
            this._selected.isSelected = false;
            this._selected = null;
        }

        if(group !== null)
        {
            group.isSelected = true;
            this._selected = group;
        }

        this._view.updatePreview();
    }

    // AS3: .../CollectiblesModel.as::get selected()
    get selected(): CollectibleGroupedItem | null
    {
        return this._selected;
    }

    /**
     * Empty in AS3. The tab does not preload: nothing is requested until the player actually opens
     * it, which `categorySwitch()` below handles.
     */
    // AS3: .../CollectiblesModel.as::requestInitialization()
    requestInitialization(): void
    {
    }

    // AS3: .../CollectiblesModel.as::categorySwitch()
    categorySwitch(category: string): void
    {
        if(category === 'collectibles' && this._controller.isVisible)
        {
            this._controller.events.emit('HABBO_INVENTORY_TRACKING_EVENT_COLLECTIBLES');
            this.requestNftAssets();
            this._view.updateContainerVisibility();
        }
    }

    // AS3: .../CollectiblesModel.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        return this._view.getWindowContainer();
    }

    // AS3: .../CollectiblesModel.as::closingInventoryView()
    closingInventoryView(): void
    {
        if(this._view.isVisible) this.resetUnseenItems();
    }

    // AS3: .../CollectiblesModel.as::subCategorySwitch()
    subCategorySwitch(category: string): void
    {
        switch(category)
        {
            case 'trading':
                // A new trade re-arms the one-shot request below, so the tab reloads once per trade.
                this._requestedInventoryThisTrade = false;

                if(this._view.isVisible) this.requestNftAssets();

                break;
            case 'empty':
                this._view.unlockAll();
                break;
        }
    }

    // AS3: .../CollectiblesModel.as::requestNftAssets()
    requestNftAssets(): void
    {
        if(this._requestedInventoryThisTrade) return;

        this._requestedInventoryThisTrade = true;
        this._communication?.connection?.send(new RequestNftAssetsComposer());
    }

    /**
     * Empty in AS3 beyond a null check on the view — the collectibles tab has no counter or badge
     * to refresh, unlike furni/pets/badges whose `updateView()` repaints unseen markers.
     */
    // AS3: .../CollectiblesModel.as::updateView()
    updateView(): void
    {
        // Intentionally empty; see the note above.
    }

    // AS3: .../CollectiblesModel.as::getItemById()
    private getItemById(assetId: number): CollectibleAsset | null
    {
        return this._items.getValue(assetId);
    }

    // AS3: .../CollectiblesModel.as::getGroupedItemById()
    getGroupedItemById(assetId: number): CollectibleGroupedItem | null
    {
        const asset = this.getItemById(assetId);

        if(asset === null) return null;

        return this._view.findGroupedItem(asset);
    }

    // AS3: .../CollectiblesModel.as::resetUnseenItems()
    resetUnseenItems(): void
    {
        this._controller.unseenItemTracker.resetCategory(UnseenItemCategory.COLLECTIBLES);
        this._controller.updateUnseenItemCounts();
    }

    /**
     * AS3 queries category **5** (BOT) here while `resetUnseenItems()` above clears category **7**
     * (COLLECTIBLES) — the two do not agree, and 5 is the wrong one. Ported as written: this is a
     * live AS3 bug, not a decompile artefact, and nothing in this port calls the method yet
     * (AS3 does not either), so "correcting" it would only invent behaviour the client never had.
     */
    // AS3: .../CollectiblesModel.as::isUnseen()
    isUnseen(assetId: number): boolean
    {
        return this._controller.unseenItemTracker.isUnseen(UnseenItemCategory.BOT, assetId);
    }

    /**
     * Empty in AS3. The `inventory/open/collectibles/<id>` link therefore opens the tab but does
     * not select anything — a gap in the source, not in the port.
     */
    // AS3: .../CollectiblesModel.as::selectItemById()
    selectItemById(_itemId: string): void
    {
    }

    // AS3: .../CollectiblesModel.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._view.dispose();
        this._items.dispose();
        this._communication = null;
        this._disposed = true;
    }
}
