import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request the list of available commands for a pet
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.pet.GetPetCommandsComposer
 */
export class GetPetCommandsComposer extends MessageComposer<ConstructorParameters<typeof GetPetCommandsComposer>>
{
	private _data: ConstructorParameters<typeof GetPetCommandsComposer>;

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
