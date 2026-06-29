import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Open a pet package furni to name and release the pet
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/furniture/OpenPetPackageMessageComposer.as
 */
export class OpenPetPackageMessageComposer extends MessageComposer<ConstructorParameters<typeof OpenPetPackageMessageComposer>>
{
	private _data: ConstructorParameters<typeof OpenPetPackageMessageComposer>;

	constructor(objectId: number, name: string)
	{
		super();
		this._data = [objectId, name];
	}

	getMessageArray()
	{
		return this._data;
	}
}
