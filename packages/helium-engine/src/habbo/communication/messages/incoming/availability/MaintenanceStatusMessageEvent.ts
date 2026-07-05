import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MaintenanceStatusMessageEventParser} from '../../parser/availability/MaintenanceStatusMessageEventParser';

/**
 * Maintenance status message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/availability/MaintenanceStatusMessageEvent.as
 */
export class MaintenanceStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, MaintenanceStatusMessageEventParser);
    }
}
