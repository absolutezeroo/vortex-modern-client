import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {ILimitedItemGridOverlayWidget} from '@habbo/window/widgets/ILimitedItemGridOverlayWidget';
import type {IRarityItemGridOverlayWidget} from '@habbo/window/widgets/IRarityItemGridOverlayWidget';
import type {ProductIconWidget} from '@habbo/window/widgets/ProductIconWidget';
import type {
    ChestStorage
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/ChestStorage';
import type {
    IChestStorageItem
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/IChestStorageItem';
import {ChestItemTypeRenderableWrapper} from './ChestItemTypeRenderableWrapper';
import type {IChestItemView} from './IChestItemView';
import type {FurniChestView} from './FurniChestView';

/**
 * One cell of the furniture grid — and it stands for a **stack**, not an item.
 *
 * Identical items share a cell: `_storages` holds every one of them, the badge shows the count once
 * there is more than one, and everything visual is read from `peek()`, the first. That is why
 * `add`/`remove` exist rather than the grid rebuilding.
 *
 * Cells are recycled (`recycle()` empties one without disposing its window), so the grid can reuse
 * them across chests.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/subcontrollers/views/FurniChestItemView.as
 */
export class FurniChestItemView implements IChestItemView
{
    // AS3: FurniChestItemView.as::NOT_HOVERED_COLOR
    static readonly NOT_HOVERED_COLOR: number = 13355979;

    // AS3: FurniChestItemView.as::_SafeStr_10259 (name derived: the hovered border colour)
    static readonly HOVERED_COLOR: number = 14079702;

    // AS3: FurniChestItemView.as::_disposed
    private _disposed: boolean = false;

    // AS3: FurniChestItemView.as::_storages
    private _storages: ChestStorage[] = [];

    // AS3: FurniChestItemView.as::_SafeStr_6233 (name derived: the owning grid view)
    private _gridView: FurniChestView | null = null;

    // AS3: FurniChestItemView.as::_active
    private _active: boolean = false;

    // AS3: FurniChestItemView.as::_SafeStr_5943 (name derived: pointer is over the cell)
    private _hovered: boolean = false;

    // AS3: FurniChestItemView.as::_window
    private _window: IWindowContainer | null;

    // AS3: FurniChestItemView.as::FurniChestItemView()
    constructor(template: IWindow)
    {
        this._window = template.clone() as unknown as IWindowContainer;

        this._window.addEventListener('WME_CLICK', this.onClick);
        this._window.addEventListener('WME_OVER', this.onOver);
        this._window.addEventListener('WME_OUT', this.onOut);
    }

    /**
	 * Paints the LTD and rarity decorations over any cell.
	 *
	 * Static and taking the interface rather than `this`, because the transaction views reuse it for
	 * their own cells — that is the whole reason {@link IChestItemView} exists.
	 *
	 * A null item hides everything including the icon, which is how an emptied cell is blanked.
	 * Rarity is gated on `specialType == 19`; AS3 inlines that number and nothing names it.
	 */
    // AS3: FurniChestItemView.as::initChestBasedIconUI()
    static initChestBasedIconUI(view: IChestItemView, item: IChestStorageItem | null): void
    {
        if(item == null)
        {
            if(view.ltdBackgroundBitmap) view.ltdBackgroundBitmap.visible = false;
            if(view.ltdOverlayWidget) view.ltdOverlayWidget.visible = false;
            if(view.rarityOverlayWidget) view.rarityOverlayWidget.visible = false;
            if(view.furniIcon) view.furniIcon.visible = false;

            return;
        }

        if(view.furniIcon) view.furniIcon.visible = true;

        const stuffData = item.stuffData;
        const isLimited = (stuffData?.uniqueSerialNumber ?? 0) > 0;

        if(view.ltdBackgroundBitmap) view.ltdBackgroundBitmap.visible = isLimited;
        if(view.ltdOverlayWidget) view.ltdOverlayWidget.visible = isLimited;

        if(isLimited && stuffData)
        {
            const widget = view.ltdOverlayWidget?.widget as ILimitedItemGridOverlayWidget | null;

            if(widget)
            {
                widget.serialNumber = stuffData.uniqueSerialNumber;
                widget.seriesSize = stuffData.uniqueSeriesSize;
            }
        }

        const isRare = item.specialType === 19;

        if(view.rarityOverlayWidget) view.rarityOverlayWidget.visible = isRare;

        if(isRare && stuffData)
        {
            const widget = view.rarityOverlayWidget?.widget as IRarityItemGridOverlayWidget | null;

            if(widget) widget.rarityLevel = stuffData.rarityLevel;
        }

        const icon = view.furniIcon?.widget as ProductIconWidget | null;

        if(icon) icon.productInfo = new ChestItemTypeRenderableWrapper(item.type);
    }

    // AS3: FurniChestItemView.as::get window()
    get window(): IWindow | null
    {
        return this._window as unknown as IWindow | null;
    }

    // AS3: FurniChestItemView.as::initialize()
    initialize(gridView: FurniChestView, storages: ChestStorage[]): void
    {
        this._gridView = gridView;
        this._storages = storages;

        this.initializeUI();
    }

    // AS3: FurniChestItemView.as::get numItems()
    get numItems(): number
    {
        return this._storages.length;
    }

    /**
	 * The cell's representative item. Every visual comes from it, so a stack of identical furniture
	 * only ever renders its first member.
	 */
    // AS3: FurniChestItemView.as::peek()
    peek(): ChestStorage | null
    {
        return this._storages.length === 0 ? null : this._storages[0];
    }

    // AS3: FurniChestItemView.as::remove()
    remove(storage: ChestStorage): void
    {
        const index = this._storages.indexOf(storage);

        if(index !== -1) this._storages.splice(index, 1);

        this.updateUI();
    }

    // AS3: FurniChestItemView.as::add()
    add(storage: ChestStorage): void
    {
        this._storages.push(storage);
        this.updateUI();
    }

    // AS3: FurniChestItemView.as::initializeUI()
    private initializeUI(): void
    {
        const sample = this.peek();

        // An empty cell is left exactly as it was — AS3 returns before touching anything, so a
        // recycled cell keeps its previous artwork until it is given items.
        if(sample === null) return;

        FurniChestItemView.initChestBasedIconUI(this, sample);
        this.updateUI();
        this.updateColoring();
    }

    /**
	 * The count badge appears only for a real stack; a single item shows none.
	 */
    // AS3: FurniChestItemView.as::updateUI()
    updateUI(): void
    {
        const container = this.numberContainer;

        if(!container) return;

        if(this.numItems > 1)
        {
            container.visible = true;

            const quantity = this.furniQuantity;

            if(quantity) quantity.text = String(this.numItems);
        }
        else
        {
            container.visible = false;
        }
    }

    // AS3: FurniChestItemView.as::updateColoring()
    updateColoring(): void
    {
        const outline = this.focusOutline;
        const border = this.border;

        if(outline) outline.visible = this._active;
        if(border) border.color = this._hovered ? FurniChestItemView.HOVERED_COLOR : FurniChestItemView.NOT_HOVERED_COLOR;
    }

    // AS3: FurniChestItemView.as::onOut()
    private onOut = (): void =>
    {
        this._hovered = false;
        this.updateColoring();
    };

    // AS3: FurniChestItemView.as::onOver()
    private onOver = (): void =>
    {
        this._hovered = true;
        this.updateColoring();
    };

    // AS3: FurniChestItemView.as::onClick()
    private onClick = (): void =>
    {
        this._gridView?.selectItemView(this);
    };

    // AS3: FurniChestItemView.as::activate()
    activate(): void
    {
        this._active = true;
        this.updateColoring();
    }

    // AS3: FurniChestItemView.as::deactivate()
    deactivate(): void
    {
        this._active = false;
        this.updateColoring();
    }

    /**
	 * Back to the pool: the state goes, the window stays. AS3 drops the storage list to null here
	 * and only `dispose()` takes the window down.
	 */
    // AS3: FurniChestItemView.as::recycle()
    recycle(): void
    {
        this._storages = [];
        this._active = false;
        this._hovered = false;
        this._gridView = null;
    }

    // AS3: FurniChestItemView.as::get chestBasedItemSample()
    get chestBasedItemSample(): IChestStorageItem | null
    {
        return this.peek();
    }

    // AS3: FurniChestItemView.as::get border()
    private get border(): IWindow | null
    {
        return this._window?.findChildByName('border') ?? null;
    }

    // AS3: FurniChestItemView.as::get focusOutline()
    private get focusOutline(): IWindow | null
    {
        return this._window?.findChildByName('outline_focus') ?? null;
    }

    // AS3: FurniChestItemView.as::get ltdBackgroundBitmap()
    get ltdBackgroundBitmap(): IWindow | null
    {
        return this._window?.findChildByName('unique_item_background_bitmap') ?? null;
    }

    // AS3: FurniChestItemView.as::get furniIcon()
    get furniIcon(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('furni_icon') as IWidgetWindow | null) ?? null;
    }

    // AS3: FurniChestItemView.as::get ltdOverlayWidget()
    get ltdOverlayWidget(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('unique_item_overlay_container') as IWidgetWindow | null) ?? null;
    }

    // AS3: FurniChestItemView.as::get rarityOverlayWidget()
    get rarityOverlayWidget(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('rarity_item_overlay_container') as IWidgetWindow | null) ?? null;
    }

    // AS3: FurniChestItemView.as::get numberContainer()
    private get numberContainer(): IWindow | null
    {
        return this._window?.findChildByName('number_container') ?? null;
    }

    // AS3: FurniChestItemView.as::get furniQuantity()
    private get furniQuantity(): ITextWindow | null
    {
        return (this._window?.findChildByName('furni_quantity') as ITextWindow | null) ?? null;
    }

    // AS3: FurniChestItemView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: FurniChestItemView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._storages = [];
        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._active = false;
        this._hovered = false;
        this._gridView = null;
        this._disposed = true;
    }
}
