import {OrderedMap} from '@core/utils/OrderedMap';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IScrollableGridWindow} from '@core/window/components/IScrollableGridWindow';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {ProductImageWidget} from '@habbo/window/widgets/ProductImageWidget';
import type {
    ChestStorage
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/ChestStorage';
import type {
    IChestStorageItem
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/IChestStorageItem';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import {Util} from '../../../../Util';
import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import type {FurniChestSubController} from '../FurniChestSubController';
import {ChestItemTypeRenderableWrapper} from './ChestItemTypeRenderableWrapper';
import {FurniChestItemView} from './FurniChestItemView';
import type {IChestItemView} from './IChestItemView';

/**
 * The furniture chest's grid, preview panel and withdraw controls.
 *
 * **Identical items are grouped into one cell.** Two indexes make that work: `_viewsByTypeKey` maps
 * a type key to the cells holding it, and `_viewByStorage` maps each individual item back to the
 * cell showing it — the first to find a cell to join, the second to find the cell to leave.
 *
 * **The search bar appears and disappears with the item count**, and moving it *resizes the grid by
 * hand* — 28px off the top and off the height when it appears, back when it goes. That is why
 * `updateSearchbarVisibility()` guards on the bar's current visibility: running it twice in the same
 * direction would shift the grid twice.
 *
 * Cells are pooled across every chest the player opens, capped at {@link ITEM_POOL_MAX_SIZE}.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/subcontrollers/views/FurniChestView.as
 */
export class FurniChestView
{
    /**
	 * How far the grid moves when the search bar appears, and the item count that summons it. AS3
	 * inlines both numbers at their use sites as well as declaring them.
	 */
    // AS3: FurniChestView.as::GRID_OFFSET_SEARCH
    private static readonly GRID_OFFSET_SEARCH: number = 28;

    // AS3: FurniChestView.as::_SafeStr_10655 (name derived: the search-bar threshold)
    private static readonly SEARCH_VISIBLE_THRESHOLD: number = 31;

    // AS3: FurniChestView.as::ITEM_POOL_MAX_SIZE
    private static readonly ITEM_POOL_MAX_SIZE: number = 1000;

    // AS3: FurniChestView.as::ITEM_POOL
    private static readonly ITEM_POOL: FurniChestItemView[] = [];

    // AS3: FurniChestView.as::_disposed
    private _disposed: boolean = false;

    // AS3: FurniChestView.as::_SafeStr_4593 (name derived: the owning sub-controller)
    private _subController: FurniChestSubController | null;

    // AS3: FurniChestView.as::_container
    private _container: IWindowContainer | null;

    // AS3: FurniChestView.as::_SafeStr_6180 (name derived: the cell template)
    private _itemTemplate: IWindow | null = null;

    // AS3: FurniChestView.as::_SafeStr_5562 (name derived: type key -> cells)
    private _viewsByTypeKey: OrderedMap<string, FurniChestItemView[]> = new OrderedMap<string, FurniChestItemView[]>();

    // AS3: FurniChestView.as::_SafeStr_5729 (name derived: item -> the cell showing it)
    private _viewByStorage: Map<ChestStorage, FurniChestItemView> = new Map<ChestStorage, FurniChestItemView>();

    // AS3: FurniChestView.as::_SafeStr_4690 (name derived: the selected cell)
    private _selected: FurniChestItemView | null = null;

    // AS3: FurniChestView.as::_SafeStr_4805 (name derived: every cell, in order)
    private _views: FurniChestItemView[] = [];

    // AS3: FurniChestView.as::_SafeStr_8390 (name derived: suppress the search change handler)
    private _suppressSearchEvents: boolean = false;

    // AS3: FurniChestView.as::_SafeStr_6170 (name derived: the committed search text)
    private _searchText: string = '';

    // AS3: FurniChestView.as::FurniChestView()
    constructor(subController: FurniChestSubController)
    {
        this._subController = subController;
        this._container = (this.roomEvents?.getXmlWindow('furni_chest_contents') as IWindowContainer | null) ?? null;

        // The cell template is *removed* from the grid and kept to clone, the same trick the trade
        // rule editor uses for its chips.
        this._itemTemplate = this.itemGrid?.removeGridItemAt(0) ?? null;

        const input = this.withdrawInput;

        if(input) input.restrict = '0-9';

        this.withdrawButton?.addEventListener('WME_CLICK', this.onWithdrawClick);
        this.viewLogsButton?.addEventListener('WME_CLICK', this.onViewLogsClick);
        this.searchInput?.addEventListener('WE_CHANGE', this.onSearchChanged);
        this.searchInput?.addEventListener('WKE_KEY_DOWN', this.onSearchMaybeEnter);
        this.searchClearButton?.addEventListener('WME_CLICK', this.onClearSearchClicked);
    }

    /**
	 * Find an existing cell this item may join, or null if it needs one of its own.
	 *
	 * Three rules, in AS3's order: a **limited-edition** item never groups (its serial is unique), a
	 * **rare** item groups only with the same rarity level, and anything else joins the first cell of
	 * its type. Static and taking the interface because the transaction views group the same way.
	 */
    // AS3: FurniChestView.as::findReusableGroupedView()
    static findReusableGroupedView(
        item: IChestStorageItem,
        viewsByTypeKey: OrderedMap<string, IChestItemView[]>
    ): IChestItemView | null
    {
        const candidates = viewsByTypeKey.getValue(FurniChestView.itemTypeKey(item.type));

        if(candidates == null || candidates.length === 0) return null;

        const stuffData = item.stuffData;

        if((stuffData?.uniqueSerialNumber ?? 0) > 0) return null;

        if(item.specialType === 19)
        {
            const rarity = stuffData?.rarityLevel ?? 0;

            for(const candidate of candidates)
            {
                const sample = candidate.chestBasedItemSample;

                if(sample != null && rarity === (sample.stuffData?.rarityLevel ?? 0)) return candidate;
            }

            return null;
        }

        return candidates[0];
    }

    /**
	 * Placement, type and poster face — the three things that make two items the same *kind*.
	 */
    // AS3: FurniChestView.as::itemTypeKey()
    static itemTypeKey(type: ChestItemType): string
    {
        return `${type.isWallItem ? '1' : '0'}-${type.typeId}-${type.legacyPosterId}`;
    }

    /**
	 * A poster is named by its face rather than by the furniture — `specialType == 6` with a legacy
	 * poster id is the only case that does not go through the furniture data.
	 *
	 * An unresolvable item shows the literal `(missing item name)`; AS3 does not localize it.
	 */
    // AS3: FurniChestView.as::getChestBasedItemName()
    static getChestBasedItemName(
        item: IChestStorageItem,
        localization: IHabboLocalizationManager | null,
        sessionDataManager: ISessionDataManager | null
    ): string
    {
        const type = item.type;

        // AS3 declares this `= null` (decompiler hoisting); every path that reaches the use assigns
        // it first, so the initialiser is dropped rather than left as a value nothing reads.
        let furniData: IFurnitureData | null;

        if(type.isWallItem)
        {
            if(item.specialType === 6 && type.legacyPosterId !== '' && type.legacyPosterId !== null)
            {
                return localization?.getLocalization(`poster_${type.legacyPosterId}_name`) ?? '';
            }

            furniData = sessionDataManager?.getWallItemData(type.typeId) ?? null;
        }
        else
        {
            furniData = sessionDataManager?.getFloorItemData(type.typeId) ?? null;
        }

        if(furniData == null) return '(missing item name)';

        return furniData.localizedName;
    }

    // AS3: FurniChestView.as::claimView()
    private static claimView(
        template: IWindow,
        view: FurniChestView,
        storages: ChestStorage[]
    ): FurniChestItemView
    {
        const cell = FurniChestView.ITEM_POOL.length > 0
            ? FurniChestView.ITEM_POOL.pop()!
            : new FurniChestItemView(template);

        cell.initialize(view, storages);

        return cell;
    }

    // AS3: FurniChestView.as::recycleView()
    private static recycleView(cell: FurniChestItemView): void
    {
        if(FurniChestView.ITEM_POOL.length < FurniChestView.ITEM_POOL_MAX_SIZE)
        {
            cell.recycle();
            FurniChestView.ITEM_POOL.push(cell);
        }
        else
        {
            cell.dispose();
        }
    }

    // AS3: FurniChestView.as::onClearSearchClicked()
    private onClearSearchClicked = (): void =>
    {
        this.clearSearch();
        this.updateGrid();
    };

    /**
	 * Enter commits the search, Escape clears it. The Escape branch is subtle: with nothing already
	 * committed it clears the field *without* rebuilding the grid, because there is nothing to undo.
	 */
    // AS3: FurniChestView.as::onSearchMaybeEnter()
    private onSearchMaybeEnter = (event: {keyCode?: number}): void =>
    {
        const input = this.searchInput;

        if(!input?.visible) return;

        if(event.keyCode === 13)
        {
            if(this._searchText === input.text) return;

            this._searchText = input.text;
            this.updateGrid();
        }
        else if(event.keyCode === 27)
        {
            if(this._searchText.length === 0)
            {
                this.clearSearch();

                return;
            }

            this.clearSearch();
            this.updateGrid();
        }
    };

    /**
	 * Typing only moves the placeholder and the clear button — the grid is not filtered until the
	 * search is committed with Enter.
	 */
    // AS3: FurniChestView.as::onSearchChanged()
    private onSearchChanged = (): void =>
    {
        const length = this.searchInput?.text.length ?? 0;
        const placeholder = this.searchPlaceholder;
        const clearButton = this.searchClearButton;

        if(placeholder) placeholder.visible = length === 0;
        if(clearButton) clearButton.visible = length > 0;
    };

    // AS3: FurniChestView.as::onViewLogsClick()
    private onViewLogsClick = (): void =>
    {
        const sample = this._selected?.peek() ?? null;

        if(sample !== null) this._subController?.viewLogsWithType(sample.type);
    };

    // AS3: FurniChestView.as::onWithdrawClick()
    private onWithdrawClick = (): void =>
    {
        const amount = parseInt(this.withdrawInput?.text ?? '', 10);

        if(isNaN(amount)) return;

        const sample = this._selected?.peek() ?? null;

        if(sample !== null) this._subController?.withdrawItemsWithType(sample.type, amount);
    };

    // AS3: FurniChestView.as::get itemTemplate()
    get itemTemplate(): IWindow | null
    {
        return this._itemTemplate;
    }

    // AS3: FurniChestView.as::get roomEvents()
    private get roomEvents(): HabboUserDefinedRoomEvents | null
    {
        return this._subController?.roomEvents ?? null;
    }

    // AS3: FurniChestView.as::get container()
    get container(): IWindowContainer | null
    {
        return this._container;
    }

    /**
	 * A delta. The grid is only rebuilt when something actually changed, and the order is preserved:
	 * survivors keep their positions and new cells go on the end.
	 *
	 * Removing the *selected* cell clears the selection first, so the preview panel never points at
	 * a recycled cell.
	 */
    // AS3: FurniChestView.as::itemsUpdated()
    itemsUpdated(removed: ChestStorage[], added: ChestStorage[]): void
    {
        const emptiedCells = new Set<FurniChestItemView>();
        const newCells: FurniChestItemView[] = [];
        let anyRemoved = false;

        for(const storage of removed)
        {
            const cell = this.removeStorage(storage);

            if(cell !== null)
            {
                emptiedCells.add(cell);
                anyRemoved = true;

                if(cell === this._selected) this.selectItemView(null);
            }
        }

        for(const storage of added)
        {
            const cell = this.addStorage(storage);

            if(cell !== null) newCells.push(cell);
        }

        if(anyRemoved || newCells.length > 0)
        {
            const survivors: FurniChestItemView[] = [];

            for(const cell of this._views)
            {
                if(!emptiedCells.has(cell)) survivors.push(cell);
            }

            for(const cell of newCells)
            {
                survivors.push(cell);
            }

            this._views = survivors;
            this.updateGrid();
            this.maybeSelectNewItemView();
        }

        this._subController?.wrapperView?.updateUI();
    }

    // AS3: FurniChestView.as::itemsInitialize()
    itemsInitialize(storages: ChestStorage[]): void
    {
        this.clearSearch();
        this.clear();

        const cells: FurniChestItemView[] = [];

        for(const storage of storages)
        {
            const cell = this.addStorage(storage);

            if(cell !== null) cells.push(cell);
        }

        this._views = cells;
        this.updateGrid();
        this.maybeSelectNewItemView();
    }

    /**
	 * Returns the **new** cell, or null when the item joined an existing one — that is what lets the
	 * callers tell "a cell appeared" from "a cell grew".
	 */
    // AS3: FurniChestView.as::addStorage()
    private addStorage(storage: ChestStorage): FurniChestItemView | null
    {
        const existing = FurniChestView.findReusableGroupedView(
            storage,
            this._viewsByTypeKey as unknown as OrderedMap<string, IChestItemView[]>
        ) as FurniChestItemView | null;

        if(existing !== null)
        {
            existing.add(storage);
            this._viewByStorage.set(storage, existing);

            return null;
        }

        if(this._itemTemplate === null) return null;

        const cell = FurniChestView.claimView(this._itemTemplate, this, [storage]);

        this._viewByStorage.set(storage, cell);

        const key = FurniChestView.itemTypeKey(storage.type);
        let cells = this._viewsByTypeKey.getValue(key);

        if(cells == null)
        {
            cells = [];
            this._viewsByTypeKey.add(key, cells);
        }

        cells.push(cell);

        return cell;
    }

    /**
	 * Mirror of {@link addStorage}: returns the cell only when it **emptied**, so the caller knows to
	 * drop it from the grid. A cell that merely shrank returns null.
	 */
    // AS3: FurniChestView.as::removeStorage()
    private removeStorage(storage: ChestStorage): FurniChestItemView | null
    {
        const cell = this._viewByStorage.get(storage) ?? null;

        if(cell == null) return null;

        cell.remove(storage);
        this._viewByStorage.delete(storage);

        if(cell.numItems !== 0) return null;

        const key = FurniChestView.itemTypeKey(storage.type);
        const cells = this._viewsByTypeKey.getValue(key);

        if(cells != null)
        {
            const index = cells.indexOf(cell);

            if(index !== -1) cells.splice(index, 1);

            if(cells.length === 0) this._viewsByTypeKey.remove(key);
        }

        FurniChestView.recycleView(cell);

        return cell;
    }

    // AS3: FurniChestView.as::clear()
    clear(): void
    {
        this.itemGrid?.removeGridItems();

        for(const cell of this._views)
        {
            FurniChestView.recycleView(cell);
        }

        this._views = [];
        this._viewsByTypeKey = new OrderedMap<string, FurniChestItemView[]>();
        this._viewByStorage = new Map<ChestStorage, FurniChestItemView>();

        this.selectItemView(null);
        this.updatePreviewUI();
    }

    /**
	 * Rebuilds the grid from `_views`, applying the committed search.
	 *
	 * Every space-separated term must match the item's name — AND, not OR — and the match is on the
	 * lowercased name only, not the code.
	 */
    // AS3: FurniChestView.as::updateGrid()
    updateGrid(): void
    {
        this.updateSearchbarVisibility();

        const grid = this.itemGrid;

        grid?.removeGridItems();

        const terms = this._searchText.length > 0 ? this._searchText.toLowerCase().split(' ') : null;

        for(const cell of this._views)
        {
            if(terms !== null)
            {
                const sample = cell.peek();
                const name = (sample === null ? '' : this.getChestStorageName(sample)).toLowerCase();
                let matches = true;

                for(const term of terms)
                {
                    if(name.indexOf(term) === -1)
                    {
                        matches = false;
                        break;
                    }
                }

                if(!matches) continue;
            }

            if(cell.window) grid?.addGridItem(cell.window);
        }

        const noItems = this.noItemsText;

        if(noItems) noItems.visible = (grid?.numGridItems ?? 0) === 0;
    }

    /**
	 * Appearing and disappearing both move the grid, so each branch is guarded on the bar's current
	 * state — running the same branch twice would shift the grid 56px.
	 */
    // AS3: FurniChestView.as::updateSearchbarVisibility()
    private updateSearchbarVisibility(): void
    {
        const border = this.searchBorder;
        const grid = this.itemGrid;

        if(!border || !grid) return;

        const gridWindow = grid as unknown as IWindow;

        if(!border.visible && this._views.length >= FurniChestView.SEARCH_VISIBLE_THRESHOLD)
        {
            border.visible = true;
            this.clearSearch();
            gridWindow.y += FurniChestView.GRID_OFFSET_SEARCH;
            gridWindow.height -= FurniChestView.GRID_OFFSET_SEARCH;
        }
        else if(border.visible && this._views.length < FurniChestView.SEARCH_VISIBLE_THRESHOLD)
        {
            border.visible = false;
            this.clearSearch();
            gridWindow.y -= FurniChestView.GRID_OFFSET_SEARCH;
            gridWindow.height += FurniChestView.GRID_OFFSET_SEARCH;
        }
    }

    /**
	 * `_suppressSearchEvents` brackets the write so the field's own change handler does not fight
	 * the reset. It is set and cleared but never read in AS3 — the flag exists, the guard does not.
	 */
    // AS3: FurniChestView.as::clearSearch()
    private clearSearch(): void
    {
        this._suppressSearchEvents = true;

        const input = this.searchInput;
        const clearButton = this.searchClearButton;
        const placeholder = this.searchPlaceholder;

        if(input) input.text = '';
        if(clearButton) clearButton.visible = false;
        if(placeholder) placeholder.visible = true;

        this._searchText = '';
        this._suppressSearchEvents = false;
    }

    // AS3: FurniChestView.as::selectItemView()
    selectItemView(cell: FurniChestItemView | null): void
    {
        if(this._selected !== null)
        {
            this._selected.deactivate();
            this._selected = null;
        }

        if(cell !== null)
        {
            this._selected = cell;
            this._selected.activate();
        }

        this.updatePreviewUI();
    }

    /**
	 * Selects the first cell only when nothing is selected — an existing selection survives a
	 * refresh.
	 */
    // AS3: FurniChestView.as::maybeSelectNewItemView()
    maybeSelectNewItemView(): void
    {
        if(this._selected === null && this._views.length > 0)
        {
            this.selectItemView(this._views[0]);
        }
    }

    /**
	 * With nothing selected AS3 calls `disable()` on both buttons outright; with a selection it goes
	 * through `Util.disableSection()` against the permissions. The two paths are not symmetric and
	 * are transcribed as found.
	 */
    // AS3: FurniChestView.as::updatePreviewUI()
    updatePreviewUI(): void
    {
        const widget = this.previewWidget?.widget as ProductImageWidget | null;
        const sample = this._selected?.peek() ?? null;
        const name = this.previewFurniName;
        const placeholder = this.placeholderPreviewImage;
        const viewLogs = this.viewLogsButton;
        const withdraw = this.withdrawButton;

        if(sample === null)
        {
            if(name) name.text = '';

            widget?.clearPreviewer();
            viewLogs?.disable();
            withdraw?.disable();

            if(placeholder) placeholder.visible = true;
        }
        else
        {
            if(placeholder) placeholder.visible = false;

            if(viewLogs) Util.disableSection(viewLogs, this._subController?.canRead !== true);
            if(withdraw) Util.disableSection(withdraw, this._subController?.canWithdraw !== true);

            if(name) name.text = this.getChestStorageName(sample);

            if(widget) widget.productInfo = new ChestItemTypeRenderableWrapper(sample.type);
        }
    }

    // AS3: FurniChestView.as::getChestStorageName()
    getChestStorageName(storage: ChestStorage): string
    {
        return FurniChestView.getChestBasedItemName(
            storage,
            this._subController?.localization ?? null,
            this._subController?.parentController?.sessionDataManager ?? null
        );
    }

    // AS3: FurniChestView.as::updateUI()
    updateUI(): void
    {
        this.updatePreviewUI();
    }

    // AS3: FurniChestView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        (this._container as unknown as IWindow | null)?.dispose();
        this._container = null;
        this._itemTemplate?.dispose();
        this._itemTemplate = null;
        this._viewsByTypeKey = new OrderedMap<string, FurniChestItemView[]>();
        this._viewByStorage = new Map<ChestStorage, FurniChestItemView>();

        // Recycled rather than disposed: the pool outlives this view.
        for(const cell of this._views)
        {
            FurniChestView.recycleView(cell);
        }

        this._views = [];
        this._selected = null;
        this._subController = null;
        this._disposed = true;
    }

    // AS3: FurniChestView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: FurniChestView.as::get itemGrid()
    private get itemGrid(): IScrollableGridWindow | null
    {
        return (this._container?.findChildByName('grid_items') as IScrollableGridWindow | null) ?? null;
    }

    // AS3: FurniChestView.as::get searchBorder()
    private get searchBorder(): IWindow | null
    {
        return this._container?.findChildByName('search_border') ?? null;
    }

    // AS3: FurniChestView.as::get searchPlaceholder()
    private get searchPlaceholder(): ITextWindow | null
    {
        return (this._container?.findChildByName('search_placeholder') as ITextWindow | null) ?? null;
    }

    // AS3: FurniChestView.as::get searchInput()
    private get searchInput(): ITextFieldWindow | null
    {
        return (this._container?.findChildByName('search_input') as ITextFieldWindow | null) ?? null;
    }

    // AS3: FurniChestView.as::get searchClearButton()
    private get searchClearButton(): IWindow | null
    {
        return this._container?.findChildByName('clear_search_button') ?? null;
    }

    // AS3: FurniChestView.as::get noItemsText()
    private get noItemsText(): ITextWindow | null
    {
        return (this._container?.findChildByName('no_items_text') as ITextWindow | null) ?? null;
    }

    // AS3: FurniChestView.as::get previewFurniName()
    private get previewFurniName(): ITextWindow | null
    {
        return (this._container?.findChildByName('furni_name') as ITextWindow | null) ?? null;
    }

    // AS3: FurniChestView.as::get previewWidget()
    private get previewWidget(): IWidgetWindow | null
    {
        return (this._container?.findChildByName('preview_image') as IWidgetWindow | null) ?? null;
    }

    // AS3: FurniChestView.as::get placeholderPreviewImage()
    private get placeholderPreviewImage(): IWindow | null
    {
        return this._container?.findChildByName('placeholder_preview_image') ?? null;
    }

    // AS3: FurniChestView.as::get withdrawInput()
    private get withdrawInput(): ITextFieldWindow | null
    {
        return (this._container?.findChildByName('withdraw_input') as ITextFieldWindow | null) ?? null;
    }

    // AS3: FurniChestView.as::get withdrawButton()
    private get withdrawButton(): IWindow | null
    {
        return this._container?.findChildByName('withdraw_btn') ?? null;
    }

    // AS3: FurniChestView.as::get viewLogsButton()
    private get viewLogsButton(): IWindow | null
    {
        return this._container?.findChildByName('view_logs_by_furni_btn') ?? null;
    }
}
