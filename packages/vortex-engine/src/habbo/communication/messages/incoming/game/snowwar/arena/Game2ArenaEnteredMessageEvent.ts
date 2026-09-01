import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2ArenaEnteredMessageEventParser
} from '../../../../parser/game/snowwar/arena/Game2ArenaEnteredMessageEventParser';

/**
 * A player finished entering the arena. Header 3354.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_3889` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2248/_SafeCls_3889.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/arena/Game2ArenaEnteredMessageEvent.as
 */
export class Game2ArenaEnteredMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2ArenaEnteredMessageEventParser);
    }
}
