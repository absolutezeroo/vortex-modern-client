import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {ProductImageWidget} from '@habbo/window/widgets/ProductImageWidget';
import type {CollectibleAsset} from '@habbo/communication/messages/parser/collectibles/CollectibleAsset';

import type {IInventoryView} from '../IInventoryView';
import type {CollectiblesModel} from './CollectiblesModel';
import {CollectibleGroupedItem} from './CollectibleGroupedItem';
import {CollectiblesGridView} from './CollectiblesGridView';

const STATE_NULL = 0;
const STATE_INITIALIZING = 1;
const STATE_EMPTY = 2;
const STATE_CONTENT = 3;

// AS3: .../CollectiblesView.as::IMAGE_UPDATE_DELAY_MS
const IMAGE_UPDATE_DELAY_MS = 30;

/**
 * The product-type ids the filter dropdown offers, in the dropdown's own order. Index 0 of the menu
 * is "Everything", so the dropdown selection is offset by one against this array.
 */
// AS3: .../CollectiblesView.as::FILTER_OPTIONS
const FILTER_OPTIONS: number[] = [1, 0, 11, 9, 4, 2, 10];

/**
 * The collectibles (NFT) inventory tab: a filtered grid of owned collectibles, plus a preview panel
 * that offers the selected one into an open trade.
 *
 * One image is rendered per 30 ms tick, not all at once — `initListImages()` breaks after the first
 * uninitialised cell it finds. With 200 cells to a page that is deliberate: each product icon is a
 * furniture/badge/pet render, and doing them in one pass stalls the frame.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/collectibles/CollectiblesView.as
 */
export class CollectiblesView implements IInventoryView, IAvatarImageListener
{
    // AS3: .../CollectiblesView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;
    // AS3: .../CollectiblesView.as::_SafeStr_4550 (the tab's window container)
    private _window: IWindowContainer | null = null;
    // AS3: .../CollectiblesView.as::_SafeStr_4570 (the owning model)
    private _model: CollectiblesModel | null;
    // AS3: .../CollectiblesView.as::_disposed
    private _disposed: boolean = false;
    // AS3: .../CollectiblesView.as::_SafeStr_4755 (initialised flag)
    private _isInitialized: boolean = false;
    // AS3: .../CollectiblesView.as::_SafeStr_5211 (the grid)
    private _grid: CollectiblesGridView | null = null;
    // AS3: .../CollectiblesView.as::_groupedItems (product code -> group)
    private _groupedItems: OrderedMap<string, CollectibleGroupedItem> = new OrderedMap<string, CollectibleGroupedItem>();
    // AS3: .../CollectiblesView.as::_SafeStr_6499 (the current STATE_*)
    private _state: number = STATE_NULL;
    // AS3: .../CollectiblesView.as::_SafeStr_5802 (the 30 ms image-update timer)
    private _imageTimer: ReturnType<typeof setInterval> | null = null;

    /**
     * AS3 starts the image timer in the constructor, before `init()` has built anything;
     * `initListImages()` copes because it null-checks the grid. The port keeps that order — a
     * `Timer` there is a `setInterval` here, cleared in `dispose()`.
     */
    // AS3: .../CollectiblesView.as::CollectiblesView()
    constructor(model: CollectiblesModel, windowManager: IHabboWindowManager | null)
    {
        this._model = model;
        this._windowManager = windowManager;
        this._imageTimer = setInterval(this.onImageUpdateTimerEvent, IMAGE_UPDATE_DELAY_MS);
    }

    // AS3: .../CollectiblesView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../CollectiblesView.as::get isVisible()
    get isVisible(): boolean
    {
        return this._window !== null && this._window.parent !== null && this._window.visible;
    }

    // AS3: .../CollectiblesView.as::getWindowContainer()
    getWindowContainer(): IWindowContainer | null
    {
        if(!this._isInitialized) this.init();

        if(this._window === null || this._window.disposed) return null;

        return this._window;
    }

