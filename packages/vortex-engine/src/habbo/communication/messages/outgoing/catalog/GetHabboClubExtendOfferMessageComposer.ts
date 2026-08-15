import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for the discounted club-extension offer — header 2931 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[2931]`). Empty payload: which offer applies is entirely the
 * server's decision, from the player's own subscription state.
 *
 * Sent from the two toolbar promo bars — `ClubDiscountPromoExtension` and
 * `CitizenshipVipDiscountPromoExtension` — and from neither unless the player is at club level 2,
 * which is the only state the discount exists for.
 *
 * Name RECOVERED from
 * sources/win63_version/habbo/communication/messages/outgoing/catalog/GetHabboClubExtendOfferMessageComposer.as
 * — that tree is obfuscated too, but it is the one where messages keep readable filenames.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2983.as
 */
export class GetHabboClubExtendOfferMessageComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_2983.as::_data (name derived: the field is _SafeStr_4556 in every tree)
    private _data: [] = [];

    // AS3: _SafeCls_2983.as::_SafeCls_2983()
    constructor()
    {
        super();
    }

    // AS3: _SafeCls_2983.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
