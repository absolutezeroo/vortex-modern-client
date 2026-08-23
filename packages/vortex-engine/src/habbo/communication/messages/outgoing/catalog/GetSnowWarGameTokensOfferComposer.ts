import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for the snow-war token bundles on sale (WIN63 header 2447). No arguments.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/GetSnowWarGameTokensOfferComposer.as
 * (`_composers[2447]` in the registry _SafeCls_2046.as.)
 */
export class GetSnowWarGameTokensOfferComposer extends MessageComposer<number[]>
{
    // AS3: GetSnowWarGameTokensOfferComposer.as::getMessageArray()
    getMessageArray(): number[]
    {
        return [];
    }
}
