import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Lists items on the marketplace (header 3695).
 *
 * Body is flat, not nested: price, category, then the item count followed by that many item refs.
 * AS3 builds it by pushing onto one array, and pushes a literal `0` count when the ref vector is
 * null — that null branch is preserved here as an empty list rather than a special case.
 *
 * Category is 1 for a floor item and 2 for a wall item; `MarketplaceModel.makeOffer()` derives it
 * from the *first* item, since one offer only ever holds copies of the same furni.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_2606.as
 * (obfuscated in the primary dump; `_composers[3695] = _SafeCls_2606` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/marketplace/MakeOfferMessageComposer.as).
 */
export class MakeOfferMessageComposer extends MessageComposer<number[]>
{
    // AS3: _SafeCls_2606.as::_SafeStr_4642 — one flat array, built in the constructor.
    private _data: number[];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_2606.as::MakeOfferMessageComposer()
    constructor(price: number, category: number, itemRefs: number[] | null)
    {
        super();

        this._data = [price, category];

        if(itemRefs === null)
        {
            this._data.push(0);

            return;
        }

        this._data.push(itemRefs.length);

        for(const ref of itemRefs)
        {
            this._data.push(ref);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_2606.as::getMessageArray()
    getMessageArray(): number[]
    {
        return this._data;
    }
}
