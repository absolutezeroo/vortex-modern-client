import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Issues a trained command to a pet in the room.
 *
 * Vortex-custom message (not part of the official AS3 client dumps).
 * @see vortex-client/src/com/sulake/habbo/communication/messages/outgoing/room/engine/IssuePetCommandMessageComposer.as
 */
export class IssuePetCommandMessageComposer extends MessageComposer<ConstructorParameters<typeof IssuePetCommandMessageComposer>>
{
    private _data: ConstructorParameters<typeof IssuePetCommandMessageComposer>;

    constructor(petId: number, commandId: number)
    {
        super();
        this._data = [petId, commandId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
