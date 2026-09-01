import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2UserBlockedMessageParser
} from '../../../parser/game/directory/Game2UserBlockedMessageParser';

/**
 * This player is blocked from starting games for a while. Header 1145.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2UserBlockedMessageEvent.as
 */
export class Game2UserBlockedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2UserBlockedMessageParser);
    }
}
