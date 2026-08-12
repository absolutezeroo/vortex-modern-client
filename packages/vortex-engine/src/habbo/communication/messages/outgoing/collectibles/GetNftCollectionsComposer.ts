import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for the NFT collections (WIN63 header 708).
 *
 * The call site passes `""` for "all of them" — AS3 writes `param1 == null ? "" : param1`, so a
 * null id is a request for the whole list rather than an error.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3378`), named for its one sender
 * (`CollectionsTab.as::requestCollections()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3378.as
 */
export class GetNftCollectionsComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_3378.as::_SafeStr_4642
    private _data: [string];

    // AS3: _SafeCls_3378.as::_SafeCls_3378()
    constructor(collectionId: string)
    {
        super();

        this._data = [collectionId];
    }

    // AS3: _SafeCls_3378.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
