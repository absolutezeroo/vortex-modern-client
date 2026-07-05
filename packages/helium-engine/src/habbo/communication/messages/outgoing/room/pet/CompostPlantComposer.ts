import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Compost a plant pet (remove/recycle a plant)
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.pet.CompostPlantComposer
 */
export class CompostPlantComposer extends MessageComposer<ConstructorParameters<typeof CompostPlantComposer>>
{
    private _data: ConstructorParameters<typeof CompostPlantComposer>;

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
