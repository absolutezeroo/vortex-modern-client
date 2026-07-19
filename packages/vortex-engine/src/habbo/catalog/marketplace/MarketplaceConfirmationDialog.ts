import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboCatalog} from '../IHabboCatalog';
import type {HabboCatalog} from '../HabboCatalog';
import {HabboCatalogUtils} from '../HabboCatalogUtils';
import type {ILimitedItemGridOverlayWidget} from '@habbo/window/widgets/ILimitedItemGridOverlayWidget';
import type {IRarityItemGridOverlayWidget} from '@habbo/window/widgets/IRarityItemGridOverlayWidget';
import type {IMarketPlace} from './IMarketPlace';
import type {MarketPlaceOfferData} from './MarketPlaceOfferData';

/**
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceConfirmationDialog.as
 */
export class MarketplaceConfirmationDialog implements IGetImageListener
{
    private _marketplace: IMarketPlace | null;

    private _catalog: IHabboCatalog | null;

    private _roomEngine: IRoomEngine | null;

    private _window: IWindowContainer | null = null;

    private _offer: MarketPlaceOfferData | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceConfirmationDialog.as::MarketplaceConfirmationDialog()
    constructor(marketplace: IMarketPlace, catalog: IHabboCatalog, roomEngine: IRoomEngine)
    {
        this._marketplace = marketplace;
        this._catalog = catalog;
        this._roomEngine = roomEngine;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceConfirmationDialog.as::dispose()
    dispose(): void
    {
        this._marketplace = null;
        this._catalog = null;
        this._roomEngine = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._offer = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceConfirmationDialog.as::showConfirmation()
    showConfirmation(type: number, offer: MarketPlaceOfferData): void
    {
        if(!offer) return;

        this._offer = offer;

        if(!this._marketplace || !this._catalog || !this._catalog.localization) return;

        if(this._window) this._window.dispose();

        this._window = this._catalog.utils.createWindow('marketplace_purchase_confirmation') as unknown as IWindowContainer | null;

        if(!this._window) return;

        this._window.procedure = this.eventHandler;
        this._window.center();

        let text = this._window.findChildByName('header_text') as unknown as ITextWindow | null;

        if(text)
        {
            if(type === 1) text.text = '${catalog.marketplace.confirm_header}';
            if(type === 2) text.text = '${catalog.marketplace.confirm_higher_header}';
        }

        text = this._window.findChildByName('item_name') as unknown as ITextWindow | null;

        if(text) text.text = `\${${this._marketplace.getNameLocalizationKey(offer)}}`;

        text = this._window.findChildByName('item_price') as unknown as ITextWindow | null;

        if(text)
        {
            let priceText = this._catalog.localization.getLocalization('catalog.marketplace.confirm_price');

            priceText = priceText.replace('%price%', offer.price.toString());
            text.text = priceText;
        }

        text = this._window.findChildByName('item_average_price') as unknown as ITextWindow | null;

        if(text)
        {
            const raw = this._catalog.localization.getLocalizationRaw('catalog.marketplace.offer_details.average_price');

            if(raw)
            {
                let averageText = raw.raw;

                averageText = averageText.replace('%days%', this._marketplace.averagePricePeriod.toString());

                const averageValue = offer.averagePrice === 0 ? ' - ' : offer.averagePrice.toString();

                averageText = averageText.replace('%average%', averageValue);
                text.text = averageText;
            }
            else
            {
                text.visible = false;
            }
        }

        const offerCountText = this._window.findChildByName('offer_count') as unknown as ITextWindow | null;

        if(offerCountText)
        {
            const raw = this._catalog.localization.getLocalizationRaw('catalog.marketplace.offer_details.offer_count');

            if(raw)
            {
                offerCountText.text = raw.raw.replace('%count%', offer.offerCount.toString());
            }
            else
            {
                offerCountText.visible = false;
            }
        }

        if(offer.isUniqueLimitedItem)
        {
            const uniqueBackground = this._window.findChildByName('unique_item_background_bitmap');

            if(uniqueBackground) uniqueBackground.visible = true;

            const uniqueOverlayContainer = this._window.findChildByName('unique_item_overlay_widget') as unknown as IWidgetWindow | null;

            if(uniqueOverlayContainer)
            {
                const uniqueOverlay = uniqueOverlayContainer.widget as ILimitedItemGridOverlayWidget;

                uniqueOverlayContainer.visible = true;
                uniqueOverlay.serialNumber = offer.stuffData?.uniqueSerialNumber ?? 0;
                uniqueOverlay.animated = true;
            }
        }

        if(offer.stuffData && offer.stuffData.rarityLevel >= 0)
        {
            const rarityOverlayContainer = this._window.findChildByName('rarity_item_overlay_widget') as unknown as IWidgetWindow | null;

            if(rarityOverlayContainer)
            {
                const rarityOverlay = rarityOverlayContainer.widget as IRarityItemGridOverlayWidget;

                rarityOverlayContainer.visible = true;
                rarityOverlay.rarityLevel = offer.stuffData.rarityLevel;
            }
        }

        this.setImage();

        if((this._catalog as HabboCatalog).getBoolean('disclaimer.credit_spending.enabled'))
        {
            this.setDisclaimerAccepted(false);
        }
        else
        {
            const disclaimer = this._window.findChildByName('disclaimer');

            if(disclaimer)
            {
                this._window.height -= disclaimer.height;
                disclaimer.dispose();
            }

            this.setDisclaimerAccepted(true);
        }
    }

    private setImage(): void
    {
        if(!this._offer || !this._window || !this._roomEngine) return;

        if(!this._offer.image)
        {
            let result;

            if(this._offer.furniType === 1)
            {
                result = this._roomEngine.getFurnitureIcon(this._offer.furniId, this);
            }
            else if(this._offer.furniType === 2)
            {
                result = this._roomEngine.getWallItemIcon(this._offer.furniId, this);
            }

            if(result && result.data)
            {
                this._offer.image = result.data;
                this._offer.imageCallback = result.id;
            }
        }

        if(this._offer.image !== null)
        {
            const imageWindow = this._window.findChildByName('item_image') as unknown as IBitmapWrapperWindow | null;

            if(imageWindow) HabboCatalogUtils.replaceCenteredImage(imageWindow, this._offer.image);
        }
    }

    private eventHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(!event || !window) return;

        if(event.type !== WindowMouseEvent.CLICK && event.type !== WindowMouseEvent.DOUBLE_CLICK) return;

        switch(window.name)
        {
            case 'spending_disclaimer':
                this.setDisclaimerAccepted((window as unknown as ISelectableWindow).isSelected);
                break;
            case 'buy_button':
                this._catalog?.buyMarketPlaceOffer(this._offer!.offerId);
                this.hide();
                break;
            case 'header_button_close':
            case 'cancel_button':
                this.hide();
        }
    };

    private hide(): void
    {
        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceConfirmationDialog.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this._offer && this._offer.imageCallback === id)
        {
            this._offer.image = data;
            this.setImage();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketplaceConfirmationDialog.as::imageFailed()
    imageFailed(_id: number): void
    {
        // AS3: no-op
    }

    private setDisclaimerAccepted(accepted: boolean): void
    {
        if(!this._window) return;

        const buyButton = this._window.findChildByName('buy_button');

        if(!buyButton) return;

        if(accepted) buyButton.enable();
        else buyButton.disable();
    }
}
