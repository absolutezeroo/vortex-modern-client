import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Unaccept the current trade offer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/trading/UnacceptTradingComposer.as
 */
export class UnacceptTradingComposer extends MessageComposer<ConstructorParameters<typeof UnacceptTradingComposer>>
{
    private _data: ConstructorParameters<typeof UnacceptTradingComposer>;

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
