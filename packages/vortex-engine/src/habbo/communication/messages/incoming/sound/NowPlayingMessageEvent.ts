import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NowPlayingMessageParser} from '@habbo/communication/messages/parser/sound/NowPlayingMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/sound/NowPlayingMessageEvent.as
 * (header 398 from WIN63's registry)
 */
export class NowPlayingMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NowPlayingMessageParser);
    }
}
