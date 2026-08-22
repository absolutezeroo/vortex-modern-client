import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {CollectibleCollectionItem} from '@habbo/communication/messages/parser/collectibles/CollectibleCollectionItem';

import type {CollectiblesController} from '../../CollectiblesController';
import {CollectionItemWrapper} from '../model/CollectionItemWrapper';
import {AbstractCollectibleItemRenderer} from '../AbstractCollectibleItemRenderer';
import type {CollectionView} from '../../tabs/subviews/CollectionView';

/**
 * One slot in a collection's grid: the product, how many the player owns, and a checkmark once
 * they own any.
 *
 * The only renderer of the four with a checkmark, and the only one whose click *toggles* — see
 * `CollectionView.selectItem()`, which deselects when the same cell is clicked twice.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/collections/CollectibleItemRenderer.as
 */
export class CollectibleItemRenderer extends AbstractCollectibleItemRenderer
{
    /** AS3: CollectibleItemRenderer.as::updateVisuals() — the amount label's two background colours. */
    private static readonly AMOUNT_BORDER_OWNED = 3374080;

    private static readonly AMOUNT_BORDER_MISSING = 7441834;

    /**
     * Assigned after `super()`, as AS3 does — safe here because this class's `updateVisuals()`
     * reads only `item`, `isComplete` and its own windows, all of which the base has set up by
     * then. Only `onClick()` needs the view, and that fires later. Contrast
     * `ShopCollectibleItemRenderer`, whose override does read a subclass field.
     */
    // AS3: CollectibleItemRenderer.as::_SafeStr_5458 (the owning view)
    private _view: CollectionView;

    // AS3: CollectibleItemRenderer.as::CollectibleItemRenderer()
    constructor(
        controller: CollectiblesController,
        collectionItem: CollectibleCollectionItem,
        container: IWindowContainer,
        view: CollectionView
    )
    {
        super(controller, new CollectionItemWrapper(collectionItem), container);

        this._view = view;
    }

    // AS3: CollectibleItemRenderer.as::onClick()
    protected override onClick(_event: WindowMouseEvent): void
    {
        this._view.selectItem(this);
    }

    // AS3: CollectibleItemRenderer.as::updateVisuals()
    override updateVisuals(): void
    {
        const amount = this.amountText;
        const border = this.amountTextBorder;
        const checkmark = this.checkmarkIcon;

        // AS3 writes "x0" for an uncollected slot here, where the mint tab writes "-" for the same
        // state. Both are their own file's.
        if(amount !== null) amount.text = `x${this.item.amount}`;

        if(border !== null)
        {
            border.color = this.isComplete ? CollectibleItemRenderer.AMOUNT_BORDER_OWNED : CollectibleItemRenderer.AMOUNT_BORDER_MISSING;
        }

        if(checkmark !== null) checkmark.visible = this.isComplete;
    }

    // AS3: CollectibleItemRenderer.as::get item()
    get item(): CollectibleCollectionItem
    {
        return (this.renderableItem as CollectionItemWrapper).collectionItem;
    }

    // AS3: CollectibleItemRenderer.as::get borderOutline()
    protected override get borderOutline(): IWindow | null
    {
        return this.container?.findChildByName('border_outline') ?? null;
    }

    // AS3: CollectibleItemRenderer.as::get borderBackground()
    protected override get borderBackground(): IWindow | null
    {
        return this.container?.findChildByName('border_background') ?? null;
    }

    // AS3: CollectibleItemRenderer.as::get amountText()
    protected override get amountText(): ITextWindow | null
    {
        return this.container?.findChildByName('number') as ITextWindow | null ?? null;
    }

    // AS3: CollectibleItemRenderer.as::get amountTextBorder()
    protected override get amountTextBorder(): IWindow | null
    {
        return this.container?.findChildByName('text_border') ?? null;
    }

    // AS3: CollectibleItemRenderer.as::get checkmarkIcon()
    private get checkmarkIcon(): IStaticBitmapWrapperWindow | null
    {
        return this.container?.findChildByName('checkmark_icon') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: CollectibleItemRenderer.as::get bitmapWindow()
    protected override get bitmapWindow(): IBitmapWrapperWindow | null
    {
        return this.container?.findChildByTag('BITMAP') as IBitmapWrapperWindow | null ?? null;
    }

    // AS3: CollectibleItemRenderer.as::get unknownImageWindow()
    protected override get unknownImageWindow(): IStaticBitmapWrapperWindow | null
    {
        return this.container?.findChildByName('unknown_image') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: CollectibleItemRenderer.as::get badgeImageWindow()
    protected override get badgeImageWindow(): IWidgetWindow | null
    {
        return this.container?.findChildByName('badge_image_widget') as IWidgetWindow | null ?? null;
    }

    // AS3: CollectibleItemRenderer.as::get petImageWindow()
    protected override get petImageWindow(): IWidgetWindow | null
    {
        return this.container?.findChildByName('pet_image_widget') as IWidgetWindow | null ?? null;
    }
}
