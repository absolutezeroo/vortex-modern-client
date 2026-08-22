/**
 * MarketplaceView
 *
 * The three dialogs behind selling an item: make an offer, buy tokens, and the no-credits notice.
 * Only one is ever up, so they share a single `_window` field and `disposeView()` — opening a
 * second without closing the first would leak the first.
 *
 * The price maths is the interesting part. What the seller nets is not the price they typed: AS3
 * takes a percentage fee *plus* a term that grows with the price itself
 * (`price / halfTaxLimit`), so listing high is progressively taxed. `checkPrice()` recomputes it on
 * every keystroke and is what enables or greys the confirm button.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/marketplace/MarketplaceView.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ILimitedItemPreviewOverlayWidget} from '@habbo/window/widgets/ILimitedItemPreviewOverlayWidget';
import type {IRarityItemGridOverlayWidget} from '@habbo/window/widgets/IRarityItemGridOverlayWidget';
import type {HabboInventory} from '../HabboInventory';
import type {FurnitureItem} from '../items/FurnitureItem';
import type {MarketplaceItemStats} from '@habbo/catalog/marketplace/MarketplaceItemStats';
import type {MarketplaceModel} from './MarketplaceModel';
import {Vector3d} from '@room/utils/Vector3d';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.inventory.marketplace.MarketplaceView');

export class MarketplaceView implements IGetImageListener
{
    /**
    * AS3 passes this as a bare `4293848814` to both image getters — the dialog's own background, so
    * the rendered furni is composited against it rather than against transparency. Name DERIVED; the
    * literal is unnamed in AS3.
    */
    // AS3: .../inventory/marketplace/MarketplaceView.as::showMakeOffer()
    private static readonly PREVIEW_BACKGROUND_COLOR: number = 4293848814;

    // AS3: .../inventory/marketplace/MarketplaceView.as::showMakeOffer() — the preview render scale.
    private static readonly PREVIEW_SCALE: number = 64;

    // AS3: .../inventory/marketplace/MarketplaceView.as::showResult() — 1 is the only success code.
    private static readonly RESULT_SUCCESS: number = 1;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_SafeStr_5517 (name derived: the asset library)
    private _assets: IAssetLibrary | null;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_SafeStr_4550 (name derived: the open dialog)
    private _window: IWindowContainer | null = null;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_SafeStr_4570 (name derived: the owning model)
    private _model: MarketplaceModel | null;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_roomEngine
    private _roomEngine: IRoomEngine | null;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_localization
    private _localization: IHabboLocalizationManager | null;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_SafeStr_9588 (name derived: the inventory, for the shop URL)
    private _habboInventory: HabboInventory;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_disposed
    private _disposed: boolean = false;

    /**
     * AS3: .../inventory/marketplace/MarketplaceView.as::_SafeStr_9000
     *
     * Name DERIVED: the pending image request id. `imageReady()` ignores anything else, so a slow
     * render for a previously-shown item cannot overwrite the current preview.
     */
    // AS3: .../inventory/marketplace/MarketplaceView.as::_SafeStr_9000
    private _pendingImageId: number = -1;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_SafeStr_7968 (name derived: the typed price)
    private _offerPrice: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_offerAmount
    private _offerAmount: number = 1;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_maxOfferAmount
    private _maxOfferAmount: number = 1;

    // AS3: .../inventory/marketplace/MarketplaceView.as::_furniName
    private _furniName: string = '';

    // AS3: .../inventory/marketplace/MarketplaceView.as::_SafeStr_7350 (name derived: the server's suggested price)
    private _suggestedPrice: number = 0;

    // AS3: .../inventory/marketplace/MarketplaceView.as::MarketplaceView()
    constructor(
        model: MarketplaceModel,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        roomEngine: IRoomEngine,
        localization: IHabboLocalizationManager,
        habboInventory: HabboInventory
    )
    {
        this._model = model;
        this._assets = assets;
        this._windowManager = windowManager;
        this._roomEngine = roomEngine;
        this._localization = localization;
        this._habboInventory = habboInventory;
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::showBuyTokens()
    showBuyTokens(price: number, count: number): void
    {
        this._localization?.registerParameter('inventory.marketplace.buy_tokens.info', 'price', String(price));
        this._localization?.registerParameter('inventory.marketplace.buy_tokens.info', 'count', String(count));
        // AS3's "free" is the batch minus the one you paid for.
        this._localization?.registerParameter('inventory.marketplace.buy_tokens.info', 'free', String(count - 1));
        this._localization?.registerParameter('inventory.marketplace.buy_tokens.buy', 'price', String(price));

        this._window = this.createWindow('buy_marketplace_tokens_xml');

        if(this._window == null) return;

        this._window.procedure = this.clickHandler;
        this._window.center();
    }

    /**
     * `maxAmount` is the *lesser* of the locked stack and the bulk limit, computed by the model —
     * the field here only has to clamp to it.
     */
    // AS3: .../inventory/marketplace/MarketplaceView.as::showMakeOffer()
    showMakeOffer(item: FurnitureItem | null, maxAmount: number): void
    {
        if(item == null || this._localization == null || this._roomEngine == null || this._model == null) return;

        this._maxOfferAmount = Math.max(1, maxAmount);
        this._offerAmount = 1;

        this._localization.registerParameter('sellinmarketplace.amount', 'max_amount', String(this._maxOfferAmount));

        this._window = this.createWindow('make_marketplace_offer_xml');

        if(this._window == null) return;

        const priceInput = this._window.findChildByName('price_input') as ITextFieldWindow | null;

        if(priceInput != null) priceInput.restrict = '0-9';

        const amountInput = this._window.findChildByName('amount_input') as ITextFieldWindow | null;

        if(amountInput != null)
        {
            amountInput.restrict = '0-9';
            amountInput.text = String(this._offerAmount);
        }

        this.checkPrice();

        this._localization.registerParameter(
            'inventory.marketplace.make_offer.expiration_info_days', 'days', String(this._model.expirationHours / 24)
        );
        this._localization.registerParameter(
            'inventory.marketplace.make_offer.min_price', 'minprice', String(this._model.offerMinPrice)
        );
        this._localization.registerParameter(
            'inventory.marketplace.make_offer.max_price', 'maxprice', String(this._model.offerMaxPrice)
        );

        // AS3 renders the furni at direction 90 — the catalogue-style three-quarter view.
        const result = item.isWallItem
            ? this._roomEngine.getWallItemImage(
                item.type, new Vector3d(90, 0, 0), MarketplaceView.PREVIEW_SCALE, this, MarketplaceView.PREVIEW_BACKGROUND_COLOR,
                item.stuffData?.getLegacyString() ?? null
            )
            : this._roomEngine.getFurnitureImage(
                item.type, new Vector3d(90, 0, 0), MarketplaceView.PREVIEW_SCALE, this, MarketplaceView.PREVIEW_BACKGROUND_COLOR, String(item.extra)
            );

        if(result == null) return;

        this._pendingImageId = result.id;

        this.setFurniImage(result.data);

        let nameKey = item.isWallItem ? `wallItem.name.${item.type}` : `roomItem.name.${item.type}`;
        let descKey = item.isWallItem ? `wallItem.desc.${item.type}` : `roomItem.desc.${item.type}`;

        // Every poster shares one furni type, so its name comes from the stuff data instead.
        if(item.category === 6 && item.stuffData != null)
        {
            nameKey = `poster_${item.stuffData.getLegacyString()}_name`;
            descKey = `poster_${item.stuffData.getLegacyString()}_desc`;
        }

        this._furniName = this._localization.getLocalization(nameKey);

        this.setText('furni_name', `\${${nameKey}}`);
        this.setText('furni_desc', `\${${descKey}}`);

        this._window.procedure = this.clickHandler;
        this._window.center();

        this.resetPriceStats();

        if(item.stuffData != null && item.stuffData.uniqueSerialNumber > 0)
        {
            const overlayWindow = this._window.findChildByName('unique_item_overlay_widget') as IWidgetWindow | null;
            const overlay = (overlayWindow?.widget ?? null) as ILimitedItemPreviewOverlayWidget | null;

            if(overlayWindow != null) overlayWindow.visible = true;

            if(overlay != null)
            {
                overlay.serialNumber = item.stuffData.uniqueSerialNumber;
                overlay.seriesSize = item.stuffData.uniqueSeriesSize;
            }
        }

        if(item.stuffData != null && item.stuffData.rarityLevel >= 0)
        {
            const rarityWindow = this._window.findChildByName('rarity_item_overlay_widget') as IWidgetWindow | null;
            const rarity = (rarityWindow?.widget ?? null) as IRarityItemGridOverlayWidget | null;

            if(rarityWindow != null) rarityWindow.visible = true;

            if(rarity != null) rarity.rarityLevel = item.stuffData.rarityLevel;
        }

        this._model.getItemStats();
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::showNoCredits()
    showNoCredits(price: number): void
    {
        this._localization?.registerParameter('inventory.marketplace.no_credits.info', 'price', String(price));

        this._window = this.createWindow('marketplace_no_credits_xml');

        if(this._window == null) return;

        this._window.procedure = this.clickHandler;
        this._window.center();
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::showResult()
    showResult(result: number): void
    {
        const title = result === MarketplaceView.RESULT_SUCCESS
            ? '${inventory.marketplace.result.title.success}'
            : '${inventory.marketplace.result.title.failure}';

        // Every outcome, success or not, is a localization key indexed by the raw code — the client
        // never has to know what any of them mean.
        this._windowManager?.alert(title, `\${inventory.marketplace.result.${result}}`, 0, this.closeAlert);
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::showAlert()
    showAlert(title: string, message: string): void
    {
        this._windowManager?.alert(title, message, 0, this.closeAlert);
    }

    /**
     * The price history lines. Each hides itself when its value is not positive, so an item nobody
     * has ever sold shows no stats rather than three zeroes.
     */
    // AS3: .../inventory/marketplace/MarketplaceView.as::updateItemStats()
    updateItemStats(stats: MarketplaceItemStats | null, averagePricePeriod: number): void
    {
        if(this._window == null || this._localization == null || stats == null) return;

        this._suggestedPrice = stats.suggestedPrice;

        this.updatePriceStatLine('average_price', 'inventory.marketplace.make_offer.average_price', stats.averagePrice, averagePricePeriod);
        this.updatePriceStatLine('lowest_price', 'inventory.marketplace.make_offer.lowest_price', stats.lowestCurrentPrice);
        this.updatePriceStatLine('suggested_price', 'inventory.marketplace.make_offer.suggested_price', stats.suggestedPrice);

        const copyButton = this._window.findChildByName('copy_suggested_price_button');

        if(copyButton != null) copyButton.visible = stats.suggestedPrice > 0;
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this._pendingImageId === id) this.setFurniImage(data);
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::createWindow()
    private createWindow(assetName: string): IWindowContainer | null
    {
        if(this._assets == null || this._windowManager == null) return null;

        const window = this._windowManager.buildWidgetLayout(assetName) as IWindowContainer | null;

        if(window == null) log.warn(`Missing layout "${assetName}" — the marketplace dialog cannot open`);

        return window;
    }

    /**
     * AS3 blits the rendered furni into a fresh bitmap the size of the placeholder so it sits
     * centred. This port assigns it and lets the wrapper's own anchor centre it, as the other
     * ported previews do.
     */
    // AS3: .../inventory/marketplace/MarketplaceView.as::setFurniImage()
    private setFurniImage(image: ImageBitmap | null): void
    {
        if(image == null || this._window == null) return;

        const wrapper = this._window.findChildByName('furni_image') as IBitmapWrapperWindow | null;

        if(wrapper == null) return;

        wrapper.bitmap = image;
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::setText()
    private setText(name: string, text: string): void
    {
        const window = this._window?.findChildByName(name) as ITextWindow | null;

        if(window != null) window.text = text;
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::clickHandler()
    private clickHandler = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            switch(target.name)
            {
                case 'buy_tokens_button':
                    this._model?.buyMarketplaceTokens();
                    this.disposeView();
                    break;
                // Every cancel path releases the reserved stack. Closing the window is not enough:
                // the items stay locked until the model is told.
                case 'cancel_buy_tokens_button':
                case 'cancel_make_offer_button':
                case 'cancel_no_credits_button':
                case 'header_button_close':
                    this._model?.releaseItems();
                    this.disposeView();
                    break;
                case 'make_offer_button':
                {
                    const priceInput = this._window?.findChildByName('price_input') as ITextFieldWindow | null;

                    if(priceInput != null)
                    {
                        this._offerPrice = parseInt(priceInput.text, 10);
                        this._offerAmount = this.parseOfferAmount();

                        this.showConfirmation();
                    }

                    // Note AS3 disposes the dialog *outside* the null check, so a layout without a
                    // price field closes without asking anything. Preserved.
                    this.disposeView();
                    break;
                }
                case 'copy_suggested_price_button':
                {
                    if(this._suggestedPrice <= 0) break;

                    const priceInput = this._window?.findChildByName('price_input') as ITextFieldWindow | null;

                    if(priceInput != null)
                    {
                        priceInput.text = String(this._suggestedPrice);

                        // AS3 also pushes it to the system clipboard, inside a try/catch because
                        // Flash refused outside a user gesture. Not ported: the browser clipboard
                        // API is async and permission-gated, and the field is already filled.
                        this.checkPrice();
                    }

                    break;
                }
                case 'get_credits_button':
                    this._model?.releaseItems();
                    this.openCreditsPage();
                    this.disposeView();
                    break;
            }
        }

        if(event.type === 'WE_CHANGE' && (target.name === 'price_input' || target.name === 'amount_input'))
        {
            this.checkPrice();
        }
    };

    // AS3: .../inventory/marketplace/MarketplaceView.as::showConfirmation()
    private showConfirmation(): void
    {
        if(this._localization == null || this._windowManager == null) return;

        const finalPrice = this.calculateFinalPrice(this._offerPrice);
        const multiple = this._offerAmount > 1;

        // For a batch AS3 shows the *per-item* price the seller typed plus a computed total; for a
        // single item it shows what they will actually net.
        const key = multiple
            ? 'inventory.marketplace.confirm_offer.info.multiple'
            : 'inventory.marketplace.confirm_offer.info';

        const message = multiple
            ? this._localization.getLocalizationWithParams(
                key, key,
                'amount', String(this._offerAmount),
                'furniname', this._furniName,
                'price', String(this._offerPrice),
                'total', String(finalPrice * this._offerAmount)
            )
            : this._localization.getLocalizationWithParams(
                key, key, 'furniname', this._furniName, 'price', String(finalPrice)
            );

        const title = this._localization.getLocalization(
            'inventory.marketplace.confirm_offer.title', 'inventory.marketplace.confirm_offer.title'
        );

        this._windowManager.confirm(title, message, 0, this.confirmationCallback);
    }

    /**
     * Note the release runs on *both* answers: declining still has to give the stack back.
     */
    // AS3: .../inventory/marketplace/MarketplaceView.as::confirmationCallback()
    private confirmationCallback = (dialog: {dispose(): void}, event: WindowEvent): void =>
    {
        dialog.dispose();

        if(this._model == null) return;

        if(event.type === 'WE_OK') this._model.makeOffer(this._offerPrice, this._offerAmount);

        this._model.releaseItems();
    };

    // AS3: .../inventory/marketplace/MarketplaceView.as::closeAlert()
    private closeAlert = (dialog: {dispose(): void}, _event: WindowEvent): void =>
    {
        this._model?.releaseItems();

        dialog.dispose();
    };

    // AS3: .../inventory/marketplace/MarketplaceView.as::openCreditsPage()
    private openCreditsPage(): void
    {
        HabboWebTools.openWebPageAndMinimizeClient(this._habboInventory.getProperty('web.shop.relativeUrl') ?? '');
    }

    /**
     * What the seller nets. The deduction is a flat percentage *plus* a term proportional to the
     * price over `halfTaxLimit`, so it grows with the listing — the rounding is AS3's own
     * (`ceil(round(1000 * …) / 1000)`), kept verbatim because it decides the displayed figure.
     */
    // AS3: .../inventory/marketplace/MarketplaceView.as::calculateFinalPrice()
    private calculateFinalPrice(price: number): number
    {
        if(this._model == null) return price;

        const fee = Math.ceil(
            Math.round(1000 * (price * (this._model.sellingFeePercentage / 100 + 0.5 * price / this._model.halfTaxLimit))) / 1000
        );

        return price - fee;
    }

    /**
     * Runs on every keystroke. Note it *rewrites* the field when the price is over the maximum —
     * the user cannot type past the cap — but leaves a too-low price alone and disables the button
     * instead, because they are still typing.
     */
    // AS3: .../inventory/marketplace/MarketplaceView.as::checkPrice()
    private checkPrice(): void
    {
        if(this._window == null || this._model == null || this._localization == null) return;

        const priceInput = this._window.findChildByName('price_input') as ITextFieldWindow | null;

        if(priceInput == null) return;

        let price = parseInt(priceInput.text, 10);

        if(price > this._model.offerMaxPrice)
        {
            priceInput.text = String(this._model.offerMaxPrice);
            price = this._model.offerMaxPrice;
        }

        this._offerAmount = this.parseOfferAmount();

        const finalPrice = this.calculateFinalPrice(price);
        const button = this._window.findChildByName('make_offer_button');
        const finalPriceLabel = this._window.findChildByName('final_price') as ITextWindow | null;

        if(button == null || finalPriceLabel == null) return;

        // NaN — an empty field — fails this comparison, which is how a blank price disables the
        // button rather than reading as zero.
        if(!(price >= this._model.offerMinPrice))
        {
            this._localization.registerParameter('shop.marketplace.invalid.price', 'minPrice', String(this._model.offerMinPrice));
            this._localization.registerParameter('shop.marketplace.invalid.price', 'maxPrice', String(this._model.offerMaxPrice));

            finalPriceLabel.text = '${shop.marketplace.invalid.price}';
            button.disable();
        }
        else
        {
            finalPriceLabel.text = `${this._localization.getLocalization('sell.in.marketplace.revenue.label')}: ${finalPrice}`;
            button.enable();
        }
    }

    /**
     * Clamps and writes the amount back into the field, so an out-of-range number is corrected in
     * front of the user rather than silently reinterpreted.
     */
    // AS3: .../inventory/marketplace/MarketplaceView.as::parseOfferAmount()
    private parseOfferAmount(): number
    {
        const amountInput = this._window?.findChildByName('amount_input') as ITextFieldWindow | null;

        if(amountInput == null) return 1;

        let amount = parseInt(amountInput.text, 10);

        if(!(amount >= 1)) amount = 1;
        else if(amount > this._maxOfferAmount) amount = this._maxOfferAmount;

        amountInput.text = String(amount);

        return amount;
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::resetPriceStats()
    private resetPriceStats(): void
    {
        this._suggestedPrice = 0;

        this.setStatVisibility('average_price', false);
        this.setStatVisibility('lowest_price', false);
        this.setStatVisibility('suggested_price', false);
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::updatePriceStatLine()
    private updatePriceStatLine(name: string, key: string, price: number, days: number = -1): void
    {
        const label = this._window?.findChildByName(name) as ITextWindow | null;

        if(label == null || this._localization == null) return;

        if(price <= 0)
        {
            label.visible = false;
            label.text = '';

            return;
        }

        if(days >= 0) this._localization.registerParameter(key, 'days', String(days));

        this._localization.registerParameter(key, 'price', String(price));

        label.text = this._localization.getLocalization(key);
        label.visible = true;
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::setStatVisibility()
    private setStatVisibility(name: string, visible: boolean): void
    {
        const window = this._window?.findChildByName(name);

        if(window != null) window.visible = visible;
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::disposeView()
    private disposeView(): void
    {
        if(this._window != null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../inventory/marketplace/MarketplaceView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._model = null;
        this._assets = null;
        this._windowManager = null;
        this._roomEngine = null;
        this._localization = null;

        this.disposeView();

        this._disposed = true;
    }
}
