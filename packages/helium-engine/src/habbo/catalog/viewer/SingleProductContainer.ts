import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {ILimitedItemGridOverlayWidget} from '@habbo/window/widgets/ILimitedItemGridOverlayWidget';
import {ProductContainer} from './ProductContainer';

/**
 * A single-product offer's grid item (the common, non-multi/bundle case).
 *
 * @see sources/win63_version/habbo/catalog/viewer/SingleProductContainer.as
 */
export class SingleProductContainer extends ProductContainer
{
    override initProductIcon(roomEngine: IRoomEngine, stuffData?: unknown | null): void
    {
        const product = this.firstProduct;

        if(!product) return;

        const image = product.initIcon(this, this, this, this.offer, this.targetIcon, stuffData, this.onPreviewImageReady.bind(this));

        this.setIconImage(image, true);
    }

    enableLimitedItemLayout(): void
    {
        this._view!.findChildByName('unique_item_background_bitmap')!.visible = true;

        const overlayContainer = this._view!.findChildByName('unique_item_overlay_container') as unknown as IWidgetWindow;
        const overlayWidget = overlayContainer.widget as ILimitedItemGridOverlayWidget;

        overlayContainer.visible = true;
        overlayWidget.serialNumber = this.firstProduct!.uniqueLimitedItemSeriesSize;
        overlayWidget.animated = true;

        this._view!.findChildByName('unique_item_sold_out_bitmap')!.visible = this.firstProduct!.uniqueLimitedItemsLeft === 0;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/SingleProductContainer.as::onPreviewImageReady()
    // TODO(AS3): the asset-loader preview-ready callback path this feeds
    // (Product.initIcon()'s "i" room-preview branch) isn't wired up yet - see Product.ts.
    private onPreviewImageReady(_event: unknown): void
    {
        if(!this.disposed && this.offer.page?.viewer?.catalog != null)
        {
            // Not reachable until the preview-asset retrieval path is ported.
        }
    }

    override set view(view: IWindowContainer)
    {
        super.view = view;

        if(this.offer.product?.isUniqueLimitedItem)
        {
            (this.offer.productContainer as SingleProductContainer).enableLimitedItemLayout();
        }
    }

    protected override get useWideView(): boolean
    {
        return this.offer.isSingleChatStyle;
    }
}
