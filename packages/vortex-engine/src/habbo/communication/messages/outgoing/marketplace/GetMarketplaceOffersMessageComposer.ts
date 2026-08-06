import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_1953.as
 * (real name recovered from sources/win63_version/habbo/communication/messages/outgoing/marketplace/GetMarketplaceOffersMessageComposer.as)
 */
export class GetMarketplaceOffersMessageComposer extends MessageComposer<ConstructorParameters<typeof GetMarketplaceOffersMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetMarketplaceOffersMessageComposer>;

    constructor(minPrice: number, maxPrice: number, searchString: string, category: number, combineUniques: boolean = true)
    {
        super();
        this._data = [minPrice, maxPrice, searchString, category, combineUniques];
    }

    // AS3: .../src/unknowns/_SafePkg_1746/_SafeCls_1953.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
