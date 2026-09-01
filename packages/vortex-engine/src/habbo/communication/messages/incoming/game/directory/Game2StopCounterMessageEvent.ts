import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2StopCounterMessageParser
} from '../../../parser/game/directory/Game2StopCounterMessageParser';

/**
 * Stop the lobby countdown. Header 2747. Payload-free.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2StopCounterMessageEvent.as
 */
export class Game2StopCounterMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2StopCounterMessageParser);
    }
}
