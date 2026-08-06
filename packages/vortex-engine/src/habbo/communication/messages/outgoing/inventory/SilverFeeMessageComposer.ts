import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Stake (or withdraw) your half of a web3 trade's silver fee. `TradingModel.addSilverFee()`
 * sends it with the boolean the trade window's fee toggle carries.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/trading/SilverFeeMessageComposer.as
 * (`_SafeCls_3713` in the primary tree; header 2717 from its registry, corroborated by the
 * emulator as `SilverFeeMessageEvent`)
 */
export class SilverFeeMessageComposer extends MessageComposer<ConstructorParameters<typeof SilverFeeMessageComposer>>
{
    private _data: ConstructorParameters<typeof SilverFeeMessageComposer>;

    constructor(addFee: boolean)
    {
        super();

        this._data = [addFee];
    }

    getMessageArray()
    {
        return this._data;
    }
}
