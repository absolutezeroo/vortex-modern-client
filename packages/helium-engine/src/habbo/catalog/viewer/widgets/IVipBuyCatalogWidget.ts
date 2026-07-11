import type {IDisposable} from '@core/runtime/IDisposable';
import type {ClubBuyOfferData} from '../../club/ClubBuyOfferData';

/**
 * Visualization contract for ClubBuyController - implemented by both ClubBuyCatalogWidget and
 * VipBuyCatalogWidget.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/IVipBuyCatalogWidget.as
 */
export interface IVipBuyCatalogWidget extends IDisposable
{
    init(): boolean;

    reset(): void;

    initClubType(clubType: number): void;

    showOffer(offer: ClubBuyOfferData): void;

    readonly isGift: boolean;
}
