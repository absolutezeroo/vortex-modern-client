import type {IDisposable} from '@core/runtime/IDisposable';
import {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {HabboCatalog} from '../HabboCatalog';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import {PurchaseFromCatalogComposer} from '@habbo/communication/messages/outgoing/catalog/PurchaseFromCatalogComposer';

/**
 * Minimal purchase confirmation: shows offer name + price, sends the real purchase
 * composer on confirm.
 *
 * TODO(AS3): sources/win63_version/habbo/catalog/PurchaseConfirmationDialog.as is ~1800 lines
 * covering gifting (gift-wrapping selection, recipient avatar preview, sender name), the
 * spending disclaimer, room-ad rental extension, and bundle-quantity purchases - none of that
 * is ported here; this only implements the base "confirm and buy" path (isGift is accepted but
 * not yet acted on - the real gift flow needs GetIsOfferGiftableComposer + the gift-wrapping UI).
 *
 * @see sources/win63_version/habbo/catalog/PurchaseConfirmationDialog.as
 */
export class PurchaseConfirmationDialog implements IDisposable
{
    private _catalog: HabboCatalog | null;

    private _windowManager: IHabboWindowManager | null;

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

    // AS3: sources/win63_version/habbo/catalog/PurchaseConfirmationDialog.as::showOffer()
    showOffer(
        offer: IPurchasableOffer,
        pageId: number,
        extraParam: string,
        quantity: number,
        _stuffData: IStuffData | null,
        _isGift: boolean
    ): void
    {
        const localization = this._catalog!.localization;
        const title = localization?.getLocalizationWithParams('catalog.purchase_confirmation.title', 'Confirm purchase') ?? 'Confirm purchase';
        const productName = offer.localizationName || offer.localizationId;
        const message = `${productName}\n${this.formatPrice(offer, quantity)}`;

        this._windowManager!.confirm(title, message, 0, (dialog: IDisposable, event: WindowEvent) =>
        {
            if(event.type === WindowEvent.WE_OK)
            {
                this._catalog!.connection?.send(new PurchaseFromCatalogComposer(pageId, offer.offerId, extraParam, quantity));
            }

            dialog.dispose();
            this.dispose();
        });
    }

    private formatPrice(offer: IPurchasableOffer, quantity: number): string
    {
        const parts: string[] = [];

        if(offer.priceInCredits > 0)
        {
            parts.push(`${offer.priceInCredits * quantity} credits`);
        }

        if(offer.priceInActivityPoints > 0)
        {
            parts.push(`${offer.priceInActivityPoints * quantity} points`);
        }

        if(offer.priceInSilver > 0)
        {
            parts.push(`${offer.priceInSilver * quantity} silver`);
        }

        return parts.join(', ');
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._catalog = null;
        this._windowManager = null;
        this._disposed = true;
    }
}
