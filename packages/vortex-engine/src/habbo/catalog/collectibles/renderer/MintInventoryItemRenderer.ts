import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {CollectibleProductItem} from '@habbo/communication/messages/parser/collectibles/CollectibleProductItem';

import type {CollectiblesController} from '../CollectiblesController';
import {MintableItemWrapper} from './model/MintableItemWrapper';
import type {ICollectibleColoring} from './AbstractCollectibleItemRenderer';
import {AbstractCollectibleItemRenderer} from './AbstractCollectibleItemRenderer';
import type {MintInventoryListTab} from '../tabs/MintInventoryListTab';

/** AS3: MintInventoryItemRenderer.as::updateVisuals() — the amount label's two background colours. */
const AMOUNT_BORDER_OWNED = 3374080;
const AMOUNT_BORDER_MISSING = 7441834;

/**
 * One cell in the mint tab's grid: a furni type the player may mint, with how many they own.
 *
 * Unlike its three siblings this renderer **never uses the "complete" palette** — it overrides
 * `completeColoring()` to return the incomplete one, so owning the furni does not tint the cell.
 * Only the amount label changes colour. That is AS3's, and it is the visual difference between
 * "you own this" in a collection and "you can mint this" here.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/MintInventoryItemRenderer.as
 */
export class MintInventoryItemRenderer extends AbstractCollectibleItemRenderer
{
    /**
     * Assigned after `super()`, as AS3 does — and safe, unlike its shop and reward siblings,
     * because this class's `updateVisuals()` reads only `renderableItem` and `isComplete`, both of
     * which the base has set by then. Only `onClick()` needs the tab, and that fires later.
     */
    // AS3: MintInventoryItemRenderer.as::_SafeStr_5278 (the owning tab)
    private _tab: MintInventoryListTab;

    // AS3: MintInventoryItemRenderer.as::MintInventoryItemRenderer()
    constructor(
        controller: CollectiblesController,
        productItem: CollectibleProductItem,
        container: IWindowContainer,
        tab: MintInventoryListTab,
        amount: number
    )
    {
        super(controller, new MintableItemWrapper(productItem, amount), container);

        this._tab = tab;
    }

    // AS3: MintInventoryItemRenderer.as::onClick()
    protected override onClick(_event: WindowMouseEvent): void
    {
        this._tab.selectItem(this);
    }

    /** A cell the player owns none of shows "-" rather than "x0". */
    // AS3: MintInventoryItemRenderer.as::updateVisuals()
    override updateVisuals(): void
    {
        const amount = this.amountText;
        const border = this.amountTextBorder;

        if(amount !== null)
        {
            amount.text = this.isComplete ? `x${this.renderableItem.amount}` : '-';
        }

        if(border !== null)
        {
            border.color = this.isComplete ? AMOUNT_BORDER_OWNED : AMOUNT_BORDER_MISSING;
        }
    }

    // AS3: MintInventoryItemRenderer.as::get item()
    get item(): CollectibleProductItem
    {
        return (this.renderableItem as MintableItemWrapper).productItem;
    }

    /** See the class note: the mint grid deliberately has one palette, not two. */
    // AS3: MintInventoryItemRenderer.as::completeColoring()
    protected override completeColoring(): ICollectibleColoring
    {
        return this.incompleteColoring();
    }

    // AS3: MintInventoryItemRenderer.as::get borderOutline()
    protected override get borderOutline(): IWindow | null
    {
        return this.container?.findChildByName('border_outline') ?? null;
    }

    // AS3: MintInventoryItemRenderer.as::get borderBackground()
    protected override get borderBackground(): IWindow | null
    {
        return this.container?.findChildByName('border_background') ?? null;
    }

    // AS3: MintInventoryItemRenderer.as::get amountText()
    protected override get amountText(): ITextWindow | null
    {
        return this.container?.findChildByName('number') as ITextWindow | null ?? null;
    }

    // AS3: MintInventoryItemRenderer.as::get amountTextBorder()
    protected override get amountTextBorder(): IWindow | null
    {
        return this.container?.findChildByName('text_border') ?? null;
    }

    // AS3: MintInventoryItemRenderer.as::get bitmapWindow()
    protected override get bitmapWindow(): IBitmapWrapperWindow | null
    {
        return this.container?.findChildByTag('BITMAP') as IBitmapWrapperWindow | null ?? null;
    }

    // AS3: MintInventoryItemRenderer.as::get unknownImageWindow()
    protected override get unknownImageWindow(): IStaticBitmapWrapperWindow | null
    {
        return this.container?.findChildByName('unknown_image') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: MintInventoryItemRenderer.as::get badgeImageWindow()
    protected override get badgeImageWindow(): IWidgetWindow | null
    {
        return this.container?.findChildByName('badge_image_widget') as IWidgetWindow | null ?? null;
    }

    // AS3: MintInventoryItemRenderer.as::get petImageWindow()
    protected override get petImageWindow(): IWidgetWindow | null
    {
        return this.container?.findChildByName('pet_image_widget') as IWidgetWindow | null ?? null;
    }
}
