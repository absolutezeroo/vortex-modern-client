import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SnowWarGameTokensMessageParser} from '../../parser/catalog/SnowWarGameTokensMessageParser';

/**
 * The snow-war token bundles on sale (header 904).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/SnowWarGameTokensMessageEvent.as
 * (`_SafeStr_4546[904] = SnowWarGameTokensMessageEvent` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `HabboCatalog.as::onSnowWarGameTokenOffer()` is its only handler.)
 */
export class SnowWarGameTokensMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: SnowWarGameTokensMessageEvent.as::SnowWarGameTokensMessageEvent()
    constructor(callback: MessageEventCallback)
    {
        super(callback, SnowWarGameTokensMessageParser);
    }
}
