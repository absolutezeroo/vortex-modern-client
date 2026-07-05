import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Toggle breeding permission for a pet
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.pet.TogglePetBreedingPermissionComposer
 */
export class TogglePetBreedingPermissionComposer extends MessageComposer<ConstructorParameters<typeof TogglePetBreedingPermissionComposer>>
{
    private _data: ConstructorParameters<typeof TogglePetBreedingPermissionComposer>;

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
