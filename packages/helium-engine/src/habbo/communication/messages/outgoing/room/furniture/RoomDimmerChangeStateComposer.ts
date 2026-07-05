import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Toggle the dimmer on/off state
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/furniture/RoomDimmerChangeStateMessageComposer.as
 */
export class RoomDimmerChangeStateComposer extends MessageComposer<[number]>
{
	private _data: [number];

	constructor(objectId: number)
	{
		super();
		this._data = [objectId];
	}

	getMessageArray(): [number]
	{
		return this._data;
	}
}
