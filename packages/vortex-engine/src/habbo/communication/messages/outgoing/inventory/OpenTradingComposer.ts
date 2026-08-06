import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Open trading with another user
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/trading/OpenTradingComposer.as
 */
export class OpenTradingComposer extends MessageComposer<ConstructorParameters<typeof OpenTradingComposer>>
{
    private _data: ConstructorParameters<typeof OpenTradingComposer>;

    constructor(userId: number)
    {
        super();

        this._data = [userId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/trading/OpenTradingComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
