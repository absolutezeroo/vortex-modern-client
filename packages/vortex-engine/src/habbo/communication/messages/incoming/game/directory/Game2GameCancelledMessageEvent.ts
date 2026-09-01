import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2GameCancelledMessageParser
} from '../../../parser/game/directory/Game2GameCancelledMessageParser';

/**
 * The game was cancelled. Header 2334. Payload-free.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2GameCancelledMessageEvent.as
 */
export class Game2GameCancelledMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2GameCancelledMessageParser);
    }
}
