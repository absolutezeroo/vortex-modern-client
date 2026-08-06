import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    UserSongDisksInventoryMessageParser
} from '@habbo/communication/messages/parser/sound/UserSongDisksInventoryMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/sound/UserSongDisksInventoryMessageEvent.as
 * (`_SafeCls_3625` in the primary tree; header 1930 from its registry)
 */
export class UserSongDisksInventoryMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, UserSongDisksInventoryMessageParser);
    }
}
