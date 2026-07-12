import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the current rental configuration for a rentable space furni.
 *
 * Vortex-custom message (not part of the official AS3 client dumps).
 * @see vortex-client/src/com/sulake/habbo/communication/messages/outgoing/room/furniture/GetRentableSpaceConfigMessageComposer.as
 */
export class GetRentableSpaceConfigMessageComposer extends MessageComposer<ConstructorParameters<typeof GetRentableSpaceConfigMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetRentableSpaceConfigMessageComposer>;

    constructor(furnitureId: number)
    {
        super();
        this._data = [furnitureId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
