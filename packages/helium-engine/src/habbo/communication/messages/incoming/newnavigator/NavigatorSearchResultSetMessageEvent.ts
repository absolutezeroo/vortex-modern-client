import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorSearchResultSetMessageParser} from '../../parser/newnavigator';

/**
 * Event for a navigator search result set
 *
 * @see source_as_win63/habbo/communication/messages/incoming/newnavigator/NavigatorSearchResultSetMessageEvent.as
 */
export class NavigatorSearchResultSetMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NavigatorSearchResultSetMessageParser);
    }
}
