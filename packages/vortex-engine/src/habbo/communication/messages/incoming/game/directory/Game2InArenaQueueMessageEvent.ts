import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2InArenaQueueMessageParser
} from '../../../parser/game/directory/Game2InArenaQueueMessageParser';

/**
 * Queue position for the arena. Header 2756.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2InArenaQueueMessageEvent.as
 */
export class Game2InArenaQueueMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2InArenaQueueMessageParser);
    }
}
