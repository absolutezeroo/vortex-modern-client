import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2GameCreatedMessageEventParser
} from '../../../parser/game/directory/Game2GameCreatedMessageEventParser';

/**
 * A lobby was created. Header 413.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_2712` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/_SafeCls_2712.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/directory/Game2GameCreatedMessageEvent.as
 */
export class Game2GameCreatedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2GameCreatedMessageEventParser);
    }
}
