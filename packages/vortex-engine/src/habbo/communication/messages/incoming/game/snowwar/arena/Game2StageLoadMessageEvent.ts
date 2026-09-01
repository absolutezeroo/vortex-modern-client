import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2StageLoadMessageEventParser
} from '../../../../parser/game/snowwar/arena/Game2StageLoadMessageEventParser';

/**
 * Build the arena view. Header 755.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_2489` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2248/_SafeCls_2489.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/arena/Game2StageLoadMessageEvent.as
 */
export class Game2StageLoadMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2StageLoadMessageEventParser);
    }
}
