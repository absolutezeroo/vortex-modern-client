import {Logger} from '@core/utils/Logger';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {FurnitureItem} from '../items/FurnitureItem';
import type {IHabboInventory} from '../IHabboInventory';
import type {IRecyclerModel} from './IRecyclerModel';

const log = Logger.getLogger('habbo.inventory.recycler.RecyclerModel');

/**
 * The inventory side of the recycler — which of your own items are currently sitting in the
 * machine.
 *
 * It owns no window of its own. The recycler UI belongs to the catalog
 * (`habbo/catalog/recycler/RecyclerLogic`); this model exists so the furni grid knows to grey out
 * what is already loaded, and so those items unlock again when the machine is closed. That is why
 * six of the seven `IInventoryModel` members are empty here and `getWindowContainer()` returns
 * null: AS3's are empty too.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/recycler/RecyclerModel.as
 */
export class RecyclerModel implements IRecyclerModel
{
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::STATE_READY
    public static readonly STATE_READY: number = 0;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::STATE_ACTIVE
    public static readonly STATE_ACTIVE: number = 1;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::_inventory
    private _inventory: IHabboInventory | null;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::_SafeStr_4597 (from `get state()`)
    private _state: number = RecyclerModel.STATE_READY;

    /**
     * Keyed by item id, which is what `getOwnItemsInRecycler()` hands back — the values are only
     * held so that `releaseFurni()` can tell "not in the machine" from "in it".
     */
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::_itemList
    private _itemList: Map<number, FurnitureItem> | null = null;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::_disposed
    private _disposed: boolean = false;

    /**
     * AS3 also takes the window manager, communication, assets, the room engine and localization.
     * All five are stored and never read again — the model sends nothing and draws nothing — so
     * the port takes only the inventory it actually uses.
     */
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::RecyclerModel()
    constructor(inventory: IHabboInventory)
    {
        this._inventory = inventory;
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::get running()
    get running(): boolean
    {
        return this._state === RecyclerModel.STATE_ACTIVE;
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::get state()
    get state(): number
    {
        return this._state;
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::set state()
    set state(value: number)
    {
        this._state = value;
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Turns the recyclable badge on across the whole grid. The item list starts empty and fills as
     * the player drops things in.
     */
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::startRecycler()
    startRecycler(): void
    {
        if(this._inventory == null || this._inventory.furniModel == null) return;

        this._state = RecyclerModel.STATE_ACTIVE;
        this._itemList = new Map<number, FurnitureItem>();

        this._inventory.furniModel.showRecyclable(true);
    }

    /**
     * Releases every lock the machine was holding. Note the order AS3 uses: the state and the badge
     * go first, then the locks, then the list is dropped — so an item released here is unlocked
     * against a grid that has already stopped showing recycle badges.
     */
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::stopRecycler()
    stopRecycler(): void
    {
        if(this._itemList == null || this._inventory == null || this._inventory.furniModel == null) return;

        this._state = RecyclerModel.STATE_READY;

        this._inventory.furniModel.showRecyclable(false);

        for(const itemId of this._itemList.keys())
        {
            this._inventory.furniModel.removeLockFrom(itemId);
        }

        this._itemList = null;
    }

    /**
     * Takes one unlocked, recyclable item out of the selected stack and remembers it.
     *
     * Returns the item id, or 0 when there was nothing to take — AS3 uses 0 rather than -1 as its
     * "nothing" answer here, and the catalog side tests it as a truthy id.
     */
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::lockSelectedFurni()
    lockSelectedFurni(): number
    {
        if(this._itemList == null || this._inventory == null || this._inventory.furniModel == null) return 0;

        const item = this._inventory.furniModel.requestSelectedFurniToRecycler();

        if(item == null) return 0;

        if(!this._itemList.has(item.id)) this._itemList.set(item.id, item);

        return item.id;
    }

    /**
     * `true` when the machine is not running at all — AS3 answers "released" rather than "failed"
     * for a recycler that was never started, and only reports `false` for an id it is genuinely
     * not holding.
     */
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::releaseFurni()
    releaseFurni(itemId: number): boolean
    {
        if(this._itemList == null) return true;

        if(!this._itemList.has(itemId)) return false;

        const furniModel = this._inventory?.furniModel ?? null;

        if(furniModel == null) return false;

        furniModel.removeLockFrom(itemId);
        this._itemList.delete(itemId);

        return true;
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::getOwnItemsInRecycler()
    getOwnItemsInRecycler(): number[]
    {
        if(this._itemList == null) return [];

        return [...this._itemList.keys()];
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::closingInventoryView()
    closingInventoryView(): void
    {
        // AS3 is empty: closing the inventory does not stop the machine.
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::requestInitialization()
    requestInitialization(): void
    {
        // AS3 is empty: there is nothing to fetch, the item list is built locally.
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::categorySwitch()
    categorySwitch(_category: string): void
    {
        // AS3 is empty.
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::subCategorySwitch()
    subCategorySwitch(_category: string): void
    {
        // AS3 is empty.
    }

    /**
     * Always null. The recycler has no inventory-side window — its UI is the catalog's
     * `RecyclerLogic`, which this model never talks to.
     */
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        return null;
    }

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::updateView()
    updateView(): void
    {
        // AS3 is empty: no window, nothing to repaint.
    }

    /**
     * The message says MARKETPLACE. That is AS3's own text, not a mistake in this port — the method
     * was evidently copied from `MarketplaceModel`, whose version says the same thing. Kept
     * verbatim so a log line found in the wild still greps back to its source.
     */
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::selectItemById()
    selectItemById(_itemId: string): void
    {
        log.warn('NOT SUPPORTED: MARKETPLACE SELECT BY ID');
    }

    /**
     * AS3 clears its references *before* calling `stopRecycler()`, which then finds `_inventory`
     * null and returns immediately — so disposing never releases the locks. Preserved: the grid is
     * torn down with the inventory anyway, and reordering it would change which objects are alive
     * during teardown.
     */
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::dispose()
    dispose(): void
    {
        if(!this._disposed)
        {
            this._inventory = null;
            this._disposed = true;
        }

        this.stopRecycler();
    }
}
