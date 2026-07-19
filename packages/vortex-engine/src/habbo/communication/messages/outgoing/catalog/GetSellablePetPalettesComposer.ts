import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the sellable palettes for one pet product code (header 3342).
 *
 * Header cross-verified against the emulator's own AS3-verified registry
 * (`../vortex-emulator/Turbo.Revisions/Revision20260701/Headers.cs`), whose comment for 3342 names
 * both this composer's primary class (`_SafeCls_2003`) and `HabboCatalog::getSellablePetPalettes()`
 * as its sender.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2003.as
 * Class name cross-referenced from: sources/win63_version/habbo/communication/messages/outgoing/catalog/GetSellablePetPalettesComposer.as
 */
export class GetSellablePetPalettesComposer extends MessageComposer<ConstructorParameters<typeof GetSellablePetPalettesComposer>>
{
    private _data: ConstructorParameters<typeof GetSellablePetPalettesComposer>;

    constructor(productCode: string)
    {
        super();
        this._data = [productCode];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2003.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
