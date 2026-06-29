import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Save a dimmer preset configuration
 *
 * Color is sent as a hex string (e.g., '#ff0000') and apply is sent as 1/0.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/furniture/RoomDimmerSavePresetMessageComposer.as
 */
export class RoomDimmerSavePresetComposer extends MessageComposer<ConstructorParameters<typeof RoomDimmerSavePresetComposer>>
{
	private _data: ConstructorParameters<typeof RoomDimmerSavePresetComposer>;

	constructor(presetNumber: number, effectTypeId: number, color: string, brightness: number, apply: boolean)
	{
		super();
		this._data = [presetNumber, effectTypeId, color, brightness, apply];
	}

	getMessageArray()
	{
		return this._data;
	}
}
