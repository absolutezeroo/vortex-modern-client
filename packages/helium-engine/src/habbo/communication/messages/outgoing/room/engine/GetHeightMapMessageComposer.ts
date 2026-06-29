import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetHeightMapMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.engine.GetHeightMapMessageComposer
 *
 * Requests height map from the server.
 * Sent on subsequent room entries.
 */
export class GetHeightMapMessageComposer extends MessageComposer<[]>
{
	private _data: [] = [];

	getMessageArray(): []
	{
		return this._data;
	}
}
