import type {IDisposable} from '@core/runtime/IDisposable';
import type {ClubBuyOfferData} from '../../club/ClubBuyOfferData';

/**
 * Visualization contract for ClubBuyController - implemented by both ClubBuyCatalogWidget and
 * VipBuyCatalogWidget.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/IVipBuyCatalogWidget.as
 */
export interface IVipBuyCatalogWidget extends IDisposable
{
    // Redeclared rather than left to `IDisposable`: AS3 declares it on this interface, and the
    // implementations are reached through this type, not through the disposable one.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/IVipBuyCatalogWidget.as::dispose()
    dispose(): void;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/IVipBuyCatalogWidget.as::init()
    init(): boolean;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/IVipBuyCatalogWidget.as::reset()
    reset(): void;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/IVipBuyCatalogWidget.as::initClubType()
    initClubType(clubType: number): void;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/IVipBuyCatalogWidget.as::showOffer()
    showOffer(offer: ClubBuyOfferData): void;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/IVipBuyCatalogWidget.as::get isGift()
    readonly isGift: boolean;
}