    /**
     * Applies one server snapshot: `added` assets fold into their product-code group (creating it
     * when new), `removed` ones fold out, and a group that loses its last copy is disposed.
     */
    // AS3: .../CollectiblesView.as::initCollectibles()
    initCollectibles(added: CollectibleAsset[], removed: CollectibleAsset[]): void
    {
        if(this._model === null) return;

        for(const asset of added)
        {
            const key = CollectiblesView.groupKey(asset);
            const existing = this._groupedItems.getValue(key);

            if(existing !== null)
            {
                existing.addAssetId(asset.assetId);
            }
            else
            {
                this._groupedItems.add(key, new CollectibleGroupedItem(asset, [asset.assetId], this._model));
            }
        }

        for(const asset of removed)
        {
            const key = CollectiblesView.groupKey(asset);
            const group = this._groupedItems.getValue(key);

            if(group === null) continue;

            if(group.removeAssetId(asset.assetId) && group.amount === 0)
            {
                group.dispose();
                this._groupedItems.remove(key);
            }
        }

        this._grid?.setItems(this._groupedItems.getValues());
        this.updateState();
        this.updatePreview();
    }

    // AS3: .../CollectiblesView.as::maybeSelectFirst()
    private maybeSelectFirst(): void
    {
        if(this._model === null || this._grid === null) return;

        const pageItems = this._grid.currentPageItems;

        if(this._model.selected === null && pageItems.length > 0)
        {
            this._model.setSelected(pageItems[0]);
        }
    }

    // AS3: .../CollectiblesView.as::unlockAll()
    unlockAll(): void
    {
        for(const group of this._groupedItems.getValues()) group.unlockAll();
    }

    /**
     * The group holding this asset, or null. `requireAsset` is AS3's second parameter: with it, the
     * group only counts as a match when it still holds this exact, unlocked copy — which is what
     * `updateItemLocks()` deliberately switches OFF, because there it is re-locking copies that the
     * trade has already taken.
     */
    // AS3: .../CollectiblesView.as::findGroupedItem()
    findGroupedItem(asset: CollectibleAsset, requireAsset: boolean = true): CollectibleGroupedItem | null
    {
        const group = this._groupedItems.getValue(CollectiblesView.groupKey(asset));

        if(group === null) return null;

        if(!requireAsset || group.hasAsset(asset.assetId)) return group;

        return null;
    }

    // AS3: .../CollectiblesView.as::updateFilters()
    updateFilters(): void
    {
        if(!this._isInitialized) return;

        if(this._window === null || this._window.disposed) return;

        const selection = this.filterOptions?.selection ?? 0;
        const productTypeId = selection <= 0 ? -1 : FILTER_OPTIONS[selection - 1];

        this._grid?.setFilter(productTypeId, this.filterText?.text ?? '');
    }

    /**
     * The grouping key is the product code, not the item type id: two collectibles of the same
     * furni type but different products must not merge into one cell.
     */
    // AS3: .../CollectiblesView.as::groupKey()
    private static groupKey(asset: CollectibleAsset): string
    {
        return asset.productCode;
    }

    // AS3: .../CollectiblesView.as::updatePreview()
    updatePreview(): void
    {
        if(!this._isInitialized || this._model === null) return;

        this.maybeSelectFirst();

        if(this._window === null || this._window.disposed) return;

        const selected = this._model.selected;

        if(selected === null) return;

        const collectorHub = this._model.controller.catalog?.collectorHub ?? null;
        const name = collectorHub !== null ? collectorHub.getProductName(selected.renderableItem) : selected.name;
        // AS3 asks the collector hub for the localized product category, and the hub is ported. The
        // local fallback below stays because `populateFilterOptions()` needs the same switch
        // anyway — the dropdown is built before any hub call — so having it cost nothing.
        const type = collectorHub !== null
            ? collectorHub.getProductType(selected.renderableItem)
            : this.localizedProductType(selected.renderableItem.productTypeId);

        const imageWidget = this.nftImageWidget;

        if(imageWidget !== null) imageWidget.productInfo = selected.renderableItem;

        const nameText = this.nftNameText;
        const typeText = this.nftTypeText;

        if(nameText !== null) nameText.text = name;

        if(typeText !== null)
        {
            const label = this._model.controller.localization?.getLocalization('collectibles.item.type') ?? '';

            typeText.text = `${label}: ${type}`;
        }

        if(selected.unlockedAssetCount === 0)
        {
            this.offerButton?.disable();
        }
        else
        {
            this.offerButton?.enable();
        }
    }

    // AS3: .../CollectiblesView.as::init()
    private init(): void
    {
        if(this._model === null) return;

        this._window = this._model.controller.view.getView('collectibles');

        if(this._window === null) return;

        this._window.enableLookupCache();
        this._window.procedure = this.windowEventProc;
        this._window.visible = false;

        const grid = this._window.findChildByName('item_grid') as IItemGridWindow | null;
        const pages = this._window.findChildByName('item_grid_pages') as IItemListWindow | null;

        if(grid !== null) this._grid = new CollectiblesGridView(this, grid, pages);

        const filter = this.filterText;

        if(filter !== null) filter.text = '';

        this.populateFilterOptions();

        this._isInitialized = true;
        this.updateState();
    }

