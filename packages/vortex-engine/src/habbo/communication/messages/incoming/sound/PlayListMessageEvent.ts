import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PlayListMessageParser} from '@habbo/communication/messages/parser/sound/PlayListMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/sound/PlayListMessageEvent.as
 * (header 1242 from WIN63's registry)
 */
export class PlayListMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PlayListMessageParser);
    }
}
