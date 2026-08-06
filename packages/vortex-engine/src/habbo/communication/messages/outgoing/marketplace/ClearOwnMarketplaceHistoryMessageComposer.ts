import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * TS-derived name: newer feature absent from win63_version/PRODUCTION-201601012205-226667486
 * entirely (no readable-name counterpart in any secondary/tertiary tree).
 * Named from usage context: `HabboCatalog.clearOwnMarketPlaceHistory(status)`
 * sends this with the `MarketPlaceOfferStatus` value to clear.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_2060.as
 */
export class ClearOwnMarketplaceHistoryMessageComposer extends MessageComposer<[number]> 
{
    private _data: [number];

    constructor(status: number) 
    {
        super();
        this._data = [status];
    }

    // AS3: .../src/unknowns/_SafePkg_1746/_SafeCls_2060.as::getMessageArray()
    getMessageArray(): [number] 
    {
        return this._data;
    }
}
