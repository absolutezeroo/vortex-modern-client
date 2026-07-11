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
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/ClubGiftController.as
 */
export class ClubGiftController
{
    private _widget: ClubGiftWidget | null = null;

    private _daysUntilNextGift: number = 0;

    private _giftsAvailable: number = 0;

    private _offers: ClubOfferData[] = [];

    private _giftData: Map<number, ClubGiftEligibilityData> = new Map();

    private _catalog: HabboCatalog | null;

    private _confirmationDialog: ClubGiftConfirmationDialog | null = null;

    constructor(catalog: HabboCatalog)
    {
        this._catalog = catalog;
    }

    dispose(): void
    {
        this._catalog = null;
        this._confirmationDialog?.dispose();
        this._confirmationDialog = null;
    }

    set widget(widget: ClubGiftWidget)
    {
        this._widget = widget;
        this._catalog?.connection?.send(new GetClubGiftMessageComposer());
    }

    get daysUntilNextGift(): number
    {
        return this._daysUntilNextGift;
    }

    get giftsAvailable(): number
    {
        return this._giftsAvailable;
    }

    setInfo(daysUntilNextGift: number, giftsAvailable: number, offers: ClubOfferData[], giftData: Map<number, ClubGiftEligibilityData>): void
    {
        this._daysUntilNextGift = daysUntilNextGift;
        this._giftsAvailable = giftsAvailable;
        this._offers = offers;
        this._giftData = giftData;

        this._widget?.update();
    }

    selectGift(offer: IPurchasableOffer): void
    {
        this.closeConfirmation();
        this._confirmationDialog = new ClubGiftConfirmationDialog(this, offer);
    }

    confirmSelection(productCode: string): void
    {
        if(!productCode || !this._catalog || !this._catalog.connection) return;

        this._catalog.connection.send(new SelectClubGiftComposer(productCode));
        this._giftsAvailable = this._giftsAvailable - 1;
        this._widget?.update();
        this.closeConfirmation();
    }

    closeConfirmation(): void
    {
        this._confirmationDialog?.dispose();
        this._confirmationDialog = null;
    }

    getOffers(): ClubOfferData[]
    {
        return this._offers;
    }

    getGiftData(): Map<number, ClubGiftEligibilityData>
    {
        return this._giftData;
    }

    get hasClub(): boolean
    {
        return (this._catalog?.getPurse()?.clubDays ?? 0) > 0;
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

    get roomEngine(): IRoomEngine | null
    {
        return this._catalog?.roomEngine ?? null;
    }

    getProductData(localizationId: string): IProductData | null
    {
        return this._catalog?.getProductData(localizationId) ?? null;
    }

    get purse(): Purse | null
    {
        return this._catalog?.getPurse() ?? null;
    }

    get catalog(): HabboCatalog | null
    {
        return this._catalog;
    }
}
