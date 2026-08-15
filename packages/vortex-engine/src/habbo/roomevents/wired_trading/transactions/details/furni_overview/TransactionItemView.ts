import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import type {
    IChestStorageItem
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/IChestStorageItem';

import {FurniChestItemView} from '../../../chests/subcontrollers/views/FurniChestItemView';
import {FurniChestView} from '../../../chests/subcontrollers/views/FurniChestView';
import type {IChestItemView} from '../../../chests/subcontrollers/views/IChestItemView';
import type {WiredTransactionDetailsController} from '../WiredTransactionDetailsController';
import {TransactionChestItemWrapper} from './TransactionChestItemWrapper';

/**
 * One cell in a transaction's item breakdown — a stack of furniture, a pile of coins, or the
 * "and N more" marker for a truncated list.
 *
 * **Three kinds share one cell and one layout.** {@link TYPE_FURNI} draws the furniture icon and
 * names it, {@link TYPE_COINS} swaps in the coin bitmap, and {@link TYPE_INCOMPLETE_DATA} hides the
 * quantity badge entirely and writes `+N` across the cell instead — shrinking its font past a
 * thousand so four digits still fit.
 *
 * Cells are pooled by {@link TransactionOverviewView}: `recycle()` empties one without touching its
 * window, so reopening the details of another transaction reuses them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/transactions/details/furni_overview/TransactionItemView.as
 */
export class TransactionItemView implements IDisposable, IChestItemView
{
    // AS3: TransactionItemView.as::TYPE_FURNI
    static readonly TYPE_FURNI: number = 0;

    // AS3: TransactionItemView.as::_SafeStr_11199 (name derived from the branch that draws coins)
    static readonly TYPE_COINS: number = 1;

    // AS3: TransactionItemView.as::TYPE_INCOMPLETE_DATA
    static readonly TYPE_INCOMPLETE_DATA: number = 2;

    /**
	 * Past this many items the `+N` text drops from 16px to 12px so four digits still fit the cell.
	 * AS3 inlines all three numbers.
	 */
    // AS3: TransactionItemView.as::updateUI() — inline threshold (name derived)
    private static readonly INCOMPLETE_TEXT_SHRINK_THRESHOLD: number = 1000;

    // AS3: TransactionItemView.as::_disposed
    private _disposed: boolean = false;

    // AS3: TransactionItemView.as::_SafeStr_4593 (name derived: the details controller)
    private _controller: WiredTransactionDetailsController | null;

    // AS3: TransactionItemView.as::_count
    private _count: number = 0;

    // AS3: TransactionItemView.as::_SafeStr_4778 (name derived: which of the three kinds)
    private _itemKind: number = 0;

    // AS3: TransactionItemView.as::_SafeStr_5296 (name derived: the furniture type shown)
    private _itemType: ChestItemType | null = null;

    // AS3: TransactionItemView.as::_SafeStr_4860 (name derived: the type dressed as a chest item)
    private _chestBasedItemSample: IChestStorageItem | null = null;

    // AS3: TransactionItemView.as::_SafeStr_5943 (name derived: pointer is over the cell)
    private _hovered: boolean = false;

    // AS3: TransactionItemView.as::_window
    private _window: IRegionWindow | null;

    // AS3: TransactionItemView.as::TransactionItemView()
    constructor(template: IRegionWindow, controller: WiredTransactionDetailsController)
    {
        this._window = (template as unknown as IWindow).clone() as unknown as IRegionWindow;
        this._controller = controller;

        (this._window as unknown as IWindow).addEventListener('WME_OVER', this.onOver);
        (this._window as unknown as IWindow).addEventListener('WME_OUT', this.onOut);
    }

    // AS3: TransactionItemView.as::get window()
    get window(): IRegionWindow | null
    {
        return this._window;
    }

    /**
	 * A null type means this cell is not furniture — the coin and truncation kinds pass none, and the
	 * wrapper is left null so the icon helpers blank the furniture slot.
	 */
    // AS3: TransactionItemView.as::initialize()
    initialize(count: number, itemKind: number, itemType: ChestItemType | null): void
    {
        this._count = count;
        this._itemKind = itemKind;
        this._itemType = itemType;
        this._chestBasedItemSample = itemType === null ? null : new TransactionChestItemWrapper(itemType);

        let tooltip = '';

        if(this._itemKind === TransactionItemView.TYPE_FURNI)
        {
            tooltip = FurniChestView.getChestBasedItemName(
                this._chestBasedItemSample!,
                this._controller?.localizationManager ?? null,
                this._controller?.sessionDataManager ?? null
            );
        }
        else if(this._itemKind === TransactionItemView.TYPE_COINS)
        {
            tooltip = '${wiredcontracts.element.type.0}';
        }
        else if(this._itemKind === TransactionItemView.TYPE_INCOMPLETE_DATA)
        {
            tooltip = '${wiredchests.log_details.incomplete_data}';
        }

        if(this._window) this._window.toolTipCaption = tooltip;

        this.initializeUI();
    }

    // AS3: TransactionItemView.as::get numItems()
    get numItems(): number
    {
        return this._count;
    }

    // AS3: TransactionItemView.as::initializeUI()
    private initializeUI(): void
    {
        FurniChestItemView.initChestBasedIconUI(this, this._chestBasedItemSample);

        const coinsIcon = this.coinsIcon;
        const incompleteText = this.incompleteText;

        if(coinsIcon) coinsIcon.visible = this._itemKind === TransactionItemView.TYPE_COINS;
        if(incompleteText) incompleteText.visible = this._itemKind === TransactionItemView.TYPE_INCOMPLETE_DATA;

        this.updateUI();
        this.updateColoring();
    }

    /**
	 * A single item shows no quantity badge at all — only stacks are numbered.
	 */
    // AS3: TransactionItemView.as::updateUI()
    updateUI(): void
    {
        const numberContainer = this.numberContainer;
        const incompleteText = this.incompleteText;

        if(this._itemKind === TransactionItemView.TYPE_INCOMPLETE_DATA)
        {
            if(numberContainer) numberContainer.visible = false;

            if(incompleteText)
            {
                incompleteText.fontSize = this.numItems >= TransactionItemView.INCOMPLETE_TEXT_SHRINK_THRESHOLD ? 12 : 16;
                incompleteText.text = `+${this.numItems}`;
            }
        }
        else if(this.numItems > 1)
        {
            if(numberContainer) numberContainer.visible = true;

            const furniQuantity = this.furniQuantity;

            if(furniQuantity) furniQuantity.text = String(this.numItems);
        }
        else
        {
            if(numberContainer) numberContainer.visible = false;
        }
    }

    /**
	 * The focus outline is hidden unconditionally — a transaction cell is never selectable, unlike
	 * the chest cell this borrows its colours from.
	 */
    // AS3: TransactionItemView.as::updateColoring()
    updateColoring(): void
    {
        const focusOutline = this.focusOutline;
        const border = this.border;

        if(focusOutline) focusOutline.visible = false;

        if(border)
        {
            (border as unknown as IWindow).color = this._hovered
                ? FurniChestItemView.HOVERED_COLOR
                : FurniChestItemView.NOT_HOVERED_COLOR;
        }
    }

    // AS3: TransactionItemView.as::onOut()
    private onOut = (): void =>
    {
        this._hovered = false;
        this.updateColoring();
    };

    // AS3: TransactionItemView.as::onOver()
    private onOver = (): void =>
    {
        this._hovered = true;
        this.updateColoring();
    };

    /**
	 * Empties the cell for the pool. Note AS3 leaves `_SafeStr_4860` (the wrapper) and `_itemKind`
	 * alone — `initialize()` overwrites both before the cell is shown again, so the stale wrapper is
	 * never read.
	 */
    // AS3: TransactionItemView.as::recycle()
    recycle(): void
    {
        this._hovered = false;
        this._count = 0;
        this._itemType = null;
    }

    // AS3: TransactionItemView.as::get chestBasedItemSample()
    get chestBasedItemSample(): IChestStorageItem | null
    {
        return this._chestBasedItemSample;
    }

    // AS3: TransactionItemView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._hovered = false;
        // AS3 writes `_count = null` on an `int` here, which Flash coerces to 0.
        this._count = 0;
        this._itemType = null;
        this._controller = null;
        this._disposed = true;
    }

    // AS3: TransactionItemView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: TransactionItemView.as::get border()
    private get border(): IWindowContainer | null
    {
        return (this._window?.findChildByName('border') as IWindowContainer | null) ?? null;
    }

    // AS3: TransactionItemView.as::get focusOutline()
    private get focusOutline(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('outline_focus') as IStaticBitmapWrapperWindow | null) ?? null;
    }

    // AS3: TransactionItemView.as::get ltdBackgroundBitmap()
    get ltdBackgroundBitmap(): IWindow | null
    {
        return this._window?.findChildByName('unique_item_background_bitmap') ?? null;
    }

    // AS3: TransactionItemView.as::get coinsIcon()
    get coinsIcon(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('coins_icon') as IStaticBitmapWrapperWindow | null) ?? null;
    }

    // AS3: TransactionItemView.as::get incompleteText()
    get incompleteText(): ITextWindow | null
    {
        return (this._window?.findChildByName('incomplete_text') as ITextWindow | null) ?? null;
    }

    // AS3: TransactionItemView.as::get furniIcon()
    get furniIcon(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('furni_icon') as IWidgetWindow | null) ?? null;
    }

    // AS3: TransactionItemView.as::get numberContainer()
    private get numberContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('number_container') as IWindowContainer | null) ?? null;
    }

    // AS3: TransactionItemView.as::get furniQuantity()
    private get furniQuantity(): ITextWindow | null
    {
        return (this._window?.findChildByName('furni_quantity') as ITextWindow | null) ?? null;
    }

    // AS3: TransactionItemView.as::get ltdOverlayWidget()
    get ltdOverlayWidget(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('unique_item_overlay_container') as IWidgetWindow | null) ?? null;
    }

    // AS3: TransactionItemView.as::get rarityOverlayWidget()
    get rarityOverlayWidget(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('rarity_item_overlay_container') as IWidgetWindow | null) ?? null;
    }
}
