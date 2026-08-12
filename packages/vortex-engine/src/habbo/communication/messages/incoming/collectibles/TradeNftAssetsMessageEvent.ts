import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradeNftAssetsMessageParser} from '../../parser/collectibles/TradeNftAssetsMessageParser';

/**
 * The NFT assets offered on both sides of an open trade (header 850).
 *
 * `_SafeStr_4546[850] = _SafeCls_2441` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as;
 * `habbo/inventory/_SafeCls_1951.as:204` is its only subscriber (`onTradeNfts`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2442/_SafeCls_2441.as
 */
export class TradeNftAssetsMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2441.as::_SafeCls_2441()
    constructor(callback: MessageEventCallback)
    {
        super(callback, TradeNftAssetsMessageParser);
    }
}
