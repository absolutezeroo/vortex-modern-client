import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {ILimitedItemSupplyLeftOverlayWidget} from '@habbo/window/widgets/ILimitedItemSupplyLeftOverlayWidget';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import {SelectProductEvent} from './events/SelectProductEvent';
import {ProductOfferUpdatedEvent} from './events/ProductOfferUpdatedEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * Shows the "X left of Y" supply overlay for the currently selected limited-edition
 * (LTD) product, refreshed from the server every 20 seconds while visible.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/UniqueLimitedItemWidget.as
 */
export class UniqueLimitedItemWidget extends CatalogWidget
{
    private static readonly SUPPLY_REFRESH_PERIOD_MS: number = 20000;

    private _catalog: HabboCatalog | null;

    private _overlayWidget: ILimitedItemSupplyLeftOverlayWidget | null = null;

    private _lastOffer: IPurchasableOffer | null = null;

    private _supplyRefreshTimer: ReturnType<typeof setInterval> | null = null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        if(this._supplyRefreshTimer != null)
        {
            clearInterval(this._supplyRefreshTimer);
            this._supplyRefreshTimer = null;
        }

        this.window.visible = false;
        this._catalog = null;
        this._lastOffer = null;
        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.off(ProductOfferUpdatedEvent.CWE_PRODUCT_OFFER_UPDATED, this.onOfferUpdated);
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        const overlayContainer = this.window.findChildByName('unique_item_overlay_container') as unknown as IWidgetWindow | null;

        this._overlayWidget = (overlayContainer?.widget as ILimitedItemSupplyLeftOverlayWidget | null) ?? null;
        this.window.visible = false;

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        this.events.on(ProductOfferUpdatedEvent.CWE_PRODUCT_OFFER_UPDATED, this.onOfferUpdated);

        return true;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/UniqueLimitedItemWidget.as::onSelectProduct()
    private onSelectProduct = (event: SelectProductEvent): void =>
    {
        if(event == null) return;

        this._lastOffer = event.offer;
        this.update(event.offer, true);
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/UniqueLimitedItemWidget.as::onOfferUpdated()
    private onOfferUpdated = (event: ProductOfferUpdatedEvent): void =>
    {
        this._lastOffer = event.offer;
        this.update(event.offer);
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/UniqueLimitedItemWidget.as::update()
    private update(offer: IPurchasableOffer, requestRefresh: boolean = false): void
    {
        const product = offer.product;

        if(offer.pricingModel === 'pricing_model_single' && product != null && product.isUniqueLimitedItem)
        {
            if(this._overlayWidget != null)
            {
                this._overlayWidget.supplyLeft = product.uniqueLimitedItemsLeft;
                this._overlayWidget.seriesSize = product.uniqueLimitedItemSeriesSize;
            }

            this.window.visible = true;

            if(requestRefresh)
            {
                this._catalog!.sendGetProductOffer(offer.offerId);
            }

            if(this._supplyRefreshTimer == null)
            {
                this._supplyRefreshTimer = setInterval(() => this.onSupplyLeftTimer(), UniqueLimitedItemWidget.SUPPLY_REFRESH_PERIOD_MS);
            }
        }
        else
        {
            this.window.visible = false;

            if(this._supplyRefreshTimer != null)
            {
                clearInterval(this._supplyRefreshTimer);
                this._supplyRefreshTimer = null;
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/UniqueLimitedItemWidget.as::onSupplyLeftTimer()
    private onSupplyLeftTimer(): void
    {
        if(this.window.visible && this._lastOffer != null)
        {
            this.update(this._lastOffer, true);
        }
    }
}
