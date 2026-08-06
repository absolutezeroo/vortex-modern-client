import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {JukeboxPlayListFullMessageParser} from '@habbo/communication/messages/parser/sound/JukeboxPlayListFullMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/sound/JukeboxPlayListFullMessageEvent.as
 * (header 949 from WIN63's registry)
 */
export class JukeboxPlayListFullMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, JukeboxPlayListFullMessageParser);
    }
}
