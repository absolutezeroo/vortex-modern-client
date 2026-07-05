import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Accept the current trade offer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/trading/AcceptTradingComposer.as
 */
export class AcceptTradingComposer extends MessageComposer<ConstructorParameters<typeof AcceptTradingComposer>>
{
    private _data: ConstructorParameters<typeof AcceptTradingComposer>;

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
