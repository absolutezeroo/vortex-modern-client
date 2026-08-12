import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {ProductIconWidget} from '@habbo/window/widgets/ProductIconWidget';
import type {CollectibleAsset} from '@habbo/communication/messages/parser/collectibles/CollectibleAsset';

import {RenderableTradeNftItem} from './RenderableTradeNftItem';
import type {CollectiblesModel} from './CollectiblesModel';

/**
 * One cell in the collectibles grid: every copy the player owns of a single NFT product.
 *
 * The grouping key is the *product code*, not the asset id — a player who owns five copies of the
 * same collectible sees one thumbnail with a "5" badge, and offering one to a trade pops an
 * individual asset id off this group.
 *
 * `_assetIds` maps assetId -> **locked**. `false` means the copy is free to offer; `true` means it
 * is already sitting in the open trade. That polarity runs through `pop()`, `unlockedAssetCount`,
 * `hasAsset()` and `unlockAll()`, and it is why `lockAsset()`'s second parameter reads inverted:
 * see the note there.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/collectibles/CollectibleGroupedItem.as
 */
export class CollectibleGroupedItem
{
    // AS3: .../inventory/collectibles/CollectibleGroupedItem.as::THUMB_COLOR_NORMAL
    private static readonly THUMB_COLOR_NORMAL: number = 13421772;
    // AS3: .../inventory/collectibles/CollectibleGroupedItem.as::THUMB_COLOR_UNSEEN
    private static readonly THUMB_COLOR_UNSEEN: number = 10275685;

    // AS3: .../CollectibleGroupedItem.as::_SafeStr_4755 (from `get isInitialized()`)
    private _isInitialized: boolean = false;
    // AS3: .../CollectibleGroupedItem.as::_SafeStr_7286 (from `get renderableItem()`)
    private _renderableItem: RenderableTradeNftItem;
    // AS3: .../CollectibleGroupedItem.as::_SafeStr_4754 (from `get assetIds()`)
    private _assetIds: OrderedMap<number, boolean> = new OrderedMap<number, boolean>();
    // AS3: .../CollectibleGroupedItem.as::_SafeStr_7496 (from `get isSelected()`)
    private _isSelected: boolean = false;
    // AS3: .../CollectibleGroupedItem.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: .../CollectibleGroupedItem.as::_SafeStr_5584 (the BG_COLOR child)
    private _bgColorWindow: IWindow | null = null;
    // AS3: .../CollectibleGroupedItem.as::_isUnseen
    private _isUnseen: boolean = false;
    // AS3: .../CollectibleGroupedItem.as::_SafeStr_4570 (the owning model)
    private _model: CollectiblesModel;
    // AS3: .../CollectibleGroupedItem.as::_name
    private _name: string = '';

    /**
     * AS3 builds the thumbnail from `assets.getAssetByName("inventory_thumb_nft_xml")` and
     * `windowManager.buildFromXML()`; the port's `buildWidgetLayout()` is the same two steps behind
     * one call, as BotGridItem and PetGridItem already do.
     *
     * The bail-out when the layout is missing is AS3's own: it returns before naming the item or
     * sizing the counter, so a thumbnail-less group is inert rather than half-built.
     */
    // AS3: .../CollectibleGroupedItem.as::CollectibleGroupedItem()
    constructor(item: CollectibleAsset, assetIds: number[], model: CollectiblesModel)
    {
        this._renderableItem = new RenderableTradeNftItem(item);

        for(const assetId of assetIds) this._assetIds.add(assetId, false);

        this._model = model;
        this._isUnseen = false;
        this.isSelected = false;

        this._window = model.controller.windowManager?.buildWidgetLayout('inventory_thumb_nft_xml') as IWindowContainer | null ?? null;

        if(this._window === null) return;

        this._window.procedure = this.itemEventProc;
        this._bgColorWindow = this._window.findChildByTag('BG_COLOR');

        // AS3 reads the display name straight off `catalog.collectorHub`, and so does this — the
        // hub is `CollectiblesController` and it is ported. The product-code fallback stays for the
        // case where the catalog component has not resolved yet: an empty cell is one the filter
        // can never match.
        const collectorHub = model.controller.catalog?.collectorHub ?? null;

        this._name = collectorHub !== null
            ? collectorHub.getProductName(this._renderableItem)
            : item.productCode;

        this.unlockedAssetCountChanged();
    }

