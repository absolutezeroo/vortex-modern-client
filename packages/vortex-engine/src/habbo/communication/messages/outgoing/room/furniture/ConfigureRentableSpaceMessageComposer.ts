import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sets up (or updates) the rental configuration for a rentable space furni.
 *
 * Vortex-custom message (not part of the official AS3 client dumps).
 * @see vortex-client/src/com/sulake/habbo/communication/messages/outgoing/room/furniture/ConfigureRentableSpaceMessageComposer.as
 */
export class ConfigureRentableSpaceMessageComposer extends MessageComposer<ConstructorParameters<typeof ConfigureRentableSpaceMessageComposer>>
{
    private _data: ConstructorParameters<typeof ConfigureRentableSpaceMessageComposer>;

    constructor(furnitureId: number, price: number, currencyTypeId: number, rentDurationSeconds: number, requiresHc: boolean)
    {
        super();
        this._data = [furnitureId, price, currencyTypeId, rentDurationSeconds, requiresHc];
    }

    getMessageArray()
    {
        return this._data;
    }
}
