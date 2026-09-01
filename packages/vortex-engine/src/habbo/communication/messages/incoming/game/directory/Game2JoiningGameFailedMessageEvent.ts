import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2JoiningGameFailedMessageParser
} from '../../../parser/game/directory/Game2JoiningGameFailedMessageParser';

/**
 * The join was refused, with a reason code. Header 493.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2JoiningGameFailedMessageEvent.as
 */
export class Game2JoiningGameFailedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2JoiningGameFailedMessageParser);
    }
}
