import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Confirm accept trading (final confirmation)
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/trading/ConfirmAcceptTradingComposer.as
 */
export class ConfirmAcceptTradingComposer extends MessageComposer<ConstructorParameters<typeof ConfirmAcceptTradingComposer>>
{
    private _data: ConstructorParameters<typeof ConfirmAcceptTradingComposer>;

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
