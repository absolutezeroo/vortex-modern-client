import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the room's crafting gizmo's craftable-products list.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2376/_SafeCls_3391.as
 * (real name from sources/win63_version/habbo/communication/messages/outgoing/crafting/GetCraftableProductsComposer.as;
 * header 369 from WIN63's registry)
 */
export class GetCraftableProductsComposer extends MessageComposer<ConstructorParameters<typeof GetCraftableProductsComposer>>
{
    private _data: ConstructorParameters<typeof GetCraftableProductsComposer>;

    constructor(roomId: number)
    {
        super();
        this._data = [roomId];
    }

    // AS3: .../_SafePkg_2376/_SafeCls_3391.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
