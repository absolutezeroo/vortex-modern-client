import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {SellablePetPalette} from './SellablePetPalette';

/**
 * Parses the sellable pet palettes response (header 3350).
 *
 * The primary's copy carries readable field names (`_productCode`/`_sellablePalettes`) and a clean
 * `parse()` loop. The secondary's copy is decompiler-corrupted there: it reads `while(0 < count)`
 * with the index declared and incremented but never compared - an infinite loop the real client
 * plainly does not have. Same corruption signature as `HabboClubOffersMessageEventParser`, where
 * the primary likewise held the correct `while(i < count)` form. The primary's loop is ported here.
 *
 * `parse()` appends rather than resetting `_sellablePalettes` - faithful to both trees, which leave
 * that reset to `flush()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_1905.as
 * Class name cross-referenced from: sources/win63_version/habbo/communication/messages/parser/catalog/SellablePetPalettesMessageEventParser.as
 */
export class SellablePetPalettesMessageEventParser implements IMessageParser
{
    private _productCode: string = '';

    private _sellablePalettes: SellablePetPalette[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_1905.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_1905.as::get sellablePalettes()
    get sellablePalettes(): SellablePetPalette[]
    {
        return this._sellablePalettes.slice();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_1905.as::flush()
    flush(): boolean
    {
        this._productCode = '';
        this._sellablePalettes = [];

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_1905.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._productCode = wrapper.readString();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._sellablePalettes.push(new SellablePetPalette(wrapper));
        }

        return true;
    }
}
