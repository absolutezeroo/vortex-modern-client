import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a room moderation action (lock, rename, kick all).
 * Boolean params are converted to 0/1 integers matching AS3 behavior.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/ModerateRoomMessageComposer.as
 */
export class ModerateRoomMessageComposer extends MessageComposer<unknown[]>
{
	private _data: unknown[];

	constructor(roomId: number, lockDoor: boolean, changeTitle: boolean, kickAll: boolean)
	{
		super();
		this._data = [roomId, lockDoor ? 1 : 0, changeTitle ? 1 : 0, kickAll ? 1 : 0];
	}

	getMessageArray(): unknown[]
	{
		return this._data;
	}
}
