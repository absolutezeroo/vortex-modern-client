import type {IFurnitureItem} from './IFurnitureItem';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {FurniModel} from '../furni/FurniModel';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {ILimitedItemGridOverlayWidget} from '@habbo/window/widgets/ILimitedItemGridOverlayWidget';
import type {IRarityItemGridOverlayWidget} from '@habbo/window/widgets/IRarityItemGridOverlayWidget';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {FurnitureItem} from './FurnitureItem';
import {FurnitureCategory} from '../enum';

const THUMB_COLOR_NORMAL = 13421772;
const THUMB_COLOR_UNSEEN = 10275685;

/**
 * Groups identical furniture items together
 *
 * Based on AS3 com.sulake.habbo.inventory.items.GroupItem
 * This is the ENGINE-only version; UI is the ported window system.
 */
export class GroupItem implements IGetImageListener 
{
    private _items: Map<number, FurnitureItem> = new Map();
    private _model: FurniModel;
    private _windowInitialized: boolean = false;
    private _presetIcon: ImageBitmap | null;
    private _isNoAutoRequestImage: boolean;
    private _iconImage: ImageBitmap | null = null;
    private _iconCallbackId: number = -1;
    private _isImageInitAttempted: boolean = false;
    private _bgColorWindow: IWindow | null = null;
    private _wasDragCandidate: boolean = false;

    constructor(
        model: FurniModel,
        type: number,
        category: number,
        stuffData: IStuffData | null,
        extra: number,
        icon: ImageBitmap | null = null,
        isNoAutoRequestImage: boolean = false,
        alignment: string = 'center',
        showRecyclable: boolean = false
    ) 
    {
        this._model = model;
        this._type = type;
        this._category = category;
        this._stuffData = stuffData;
        this._extra = extra;
        this._presetIcon = icon;
        this._isNoAutoRequestImage = isNoAutoRequestImage;
        this._alignment = alignment;
        this._showRecyclable = showRecyclable;

        switch(this._category) 
        {
            case FurnitureCategory.WALL_PAPER:
                this._name = model.localization.getLocalization('inventory.furni.item.wallpaper.name');
                this._description = model.localization.getLocalization('inventory.furni.item.wallpaper.desc');
                break;
            case FurnitureCategory.FLOOR:
                this._name = model.localization.getLocalization('inventory.furni.item.floor.name');
                this._description = model.localization.getLocalization('inventory.furni.item.floor.desc');
                break;
            case FurnitureCategory.LANDSCAPE:
                this._name = model.localization.getLocalization('inventory.furni.item.landscape.name');
                this._description = model.localization.getLocalization('inventory.furni.item.landscape.desc');
                break;
        }
    }

    private _window: IWindowContainer | null = null;

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::get window()
    get window(): IWindowContainer | null 
    {
        if(!this._windowInitialized) 
        {
            this.initWindow();
        }

        return this._window;
    }

    private _alignment: string;

    get alignment(): string 
    {
        return this._alignment;
    }

