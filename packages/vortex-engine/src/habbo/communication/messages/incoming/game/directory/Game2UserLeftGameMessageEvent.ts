import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2UserLeftGameMessageParser
} from '../../../parser/game/directory/Game2UserLeftGameMessageParser';

/**
 * A player left the lobby. Header 606.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2UserLeftGameMessageEvent.as
 */
export class Game2UserLeftGameMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2UserLeftGameMessageParser);
    }
}
