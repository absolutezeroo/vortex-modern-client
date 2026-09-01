import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2PlayerExitedGameArenaMessageEventParser
} from '../../../../parser/game/snowwar/arena/Game2PlayerExitedGameArenaMessageEventParser';

/**
 * A player left the running arena. Header 1301.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_2432` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2248/_SafeCls_2432.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/arena/Game2PlayerExitedGameArenaMessageEvent.as
 */
export class Game2PlayerExitedGameArenaMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2PlayerExitedGameArenaMessageEventParser);
    }
}
