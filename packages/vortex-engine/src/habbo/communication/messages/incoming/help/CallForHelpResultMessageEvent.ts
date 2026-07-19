import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CallForHelpResultMessageParser} from '../../parser/help/CallForHelpResultMessageParser';

/**
 * Event for call for help submission result.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/CallForHelpResultMessageEvent.as
 */
export class CallForHelpResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CallForHelpResultMessageParser);
    }
}
