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
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import {AvatarAction} from '@habbo/avatar/enum/AvatarAction';
import {textureToBitmap} from '@habbo/avatar/AvatarImageSnapshot';
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
// AS3: PurchaseConfirmationDialog.as:62 — `implements _SafeCls_67, _SafeCls_1739`, the first of
// which is IAvatarImageListener (it is what `createAvatarImage(..., this)` in the "r" branch takes).
export class PurchaseConfirmationDialog implements IDisposable, IGetImageListener, IAvatarImageListener
{
    // AS3: PurchaseConfirmationDialog.as::_window.color — the light (non-collectible) header tint.
    private static readonly WINDOW_COLOR: number = 4296112;

    // AS3: .../src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::_catalog
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

    // AS3: .../src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::_disposed
    private _disposed: boolean = false;

    constructor(catalog: HabboCatalog, windowManager: IHabboWindowManager)
    {
        this._catalog = catalog;
        this._windowManager = windowManager;
    }

    // AS3: .../src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::get disposed()
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
    // AS3: .../src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::showOffer()
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
            // AS3 writes `getProductData(localizationId)?.name` here, which is `null` when
            // productdata carries no row for the offer - and an unset caption leaves the layout's
            // own design placeholder ("001 lorem ipsum title that wraps around") on screen.
            //
            // Deviation, stated: fall back to `offer.localizationName`, which is AS3's own accessor
            // for this same string (`Offer.as::get localizationName()`) and answers `${<id>}` for a
            // missing row - so the dialog then shows exactly what the catalog page behind it shows
            // for the same offer, instead of a placeholder or a blank. Only the fallback differs;
            // when productdata has the row both paths return the identical name.
            productName.caption = catalog.getProductData(offer.localizationId)?.name || offer.localizationName;
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

        const freeQuantity = this._window.findChildByName('freeQuantity');

        if(freeQuantity) freeQuantity.visible = false;

