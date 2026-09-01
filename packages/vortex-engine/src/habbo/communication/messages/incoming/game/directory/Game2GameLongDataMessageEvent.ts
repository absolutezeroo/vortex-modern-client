import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2GameLongDataMessageEventParser
} from '../../../parser/game/directory/Game2GameLongDataMessageEventParser';

/**
 * The lobby data again, on its own header. Header 3539. The handler treats it exactly like
 * *game created*.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_3733` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/_SafeCls_3733.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/directory/Game2GameLongDataMessageEvent.as
 */
export class Game2GameLongDataMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2GameLongDataMessageEventParser);
    }
}
