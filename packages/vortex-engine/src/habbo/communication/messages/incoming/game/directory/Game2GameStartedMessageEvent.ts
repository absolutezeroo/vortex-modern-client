import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2GameStartedMessageEventParser
} from '../../../parser/game/directory/Game2GameStartedMessageEventParser';

/**
 * The lobby closed and the game is starting. Header 2902.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_3582` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/_SafeCls_3582.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/directory/Game2GameStartedMessageEvent.as
 */
export class Game2GameStartedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2GameStartedMessageEventParser);
    }
}
