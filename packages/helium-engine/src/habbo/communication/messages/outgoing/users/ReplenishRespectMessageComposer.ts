import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Replenish daily respect allowance.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/users/ReplenishRespectMessageComposer.as
 */
export class ReplenishRespectMessageComposer extends MessageComposer<ConstructorParameters<typeof ReplenishRespectMessageComposer>>
{
    private _data: ConstructorParameters<typeof ReplenishRespectMessageComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    getMessageArray()
    {
        return this._data;
    }
}
