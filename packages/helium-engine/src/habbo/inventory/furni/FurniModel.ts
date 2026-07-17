import type {IFurniModel} from './IFurniModel';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {IFurnitureItemData} from '../items/FurnitureItemData';
import type {HabboInventory} from '../HabboInventory';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboCommunicationManager} from '../../communication/IHabboCommunicationManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {RoomEngineObjectPlacedEvent} from '@habbo/room/events/RoomEngineObjectPlacedEvent';
import {GroupItem} from '../items/GroupItem';
import {HabboInventoryCategoryInitializeEvent} from '../events/HabboInventoryCategoryInitializeEvent';
import {FurnitureItem} from '../items/FurnitureItem';
import {FurnitureCategory} from '../enum';
import {FurniView} from './FurniView';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';

/**
 * Manages furniture inventory data
 *
 * Based on AS3 com.sulake.habbo.inventory.furni.FurniModel (ENGINE only)
 * UI is the ported FurniView window (see task #14), not SolidJS.
 */
export class FurniModel implements IFurniModel
{
    private _currentCategory: 'furni' | 'rentables' = 'furni';
    private _categorySelections: Map<string, GroupItem | null> = new Map();

    private _habboInventory: HabboInventory;
    private _windowManager: IHabboWindowManager;
    private _roomEngine: IRoomEngine;
    private _communication: IHabboCommunicationManager;
    private _catalog: IHabboCatalog;
    private _localization: IHabboLocalizationManager;

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::controller
    get controller(): HabboInventory
    {
        return this._habboInventory;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::localization
    get localization(): IHabboLocalizationManager
    {
        return this._localization;
    }

    get windowManager(): IHabboWindowManager
    {
        return this._windowManager;
    }

    get roomEngine(): IRoomEngine
    {
        return this._roomEngine;
    }

    get catalog(): IHabboCatalog
    {
        return this._catalog;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::isTradingOpen
    // TODO(AS3): TradingView/subCategory routing not ported yet (see FurniView task).
    get isTradingOpen(): boolean
    {
        return false;
    }

    constructor(
        habboInventory: HabboInventory,
        windowManager: IHabboWindowManager,
        roomEngine: IRoomEngine,
        communication: IHabboCommunicationManager,
        catalog: IHabboCatalog,
        localization: IHabboLocalizationManager
    )
    {
        this._habboInventory = habboInventory;
        this._windowManager = windowManager;
        this._roomEngine = roomEngine;
        this._communication = communication;
        this._catalog = catalog;
        this._localization = localization;
        this._categorySelections.set('furni', null);
        this._categorySelections.set('rentables', null);
        this._view = new FurniView(this);
        this._roomEngine.events.on('REOE_PLACED', this.onObjectPlaced);
    }

    private _view: FurniView;

    get view(): FurniView
    {
        return this._view;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::isListInited()
    isListInited(): boolean
    {
        return this._isListInitialized;
    }

    private _showingNfts: boolean = true;

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::get showingNfts()
    get showingNfts(): boolean
    {
        return this._showingNfts;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::get isPrivateRoom()
    get isPrivateRoom(): boolean
    {
        if(!this._habboInventory || !this._habboInventory.roomSession) return false;

        return this._habboInventory.roomSession.isPrivateRoom;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::canUserOfferToTrade()
    // TODO(AS3): needs HabboInventory.canUserOfferToTrade() (not wired yet).
    canUserOfferToTrade(): boolean
    {
        return false;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::gotoRoom()
    // TODO(AS3): needs OpenFlatConnectionMessageComposer wiring.
    gotoRoom(): void
    {
        // Not wired yet.
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::requestSelectedFurniToTrading()
    // TODO(AS3): TradingModel.requestAddItemsToTrading() not wired yet.
    requestSelectedFurniToTrading(_count: number = 1, _offerInTradingCountButton: unknown = null): void
    {
        // Not wired yet.
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::requestSelectedFurniSelling()
    // TODO(AS3): needs MarketplaceModel (not ported — see class doc comment).
    requestSelectedFurniSelling(): void
    {
        // Not wired yet.
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::showUseProductSelection()
    // TODO(AS3): needs RoomEngine.showUseProductSelection() (not ported yet).
    showUseProductSelection(): void
    {
        // Not wired yet.
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::extendRentPeriod()
    // TODO(AS3): needs HabboCatalog.openRentConfirmationWindow() (not wired yet).
    extendRentPeriod(): void
    {
        // Not wired yet.
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::buyRentedItem()
    // TODO(AS3): needs HabboCatalog.openRentConfirmationWindow() (not wired yet).
    buyRentedItem(): void
    {
        // Not wired yet.
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::updateActionView()
    updateActionView(): void
    {
        this._view.updateActionView();
    }

    private _pendingPlacementRef: number = -1;
    private _isPlacing: boolean = false;

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::cancelFurniInMover()
    cancelFurniInMover(): void
    {
        if(this._pendingPlacementRef > -1)
        {
            this._roomEngine.cancelRoomObjectInsert();
            this._isPlacing = false;
            this._pendingPlacementRef = -1;
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::requestSelectedFurniPlacement()
    // TODO(AS3): category 2/3/4 (wallpaper/floor/landscape) should go through
    // RequestRoomPropertySet instead of the mover — not ported yet, so those
    // items report failure here for now.
    requestSelectedFurniPlacement(useLastSelectedIndex: boolean = true): boolean
    {
        const groupItem = this.getSelectedItem();

        if(groupItem === null) return false;

        if(groupItem.getUnlockedCount() === 0) return false;

        if(groupItem.selectedItemIndex < 0 && useLastSelectedIndex)
        {
            groupItem.selectedItemIndex = groupItem.getTotalCount() - 1;
        }

        const item = groupItem.getAt(groupItem.selectedItemIndex);

        if(item === null) return false;

        if(item.isRented && item.flatId > -1) return false;

        if(([FurnitureCategory.WALL_PAPER, FurnitureCategory.FLOOR, FurnitureCategory.LANDSCAPE] as number[]).includes(item.category))
        {
            return false;
        }

        this.requestSelectedFurniToMover(item);
        this._view.updateActionView();

        return true;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::requestSelectedFurniToMover()
    private requestSelectedFurniToMover(item: FurnitureItem): void
    {
        const category = item.isWallItem ? RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL : RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE;

        const success = this._roomEngine.initializeRoomObjectInsert(
            'inventory', item.id, category, item.type, item.extra.toString(), item.stuffData
        );

        if(success)
        {
            this._pendingPlacementRef = item.ref;
            this._isPlacing = true;
            this._habboInventory.closeView();
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::onObjectPlaced()
    onObjectPlaced = (event: RoomEngineObjectPlacedEvent): void =>
    {
        if(!this._isPlacing || event.type !== 'REOE_PLACED') return;

        this._isPlacing = false;

        if(!event.placedInRoom)
        {
            this._habboInventory.showView();
            this.cancelFurniInMover();
        }
        else if(this._currentCategory === 'rentables')
        {
            this._habboInventory.showView();
        }
        else if((event.placedOnFloor && -event.objectId === this._pendingPlacementRef) || (event.placedOnWall && event.objectId === this._pendingPlacementRef))
        {
            this.attemptPlaceNextFurni();
        }
    };

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::attemptPlaceNextFurni()
    private attemptPlaceNextFurni(): void
    {
        const groupItem = this.getSelectedItem();

        if(groupItem === null) return;

        let nextIndex = -1;

        if(groupItem.category === FurnitureCategory.POST_IT)
        {
            if(groupItem.getTotalCount() > 1) nextIndex = 0;
        }
        else
        {
            for(let i = groupItem.selectedItemIndex - 1; i >= 0; i--)
            {
                const item = groupItem.getAt(i);

                if(item && !item.locked)
                {
                    nextIndex = i;
                    break;
                }
            }
        }

        let stop = true;

        if(nextIndex !== -1)
        {
            groupItem.selectedItemIndex = nextIndex;
            stop = !this.requestSelectedFurniPlacement(false);
        }

        if(stop)
        {
            groupItem.selectedItemIndex = -1;
            this.cancelFurniInMover();
            this._habboInventory.showView();
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::requestCurrentActionOnSelection()
    // TODO(AS3): recycler/trading branches not wired yet (only placement).
    requestCurrentActionOnSelection(): void
    {
        this.requestSelectedFurniPlacement();
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    private _isListInitialized: boolean = false;

    get isListInitialized(): boolean
    {
        return this._isListInitialized;
    }

    private _furniData: GroupItem[] = [];
    private _furniDataSet: Set<GroupItem> = new Set();

    get furniData(): GroupItem[]
    {
        return this._furniData;
    }

    private _showingRentedFurni: boolean = false;

    get showingRentedFurni(): boolean
    {
        return this._showingRentedFurni;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._roomEngine.events.off('REOE_PLACED', this.onObjectPlaced);

        for(const group of this._furniData)
        {
            group.dispose();
        }

        this._furniData.length = 0;
        this._furniDataSet.clear();
        this._categorySelections.clear();
        this._view.dispose();
        this._disposed = true;
    }

    insertFurniture(items: Map<number, IFurnitureItemData>): {
        addedCount: number;
        removedCount: number;
        isFirstLoad: boolean;
    }
    {
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/furni/FurniModel.as::insertFurniture()
        // Claim the category up-front; this returns true exactly once. Without it
        // _initializedCategories stays empty, so checkCategoryInitilization() never sees the furni
        // list as loaded and re-requests the whole inventory on every tab switch.
        const categoryWasInitialized = this._habboInventory.setInventoryCategoryInit('furni');

        const existingIds = this.getAllStripIds();
        const newIds = new Set(items.keys());
        const isFirstLoad = existingIds.size === 0;

        // Find IDs to add and remove
        const idsToAdd: number[] = [];
        const idsToRemove: number[] = [];

        for(const id of newIds)
        {
            if(!existingIds.has(id))
            {
                idsToAdd.push(id);
            }
        }

        for(const id of existingIds)
        {
            if(!newIds.has(id))
            {
                idsToRemove.push(id);
            }
        }

        // Remove items no longer in list
        for(const id of idsToRemove)
        {
            this.removeFurni(id);
        }

        // Add new items
        for(const id of idsToAdd)
        {
            const data = items.get(id);

            if(data)
            {
                const item = new FurnitureItem(data);

                this.addOrUpdateItem(item, true);
            }
        }

        this._isListInitialized = true;
        this._view.addItems(this._furniData);

        // Select first item if needed
        if(isFirstLoad || this.getSelectedItem() === null)
        {
            this.selectFirstItem();
        }

        this._view.setViewToState();

        // AS3 dispatches this at the tail of insertFurniture(), only on the pass that actually
        // claimed the category. Its only AS3 consumer is CollectiblesController, which is not
        // ported — the event is raised anyway so the chain is complete rather than silently absent.
        if(categoryWasInitialized)
        {
            this._habboInventory.events.emit(
                HabboInventoryCategoryInitializeEvent.HABBO_INVENTORY_CATEGORY_INITIALIZED,
                new HabboInventoryCategoryInitializeEvent('furni')
            );
        }

        return {
            addedCount: idsToAdd.length,
            removedCount: idsToRemove.length,
            isFirstLoad,
        };
    }

    addOrUpdateItem(item: FurnitureItem, isInitializing: boolean): {
        groupItem: GroupItem;
        isNewGroup: boolean;
    }
    {
        let result: { groupItem: GroupItem; isNewGroup: boolean };

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/furni/FurniModel.as::addOrUpdateItem()
        // Non-groupable items get their own group, except monsterplant seeds and the two chest
        // categories — AS3 sends those down the groupable path even when not groupable, because
        // addOrUpdateGroupableItem() has a chest-specific matching rule.
        if(!item.groupable
            && item.category !== FurnitureCategory.MONSTERPLANT_SEED
            && item.category !== FurnitureCategory.FURNI_CHEST
            && item.category !== FurnitureCategory.COINS_CHEST)
        {
            result = this.addOrUpdateNonGroupableItem(item, isInitializing);
        }
        else
        {
            result = this.addOrUpdateGroupableItem(item, isInitializing);
        }

        // Mark as unseen if not initializing
        if(!isInitializing)
        {
            result.groupItem.hasUnseenItems = true;
        }

        return result;
    }

    removeFurni(itemId: number): GroupItem | null
    {
        for(let i = 0; i < this._furniData.length; i++)
        {
            const groupItem = this._furniData[i];
            const removedItem = groupItem.remove(itemId);

            if(removedItem)
            {
                // If group is empty, remove it
                if(groupItem.getTotalCount() <= 0)
                {
                    this._furniDataSet.delete(groupItem);
                    this._furniData.splice(i, 1);

                    // If this was selected, select first item
                    if(groupItem.isSelected)
                    {
                        this.selectFirstItem();
                    }

                    groupItem.dispose();
                }
                else
                {
                    this._view.updateActionView();
                }

                this._view.setViewToState();

                return groupItem;
            }
        }

        return null;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::removeFurnis()
    removeFurnis(itemIds: number[]): boolean
    {
        let removedAny = false;

        for(const itemId of itemIds)
        {
            if(this.removeFurni(itemId) !== null)
            {
                removedAny = true;
            }
        }

        return removedAny;
    }

    clearFurniList(): void
    {
        for(const group of this._furniData)
        {
            group.dispose();
        }

        this._furniData.length = 0;
        this._furniDataSet.clear();
        this._isListInitialized = false;
    }

    getSelectedItem(): GroupItem | null
    {
        for(const groupItem of this._furniData)
        {
            if(groupItem.isSelected)
            {
                return groupItem;
            }
        }

        return null;
    }

    removeSelections(): void
    {
        for(const groupItem of this._furniData)
        {
            groupItem.isSelected = false;
        }
    }

    selectFirstItem(): GroupItem | null
    {
        this.removeSelections();

        // Find first item matching current category filter
        for(const groupItem of this._furniData)
        {
            if(this._showingRentedFurni === groupItem.isRented)
            {
                groupItem.isSelected = true;
                groupItem.selectedItemIndex = -1;
                this._categorySelections.set(this._currentCategory, groupItem);

                return groupItem;
            }
        }

        return null;
    }

    selectItem(groupItem: GroupItem): void
    {
        this.removeSelections();
        groupItem.isSelected = true;
        groupItem.selectedItemIndex = -1;
        this._categorySelections.set(this._currentCategory, groupItem);
    }

    getItemById(itemId: number): GroupItem | null
    {
        for(const groupItem of this._furniData)
        {
            if(groupItem.getItem(itemId) !== null)
            {
                return groupItem;
            }
        }

        return null;
    }

    getItemWithStripId(stripId: number): GroupItem | null
    {
        return this.getItemById(stripId);
    }

    getGroupItemByItemTypeId(typeId: number, isWallItem: boolean): GroupItem | null
    {
        for(const groupItem of this._furniData)
        {
            if(groupItem.type === typeId && groupItem.isWallItem === isWallItem)
            {
                return groupItem;
            }
        }

        return null;
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::updateItemLocks()
    // TODO(AS3): AS3 computes lockedRefIds itself from tradingModel/recyclerModel/
    // marketplaceModel (none wired yet) — callers pass the list explicitly for now.
    updateItemLocks(lockedRefIds: number[] = []): void
    {
        if(lockedRefIds.length === 0)
        {
            this.removeAllLocks();
        }
        else
        {
            for(const groupItem of this._furniData)
            {
                groupItem.updateLocks(lockedRefIds);
            }
        }

        this._view.updateActionView();
    }

    addLockTo(itemId: number): void
    {
        for(const groupItem of this._furniData)
        {
            if(groupItem.addLockTo(itemId))
            {
                return;
            }
        }
    }

    removeLockFrom(itemId: number): void
    {
        for(const groupItem of this._furniData)
        {
            if(groupItem.removeLockFrom(itemId))
            {
                return;
            }
        }
    }

    removeAllLocks(): void
    {
        for(const groupItem of this._furniData)
        {
            groupItem.removeAllLocks();
        }
    }

    categorySwitch(category: 'furni' | 'rentables'): void
    {
        if(!this._habboInventory.isVisible) return;

        this._currentCategory = category;
        this._showingRentedFurni = category === 'rentables';
        this._view.resetFilters(category);
        this.updateCategorySelection();
        this.updateItemLocks();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        return this._view.getWindowContainer();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::requestInitialization()
    requestInitialization(): void
    {
        this._habboInventory.requestFurni();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::subCategorySwitch()
    // TODO(AS3): trading subcategory NFT-tab toggle depends on web3tradeEnabled flow.
    subCategorySwitch(category: string): void
    {
        if(category === 'empty')
        {
            this.removeAllLocks();
        }

        this._view.updateActionView();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::closingInventoryView()
    closingInventoryView(): void
    {
        if(this._view.isVisible)
        {
            this.resetUnseenItems();
        }
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::updateView()
    updateView(): void
    {
        this._view.updateActionView();
        this._view.updateGridFilters();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/furni/FurniModel.as::setViewToState()
    setViewToState(): void
    {
        this._view.setViewToState();
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::selectItemById()
    selectItemById(itemId: string): void
    {
        const groupItem = this.getItemById(-parseInt(itemId, 10));

        if(groupItem !== null)
        {
            this.selectItem(groupItem);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/furni/FurniModel.as::resetUnseenItems()
    resetUnseenItems(): number[]
    {
        const resetIds: number[] = [];

        // AS3 resets the tracker category first — rentables → 2, otherwise → 1 — which
        // sends the server reset and clears the count, then updateUnseenItemCounts()
        // redraws the tab badges. The old body only cleared the per-group highlight
        // flags and returned ids no caller consumed, so the badge never cleared after a
        // category was viewed.
        const category = this._showingRentedFurni ? 2 : 1;

        this._habboInventory.unseenItemTracker.resetCategory(category);

        for(const groupItem of this._furniData)
        {
            if(groupItem.hasUnseenItems && groupItem.isRented === this._showingRentedFurni)
            {
                groupItem.hasUnseenItems = false;
                resetIds.push(...groupItem.getFurniIds());
            }
        }

        this._habboInventory.updateUnseenItemCounts();

        return resetIds;
    }

    updateUnseenItems(unseenIds: number[]): void
    {
        if(unseenIds.length === 0) return;

        const unseenSet = new Set(unseenIds);

        for(const groupItem of this._furniData)
        {
            const furniIds = groupItem.getFurniIds();

            for(const id of furniIds)
            {
                if(unseenSet.has(id))
                {
                    groupItem.hasUnseenItems = true;
                    this.moveItemToTop(groupItem);

                    break;
                }
            }
        }
    }

    private getAllStripIds(): Set<number>
    {
        const ids = new Set<number>();

        for(const groupItem of this._furniData)
        {
            let count = groupItem.getTotalCount();

            // POST_IT items count differently
            if(groupItem.category === FurnitureCategory.POST_IT)
            {
                count = 1;
            }

            for(let i = 0; i < count; i++)
            {
                const item = groupItem.getAt(i);

                if(item)
                {
                    ids.add(item.id);
                }
            }
        }

        return ids;
    }

    private addOrUpdateNonGroupableItem(item: FurnitureItem, isInitializing: boolean): {
        groupItem: GroupItem;
        isNewGroup: boolean;
    }
    {
        // Find existing groups with same type
        const matchingGroups: GroupItem[] = [];

        for(const groupItem of this._furniData)
        {
            if(groupItem.type === item.type)
            {
                matchingGroups.push(groupItem);
            }
        }

        // Check if item already exists in any matching group
        for(const groupItem of matchingGroups)
        {
            if(groupItem.getItem(item.id) !== null)
            {
                return {groupItem, isNewGroup: false};
            }
        }

        // Create new group for this non-groupable item
        const isUnseen = !isInitializing;
        const groupItem = this.createGroupItem(item.type, item.category, item.stuffData, item.extra);

        groupItem.push(item, isUnseen);

        if(isUnseen)
        {
            groupItem.hasUnseenItems = true;
            this.addItemToTop(groupItem);
        }
        else
        {
            this.addItemToBottom(groupItem);
        }

        return {groupItem, isNewGroup: true};
    }

    private addOrUpdateGroupableItem(item: FurnitureItem, isInitializing: boolean): {
        groupItem: GroupItem;
        isNewGroup: boolean;
    }
    {
        const isUnseen = !isInitializing;
        let existingGroup: GroupItem | null = null;

        // Find matching group
        for(const groupItem of this._furniData)
        {
            if(groupItem.type === item.type && groupItem.isWallItem === item.isWallItem)
            {
                // MONSTERPLANT_SEED - match by rarity level
                if(item.category === FurnitureCategory.MONSTERPLANT_SEED)
                {
                    if(groupItem.stuffData?.rarityLevel === item.stuffData?.rarityLevel)
                    {
                        existingGroup = groupItem;

                        break;
                    }
                }
                // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/furni/FurniModel.as::addOrUpdateGroupableItem()
                // Chests only stack while both are empty and unnamed; anything else keeps its own
                // group. Without this branch they fell through to the match-by-type default and
                // every chest of a type collapsed into one pile regardless of contents or name.
                // AS3 deliberately does not break here — the last matching chest wins.
                else if(item.category === FurnitureCategory.FURNI_CHEST
                    || item.category === FurnitureCategory.COINS_CHEST)
                {
                    if(groupItem.stuffData?.contentsCount === 0
                        && item.stuffData?.contentsCount === 0
                        && groupItem.stuffData?.chestName === ''
                        && item.stuffData?.chestName === '')
                    {
                        existingGroup = groupItem;
                    }
                }
                // Must be groupable
                else if(groupItem.isGroupable)
                {
                    // POSTER - match by legacy string (color)
                    if(item.category === FurnitureCategory.POSTER)
                    {
                        if(groupItem.stuffData?.getLegacyString() === item.stuffData?.getLegacyString())
                        {
                            existingGroup = groupItem;

                            break;
                        }
                    }
                    // GUILD_FURNI - match by stuffData compare
                    else if(item.category === FurnitureCategory.GUILD_FURNI)
                    {
                        if(groupItem.stuffData && item.stuffData?.compare(groupItem.stuffData))
                        {
                            existingGroup = groupItem;

                            break;
                        }
                    }
                    // Default - just match by type
                    else
                    {
                        existingGroup = groupItem;

                        break;
                    }
                }
            }
        }

        // Add to existing group
        if(existingGroup)
        {
            existingGroup.push(item, isUnseen);

            if(isUnseen)
            {
                existingGroup.hasUnseenItems = true;
                this.moveItemToTop(existingGroup);
            }

            return {groupItem: existingGroup, isNewGroup: false};
        }

        // Create new group
        const groupItem = this.createGroupItem(item.type, item.category, item.stuffData, item.extra);

        groupItem.push(item, isUnseen);

        if(isUnseen)
        {
            groupItem.hasUnseenItems = true;
            this.addItemToTop(groupItem);
        }
        else
        {
            this.addItemToBottom(groupItem);
        }

        return {groupItem, isNewGroup: true};
    }

    // AS3: sources/win63_version/habbo/inventory/furni/FurniModel.as::createGroupItem()
    // TODO(AS3): skips the fixed wallpaper/floor/landscape icon lookup (needs
    // IHabboWindowManager.assets, not exposed) and the bottom-alignment list
    // (catalog.preview.alignment.bottom) — both fall back to sensible defaults
    // and get a real icon anyway via GroupItem's normal getFurnitureIcon() path.
    // Also always auto-requests icons instead of AS3's isInitializing-gated
    // deferral (FurniModel.initListImages()'s paced loader isn't ported yet).
    private createGroupItem(type: number, category: number, stuffData: IStuffData | null, extra: number): GroupItem
    {
        return new GroupItem(this, type, category, stuffData, extra, null, false, 'center', false);
    }

    private addItemToTop(groupItem: GroupItem): void
    {
        this._furniDataSet.add(groupItem);
        this._furniData.unshift(groupItem);
    }

    private addItemToBottom(groupItem: GroupItem): void
    {
        this._furniDataSet.add(groupItem);
        this._furniData.push(groupItem);
    }

    private removeItem(groupItem: GroupItem): void
    {
        if(this._furniDataSet.delete(groupItem))
        {
            const index = this._furniData.indexOf(groupItem);

            if(index > -1)
            {
                this._furniData.splice(index, 1);
            }
        }
    }

    private moveItemToTop(groupItem: GroupItem): void
    {
        this.removeItem(groupItem);
        this.addItemToTop(groupItem);
    }

    private updateCategorySelection(): void
    {
        this.removeSelections();

        const savedSelection = this._categorySelections.get(this._currentCategory);

        if(savedSelection && this._furniDataSet.has(savedSelection))
        {
            savedSelection.isSelected = true;
            savedSelection.selectedItemIndex = -1;
        }
        else
        {
            this.selectFirstItem();
        }
    }
}
