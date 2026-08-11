import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import {ToolbarDisplayExtensionIds} from '@habbo/toolbar/ToolbarDisplayExtensionIds';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IProductDataListener} from '@habbo/session/product/IProductDataListener';
import {TargetedOfferMessageEvent} from '@habbo/communication/messages/incoming/catalog/TargetedOfferMessageEvent';
import {TargetedOfferNotFoundMessageEvent} from '@habbo/communication/messages/incoming/catalog/TargetedOfferNotFoundMessageEvent';
import type {TargetedOfferMessageParser} from '@habbo/communication/messages/parser/catalog/TargetedOfferMessageParser';
import {GetNextTargetedOfferComposer} from '@habbo/communication/messages/outgoing/catalog/GetNextTargetedOfferComposer';
import {SetTargetedOfferStateComposer} from '@habbo/communication/messages/outgoing/catalog/SetTargetedOfferStateComposer';
import {PurchaseTargetedOfferComposer} from '@habbo/communication/messages/outgoing/catalog/PurchaseTargetedOfferComposer';
import {ShopTargetedOfferViewedComposer} from '@habbo/communication/messages/outgoing/catalog/ShopTargetedOfferViewedComposer';
import {EventLogMessageComposer} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import type {HabboCatalog} from '../HabboCatalog';
import {PurseUpdateEvent} from '../purse/PurseUpdateEvent';
import type {HabboMallOffer} from './data/HabboMallOffer';
import {TargetedOffer} from './data/TargetedOffer';
import {MallOfferDialogView} from './MallOfferDialogView';
import {MallOfferMinimizedView} from './MallOfferMinimizedView';
import type {OfferView} from './OfferView';
import {TargetedOfferDialogView} from './TargetedOfferDialogView';
import {TargetedOfferMinimizedView} from './TargetedOfferMinimizedView';
import {TargetedOfferPurchaseConfirmationView} from './TargetedOfferPurchaseConfirmationView';
import {MallOfferExternalInterfaceHelper} from './util/MallOfferExternalInterfaceHelper';
import {TargetedOfferLogEvent} from './util/TargetedOfferLogEvent';

/**
 * Owns the single targeted offer a player may be shown, and the one view that displays it.
 *
 * Two sources feed it. The server pushes a `TargetedOffer` (header 2155) in reply to
 * `GetNextTargetedOfferComposer`, which goes out as soon as the product data is ready — the offer
 * names its contents by product code, so asking earlier would give the views nothing to print. If
 * the server answers "none" (2013) instead, the controller falls back to the Habbo Mall offer that
 * the surrounding web page can hand over through `MallOfferExternalInterfaceHelper`.
 *
 * Only ever one view at a time: every show path calls `destroyView()` first, and the minimized
 * ones live in the toolbar's extension slot rather than as free windows.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/OfferController.as
 */
