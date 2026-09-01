import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2FullGameStatusMessageEventParser
} from '../../../../parser/game/snowwar/ingame/Game2FullGameStatusMessageEventParser';

/**
 * The whole arena state, after a desync. Header 1739.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_3007` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3008/_SafeCls_3007.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/ingame/Game2FullGameStatusMessageEvent.as
 */
export class Game2FullGameStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2FullGameStatusMessageEventParser);
    }
}
