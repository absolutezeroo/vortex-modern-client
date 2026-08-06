import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests bonus rare info from the catalog.
 * @see source_nitro_renderer/.../outgoing/catalog/GetBonusRareInfoMessageComposer.ts
 */
export class GetBonusRareInfoMessageComposer extends MessageComposer<ConstructorParameters<typeof GetBonusRareInfoMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetBonusRareInfoMessageComposer>;

    constructor()
    {
        super();
        this._data = [];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/catalog/GetBonusRareInfoMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