        if(catalog.bundleDiscountEnabled)
        {
            const discountItemsCount = catalog.utils.getDiscountItemsCount(this._quantity);

            if(freeQuantity) freeQuantity.visible = discountItemsCount > 0;

            catalog.localization?.registerParameter('shop.bonus.items.count', 'amount', discountItemsCount.toString());
        }

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
     * Both halves of the ImageResult contract have to be honoured, exactly as AS3 does it
     * (`if(_loc6_ != null) { _loc13_ = _loc6_.data; _SafeStr_6872 = _loc6_.id; }`): a request whose
     * content is already loaded comes back **synchronously** with `id === 0` and `data` filled and
     * never calls `imageReady()`, while one that still has to load returns `id > 0` and answers
     * later. Reading only the callback is why the preview stayed blank for every cached furni — i.e.
     * essentially always, since the catalog has just rendered the same item in its grid.
     *
     * `ImageResult`'s own header still describes the old always-async behaviour; the body of
     * `RoomEngine.getGenericRoomObjectImage()` is what actually holds (it was changed to return
     * synchronously so the pet widgets' imageReady->updateImage chain would terminate).
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
        let image: ImageBitmap | null = null;

        switch(this.productType)
        {
            case 's':
                if(roomEngine)
                {
                    const result = roomEngine.getFurnitureImage(
                        classId, new Vector3d(90, 0, 0), 64, this, 0, extraParam, -1, -1, this._stuffData);

                    image = result.data;
                    this._pendingImageId = result.id;
                }

                break;
            case 'i':
                if(roomEngine)
                {
                    const result = roomEngine.getWallItemImage(
                        classId, new Vector3d(90, 0, 0), 64, this, 0, extraParam);

                    image = result.data;
                    this._pendingImageId = result.id;
                }

                break;
            case 'e':
                image = catalog.getPixelEffectIcon(classId);

                break;
            case 'h':
                image = catalog.getSubscriptionProductIcon(classId);

                break;
            case 'r':
                // A bot offer: `extraParam` is the bot's figure. The render lands through the
                // promise (and again through avatarImageReady() if the figure had to download), so
                // nothing is assigned to `image` here.
                void this.renderBotImage(extraParam);

                break;
            case 'chat_style':
                // `extraParam` is the style id. The library owns the bitmap — AS3 clones it because
                // assigning a BitmapData transfers ownership; the port's wrapper does not take it.
                image = catalog.freeFlowChat?.chatStyleLibrary?.getStyle(parseInt(extraParam))?.selectorPreview ?? null;

                break;
            default:
                // TODO(AS3): AS3 also renders "habbicon" here, via
                // HabbiconAssetManager.getPreviewBitmap(). The habbicon subsystem has no port —
                // the same gap HabboCatalog.isHabbiconOfferOwned() documents.
                log.warn(`No purchase-confirmation preview for product type "${this.productType}"`);
        }

        // AS3 calls setImage() unconditionally at the end of the branch; setImage() is null-guarded,
        // so the pending case falls through to imageReady() without clearing what is there.
        this.setImage(image);
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::avatarImageReady()
     *
     * The figure's assets have arrived; AS3 re-renders the preview from them, whatever figure it
     * was — the dialog only ever asks for one.
     *
     * TODO(AS3): AS3 also calls `updateGiftDialogAvatarImage()` when the ready figure is the
     * player's own. The gift flow is unported (see the class doc), so that half has nothing to
     * refresh yet.
     */
    // AS3: .../src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::avatarImageReady()
    avatarImageReady(figureString: string): void
    {
        if(this._catalog === null || this._window === null || this._window.disposed || this.disposed) return;

        void this.renderBotImage(figureString);
    }

    /**
     * AS3: PurchaseConfirmationDialog.as::updateImage() ("r" branch) and ::avatarImageReady() —
     * both build the same picture: body facing 3, waving, smiling, and the highlighted "full"
     * image rather than the cropped one.
     *
     * The render is asynchronous here for the reason `AvatarImageSnapshot` documents.
     */
    // AS3: .../src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::updateImage() ("r" branch)
    private async renderBotImage(figureString: string): Promise<void>
    {
        const avatarImage = this._catalog?.avatarRenderManager?.createAvatarImage(
            figureString, 'h', null, this, null
        ) ?? null;

        if(avatarImage === null) return;

        avatarImage.setDirection('full', 3);
        avatarImage.appendAction(AvatarAction.EXPRESSION_WAVE);
        avatarImage.appendAction(AvatarAction.GESTURE, AvatarAction.GESTURE_SMILE);

        const bitmap = await textureToBitmap(avatarImage.getImage('full', true));

        avatarImage.dispose();

        if(this.disposed) return;

        this.setImage(bitmap);
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
     * Enable or disable the gift dialog's send button
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::enableGiftButton()
    private enableGiftButton(enabled: boolean): void
    {
        if(this._window == null) return;

        if(enabled) this.safeEnable('give_gift_button');
        else this.safeDisable('give_gift_button');
    }

    /**
     * The server could not find the player this gift was addressed to
     *
     * Re-enables the send button so the name can be corrected and tried again — a rejected gift
     * is recoverable, unlike a rejected purchase.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::receiverNotFound()
    receiverNotFound(): void
    {
        if(this._disposed) return;

        this.enableGiftButton(true);

        this._windowManager?.alert(
            '${catalog.gift_wrapping.receiver_not_found.title}',
            '${catalog.gift_wrapping.receiver_not_found.info}',
            0,
            this.onReceiverNotFoundAlert
        );
    }

    /**
     * Dismissing the not-found alert leaves the dialog usable
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::alertHandler()
    // AS3 re-enables the button a second time here, after `receiverNotFound()` already did; kept,
    // because the alert is modal and the dialog behind it can be reached in between.
    private onReceiverNotFoundAlert = (dialog: IDisposable): void =>
    {
        dialog.dispose();

        this.enableGiftButton(true);
    };

    /**
     * AS3: PurchaseConfirmationDialog.as::notEnoughCredits()
     *
     * Note what AS3 does NOT do here: it never re-enables `buy_button`/`cancel_button`. A rejected
     * purchase leaves them dead on purpose and the close button is the way out - which is why the
     * one call that matters in the non-gift path is the `header_button_close` re-enable.
     *
     * TODO(AS3): AS3 additionally selects `use_free_checkbox` here, which belongs to the unported
     * gift flow. `enableGiftButton(true)` was on that list too and is no longer: the button is an
     * ordinary window child and `safeEnable()` already existed.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::notEnoughCredits()
    notEnoughCredits(): void
    {
        if(this._disposed || this._window == null) return;

        this.enableGiftButton(true);
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

    // AS3: .../src/com/sulake/habbo/catalog/purchase/PurchaseConfirmationDialog.as::dispose()
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
