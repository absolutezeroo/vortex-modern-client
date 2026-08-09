/**
 * RentConfirmationWindow
 *
 * "Extend this rental?" / "Buy this out?" — one dialog for both, and the server decides which.
 *
 * The flow is a round trip rather than a straight open: `show()` sends a quote request and returns;
 * the dialog is only built when the answer arrives, which is why an item whose price the user
 * cannot afford never opens a window at all — it shows the not-enough-credits alert instead.
 *
 * The three modes decide what the OK button sends. AS3 picks them from the arguments rather than
 * from an enum: an infostand id means the item is standing in a room, a strip id means it is in the
 * inventory, and the explicit `fromCatalogue` flag means it is a rent offer being bought outright.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/purchase/RentConfirmationWindow.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {HabboCatalog} from '../HabboCatalog';
import {RentOrBuyoutOfferMessageEvent} from '@habbo/communication/messages/incoming/rent/RentOrBuyoutOfferMessageEvent';
import type {RentOrBuyoutOfferMessageParser} from '@habbo/communication/messages/parser/rent/RentOrBuyoutOfferMessageParser';
import {GetRentOrBuyoutOfferMessageComposer} from '@habbo/communication/messages/outgoing/rent/GetRentOrBuyoutOfferMessageComposer';
import {ExtendRentOrBuyoutFurniMessageComposer} from '@habbo/communication/messages/outgoing/rent/ExtendRentOrBuyoutFurniMessageComposer';
import {ExtendRentOrBuyoutStripItemMessageComposer} from '@habbo/communication/messages/outgoing/rent/ExtendRentOrBuyoutStripItemMessageComposer';
import {Vector3d} from '@room/utils/Vector3d';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.catalog.purchase.RentConfirmationWindow');

/**
 * AS3 renders the preview at direction 90 and scale 64 — the same three-quarter view the catalogue
 * uses. Names DERIVED; both are bare literals in AS3.
 */
// AS3: .../catalog/purchase/RentConfirmationWindow.as::onFurniRentOrBuyoutOffer()
const PREVIEW_DIRECTION: number = 90;
const PREVIEW_SCALE: number = 64;

export class RentConfirmationWindow implements IDisposable, IGetImageListener
{
    // AS3: .../catalog/purchase/RentConfirmationWindow.as::MODE_INFOSTAND
    private static readonly MODE_INFOSTAND: number = 1;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::MODE_INVENTORY
    private static readonly MODE_INVENTORY: number = 2;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::MODE_CATALOGUE
    private static readonly MODE_CATALOGUE: number = 3;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_catalog
    private _catalog: HabboCatalog;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_offerMessageEvent
    private _offerMessageEvent: IMessageEvent | null = null;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_isBuyout
    private _isBuyout: boolean = false;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_SafeStr_4872 (name derived: pending image id)
    private _pendingImageId: number = -1;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_SafeStr_4620 (name derived: the furni being quoted)
    private _furniData: IFurnitureData | null = null;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_mode
    private _mode: number = RentConfirmationWindow.MODE_INVENTORY;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_SafeStr_8603 (name derived: the room object id)
    private _objectId: number = -1;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::_SafeStr_8814 (name derived: the inventory strip id)
    private _stripId: number = -1;

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::RentConfirmationWindow()
    constructor(catalog: HabboCatalog)
    {
        this._catalog = catalog;

        this._offerMessageEvent = new RentOrBuyoutOfferMessageEvent(this.onFurniRentOrBuyoutOffer);

        this._catalog.communication?.addMessageEvent(this._offerMessageEvent);
    }

    /**
     * Asks for the quote. Nothing is shown yet — the dialog is built by the reply, so a refusal or
     * an unaffordable price never puts a window on screen.
     */
    // AS3: .../catalog/purchase/RentConfirmationWindow.as::show()
    show(furniData: IFurnitureData | null, buyout: boolean, objectId: number = -1, stripId: number = -1, fromCatalogue: boolean = false): void
    {
        this.close();

        if(furniData === null) return;

        this._furniData = furniData;
        this._objectId = objectId;
        this._stripId = stripId;

        // AS3 derives the mode from which id it was given rather than passing one.
        if(fromCatalogue) this._mode = RentConfirmationWindow.MODE_CATALOGUE;
        else if(this._objectId > -1) this._mode = RentConfirmationWindow.MODE_INFOSTAND;
        else this._mode = RentConfirmationWindow.MODE_INVENTORY;

        this._catalog.connection?.send(
            new GetRentOrBuyoutOfferMessageComposer(furniData.type === 'i', furniData.fullName, buyout)
        );
    }

