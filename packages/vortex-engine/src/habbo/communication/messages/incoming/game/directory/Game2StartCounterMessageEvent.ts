import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2StartCounterMessageParser
} from '../../../parser/game/directory/Game2StartCounterMessageParser';

/**
 * Start the lobby countdown. Header 2008.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2StartCounterMessageEvent.as
 */
export class Game2StartCounterMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2StartCounterMessageParser);
    }
}
