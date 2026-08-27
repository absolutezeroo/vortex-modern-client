import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BanInfoMessageEventParser} from '../../parser/moderation/BanInfoMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/moderation/BanInfoMessageEvent.as
 */
export class BanInfoMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, BanInfoMessageEventParser);
    }
}
