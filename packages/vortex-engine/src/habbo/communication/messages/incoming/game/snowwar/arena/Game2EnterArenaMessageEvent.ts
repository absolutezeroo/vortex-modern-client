import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2EnterArenaMessageEventParser
} from '../../../../parser/game/snowwar/arena/Game2EnterArenaMessageEventParser';

/**
 * Build the arena. Header 620.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_3114` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2248/_SafeCls_3114.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/arena/Game2EnterArenaMessageEvent.as
 */
export class Game2EnterArenaMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2EnterArenaMessageEventParser);
    }
}
