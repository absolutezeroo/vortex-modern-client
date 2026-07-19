import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Close trading session
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/trading/CloseTradingComposer.as
 */
export class CloseTradingComposer extends MessageComposer<ConstructorParameters<typeof CloseTradingComposer>>
{
    private _data: ConstructorParameters<typeof CloseTradingComposer>;

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
