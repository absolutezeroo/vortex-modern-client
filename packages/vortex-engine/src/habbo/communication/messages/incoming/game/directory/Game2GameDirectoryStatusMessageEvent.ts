import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2GameDirectoryStatusMessageParser
} from '../../../parser/game/directory/Game2GameDirectoryStatusMessageParser';

/**
 * Whether the game directory is open. Header 3251.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/Game2GameDirectoryStatusMessageEvent.as
 */
export class Game2GameDirectoryStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2GameDirectoryStatusMessageParser);
    }
}