    private _showRecyclable: boolean;

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::set showRecyclable()
    set showRecyclable(value: boolean) 
    {
        if(this._showRecyclable !== value) 
        {
            this._showRecyclable = value;
            this.updateRecycleStatusVisual();
        }
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::get isImageInited()
    get isImageInited(): boolean 
    {
        return this._windowInitialized && this._isImageInitAttempted;
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::get isImageFinished()
    get isImageFinished(): boolean 
    {
        return this._iconCallbackId === -1;
    }

    private _type: number;

    get type(): number 
    {
        return this._type;
    }

    private _category: number;

    get category(): number 
    {
        return this._category;
    }

    private _stuffData: IStuffData | null;

    get stuffData(): IStuffData | null 
    {
        return this._stuffData;
    }

    private _extra: number;

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::createWindow()
    // TS deviation: uses the generic buildWidgetLayout() cache-per-call mechanism
    // instead of AS3's own template+clone cache (FurniModel.createItemWindow()) —

    get extra(): number 
    {
        return this._extra;
    }

    private _isLocked: boolean = false;

    get isLocked(): boolean 
    {
        return this._isLocked;
    }

    set isLocked(value: boolean) 
    {
        this._isLocked = value;
    }

    private _isSelected: boolean = false;

    get isSelected(): boolean 
    {
        return this._isSelected;
    }

    set isSelected(value: boolean) 
    {
        if(this._isSelected !== value) 
        {
            this._isSelected = value;
            this.updateSelectionVisual();
        }
    }

    private _hasUnseenItems: boolean = false;

    get hasUnseenItems(): boolean 
    {
        return this._hasUnseenItems;
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::isNft()

    set hasUnseenItems(value: boolean) 
    {
        if(this._hasUnseenItems !== value) 
        {
            this._hasUnseenItems = value;
            this.updateBackgroundVisual();
        }
    }

    private _name: string = '';

    get name(): string 
    {
        return this._name;
    }

    set name(value: string) 
    {
        this._name = value;
    }

    private _description: string = '';

    get description(): string 
    {
        return this._description;
    }

    set description(value: string) 
    {
        this._description = value;
    }

    private _selectedItemIndex: number = -1;

    get selectedItemIndex(): number 
    {
        if(this._selectedItemIndex >= this._items.size) 
        {
            this._selectedItemIndex = Math.max(0, this._items.size - 1);
        }

        return this._selectedItemIndex;
    }

    set selectedItemIndex(value: number) 
    {
        if(value >= this._items.size) 
        {
            value = 0;
        }

        this._selectedItemIndex = value;
    }

    get isWallItem(): boolean 
    {
        const item = this.getAt(0);

        return item?.isWallItem ?? false;
    }

    get flatId(): number 
    {
        const item = this.getAt(0);

        return item?.flatId ?? -1;
    }

    get isGroupable(): boolean 
    {
        const item = this.getAt(0);

        return item?.groupable ?? true;
    }

    get isRented(): boolean 
    {
        const item = this.getAt(0);

        return item?.isRented ?? false;
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::initImage()
    initImage(setLoadingImage: boolean = true): boolean 
    {
        if(this._iconImage !== null) return false;

        if(this._isImageInitAttempted) return false;

        let result: ImageResult;

        if(this.isWallItem) 
        {
            result = this._model.roomEngine.getWallItemIcon(this._type, this, this._stuffData?.getLegacyString() ?? null);
        }
        else 
        {
            result = this._model.roomEngine.getFurnitureIcon(this._type, this, String(this._extra), this._stuffData);
        }

        if(result.id > 0) 
        {
            if(setLoadingImage) 
            {
                this.setLoadingImage(result.data);
            }

            this._iconCallbackId = result.id;
        }
        else 
        {
            this.setFinalImage(result.data);
            this._iconCallbackId = -1;
        }

        this._isImageInitAttempted = true;

        return result.id > 0;
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void 
    {
        if(!this._window) return;

        if(this._iconCallbackId !== id) return;

        this._iconImage = data;
        this._iconCallbackId = -1;
        this.updateItemImageVisual();
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::imageFailed()
    imageFailed(_id: number): void 
    {
        // Intentional no-op, matches AS3.
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::removeIntervalProcedure()
    removeIntervalProcedure(): void 
    {
        if(this._window) 
        {
            this._window.procedure = null;
        }
    }

    // TODO(AS3): needs HabboInventory.getFurnitureData() (not wired yet).
    isNft(): boolean 
    {
        return false;
    }

    /**
     * Add an item to the group
     */
    push(item: FurnitureItem, isUnseen: boolean = false): void 
    {
        const existing = this._items.get(item.id);

        if(!existing) 
        {
            this._items.set(item.id, item);
        }
        else 
        {
            existing.locked = false;
        }

        this.updateItemCountVisual();
        this.updateSelectionVisual();
        this.updateRentStateVisual();

        if(!this._name) 
        {
            this._name = this.getFurniItemName();
        }

        if(!this._description) 
        {
            this._description = this.getFurniItemDesc();
        }

        if(isUnseen !== this._hasUnseenItems) 
        {
            this._hasUnseenItems = isUnseen;
            this.updateBackgroundVisual();
        }
    }

    /**
     * Remove and return the last item
     */
    pop(): FurnitureItem | null 
    {
        if(this._items.size === 0) 
        {
            return null;
        }

        const items = Array.from(this._items.values());
        const item = items[items.length - 1];

        this._items.delete(item.id);
        this.updateAllThumbDataVisuals();

        return item;
    }

    /**
     * Get the last item without removing it
     */
    peek(): FurnitureItem | null 
    {
        if(this._items.size === 0) 
        {
            return null;
        }

        const items = Array.from(this._items.values());

        return items[items.length - 1];
    }

    /**
     * Get item at index
     */
    getAt(index: number): FurnitureItem | null 
    {
        const items = Array.from(this._items.values());

        return items[index] ?? null;
    }

    /**
     * Get item by ID
     */
    getItem(itemId: number): FurnitureItem | null 
    {
        return this._items.get(itemId) ?? null;
    }

    /**
     * Remove item by ID
     */
    remove(itemId: number): FurnitureItem | null 
    {
        const item = this._items.get(itemId);

        if(item) 
        {
            this._items.delete(itemId);
            this.updateAllThumbDataVisuals();
        }

        return item ?? null;
    }

    /**
     * Replace item
     */
    replaceItem(itemId: number, item: FurnitureItem): void 
    {
        this._items.set(itemId, item);
        this.updateAllThumbDataVisuals();
    }

    /**
     * Get total item count
     * For POST_IT items, returns sum of quantities
     */
    getTotalCount(): number 
    {
        if(this._category === FurnitureCategory.POST_IT) 
        {
            let count = 0;

            for(const item of this._items.values()) 
            {
                const quantity = parseInt(item.stuffData?.getLegacyString() ?? '0', 10);

                count += quantity || 0;
            }

            return count;
        }

        return this._items.size;
    }

    /**
     * Get count of unlocked items
     */
    getUnlockedCount(): number 
    {
        if(this._category === FurnitureCategory.POST_IT) 
        {
            return this.getTotalCount();
        }

        let count = 0;

        for(const item of this._items.values()) 
        {
            if(!item.locked) 
            {
                count++;
            }
        }

        return count;
    }

    /**
     * Get count of tradeable items (unlocked and tradeable)
     */
    getTradeableCount(): number 
    {
        let count = 0;

        for(const item of this._items.values()) 
        {
            if(!item.locked && item.tradeable) 
            {
                count++;
            }
        }

        return count;
    }

    /**
     * Get count of recyclable items (unlocked and recyclable)
     */
    getRecyclableCount(): number 
    {
        let count = 0;

        for(const item of this._items.values()) 
        {
            if(!item.locked && item.recyclable) 
            {
                count++;
            }
        }

        return count;
    }

    /**
     * Lock an item by ID
     */
    addLockTo(itemId: number): boolean 
    {
        const item = this._items.get(itemId);

        if(item) 
        {
            item.locked = true;
            this.updateItemCountVisual();
            return true;
        }

        return false;
    }

    /**
     * Unlock an item by ID
     */
    removeLockFrom(itemId: number): boolean 
    {
        const item = this._items.get(itemId);

        if(item) 
        {
            item.locked = false;
            this.updateItemCountVisual();
            this.updateRecycleStatusVisual();
            return true;
        }

        return false;
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::getFurniItemName()
    // TODO(AS3): skips the TRAX_SONG (category 8) async song-title lookup —

    /**
     * Unlock all items
     */
    removeAllLocks(): void 
    {
        let changed = false;

        for(const item of this._items.values()) 
        {
            if(item.locked) 
            {
                item.locked = false;
                changed = true;
            }
        }

        if(changed) 
        {
            this.updateItemCountVisual();
        }
    }

    /**
     * Update locks based on reference IDs (items in trade)
     */
    updateLocks(lockedRefIds: number[]): void 
    {
        for(const item of this._items.values()) 
        {
            const shouldBeLocked = lockedRefIds.includes(item.ref);

            item.locked = shouldBeLocked;
        }
    }

    /**
     * Get one item available for trade
     */
    getOneForTrade(): FurnitureItem | null 
    {
        // Try selected item first
        if(this._selectedItemIndex >= 0) 
        {
            const selected = this.getAt(this._selectedItemIndex);

            if(selected && !selected.locked && selected.tradeable) 
            {
                return selected;
            }
        }

        // Find any tradeable item
        for(const item of this._items.values()) 
        {
            if(!item.locked && item.tradeable) 
            {
                return item;
            }
        }

        return null;
    }

    /**
     * Get multiple items for trade
     */
    getItemsForTrade(count: number): IFurnitureItem[] 
    {
        const result: IFurnitureItem[] = [];
        const tradeItem = this.getOneForTrade();

        if(!tradeItem) 
        {
            return result;
        }

        for(const item of this._items.values()) 
        {
            if(result.length >= count) 
            {
                break;
            }

            if(!item.locked && item.tradeable && item.type === tradeItem.type) 
            {
                result.push(item);
            }
        }

        return result;
    }

    /**
     * Get one item for recycling (locks it)
     */
    getOneForRecycle(): FurnitureItem | null 
    {
        for(const item of this._items.values()) 
        {
            if(!item.locked && item.recyclable) 
            {
                this.addLockTo(item.id);
                return item;
            }
        }

        return null;
    }

    /**
     * Get one item for selling on marketplace
     */
    getOneForSelling(): FurnitureItem | null 
    {
        for(const item of this._items.values()) 
        {
            if(!item.locked && item.sellable) 
            {
                return item;
            }
        }

        return null;
    }

    /**
     * Get all furniture IDs in this group
     */
    getFurniIds(): number[] 
    {
        return Array.from(this._items.keys());
    }

    /**
     * Get all non-rented furniture IDs
     */
    getNonRentedFurnitureIds(): number[] 
    {
        const ids: number[] = [];

        for(const item of this._items.values()) 
        {
            if(!item.isRented) 
            {
                ids.push(item.id);
            }
        }

        return ids;
    }

    /**
     * Minimum items to show counter in UI
     */
    getMinimumItemsToShowCounter(): number 
    {
        return 2;
    }

    /**
     * Dispose the group
     */
    dispose(): void 
    {
        this._items.clear();
        this._stuffData = null;

        if(this._window) 
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // both build the same layout per new thumbnail; no functional difference.
    protected createWindow(): void 
    {
        this._window = this._model.windowManager.buildWidgetLayout('inventory_thumb_xml') as IWindowContainer | null;
    }

    private setFinalImage(data: ImageBitmap | null): void 
    {
        this._iconImage = data;
        this._isImageInitAttempted = true;
        this._iconCallbackId = -1;
        this.updateItemImageVisual();
    }

    private setLoadingImage(data: ImageBitmap | null): void 
    {
        this._iconImage = data;
        this._isImageInitAttempted = true;
        this.updateItemImageVisual();
    }

    private initWindow(): void 
    {
        this.createWindow();

        if(this._presetIcon !== null) 
        {
            this.setFinalImage(this._presetIcon);
        }
        else if(!this._isNoAutoRequestImage) 
        {
            this.initImage();
        }

        if(this._window) 
        {
            this._window.procedure = this.itemEventProc;

            let name = `${this._model.roomEngine.getFurnitureType(this._type) ?? ''}.${this._category}`;

            if(this._stuffData && this._stuffData.getLegacyString() !== '') 
            {
                name += `.s${this._stuffData.getLegacyString()}`;
            }

            if(!isNaN(this._extra)) 
            {
                name += `.e${this._extra}`;
            }

            this._window.name = name;
        }

        this.updateBackgroundVisual();
        this.updateItemCountVisual();
        this.updateItemImageVisual();
        this.updateRecycleStatusVisual();
        this.updateSelectionVisual();
        this.updateRentStateVisual();

        this._windowInitialized = true;
    }

    private updateAllThumbDataVisuals(): void 
    {
        if(!this._window) return;

        this.updateItemImageVisual();
        this.updateBackgroundVisual();
        this.updateItemCountVisual();
        this.updateRecycleStatusVisual();
        this.updateSelectionVisual();
        this.updateRentStateVisual();
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::updateRentStateVisual()
    private updateRentStateVisual(): void 
    {
        if(!this._window) return;

        const item = this.getAt(0);
        const rentState = this._window.findChildByName('rent_state') as IStaticBitmapWrapperWindow | null;

        if(!rentState) return;

        if(!item || !this.isRented) 
        {
            rentState.visible = false;

            return;
        }

        rentState.visible = true;

        const warningDuration = this._model.controller.getInteger('purchase.rent.warning_duration_seconds', 172800);

        rentState.assetUri = !item.hasRentPeriodStarted
            ? 'inventory_thumb_rent_not_started'
            : (item.secondsToExpiration < warningDuration ? 'inventory_thumb_rent_ending' : 'inventory_thumb_rent_started');
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::updateItemCountVisual()
    private updateItemCountVisual(): void 
    {
        if(!this._window) return;

        const count = this.getUnlockedCount();
        const showCounter = count >= this.getMinimumItemsToShowCounter();
        const numberContainer = this._window.findChildByName('number_container');

        if(numberContainer) 
        {
            numberContainer.visible = showCounter;
        }

        if(showCounter) 
        {
            const numberText = this._window.findChildByName('number') as ITextWindow | null;

            if(numberText) 
            {
                numberText.text = String(count);
            }
        }

        const bitmap = this._window.findChildByName('bitmap') as IBitmapWrapperWindow | null;

        if(bitmap) 
        {
            bitmap.alpha = count <= 0 ? 0.2 : 1;
        }
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::updateBackgroundVisual()
    private updateBackgroundVisual(): void 
    {
        if(!this._window) return;

        if(!this._bgColorWindow) 
        {
            this._bgColorWindow = this._window.findChildByTag('BG_COLOR');
        }

        if(this._bgColorWindow) 
        {
            this._bgColorWindow.color = this._hasUnseenItems ? THUMB_COLOR_UNSEEN : THUMB_COLOR_NORMAL;
        }
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::updateSelectionVisual()
    private updateSelectionVisual(): void 
    {
        if(!this._window) return;

        const outline = this._window.findChildByName('outline');

        if(outline) 
        {
            outline.visible = this._isSelected;
        }
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::updateRecycleStatusVisual()
    private updateRecycleStatusVisual(): void 
    {
        if(!this._window) return;

        const container = this._window.findChildByName('recyclable_container');

        if(container) 
        {
            container.visible = this._showRecyclable && this.getRecyclableCount() > 0;
        }
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::updateItemImageVisual()
    private updateItemImageVisual(): void 
    {
        if(!this._window) return;

        if(this._stuffData && this._stuffData.uniqueSerialNumber > 0) 
        {
            const container = this._window.findChildByName('unique_item_overlay_container') as IWidgetWindow | null;

            if(container) 
            {
                const widget = container.widget as ILimitedItemGridOverlayWidget | null;

                if(widget) 
                {
                    widget.serialNumber = this._stuffData.uniqueSerialNumber;
                    widget.animated = true;
                }
            }

            const background = this._window.findChildByName('unique_item_background_bitmap');

            if(background) 
            {
                background.visible = true;
            }
        }
        else if(this._stuffData && this._stuffData.rarityLevel >= 0) 
        {
            const container = this._window.findChildByName('rarity_item_overlay_container') as IWidgetWindow | null;

            if(container) 
            {
                const widget = container.widget as IRarityItemGridOverlayWidget | null;

                if(widget) 
                {
                    widget.rarityLevel = this._stuffData.rarityLevel;
                }
            }
        }

        const bitmap = this._window.findChildByName('bitmap') as IBitmapWrapperWindow | null;

        if(bitmap) 
        {
            bitmap.bitmap = this._iconImage;
        }
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::itemEventProc()
    private itemEventProc = (event: WindowEvent, _window: IWindow): void =>
    {
        switch(event.type)
        {
            case WindowMouseEvent.UP:
                this._wasDragCandidate = false;
                this._model.cancelFurniInMover();
                break;
            case WindowMouseEvent.DOWN:
                this._model.removeSelections();
                this.isSelected = true;
                this._wasDragCandidate = true;
                this._model.updateActionView();
                this._model.selectItem(this);
                break;
            case WindowMouseEvent.OUT:
                if(!this._wasDragCandidate || this._model.isTradingOpen) return;

                if(this._model.requestSelectedFurniPlacement()) 
                {
                    this._wasDragCandidate = false;
                }

                break;
            case WindowMouseEvent.CLICK:
                this._wasDragCandidate = false;
                break;
            case WindowMouseEvent.DOUBLE_CLICK:
                this._model.requestCurrentActionOnSelection();
                this._wasDragCandidate = false;
                break;
        }
    };

    // music discs fall back to the default roomItem/wallItem name for now.
    private getFurniItemName(): string 
    {
        const item = this.peek();

        if(item === null) return '';

        if(this._category === FurnitureCategory.POSTER) 
        {
            return this._model.localization.getLocalization(`poster_${item.stuffData?.getLegacyString() ?? ''}_name`);
        }

        const key = this.isWallItem ? `wallItem.name.${item.type}` : `roomItem.name.${item.type}`;

        return this._model.localization.getLocalization(key);
    }

    // AS3: sources/win63_version/habbo/inventory/items/GroupItem.as::getFurniItemDesc()
    private getFurniItemDesc(): string 
    {
        const item = this.peek();

        if(item === null) return '';

        if(this._category === FurnitureCategory.POSTER) 
        {
            return this._model.localization.getLocalization(`poster_${item.stuffData?.getLegacyString() ?? ''}_desc`);
        }

        const key = this.isWallItem ? `wallItem.desc.${item.type}` : `roomItem.desc.${item.type}`;

        return this._model.localization.getLocalization(key);
    }
}
