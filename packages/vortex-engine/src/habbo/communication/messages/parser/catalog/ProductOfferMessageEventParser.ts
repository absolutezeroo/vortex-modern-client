import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {ClubOfferData} from './ClubOfferData';

/**
 * One catalog offer, sent in reply to `GetProductOfferComposer` (header 1911).
 *
 * The payload is a bare offer in the same shape the catalog page uses for each of its own, which
 * is why this reads it with `ClubOfferData` rather than repeating the field list — the emulator
 * serialises it through the very same `CatalogOfferSerializer` it uses for page offers.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_2250.as
 * (obfuscated; identified as the product-offer parser by `_SafeCls_2066`, the event at
 * `_events[1911]` in the registry, whose `getParser()` returns it)
 */
export class ProductOfferMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_2250.as::_offerData
    private _offerData: ClubOfferData | null = null;

    /**
	 * The offer the server answered with
	 */
    // AS3: _SafeCls_2250.as::get offerData()
    get offerData(): ClubOfferData | null
    {
        return this._offerData;
    }

    // AS3: _SafeCls_2250.as::flush()
    flush(): boolean
    {
        this._offerData = null;

        return true;
    }

    // AS3: _SafeCls_2250.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._offerData = new ClubOfferData(wrapper);

        return true;
    }
}
