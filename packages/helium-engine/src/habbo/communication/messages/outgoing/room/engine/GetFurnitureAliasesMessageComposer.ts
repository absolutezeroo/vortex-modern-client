import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetFurnitureAliasesMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.engine.GetFurnitureAliasesMessageComposer
 *
 * Requests furniture aliases from the server.
 * Sent on first room entry.
 */
export class GetFurnitureAliasesMessageComposer extends MessageComposer<[]>
{
	private _data: [] = [];

	getMessageArray(): []
	{
		return this._data;
	}
}
