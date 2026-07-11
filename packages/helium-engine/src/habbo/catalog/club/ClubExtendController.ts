import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {EventLogMessageComposer} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import type {HabboClubExtendOfferMessageEventParser} from '@habbo/communication/messages/parser/catalog/HabboClubExtendOfferMessageEventParser';
import type {HabboCatalog} from '../HabboCatalog';
import type {ClubExtendOfferData} from './ClubExtendOfferData';
import {ClubExtendConfirmationDialog} from './ClubExtendConfirmationDialog';

/**
 * Drives the Habbo Club/VIP membership *extension* flow (renew-before-expiry upsell dialog).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/ClubExtendController.as
 */
export class ClubExtendController
{
    private _catalog: HabboCatalog | null;

    private _confirmationDialog: ClubExtendConfirmationDialog | null = null;

    private _offer: ClubExtendOfferData | null = null;

    private _disposed: boolean = false;

    constructor(catalog: HabboCatalog)
    {
        this._catalog = catalog;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this.closeConfirmation();
        this._offer = null;
        this._catalog = null;
        this._disposed = true;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/ClubExtendController.as::onOffer()
    // Takes the raw incoming event (not its parser) and extracts the parser/offer itself - unlike
    // ClubBuyController.onOffers(), which HabboCatalog's own handler unwraps before calling. A
    // genuine inconsistency in the primary source between these two otherwise-similar handlers,
    // preserved as-is.
    onOffer(event: IMessageEvent): void
    {
        if(this._disposed) return;

        const parser = event.parser as HabboClubExtendOfferMessageEventParser | null;

        this._offer = parser?.offer() ?? null;

        if(!this._offer) return;

        this.showConfirmation();

        if(this._catalog?.connection)
        {
            const dialogKey = this._offer.vip ? 'vip.membership.extension.purchase' : 'basic.membership.extension.purchase';

            this._catalog.connection.send(new EventLogMessageComposer('Catalog', 'dialog_show', dialogKey));
        }
    }

    closeConfirmation(): void
    {
        this._confirmationDialog?.dispose();
        this._confirmationDialog = null;
    }

    showConfirmation(): void
    {
        this.closeConfirmation();

        if(!this._offer) return;

        this._confirmationDialog = new ClubExtendConfirmationDialog(this, this._offer);
        this._confirmationDialog.showConfirmation();
    }

    confirmSelection(): void
    {
        if(!this._catalog || !this._catalog.connection || !this._offer) return;

        if(this._catalog.getPurse().credits < this._offer.priceInCredits)
        {
            this._catalog.showNotEnoughCreditsAlert();

            return;
        }

        if(this._offer.vip)
        {
            this._catalog.purchaseVipMembershipExtension(this._offer.offerId);
        }
        else
        {
            this._catalog.purchaseBasicMembershipExtension(this._offer.offerId);
        }

        this.closeConfirmation();
    }

    get windowManager(): IHabboWindowManager | null
    {
        return this._catalog?.windowManager ?? null;
    }

    get localization(): IHabboLocalizationManager | null
    {
        return this._catalog?.localization ?? null;
    }

    get assets(): IAssetLibrary | null
    {
        return this._catalog?.assets ?? null;
    }

    // AS3's config getter just returns the catalog itself (HabboCatalog doubles as a config
    // accessor) - exposed here as the concrete HabboCatalog type instead of casting to a narrower
    // config interface, since ClubExtendConfirmationDialog also needs catalog.utils/assets off it.
    get config(): HabboCatalog | null
    {
        return this._catalog;
    }
}
