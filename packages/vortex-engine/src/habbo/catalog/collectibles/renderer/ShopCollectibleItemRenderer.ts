import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {CollectibleItem} from '@habbo/communication/messages/parser/collectibles/CollectibleItem';
import type {NftStoreOffer} from '@habbo/communication/messages/parser/collectibles/NftStoreOffer';

import type {CollectiblesController} from '../CollectiblesController';
import {BaseItemWrapper} from './model/BaseItemWrapper';
import {AbstractCollectibleItemRenderer} from './AbstractCollectibleItemRenderer';
import type {ShopTab} from '../tabs/ShopTab';

/**
 * One cell in the NFT store grid: the product icon with its emerald price under it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/renderer/ShopCollectibleItemRenderer.as
 */
export class ShopCollectibleItemRenderer extends AbstractCollectibleItemRenderer
{
    /**
     * **AS3 assigns both of these before `super()`; TypeScript cannot, and that is a real
     * behavioural difference rather than a style one.**
     *
     * AS3 permits statements ahead of the base constructor call, and this class uses that: it sets
     * `_offer` first so the `updateVisuals()` the base constructor invokes can read it. TypeScript
     * forbids touching `this` before `super()` outright, so the assignment has to follow it and the
     * first `updateVisuals()` necessarily runs with `_offer` still undefined.
     *
     * The guard in `updateVisuals()` is what makes that harmless, and the price is written on the
     * next pass. `declare` is used so no field initialiser is emitted after `super()` either — an
     * `= null` here would overwrite the constructor's assignment on every construction.
     */
    // AS3: ShopCollectibleItemRenderer.as::_SafeStr_9301 (the owning tab)
    private declare _tab: ShopTab;
    // AS3: ShopCollectibleItemRenderer.as::_offer
    private declare _offer: NftStoreOffer;

    // AS3: ShopCollectibleItemRenderer.as::ShopCollectibleItemRenderer()
    constructor(
        controller: CollectiblesController,
        offer: NftStoreOffer,
        container: IWindowContainer,
        tab: ShopTab
    )
    {
        super(controller, new BaseItemWrapper(offer.productInfo), container);

        this._tab = tab;
        this._offer = offer;

        // AS3 gets this for free from its pre-super() assignment. Here the base's own
        // `updateVisuals()` ran too early, so it is re-run now that `_offer` exists.
        this.updateVisuals();
    }

    // AS3: ShopCollectibleItemRenderer.as::onClick()
    protected override onClick(_event: WindowMouseEvent): void
    {
        this._tab.selectItem(this);
    }

    /**
     * Runs twice: once from `super()`, before `_offer` exists, and once from the constructor after
     * it does. The guard covers the first pass — see the field note.
     */
    // AS3: ShopCollectibleItemRenderer.as::updateVisuals()
    override updateVisuals(): void
    {
        if(this._offer === undefined) return;

        const amount = this.amountText;

        if(amount !== null) amount.text = String(this._offer.emeraldPrice);
    }

    // AS3: ShopCollectibleItemRenderer.as::get item()
    get item(): CollectibleItem
    {
        return (this.renderableItem as BaseItemWrapper).baseItem;
    }

    // AS3: ShopCollectibleItemRenderer.as::get offer()
    get offer(): NftStoreOffer
    {
        return this._offer;
    }

    // AS3: ShopCollectibleItemRenderer.as::get borderOutline()
    protected override get borderOutline(): IWindow | null
    {
        return this.container?.findChildByName('border_outline') ?? null;
    }

    // AS3: ShopCollectibleItemRenderer.as::get borderBackground()
    protected override get borderBackground(): IWindow | null
    {
        return this.container?.findChildByName('border_background') ?? null;
    }

    // AS3: ShopCollectibleItemRenderer.as::get amountText()
    protected override get amountText(): ITextWindow | null
    {
        return this.container?.findChildByName('number') as ITextWindow | null ?? null;
    }

    // AS3: ShopCollectibleItemRenderer.as::get amountTextBorder()
    protected override get amountTextBorder(): IWindow | null
    {
        return this.container?.findChildByName('text_border') ?? null;
    }

    // AS3: ShopCollectibleItemRenderer.as::get bitmapWindow()
    protected override get bitmapWindow(): IBitmapWrapperWindow | null
    {
        return this.container?.findChildByTag('BITMAP') as IBitmapWrapperWindow | null ?? null;
    }

    // AS3: ShopCollectibleItemRenderer.as::get unknownImageWindow()
    protected override get unknownImageWindow(): IStaticBitmapWrapperWindow | null
    {
        return this.container?.findChildByName('unknown_image') as IStaticBitmapWrapperWindow | null ?? null;
    }

    // AS3: ShopCollectibleItemRenderer.as::get badgeImageWindow()
    protected override get badgeImageWindow(): IWidgetWindow | null
    {
        return this.container?.findChildByName('badge_image_widget') as IWidgetWindow | null ?? null;
    }

    // AS3: ShopCollectibleItemRenderer.as::get petImageWindow()
    protected override get petImageWindow(): IWidgetWindow | null
    {
        return this.container?.findChildByName('pet_image_widget') as IWidgetWindow | null ?? null;
    }
}
