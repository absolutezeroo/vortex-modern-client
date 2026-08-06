import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TraxSongInfoMessageParser
} from '@habbo/communication/messages/parser/sound/TraxSongInfoMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/sound/TraxSongInfoMessageEvent.as
 * (`_SafeCls_3428` in the primary tree; header 2278 from its registry)
 */
export class TraxSongInfoMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TraxSongInfoMessageParser);
    }
}
