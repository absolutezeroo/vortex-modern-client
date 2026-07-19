import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    RoomVisualizationSettingsEventParser
} from '@habbo/communication/messages/parser/room/engine/RoomVisualizationSettingsEventParser';

/**
 * @see sources/win63_version/habbo/communication/messages/incoming/room/engine/RoomVisualizationSettingsEvent.as
 */
export class RoomVisualizationSettingsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomVisualizationSettingsEventParser);
    }
}
