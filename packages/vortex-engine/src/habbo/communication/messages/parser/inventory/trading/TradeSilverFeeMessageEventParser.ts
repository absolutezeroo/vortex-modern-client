import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The silver fee this trade requires before it can be confirmed.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradeSilverFeeMessageEventParser.as
 * (obfuscated as `_SafeCls_3250`'s parser in the primary tree)
 */
export class TradeSilverFeeMessageEventParser implements IMessageParser
{
    private _silverFee: number = -1;

    // AS3: .../TradeSilverFeeMessageEventParser.as::get silverFee()
    get silverFee(): number
    {
        return this._silverFee;
    }

    // AS3: .../TradeSilverFeeMessageEventParser.as::flush()
    flush(): boolean
    {
        this._silverFee = -1;

        return true;
    }

    // AS3: .../TradeSilverFeeMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._silverFee = wrapper.readInt();

        return true;
    }
}
