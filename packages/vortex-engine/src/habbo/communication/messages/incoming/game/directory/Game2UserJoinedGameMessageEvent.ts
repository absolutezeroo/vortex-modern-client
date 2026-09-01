import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2UserJoinedGameMessageEventParser
} from '../../../parser/game/directory/Game2UserJoinedGameMessageEventParser';

/**
 * A player joined the lobby. Header 3352.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_3779` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2421/_SafeCls_3779.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/directory/Game2UserJoinedGameMessageEvent.as
 */
export class Game2UserJoinedGameMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2UserJoinedGameMessageEventParser);
    }
}
