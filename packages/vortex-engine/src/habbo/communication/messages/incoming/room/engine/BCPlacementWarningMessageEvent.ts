import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BCPlacementWarningMessageParser} from '@habbo/communication/messages/parser/room/engine/BCPlacementWarningMessageParser';

/**
 * BCPlacementWarningMessageEvent — the server wants a builders-club placement confirmed (WIN63
 * header 2458, from the registry `_SafeStr_4546[2458] = _SafeCls_3642`). Consumed by
 * RoomMessageHandler.onBCPlacementWarning.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3642`); named after its readable consumer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2102/_SafeCls_3642.as
 */
export class BCPlacementWarningMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, BCPlacementWarningMessageParser);
    }
}