export class OfferController implements IProductDataListener, IDisposable
{
    /**
     * AS3 tracking states. Only 4 and 2 are branched on by name — 4 means the player has already
     * pushed the offer aside, so it comes back minimized; 2 means suppressed entirely.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::onTargetedOffer() (the literal 4)
    private static readonly TRACKING_STATE_MINIMIZED: number = 4;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::onHabboMallOffer() (the literal 2)
    private static readonly TRACKING_STATE_SUPPRESSED: number = 2;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::_offerDialog
    private _offerDialog: TargetedOfferDialogView | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::_SafeStr_6859 (the mall dialog)
    private _mallOfferDialog: MallOfferDialogView | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::_SafeStr_6366 (the minimized view)
    private _minimizedView: OfferView | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::_SafeStr_6892 (the confirmation)
    private _confirmationView: TargetedOfferPurchaseConfirmationView | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::_SafeStr_7337 (the ExternalInterface bridge)
    private _externalInterfaceHelper: MallOfferExternalInterfaceHelper | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::_catalog
    private _catalog: HabboCatalog;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::OfferController()
    constructor(catalog: HabboCatalog)
    {
        this._catalog = catalog;
        this._catalog.connection?.addMessageEvent(new TargetedOfferMessageEvent(this.onTargetedOffer));
        this._catalog.connection?.addMessageEvent(new TargetedOfferNotFoundMessageEvent(this.onTargetedOfferNotFound));
        this._catalog.events.on(PurseUpdateEvent.UPDATE, this.onPurseUpdate);
        this._catalog.sessionDataManager?.addProductsReadyEventListener(this);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::get catalog()
    get catalog(): HabboCatalog
    {
        return this._catalog;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::productDataReady()
    productDataReady(): void
    {
        this._catalog.connection?.send(new GetNextTargetedOfferComposer());
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::onTargetedOffer()
    private onTargetedOffer = (event: IMessageEvent): void =>
    {
        const parser = event.parser as TargetedOfferMessageParser | null;

        if(parser == null || parser.data == null) return;

        const offer = new TargetedOffer(parser.data);

        if(offer.trackingState === OfferController.TRACKING_STATE_MINIMIZED) this.minimizeOffer(offer);
        else this.maximizeOffer(offer);
    };

    /**
     * No offer from the server is not the end of it — this is where the client starts asking the
     * surrounding page whether *it* has one.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::onTargetedOfferNotFound()
    private onTargetedOfferNotFound = (_event: IMessageEvent): void =>
    {
        this._externalInterfaceHelper = new MallOfferExternalInterfaceHelper(this);
    };

    /**
     * Note the double guard on state 2: AS3 returns early *and* keeps a `case 2: return` inside the
     * switch. Ported as written — the switch arm is unreachable, not wrong.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::onHabboMallOffer()
    onHabboMallOffer(offer: HabboMallOffer): void
    {
        if(offer.trackingState === OfferController.TRACKING_STATE_SUPPRESSED) return;

        switch(offer.trackingState)
        {
            case 0:
            case 5:
            case 6:
                this.maximizeMallOffer(offer);
                break;
            case OfferController.TRACKING_STATE_SUPPRESSED:
                return;
            default:
                this.minimizeMallOffer(offer);
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::maximizeMallOffer()
    maximizeMallOffer(offer: HabboMallOffer): void
    {
        if(this._mallOfferDialog) return;

        this.destroyView();

        this._mallOfferDialog = new MallOfferDialogView(this, offer);
        this._catalog.connection?.send(new ShopTargetedOfferViewedComposer(offer.targetedOfferId, 6));
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::minimizeMallOffer()
    minimizeMallOffer(offer: HabboMallOffer, _unused: boolean = false): void
    {
        this.destroyView();

        this._minimizedView = new MallOfferMinimizedView(this, offer);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::onHabboMallOfferOpened()
    onHabboMallOfferOpened(offer: HabboMallOffer): void
    {
        this._catalog.connection?.send(new ShopTargetedOfferViewedComposer(offer.targetedOfferId, 1));
        this._catalog.openCreditsHabblet();
        this.minimizeMallOffer(offer);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::onHabboMallOfferClosed()
    onHabboMallOfferClosed(offer: HabboMallOffer): void
    {
        this._catalog.connection?.send(new ShopTargetedOfferViewedComposer(offer.targetedOfferId, 4));
        this.minimizeMallOffer(offer);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::minimizeOffer()
    minimizeOffer(offer: TargetedOffer): void
    {
        this.destroyView();

        this._minimizedView = new TargetedOfferMinimizedView(this, offer);
        this._catalog.connection?.send(new SetTargetedOfferStateComposer(offer.id, 4));
    }

    /**
     * An expired offer is shown as nothing at all — the `isExpired()` guard means `destroyView()`
     * has already run and no replacement is built.
     *
     * The layout can be overridden per offer id through the `targeted.offer.override.layout.<id>`
     * config key, which is how a campaign ships its own dialog art without a client release.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::maximizeOffer()
    maximizeOffer(offer: TargetedOffer): void
    {
        if(this._offerDialog) return;

        this.destroyView();

        if(offer.isExpired()) return;

        const layoutOverride = this.getLayoutOverride(offer);

        this._offerDialog = new TargetedOfferDialogView(this, offer);

        if(layoutOverride != null && layoutOverride.length > 0 && this._catalog.assets?.hasAsset(layoutOverride))
        {
            this._offerDialog.buildWindow(layoutOverride);
        }
        else
        {
            this._offerDialog.buildWindow('targeted_offer_dialog_xml');
        }

        this._catalog.connection?.send(new SetTargetedOfferStateComposer(offer.id, 1));
    }

    /**
     * The purchase limit decides what the player sees next: an offer that can still be bought again
     * stays around minimized, one that cannot disappears entirely.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::purchaseTargetedOffer()
    purchaseTargetedOffer(offer: TargetedOffer, amount: number): void
    {
        this._catalog.connection?.send(new PurchaseTargetedOfferComposer(offer.id, amount));

        offer.purchased(amount);

        if(offer.purchaseLimit > 0) this.minimizeOffer(offer);
        else this.destroyView();
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::sendLogEvent()
    sendLogEvent(action: string, extraString: string = ''): void
    {
        if(!this._catalog || !this._catalog.connection) return;

        this._catalog.connection.send(new EventLogMessageComposer('TargetedOffers', 'FLASH.UNKNOWN', action, extraString));
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::purchaseCredits()
    purchaseCredits(offer: TargetedOffer): void
    {
        this.sendLogEvent(TargetedOfferLogEvent.TARGETED_OFFER_OPEN_CREDITS_PAGE_CLICKED, offer.identifier);
        this._catalog.openCreditsHabblet();
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::attachExtension()
    attachExtension(window: IWindow): void
    {
        this._catalog.toolbar?.extensionView?.attachExtension(ToolbarDisplayExtensionIds.TARGETED_OFFER, window, 13);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::showConfirmation()
    showConfirmation(offer: TargetedOffer, amount: number): void
    {
        if(this._confirmationView) return;

        this.destroyView();

        this._confirmationView = new TargetedOfferPurchaseConfirmationView(this, offer, amount);
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::onPurseUpdate()
    private onPurseUpdate = (_event: PurseUpdateEvent): void =>
    {
        this._offerDialog?.updateButtonStates();
    };

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::destroyView()
    destroyView(): void
    {
        if(this._offerDialog)
        {
            this._offerDialog.dispose();
            this._offerDialog = null;
        }

        if(this._mallOfferDialog)
        {
            this._mallOfferDialog.dispose();
            this._mallOfferDialog = null;
        }

        if(this._minimizedView)
        {
            this._catalog.toolbar?.extensionView?.detachExtension(ToolbarDisplayExtensionIds.TARGETED_OFFER);
            this._minimizedView.dispose();
            this._minimizedView = null;
        }

        if(this._confirmationView)
        {
            this._confirmationView.dispose();
            this._confirmationView = null;
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::getLayoutOverride()
    private getLayoutOverride(offer: TargetedOffer): string
    {
        return this._catalog.getProperty(`targeted.offer.override.layout.${offer.id}`);
    }

    /**
     * Note what is *not* here: AS3 never assigns `_disposed`, so `get disposed()` answers false
     * forever, even after this has run. Left alone rather than "completed" — nothing reads it, and
     * flipping it would change when a DI container considers this controller dead.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferController.as::dispose()
    dispose(): void
    {
        this.destroyView();

        if(this._externalInterfaceHelper)
        {
            this._externalInterfaceHelper.dispose();
            this._externalInterfaceHelper = null;
        }
    }
}
