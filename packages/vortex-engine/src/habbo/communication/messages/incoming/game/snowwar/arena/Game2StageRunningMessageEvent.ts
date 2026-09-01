import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2StageRunningMessageEventParser
} from '../../../../parser/game/snowwar/arena/Game2StageRunningMessageEventParser';

/**
 * The stage is live. Header 3695.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_3589` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2248/_SafeCls_3589.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/arena/Game2StageRunningMessageEvent.as
 */
export class Game2StageRunningMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2StageRunningMessageEventParser);
    }
}