    /**
     * The quote came back. The type-name check is what keeps a late reply for a furni the user has
     * moved on from out of the current dialog.
     */
    // AS3: .../catalog/purchase/RentConfirmationWindow.as::onFurniRentOrBuyoutOffer()
    private onFurniRentOrBuyoutOffer = (event: IMessageEvent): void =>
    {
        if(this._furniData === null) return;

        const parser = event.parser as RentOrBuyoutOfferMessageParser | null;

        if(parser === null || this._furniData.fullName !== parser.furniTypeName) return;

        this._isBuyout = parser.buyout;

        // Both checks come before the window is built, so an unaffordable offer shows an alert
        // instead of a dialog the user could not act on.
        if((this._catalog.getPurse()?.credits ?? 0) < parser.priceInCredits)
        {
            this._catalog.showNotEnoughCreditsAlert();

            return;
        }

        if((this._catalog.getPurse()?.getActivityPointsForType(parser.activityPointType) ?? 0) < parser.priceInActivityPoints)
        {
            this._catalog.showNotEnoughActivityPointsAlert(parser.activityPointType);

            return;
        }

        this._window = this._catalog.windowManager?.buildWidgetLayout('rent_confirmation') as IWindowContainer | null ?? null;

        if(this._window === null)
        {
            log.warn('Missing layout "rent_confirmation" — the rent dialog cannot open');

            return;
        }

        const priceAmount = this._window.findChildByName('price_amount') as ITextWindow | null;

        // A credits price swaps the icon in; an activity-point price shows the number alone, which
        // is AS3's own asymmetry — it never sets a ducket icon here.
        if(parser.priceInCredits > 0)
        {
            if(priceAmount != null) priceAmount.caption = String(parser.priceInCredits);

            const priceType = this._window.findChildByName('price_type') as IStaticBitmapWrapperWindow | null;

            if(priceType != null) priceType.assetUri = 'toolbar_credit_icon_0';
        }
        else if(priceAmount != null)
        {
            priceAmount.caption = String(parser.priceInActivityPoints);
        }

        if(this._isBuyout)
        {
            this._window.caption = '${rent.confirmation.title.buyout}';

            const rentalDescription = this._window.findChildByName('rental_description');

            if(rentalDescription != null) rentalDescription.visible = false;

            const okButton = this._window.findChildByName('ok_button') as ITextWindow | null;

            if(okButton != null) okButton.caption = '${catalog.purchase_confirmation.buy}';
        }

        const furniName = this._window.findChildByName('furni_name') as ITextWindow | null;

        if(furniName != null) furniName.caption = this._furniData.localizedName;

        (this._window.findChildByName('content_list') as IItemListWindow | null)?.arrangeListItems();

        this._window.center();
        this._window.procedure = this.windowProcedure;

        this.requestPreview();
    };

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::onFurniRentOrBuyoutOffer() — the image half
    private requestPreview(): void
    {
        const roomEngine: IRoomEngine | null = this._catalog.roomEngine;

        if(roomEngine === null || this._furniData === null) return;

        const direction = new Vector3d(PREVIEW_DIRECTION, 0, 0);

        // AS3 leaves the result null for any other type, which then throws on `.data`; guarded here
        // instead, since a furni with neither type simply has no preview to show.
        const result = this._furniData.type === 's'
            ? roomEngine.getFurnitureImage(this._furniData.id, direction, PREVIEW_SCALE, this)
            : this._furniData.type === 'i'
                ? roomEngine.getWallItemImage(this._furniData.id, direction, PREVIEW_SCALE, this)
                : null;

        if(result === null) return;

        this._pendingImageId = result.id;

        this.setPreview(result.data);
    }

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this._window !== null && id === this._pendingImageId) this.setPreview(data);
    }

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // TS-only: the two image paths above both end here.
    private setPreview(data: ImageBitmap | null): void
    {
        const image = this._window?.findChildByName('image') as IBitmapWrapperWindow | null;

        if(image != null) image.bitmap = data;
    }

    /**
     * The mode chosen in `show()` decides what OK sends: a room object, an inventory strip item, or
     * — from the catalogue — an ordinary purchase of the furni's rent offer.
     */
    // AS3: .../catalog/purchase/RentConfirmationWindow.as::windowProcedure()
    private windowProcedure = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK' || this._window === null) return;

        switch(target.name)
        {
            case 'cancel_button':
            case 'header_button_close':
                this.close();
                break;
            case 'ok_button':
                switch(this._mode)
                {
                    case RentConfirmationWindow.MODE_INFOSTAND:
                        this._catalog.connection?.send(
                            new ExtendRentOrBuyoutFurniMessageComposer(this._furniData?.type === 'i', this._objectId, this._isBuyout)
                        );
                        break;
                    case RentConfirmationWindow.MODE_INVENTORY:
                        this._catalog.connection?.send(
                            new ExtendRentOrBuyoutStripItemMessageComposer(this._stripId, this._isBuyout)
                        );
                        break;
                    case RentConfirmationWindow.MODE_CATALOGUE:
                        this._catalog.purchaseOffer(this._furniData?.rentOfferId ?? -1);
                        break;
                }

                this.close();
                break;
        }
    };

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::close()
    private close(): void
    {
        if(this._window === null) return;

        this._window.dispose();
        this._window = null;
        this._pendingImageId = -1;
    }

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../catalog/purchase/RentConfirmationWindow.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.close();

        if(this._offerMessageEvent !== null)
        {
            this._catalog.communication?.removeMessageEvent(this._offerMessageEvent);
            this._offerMessageEvent = null;
        }

        this._disposed = true;
    }
}