    // AS3: .../CollectibleGroupedItem.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../CollectibleGroupedItem.as::initializeImage()
    initializeImage(): void
    {
        const widget = this.nftIconWidget;

        if(widget !== null) widget.productInfo = this._renderableItem;

        this._isInitialized = true;
    }

    // AS3: .../CollectibleGroupedItem.as::get isInitialized()
    get isInitialized(): boolean
    {
        return this._isInitialized;
    }

    // AS3: .../CollectibleGroupedItem.as::get item()
    get item(): CollectibleAsset
    {
        return this._renderableItem.item;
    }

    // AS3: .../CollectibleGroupedItem.as::addAssetId()
    addAssetId(assetId: number): void
    {
        this._assetIds.add(assetId, false);
        this.unlockedAssetCountChanged();
    }

    // AS3: .../CollectibleGroupedItem.as::get assetIds()
    get assetIds(): number[]
    {
        return this._assetIds.getKeys();
    }

    /**
     * Up to `count` asset ids that are not already in the trade. AS3 tests the length *after*
     * pushing, so the returned vector can be shorter than asked for but never longer.
     */
    // AS3: .../CollectibleGroupedItem.as::pop()
    pop(count: number): number[]
    {
        const popped: number[] = [];

        for(const assetId of this._assetIds.getKeys())
        {
            if(this._assetIds.getValue(assetId) === false) popped.push(assetId);

            if(popped.length >= count) break;
        }

        return popped;
    }

    // AS3: .../CollectibleGroupedItem.as::removeAssetId()
    removeAssetId(assetId: number): boolean
    {
        if(this._assetIds.hasKey(assetId))
        {
            this._assetIds.remove(assetId);
            this.unlockedAssetCountChanged();

            return true;
        }

        return false;
    }

    // AS3: .../CollectibleGroupedItem.as::hasAsset()
    hasAsset(assetId: number, locked: boolean = false): boolean
    {
        if(this._assetIds.hasKey(assetId))
        {
            return this._assetIds.getValue(assetId) === locked;
        }

        return false;
    }

    /**
     * Locks (default) or unlocks a single copy, returning whether the state actually changed.
     *
     * The parameter reads backwards on purpose: AS3's `param2` is "the state to move *away* from",
     * so `lockAsset(id)` locks and `lockAsset(id, true)` unlocks. The name is AS3's; the polarity
     * is AS3's; only this comment is the port's.
     */
    // AS3: .../CollectibleGroupedItem.as::lockAsset()
    lockAsset(assetId: number, unlock: boolean = false): boolean
    {
        if(!this._assetIds.hasKey(assetId)) return false;

        const locked = this._assetIds.getValue(assetId) === true;

        if(locked && unlock)
        {
            this._assetIds.remove(assetId);
            this._assetIds.add(assetId, false);
            this.unlockedAssetCountChanged();

            return true;
        }

        if(!locked && !unlock)
        {
            this._assetIds.remove(assetId);
            this._assetIds.add(assetId, true);
            this.unlockedAssetCountChanged();

            return true;
        }

        return false;
    }

    // AS3: .../CollectibleGroupedItem.as::unlockAll()
    unlockAll(): void
    {
        let changed = false;

        for(const assetId of this._assetIds.getKeys())
        {
            if(this._assetIds.getValue(assetId) === true)
            {
                this._assetIds.remove(assetId);
                this._assetIds.add(assetId, false);
                changed = true;
            }
        }

        if(changed) this.unlockedAssetCountChanged();
    }

