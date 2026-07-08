import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SecondsUntilMessageEventParser} from '../../parser/competition/SecondsUntilMessageEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/competition/SecondsUntilMessageEvent.as
 */
export class SecondsUntilMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, SecondsUntilMessageEventParser);
    }
}
