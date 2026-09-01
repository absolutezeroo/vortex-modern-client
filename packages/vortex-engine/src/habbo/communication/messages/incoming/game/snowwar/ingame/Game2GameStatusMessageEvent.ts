import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2GameStatusMessageEventParser
} from '../../../../parser/game/snowwar/ingame/Game2GameStatusMessageEventParser';

/**
 * One turn of the lock-step loop. Header 498.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_3607` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3008/_SafeCls_3607.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/ingame/Game2GameStatusMessageEvent.as
 */
export class Game2GameStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2GameStatusMessageEventParser);
    }
}