    // AS3: .../CollectiblesView.as::onImageUpdateTimerEvent()
    private onImageUpdateTimerEvent = (): void =>
    {
        this.initListImages();
    };

    /**
     * One cell per tick — the `break` is AS3's, and it is what keeps a 200-cell page from rendering
     * 200 product icons inside a single frame.
     */
    // AS3: .../CollectiblesView.as::initListImages()
    private initListImages(): void
    {
        if(this._grid === null) return;

        for(const item of this._grid.currentPageItems)
        {
            if(!item.isInitialized)
            {
                item.initializeImage();
                break;
            }
        }
    }

    // AS3: .../CollectiblesView.as::populateFilterOptions()
    private populateFilterOptions(): void
    {
        const options = this.filterOptions;

        if(options === null) return;

        const localization = this._model?.controller.localization ?? null;
        const captions: string[] = [
            localization?.getLocalization('inventory.filter.option.everything', 'Everything') ?? 'Everything',
        ];

        for(const productTypeId of FILTER_OPTIONS)
        {
            captions.push(this.localizedProductType(productTypeId));
        }

        options.populateWithStrings(captions);
        options.selection = 0;
    }

    /**
     * The `product.type.*` label for one product type id.
     *
     * AS3 spells this switch out twice — once in `populateFilterOptions()` here, once in
     * `CollectiblesController.as::getProductType()`. The port factors it out because the second
     * copy is behind the unported collector hub and the preview panel needs it anyway.
     */
    // AS3: .../CollectiblesView.as::populateFilterOptions()
    private localizedProductType(productTypeId: number): string
    {
        const localization = this._model?.controller.localization ?? null;

        switch(productTypeId)
        {
            case 0:
                return localization?.getLocalization('product.type.wall') ?? '';
            case 1:
                return localization?.getLocalization('product.type.room') ?? '';
            case 2:
                return localization?.getLocalization('product.type.effect') ?? '';
            case 4:
                return localization?.getLocalization('product.type.badge') ?? '';
            case 9:
                return localization?.getLocalization('product.type.chatstyle') ?? '';
            case 10:
                return localization?.getLocalization('product.type.pets') ?? '';
            case 11:
                return localization?.getLocalization('product.type.clothing') ?? '';
            default:
                // AS3's getProductType() default. populateFilterOptions() never reaches it, since
                // FILTER_OPTIONS holds only the seven cases above.
                return 'Unknown';
        }
    }

    // AS3: .../CollectiblesView.as::updateState()
    updateState(): void
    {
        if(!this._isInitialized || this._model === null) return;

        let state: number;

        if(!this._model.isListInitialized())
        {
            state = STATE_INITIALIZING;
        }
        else if(this._model.items.length === 0)
        {
            state = STATE_EMPTY;
        }
        else
        {
            state = STATE_CONTENT;
        }

        if(this._state === state) return;

        this._state = state;
        this.updateContainerVisibility();
    }

    // AS3: .../CollectiblesView.as::updateContainerVisibility()
    updateContainerVisibility(): void
    {
        if(this._model === null || this._window === null) return;

        if(this._model.controller.currentCategory !== 'collectibles') return;

        const view = this._model.controller.view;
        const loadingContainer = view.loadingContainer;
        const emptyContainer = view.emptyContainer;
        const gridContainer = this._window.findChildByName('grid_container');
        const optionsContainer = this._window.findChildByName('options_container');
        const previewContainer = this._window.findChildByName('preview_container');

        switch(this._state)
        {
            case STATE_INITIALIZING:
                if(loadingContainer) loadingContainer.visible = true;
                if(emptyContainer) emptyContainer.visible = false;
                if(gridContainer) gridContainer.visible = false;
                if(optionsContainer) optionsContainer.visible = false;
                if(previewContainer) previewContainer.visible = false;
                break;
            case STATE_EMPTY:
                if(loadingContainer) loadingContainer.visible = false;
                if(emptyContainer) emptyContainer.visible = true;
                if(gridContainer) gridContainer.visible = false;
                if(optionsContainer) optionsContainer.visible = false;
                if(previewContainer) previewContainer.visible = false;
                break;
            case STATE_CONTENT:
                if(loadingContainer) loadingContainer.visible = false;
                if(emptyContainer) emptyContainer.visible = false;
                if(gridContainer) gridContainer.visible = true;
                if(optionsContainer) optionsContainer.visible = true;
                if(previewContainer) previewContainer.visible = true;
                break;
        }
    }

