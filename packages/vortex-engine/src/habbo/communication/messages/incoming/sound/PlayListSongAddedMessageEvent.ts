import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PlayListSongAddedMessageParser} from '@habbo/communication/messages/parser/sound/PlayListSongAddedMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/sound/PlayListSongAddedMessageEvent.as
 * (header 2785 from WIN63's registry)
 */
export class PlayListSongAddedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PlayListSongAddedMessageParser);
    }
}
