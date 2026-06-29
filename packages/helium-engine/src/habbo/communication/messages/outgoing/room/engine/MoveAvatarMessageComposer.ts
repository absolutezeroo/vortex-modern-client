import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a walk-to-tile request to the server.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/room/engine/MoveAvatarMessageComposer.as
 */
export class MoveAvatarMessageComposer extends MessageComposer<[number, number]>
{
	private _data: [number, number];

	constructor(x: number, y: number)
	{
		super();
		this._data = [x, y];
	}

	getMessageArray(): [number, number]
	{
		return this._data;
	}
}
