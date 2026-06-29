import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Dismount from a pet in the room
 *
 * Note: AS3 has separate methods for mount and dismount. This is kept as a separate
 * composer rather than combining with MountPetComposer using a toggle flag.
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.pet.DismountPetComposer
 */
export class DismountPetComposer extends MessageComposer<ConstructorParameters<typeof DismountPetComposer>>
{
	private _data: ConstructorParameters<typeof DismountPetComposer>;

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