    // AS3: .../CollectiblesView.as::windowEventProc()
    private windowEventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK)
        {
            switch(window.name)
            {
                case 'clear_filter_button':
                {
                    const filter = this.filterText;

                    if(filter !== null) filter.text = '';

                    window.visible = false;
                    this.updateFilters();
                    break;
                }
                case 'offertotrade_btn':
                {
                    const selected = this._model?.selected ?? null;

                    if(selected === null) break;

                    const input = this.offerAmountInput;
                    const typed = parseInt(input?.text ?? '', 10) || 0;
                    // AS3 clamps to [1, unlockedAssetCount] and writes the clamped value back, so
                    // the field never keeps a number the player cannot actually offer.
                    const amount = Math.min(Math.max(1, typed), selected.unlockedAssetCount);

                    if(input !== null && amount !== typed) input.text = String(amount);

                    this._model?.requestAddTrading(selected, amount);
                    break;
                }
            }
        }
        else if(event.type === WindowKeyboardEvent.KEY_UP)
        {
            if(window.name === 'filter')
            {
                const clearButton = this._window?.findChildByName('clear_filter_button');
                const field = window as unknown as ITextFieldWindow;

                if(clearButton) clearButton.visible = field.text.length > 0;

                if((event as WindowKeyboardEvent).keyCode === 13) this.updateFilters();
            }
        }

        if(event.type === 'WE_SELECTED')
        {
            if(window.name === 'filter.options') this.updateFilters();
        }
    };

    /**
     * Empty in AS3 too. The view declares the avatar-image listener contract because a collectible
     * can be a clothing item, whose icon renders through the avatar renderer — but the product
     * widget owns that callback, so nothing lands here.
     */
    // AS3: .../CollectiblesView.as::avatarImageReady()
    avatarImageReady(_figureString: string): void
    {
    }

    // AS3: .../CollectiblesView.as::get nftImageWidget()
    private get nftImageWidget(): ProductImageWidget | null
    {
        const widgetWindow = this._window?.findChildByName('nft_image') as IWidgetWindow | null ?? null;

        return (widgetWindow?.widget ?? null) as ProductImageWidget | null;
    }

    // AS3: .../CollectiblesView.as::get nftNameText()
    private get nftNameText(): ITextWindow | null
    {
        return this._window?.findChildByName('nft_name') as ITextWindow | null ?? null;
    }

    // AS3: .../CollectiblesView.as::get nftTypeText()
    private get nftTypeText(): ITextWindow | null
    {
        return this._window?.findChildByName('nft_type') as ITextWindow | null ?? null;
    }

    // AS3: .../CollectiblesView.as::get offerAmountInput()
    private get offerAmountInput(): ITextFieldWindow | null
    {
        return this._window?.findChildByName('offertotrade_cnt') as ITextFieldWindow | null ?? null;
    }

    // AS3: .../CollectiblesView.as::get offerButton()
    private get offerButton(): IWindow | null
    {
        return this._window?.findChildByName('offertotrade_btn') ?? null;
    }

    // AS3: .../CollectiblesView.as::get filterOptions()
    private get filterOptions(): IDropMenuWindow | null
    {
        return this._window?.findChildByName('filter.options') as IDropMenuWindow | null ?? null;
    }

    // AS3: .../CollectiblesView.as::get filterText()
    private get filterText(): ITextFieldWindow | null
    {
        return this._window?.findChildByName('filter') as ITextFieldWindow | null ?? null;
    }

    // AS3: .../CollectiblesView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._windowManager = null;
        this._model = null;

        if(this._grid !== null)
        {
            this._grid.dispose();
            this._grid = null;
        }

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._imageTimer !== null)
        {
            clearInterval(this._imageTimer);
            this._imageTimer = null;
        }

        // AS3 leaks the grouped items here — it disposes the grid and the window but never the
        // groups, whose own windows the grid only borrowed. Disposing them is the port's, and it
        // matters more here than in Flash: each group holds a built widget layout.
        for(const group of this._groupedItems.getValues()) group.dispose();

        this._groupedItems.dispose();
    }
}
