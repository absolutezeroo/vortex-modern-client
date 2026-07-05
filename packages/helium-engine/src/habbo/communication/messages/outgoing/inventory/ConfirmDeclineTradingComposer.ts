import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Decline trading after confirmation stage
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/trading/ConfirmDeclineTradingComposer.as
 */
export class ConfirmDeclineTradingComposer extends MessageComposer<ConstructorParameters<typeof ConfirmDeclineTradingComposer>>
{
    private _data: ConstructorParameters<typeof ConfirmDeclineTradingComposer>;

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
