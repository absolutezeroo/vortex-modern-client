import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2StartingGameFailedMessageParser
} from '../../../parser/game/directory/Game2StartingGameFailedMessageParser';

/**
 * The game would not start. Header 1140.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2StartingGameFailedMessageEvent.as
 */
export class Game2StartingGameFailedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2StartingGameFailedMessageParser);
    }
}
