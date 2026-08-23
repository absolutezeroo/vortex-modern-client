import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {SnowWarGameTokenOffer} from './SnowWarGameTokenOffer';

/**
 * The snow-war token bundles on sale (header 904): a count, then that many offers.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/SnowWarGameTokensMessageParser.as
 */
export class SnowWarGameTokensMessageParser implements IMessageParser
{
    // AS3: SnowWarGameTokensMessageParser.as::_offers
    private _offers: SnowWarGameTokenOffer[] = [];

    // AS3: SnowWarGameTokensMessageParser.as::get offers()
    get offers(): SnowWarGameTokenOffer[]
    {
        return this._offers;
    }

    // AS3: SnowWarGameTokensMessageParser.as::flush()
    flush(): boolean
    {
        this._offers = [];

        return true;
    }

    // AS3: SnowWarGameTokensMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._offers = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._offers.push(new SnowWarGameTokenOffer(wrapper));

        return true;
    }
}
