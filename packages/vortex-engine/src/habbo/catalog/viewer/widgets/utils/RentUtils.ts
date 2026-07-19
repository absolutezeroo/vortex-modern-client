import type {IWindow} from '@core/window/IWindow';
import type {IPurchasableOffer} from '../../../IPurchasableOffer';

/**
 * @see sources/win63_version/habbo/catalog/viewer/widgets/utils/RentUtils.as
 */
export class RentUtils
{
    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/utils/RentUtils.as::updateBuyCaption()
    static updateBuyCaption(offer: IPurchasableOffer | null, window: IWindow | null): void
    {
        if(offer == null || window == null) return;

        window.caption = offer.isRentOffer ? '${catalog.purchase_confirmation.rent}' : '${catalog.purchase_confirmation.buy}';
    }
}
