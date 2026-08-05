import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import {Vector3d} from '@room/utils/Vector3d';
import {Logger} from '@core/utils/Logger';
import type {HabboCatalog} from '../HabboCatalog';
import {HabboCatalogUtils} from '../HabboCatalogUtils';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import {Offer} from '../viewer/Offer';
import {ClubBuyOfferData} from '../club/ClubBuyOfferData';
import {RentUtils} from '../viewer/widgets/utils/RentUtils';
import {CatalogWidgetEvent} from '../viewer/widgets/events/CatalogWidgetEvent';

const log = Logger.getLogger('habbo.catalog.purchase.PurchaseConfirmationDialog');

/**
 * The catalog's "Confirm purchase" dialog: product preview, localized product name, quantity,
 * price and the buy/cancel pair, built from the `purchase_confirmation` layout.
 *
 * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as
 * is ~1770 lines; this ports the base "confirm and buy" path only. Still missing, each blocked on
 * a type this port does not have yet:
 * - the gift flow (`showGiftDialog()` and everything under it: the `gift_wrapping` layout, receiver
 *   name lookup with suggestions, box/ribbon selectors, `giveGift()`). `isGift` is accepted and
 *   remembered but only ever takes the plain purchase path.
 * - GameTokensOffer / MintTokenPurchaseOffer / NftStorePurchaseOffer, and with them the
 *   `nft_image` widget branch, the dark window colour and `purchaseGameTokensOffer()` /
 *   `purchaseMintTokens()` / `purchaseNftOffer()`.
 * - the LTD raffle container (`hideRaffle()`'s notification half needs the raffle timer).
 * - `CatalogProductImages.hasProductImage()` / `PRODUCT_IMAGES`, the named-asset override that
 *   wins over a rendered preview for a handful of localization ids.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as
 */
export class PurchaseConfirmationDialog implements IDisposable, IGetImageListener
{
    // AS3: PurchaseConfirmationDialog.as::_window.color — the light (non-collectible) header tint.
    private static readonly WINDOW_COLOR: number = 4296112;

    private _catalog: HabboCatalog | null;

    private _windowManager: IHabboWindowManager | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::_offerId
    private _offerId: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::pageId
    // Name derived, not recovered: obfuscated as `_SafeStr_7494` in every tree, and the class did
    // not exist in the 2016 build. It is showOffer()'s `param4`, forwarded to purchaseProduct()'s
    // pageId. The five fields below are the same case - each is named after the showOffer()
    // parameter it stores and the call it is eventually handed to.
    private _pageId: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::extraParam
    private _extraParam: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::quantity
    private _quantity: number = 1;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::get productType()
    private _productType: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::stuffData
    private _stuffData: IStuffData | null = null;

    // TS-only: AS3 has no such flag - it infers a gift from `_receiverName` being non-empty, which
    // only the unported gift dialog ever sets. This carries HabboCatalog's `_purchaseWillBeGift`
    // across so isGiftPurchase() can answer before that dialog exists.
    private _purchaseWillBeGift: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::pendingImageId
    // Name derived (obfuscated `_SafeStr_6872`): the pending getFurnitureImage()/getWallItemImage()
    // request id, matched against imageReady()'s.
    private _pendingImageId: number = 0;

    private _disposed: boolean = false;

