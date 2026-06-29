import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Harvest a pet (collect resources from a breedable pet)
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.pet.HarvestPetComposer
 */
export class HarvestPetComposer extends MessageComposer<ConstructorParameters<typeof HarvestPetComposer>>
{
	private _data: ConstructorParameters<typeof HarvestPetComposer>;

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
