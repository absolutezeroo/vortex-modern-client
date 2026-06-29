import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request the current dimmer presets for the room
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/furniture/RoomDimmerGetPresetsMessageComposer.as
 */
export class RoomDimmerGetPresetsComposer extends MessageComposer
{
	getMessageArray()
	{
		return [];
	}
}
