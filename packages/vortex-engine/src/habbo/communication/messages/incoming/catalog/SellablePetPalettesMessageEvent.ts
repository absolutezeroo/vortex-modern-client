import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {SellablePetPalette} from '../../parser/catalog/SellablePetPalette';
import {SellablePetPalettesMessageEventParser} from '../../parser/catalog/SellablePetPalettesMessageEventParser';

/**
 * Sellable pet palettes response (header 3350), consumed by HabboCatalog.onSellablePetPalettes().
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2109.as
 * Class name cross-referenced from: sources/win63_version/habbo/communication/messages/incoming/catalog/SellablePetPalettesMessageEvent.as
 */
export class SellablePetPalettesMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, SellablePetPalettesMessageEventParser);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2109.as::getParser()
    get productCode(): string
    {
        return (this._parser as SellablePetPalettesMessageEventParser).productCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2109.as::getParser()
    get sellablePalettes(): SellablePetPalette[]
    {
        return (this._parser as SellablePetPalettesMessageEventParser).sellablePalettes;
    }
}
