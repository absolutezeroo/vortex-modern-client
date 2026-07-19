import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CfhTopicsInitMessageParser} from '../../parser/help/CfhTopicsInitMessageParser';

/**
 * Event for CFH topics initialization.
 * Contains the full category/topic tree for the call for help system.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/callforhelp/CfhTopicsInitMessageEvent.as
 */
export class CfhTopicsInitMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, CfhTopicsInitMessageParser);
    }
}
