import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredMovementsMessageParser} from '@habbo/communication/messages/parser/room/engine/WiredMovementsMessageParser';

/**
 * WiredMovementsMessageEvent — a bundle of wired-triggered avatar/furni movements (WIN63 header 325,
 * from the registry `_SafeStr_4546[325] = _SafeCls_2529`). Consumed by
 * RoomMessageHandler.onWiredMovements.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2529`); named after its readable consumer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2102/_SafeCls_2529.as
 */
export class WiredMovementsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredMovementsMessageParser);
    }
}
