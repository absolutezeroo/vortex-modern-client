import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2StageStartingMessageEventParser
} from '../../../../parser/game/snowwar/arena/Game2StageStartingMessageEventParser';

/**
 * The stage is about to start, with the object set to build. Header 3295.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_2247` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2248/_SafeCls_2247.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/arena/Game2StageStartingMessageEvent.as
 */
export class Game2StageStartingMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2StageStartingMessageEventParser);
    }
}
