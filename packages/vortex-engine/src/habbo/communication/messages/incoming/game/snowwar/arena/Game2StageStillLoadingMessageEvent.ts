import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    Game2StageStillLoadingMessageEventParser
} from '../../../../parser/game/snowwar/arena/Game2StageStillLoadingMessageEventParser';

/**
 * Loading progress across the arena. Header 2571.
 *
 * Name recovered from `win63_version`'s filename; `_SafeCls_2842` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2248/_SafeCls_2842.as
 * @see sources/win63_version/habbo/communication/messages/incoming/game/snowwar/arena/Game2StageStillLoadingMessageEvent.as
 */
export class Game2StageStillLoadingMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, Game2StageStillLoadingMessageEventParser);
    }
}
