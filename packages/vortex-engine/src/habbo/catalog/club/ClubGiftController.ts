import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IProductData} from '@habbo/session/product/IProductData';
import {GetClubGiftMessageComposer} from '@habbo/communication/messages/outgoing/catalog/GetClubGiftMessageComposer';
import {SelectClubGiftComposer} from '@habbo/communication/messages/outgoing/catalog/SelectClubGiftComposer';
import type {ClubOfferData} from '@habbo/communication/messages/parser/catalog/ClubOfferData';
import type {ClubGiftEligibilityData} from '@habbo/communication/messages/parser/catalog/ClubGiftEligibilityData';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {Purse} from '../purse/Purse';
import type {HabboCatalog} from '../HabboCatalog';
import type {ClubGiftWidget} from '../viewer/widgets/ClubGiftWidget';
import {ClubGiftConfirmationDialog} from './ClubGiftConfirmationDialog';

/**
 * Drives the "gift Habbo Club to a friend" widget: requests offer/eligibility info (reusing the
 * same GetClubGiftMessageComposer/ClubGiftInfoEvent pair already ported for HabboClubCenter's
 * gift-count popup) and confirms/redeems a selected gift.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/club/ClubGiftController.as
 */
export class ClubGiftController
{
    private _widget: ClubGiftWidget | null = null;

    private _daysUntilNextGift: number = 0;

    private _giftsAvailable: number = 0;

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::_offers
    private _offers: ClubOfferData[] = [];

    private _giftData: Map<number, ClubGiftEligibilityData> = new Map();

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::_catalog
    private _catalog: HabboCatalog | null;

    private _confirmationDialog: ClubGiftConfirmationDialog | null = null;

    constructor(catalog: HabboCatalog)
    {
        this._catalog = catalog;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::dispose()
    dispose(): void
    {
        this._catalog = null;
        this._confirmationDialog?.dispose();
        this._confirmationDialog = null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::set widget()
    set widget(widget: ClubGiftWidget)
    {
        this._widget = widget;
        this._catalog?.connection?.send(new GetClubGiftMessageComposer());
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::get daysUntilNextGift()
    get daysUntilNextGift(): number
    {
        return this._daysUntilNextGift;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::get giftsAvailable()
    get giftsAvailable(): number
    {
        return this._giftsAvailable;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::setInfo()
    setInfo(daysUntilNextGift: number, giftsAvailable: number, offers: ClubOfferData[], giftData: Map<number, ClubGiftEligibilityData>): void
    {
        this._daysUntilNextGift = daysUntilNextGift;
        this._giftsAvailable = giftsAvailable;
        this._offers = offers;
        this._giftData = giftData;

        this._widget?.update();
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::selectGift()
    selectGift(offer: IPurchasableOffer): void
    {
        this.closeConfirmation();
        this._confirmationDialog = new ClubGiftConfirmationDialog(this, offer);
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::confirmSelection()
    confirmSelection(productCode: string): void
    {
        if(!productCode || !this._catalog || !this._catalog.connection) return;

        this._catalog.connection.send(new SelectClubGiftComposer(productCode));
        this._giftsAvailable = this._giftsAvailable - 1;
        this._widget?.update();
        this.closeConfirmation();
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::closeConfirmation()
    closeConfirmation(): void
    {
        this._confirmationDialog?.dispose();
        this._confirmationDialog = null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::getOffers()
    getOffers(): ClubOfferData[]
    {
        return this._offers;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::getGiftData()
    getGiftData(): Map<number, ClubGiftEligibilityData>
    {
        return this._giftData;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::get hasClub()
    get hasClub(): boolean
    {
        return (this._catalog?.getPurse()?.clubDays ?? 0) > 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._catalog?.windowManager ?? null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._catalog?.localization ?? null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::get assets()
    get assets(): IAssetLibrary | null
    {
        return this._catalog?.assets ?? null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this._catalog?.roomEngine ?? null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::getProductData()
    getProductData(localizationId: string): IProductData | null
    {
        return this._catalog?.getProductData(localizationId) ?? null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::get purse()
    get purse(): Purse | null
    {
        return this._catalog?.getPurse() ?? null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/club/ClubGiftController.as::get catalog()
    get catalog(): HabboCatalog | null
    {
        return this._catalog;
    }
}
