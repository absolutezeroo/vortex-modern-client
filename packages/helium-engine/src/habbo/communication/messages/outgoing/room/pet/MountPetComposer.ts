import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Mount a pet in the room
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.pet.MountPetComposer
 */
export class MountPetComposer extends MessageComposer<ConstructorParameters<typeof MountPetComposer>>
{
	private _data: ConstructorParameters<typeof MountPetComposer>;

	constructor(petId: number)
	{
		super();
		this._data = [petId];
	}

	getMessageArray()
	{
		return this._data;
	}
}