    // AS3: .../CollectibleGroupedItem.as::get amount()
    get amount(): number
    {
        return this._assetIds.length;
    }

    /**
     * AS3 dereferences the three child windows unguarded here, which is safe there because the
     * constructor returns early when the layout is missing. The port guards anyway: this also runs
     * from `addAssetId()`/`lockAsset()` long after construction.
     */
    // AS3: .../CollectibleGroupedItem.as::unlockedAssetCountChanged()
    private unlockedAssetCountChanged(): void
    {
        const count = this.unlockedAssetCount;
        const container = this.numberContainer;
        const text = this.numberText;
        const widget = this.nftIconWidget;

        if(container !== null) container.visible = count > 1;

        if(text !== null) text.text = String(count);

        // Every copy already in the trade greys the whole cell out.
        if(widget !== null) widget.blend = count === 0 ? 0.2 : 1;
    }

    // AS3: .../CollectibleGroupedItem.as::get unlockedAssetCount()
    get unlockedAssetCount(): number
    {
        let count = 0;

        for(const locked of this._assetIds.getValues())
        {
            if(!locked) count += 1;
        }

        return count;
    }

    // AS3: .../CollectibleGroupedItem.as::get isSelected()
    get isSelected(): boolean
    {
        return this._isSelected;
    }

    // AS3: .../CollectibleGroupedItem.as::set isSelected()
    set isSelected(value: boolean)
    {
        this._isSelected = value;

        if(this._bgColorWindow === null || this._window === null) return;

        this._bgColorWindow.color = this._isUnseen
            ? CollectibleGroupedItem.THUMB_COLOR_UNSEEN
            : CollectibleGroupedItem.THUMB_COLOR_NORMAL;

        const outline = this._window.findChildByName('outline');

        if(outline !== null) outline.visible = value;
    }

    // AS3: .../CollectibleGroupedItem.as::set isUnseen()
    set isUnseen(value: boolean)
    {
        if(this._isUnseen !== value)
        {
            this._isUnseen = value;
            // Re-runs the setter for its side effect only — the selection itself does not change.
            this.isSelected = this._isSelected;
        }
    }

    // AS3: .../CollectibleGroupedItem.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../CollectibleGroupedItem.as::get renderableItem()
    get renderableItem(): RenderableTradeNftItem
    {
        return this._renderableItem;
    }

    // AS3: .../CollectibleGroupedItem.as::removeIntervalProcedure()
    removeIntervalProcedure(): void
    {
        if(this._window !== null) this._window.procedure = null;
    }

    // AS3: .../CollectibleGroupedItem.as::itemEventProc()
    private itemEventProc = (event: WindowEvent, _window: IWindow): void =>
    {
        switch(event.type)
        {
            case WindowMouseEvent.CLICK:
                this._model.setSelected(this);
                break;
            case WindowMouseEvent.DOUBLE_CLICK:
                this._model.requestAddTrading(this, 1);
                break;
        }
    };

    // AS3: .../CollectibleGroupedItem.as::get nftIconWidget()
    protected get nftIconWidget(): ProductIconWidget | null
    {
        const widgetWindow = this._window?.findChildByName('nft_icon') as IWidgetWindow | null ?? null;

        return (widgetWindow?.widget ?? null) as ProductIconWidget | null;
    }

    // AS3: .../CollectibleGroupedItem.as::get numberContainer()
    protected get numberContainer(): IWindowContainer | null
    {
        return this._window?.findChildByName('number_container') as IWindowContainer | null ?? null;
    }

    // AS3: .../CollectibleGroupedItem.as::get numberText()
    protected get numberText(): ITextWindow | null
    {
        return this._window?.findChildByName('number') as ITextWindow | null ?? null;
    }

    // AS3: .../CollectibleGroupedItem.as::dispose()
    dispose(): void
    {
        if(this._isSelected) this._model.setSelected(null);

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
