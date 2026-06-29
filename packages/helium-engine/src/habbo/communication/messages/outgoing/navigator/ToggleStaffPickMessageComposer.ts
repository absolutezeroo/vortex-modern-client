import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Toggle staff pick status
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/ToggleStaffPickMessageComposer.as
 */
export class ToggleStaffPickMessageComposer extends MessageComposer<ConstructorParameters<typeof ToggleStaffPickMessageComposer>>
{
	private _data: ConstructorParameters<typeof ToggleStaffPickMessageComposer>;

	constructor(roomId: number, picked: boolean)
	{
		super();

		this._data = [roomId, picked];
	}

	getMessageArray()
	{
		return this._data;
	}

}
