import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorLiftedRoomsMessageParser} from '../../parser/newnavigator';

/**
 * Event for lifted rooms
 *
 * @see source_as_win63/habbo/communication/messages/incoming/newnavigator/NavigatorLiftedRoomsMessageEvent.as
 */
export class NavigatorLiftedRoomsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, NavigatorLiftedRoomsMessageParser);
    }
}
