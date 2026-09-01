import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2AccountGameStatusMessageParser
} from '../../../parser/game/directory/Game2AccountGameStatusMessageParser';

/**
 * How many games of a type this account has left. Header 683.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2AccountGameStatusMessageEvent.as
 */
export class Game2AccountGameStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2AccountGameStatusMessageParser);
    }
}
