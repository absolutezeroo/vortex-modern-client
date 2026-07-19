import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Moves a pet to a tile in the room (used for the monster plant seed's pet-repositioning flow).
 *
 * Vortex-custom message (not part of the official AS3 client dumps).
 * @see vortex-client/src/com/sulake/habbo/communication/messages/outgoing/room/engine/MovePetMessageComposer.as
 */
export class MovePetMessageComposer extends MessageComposer<ConstructorParameters<typeof MovePetMessageComposer>>
{
    private _data: ConstructorParameters<typeof MovePetMessageComposer>;

    constructor(petWebId: number, x: number, y: number, direction: number)
    {
        super();
        this._data = [petWebId, x, y, direction];
    }

    getMessageArray()
    {
        return this._data;
    }
}