    constructor(catalog: HabboCatalog, windowManager: IHabboWindowManager)
    {
        this._catalog = catalog;
        this._windowManager = windowManager;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: PurchaseConfirmationDialog.as::get productType()
    get productType(): string
    {
        return this._productType;
    }

    // AS3: PurchaseConfirmationDialog.as::isGiftPurchase()
    isGiftPurchase(): boolean
    {
        return this._purchaseWillBeGift;
    }

    // AS3: PurchaseConfirmationDialog.as::getIconWrapper()
    getIconWrapper(): IBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('product_image') as unknown as IBitmapWrapperWindow | null) ?? null;
    }

    /**
     * AS3: PurchaseConfirmationDialog.as::showOffer()
     *
     * TS deviation from the AS3 signature: AS3 takes `(catalog, roomEngine, offer, pageId,
     * extraParam, quantity, stuffData, giftData, userName, previewImage)` because its dialog is
     * constructed with only a localization manager. This port's dialog is handed the catalog in its
     * constructor (see HabboCatalog.showPurchaseConfirmation()), so the first two are already known.
     */
    showOffer(
        offer: IPurchasableOffer,
        pageId: number,
        extraParam: string,
        quantity: number,
        stuffData: IStuffData | null,
        isGift: boolean
    ): void
    {
        if(!this._catalog) return;

        this._offerId = offer.offerId;
        this._pageId = pageId;
        this._extraParam = extraParam;
        this._quantity = quantity;
        this._stuffData = stuffData;
        this._purchaseWillBeGift = isGift;

        if(offer instanceof Offer && offer.product != null)
        {
            this._productType = offer.product.productType;
        }
        else if(offer instanceof ClubBuyOfferData || HabboCatalogUtils.buildersClub(offer.localizationId))
        {
            this._productType = 'h';
        }
        else
        {
            // AS3 falls through to the three collectible offer classes here and returns when the
            // offer is none of them; without those classes ported, every remaining offer returns.
            log.warn(`Unsupported offer class for the purchase confirmation: ${offer.localizationId}`);

            return;
        }

        this.showConfirmationDialog(offer);
        this._catalog.syncPlacedOfferWithPurchase(offer);
    }

    // AS3: PurchaseConfirmationDialog.as::showConfirmationDialog()
    private showConfirmationDialog(offer: IPurchasableOffer): void
    {
        const catalog = this._catalog;

        if(!catalog) return;

        this._window?.dispose();
        this._window = catalog.utils.createWindow('purchase_confirmation', 2) as unknown as IWindowContainer | null;

        if(!this._window) return;

        this._window.color = PurchaseConfirmationDialog.WINDOW_COLOR;

        this.updateLocalizations(offer);

        const priceBox = this._window.findChildByName('purchase_cost_box') as unknown as IWindowContainer | null;

        if(priceBox) catalog.utils.showPriceInContainer(priceBox, offer, this._quantity);

        this.addClickListener('buy_button', this._onBuyButtonClick);
        this.addClickListener('cancel_button', this._onClose);
        this.addClickListener('header_button_close', this._onClose);

        this.hideRaffle();
        this._window.center();

        if(catalog.getBoolean('disclaimer.credit_spending.enabled'))
        {
            const disclaimer = this._window.findChildByName('spending_disclaimer');

            disclaimer?.addEventListener(WindowMouseEvent.CLICK, this._onSpendingDisclaimerClicked);
            disclaimer?.addEventListener(WindowMouseEvent.DOUBLE_CLICK, this._onSpendingDisclaimerClicked);
            this.setDisclaimerAccepted(false);
        }
        else
        {
            this._window.findChildByName('disclaimer')?.dispose();
            this.setDisclaimerAccepted(true);
        }

        const productName = this._window.findChildByName('product_name');

        if(productName)
        {
            // AS3 reads the name off productdata, NOT off the offer: `getProductData(localizationId)?.name`.
            // A localization id with no productdata row leaves this empty in AS3 too — that is a
            // catalog-data problem (the offer is named something productdata does not carry), not a
            // client one, so it is deliberately not papered over with a fallback here.
            productName.caption = catalog.getProductData(offer.localizationId)?.name ?? '';
        }

        const quantity = this._window.findChildByName('quantity');

        if(quantity)
        {
            if(catalog.multiplePurchaseEnabled && this._quantity > 1)
            {
                quantity.caption = `X ${this._quantity}`;
            }
            else
            {
                const properties = this._window.findChildByName('properties_itemlist') as unknown as IItemListWindow | null;

                properties?.removeListItem(quantity as unknown as IWindow);
            }
        }

        // TODO(AS3): the bundle-discount branch that follows in AS3 shows `freeQuantity` with
        // `HabboCatalogUtils.getDiscountItemsCount(quantity)`; that helper is not ported (see
        // SpinnerCatalogWidget's matching note), so the row stays hidden as it does when the
        // feature is off.
        const freeQuantity = this._window.findChildByName('freeQuantity');

        if(freeQuantity) freeQuantity.visible = false;

        // The collectibles previewer is not ported; the layout still carries its widget on top of
        // the bitmap, so it has to be taken out of the way or it covers the product image.
        const nftImage = this._window.findChildByName('nft_image');

        if(nftImage) nftImage.visible = false;

        this.showProductImage(offer);

        RentUtils.updateBuyCaption(offer, this._window.findChildByName('buy_button'));
    }

    /**
     * AS3: PurchaseConfirmationDialog.as::showConfirmationDialog() — the `getIconWrapper()` tail.
     *
     * The furni/wall requests answer through imageReady(); this port's RoomEngine always resolves
     * them that way, even for a cached asset (see ImageResult), so nothing is read synchronously.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::showConfirmationDialog()
    private showProductImage(offer: IPurchasableOffer): void
    {
        const catalog = this._catalog;

        if(!catalog || this.getIconWrapper() == null) return;

        const product = offer instanceof Offer ? offer.product : null;

        if(product == null) return;

        const roomEngine = catalog.roomEngine;
        const classId = product.productClassId;
        const extraParam = product.extraParam;

        switch(this.productType)
        {
            case 's':
                if(roomEngine)
                {
                    this._pendingImageId = roomEngine.getFurnitureImage(
                        classId, new Vector3d(90, 0, 0), 64, this, 0, extraParam, -1, -1, this._stuffData).id;
                }

                break;
            case 'i':
                if(roomEngine)
                {
                    this._pendingImageId = roomEngine.getWallItemImage(
                        classId, new Vector3d(90, 0, 0), 64, this, 0, extraParam).id;
                }

                break;
            case 'e':
                this.setImage(catalog.getPixelEffectIcon(classId));

                break;
            case 'h':
                this.setImage(catalog.getSubscriptionProductIcon(classId));

                break;
            default:
                // TODO(AS3): AS3 also renders "r" (an avatar figure via createAvatarImage),
                // "chat_style" (the chat-style selector preview) and "habbicon"
                // (HabbiconAssetManager.getPreviewBitmap()). None of the three sources is
                // reachable from here in this port yet.
                log.warn(`No purchase-confirmation preview for product type "${this.productType}"`);
        }
    }

    // AS3: PurchaseConfirmationDialog.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(id !== this._pendingImageId) return;

        this._pendingImageId = 0;
        this.setImage(data);
    }

    // AS3: PurchaseConfirmationDialog.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    /**
     * AS3: PurchaseConfirmationDialog.as::setImage()
     *
     * AS3 allocates a BitmapData the size of the wrapper and blits the preview into its centre;
     * the wrapper is a fixed 126x152 slot in the layout, so a small icon must not stretch to fill
     * it. The OffscreenCanvas here is the same operation — the port's bitmap wrappers take an
     * ImageBitmap, and assigning the raw preview would let fitSize() scale it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::setImage()
    private setImage(image: ImageBitmap | null): void
    {
        if(this._disposed || image == null) return;

        const wrapper = this.getIconWrapper();

        if(wrapper == null) return;

        const width = Math.max(1, wrapper.width);
        const height = Math.max(1, wrapper.height);
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');

        if(context == null) return;

        context.drawImage(image, Math.floor((width - image.width) * 0.5), Math.floor((height - image.height) * 0.5));

        wrapper.bitmap = canvas.transferToImageBitmap();
        image.close();
    }

    // AS3: PurchaseConfirmationDialog.as::updateLocalizations()
    private updateLocalizations(offer: IPurchasableOffer): void
    {
        const name = this._catalog?.getProductData(offer.localizationId)?.name ?? '';

        this._windowManager?.registerLocalizationParameter('catalog.purchase.confirmation.dialog.costs', 'offer_name', name);
    }

    // AS3: PurchaseConfirmationDialog.as::addClickListener()
    private addClickListener(name: string, listener: (event: WindowEvent) => void): void
    {
        this._window?.findChildByName(name)?.addEventListener(WindowMouseEvent.CLICK, listener);
    }

    /**
     * AS3: PurchaseConfirmationDialog.as::hideRaffle()
     *
     * TODO(AS3): AS3 also raises the "${notification.raffle.ongoing}" notification when a raffle
     * timer was running. The LTD raffle timer is not ported, so only the hide half exists.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::hideRaffle()
    private hideRaffle(): void
    {
        const raffle = this._window?.findChildByName('raffle_container');

        if(raffle != null && raffle.visible) raffle.visible = false;
    }

    // AS3: PurchaseConfirmationDialog.as::setDisclaimerAccepted()
    private setDisclaimerAccepted(accepted: boolean): void
    {
        const button = this._window?.findChildByName('buy_button');

        if(button == null) return;

        if(accepted) button.enable();
        else button.disable();
    }

    // AS3: PurchaseConfirmationDialog.as::onSpendingDisclaimerClicked()
    // AS3 reads the checkbox off `param1.target`; this port's dispatcher hands listeners the event
    // only (no second `window` argument), so the target is the sole way to reach it.
    private _onSpendingDisclaimerClicked = (event: WindowEvent): void =>
    {
        const checkbox = event.target as unknown as ISelectableWindow | null;

        if(checkbox != null) this.setDisclaimerAccepted(checkbox.isSelected);
    };

    // AS3: PurchaseConfirmationDialog.as::onBuyButtonClick()
    private _onBuyButtonClick = (): void =>
    {
        const catalog = this._catalog;

        if(!catalog) return;

        // AS3 disables all three before sending, so a second click cannot double-buy while the
        // server answer is in flight. `publish_check` belongs to the room-ad variant of the layout.
        this.safeDisable('buy_button');
        this.safeDisable('cancel_button');
        this.safeDisable('publish_check');

        catalog.purchaseProduct(this._pageId, this._offerId, this._extraParam, this._quantity);
        catalog.currentPage?.dispatchWidgetEvent(new CatalogWidgetEvent('PURCHASE'));
    };

    // AS3: PurchaseConfirmationDialog.as::onClose()
    private _onClose = (): void =>
    {
        this._catalog?.resetPlacedOfferData();
        this.dispose();
    };

    // AS3: PurchaseConfirmationDialog.as::safeDisable()
    private safeDisable(name: string): void
    {
        this._window?.findChildByName(name)?.disable();
    }

    // AS3: PurchaseConfirmationDialog.as::safeEnable()
    private safeEnable(name: string): void
    {
        this._window?.findChildByName(name)?.enable();
    }

    /**
     * AS3: PurchaseConfirmationDialog.as::notEnoughCredits()
     *
     * Note what AS3 does NOT do here: it never re-enables `buy_button`/`cancel_button`. A rejected
     * purchase leaves them dead on purpose and the close button is the way out - which is why the
     * one call that matters in the non-gift path is the `header_button_close` re-enable.
     *
     * TODO(AS3): the two gift-dialog halves - `enableGiftButton(true)` and selecting
     * `use_free_checkbox` - belong to the unported gift flow.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::notEnoughCredits()
    notEnoughCredits(): void
    {
        if(this._disposed || this._window == null) return;

        this.safeEnable('header_button_close');
    }

    /**
     * AS3: PurchaseConfirmationDialog.as::ltdRaffleEnded()
     *
     * TODO(AS3): AS3 also stops the raffle countdown timer; the timer is not ported, so only the
     * container hide it shares with hideRaffle() is here.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::ltdRaffleEnded()
    ltdRaffleEnded(): void
    {
        if(this._disposed) return;

        const raffle = this._window?.findChildByName('raffle_container');

        if(raffle != null) raffle.visible = false;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this.hideRaffle();

        this._disposed = true;
        this._catalog = null;
        this._windowManager = null;
        this._offerId = -1;
        this._pageId = -1;
        this._extraParam = '';
        this._stuffData = null;
        this._pendingImageId = 0;
        this._window?.dispose();
        this._window = null;
    }
}
