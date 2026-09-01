import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2GameEndingMessageEventParser
} from '../../../../parser/game/snowwar/arena/Game2GameEndingMessageEventParser';

/**
 * The game is over — scores, result and stats for the ending panel. Header 3446.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_2818` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2248/_SafeCls_2818.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/arena/Game2GameEndingMessageEvent.as
 */
export class Game2GameEndingMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2GameEndingMessageEventParser);
    }
}
