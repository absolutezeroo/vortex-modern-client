import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Why the server refused to open a trade.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradeOpenFailedEventParser.as
 * (the class is `_SafeCls_3581`'s parser in the primary tree, where it is obfuscated)
 */
export class TradeOpenFailedEventParser implements IMessageParser
{
    /**
     * AS3: .../TradeOpenFailedEventParser.as::const_870
     * Name DERIVED, not recovered: the constant is `const_870` in every tree. Value 7, and
     * `TradingModel.handleMessageEvent()` treats 7 and 8 as the two reasons that open the generic
     * "trading is disabled" popup instead of the per-reason message.
     */
    static readonly REASON_OWN_TRADING_DISABLED: number = 7;

    /**
     * AS3: .../TradeOpenFailedEventParser.as::const_458
     * Name DERIVED, not recovered: the constant is `const_458` in every tree. Value 8, the other
     * half of the pair above.
     */
    static readonly REASON_OTHER_TRADING_DISABLED: number = 8;

    private _reason: number = 0;

    // AS3: .../TradeOpenFailedEventParser.as::get reason()
    get reason(): number
    {
        return this._reason;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradeOpenFailedEventParser.as::_otherUserName
    private _otherUserName: string = '';

    // AS3: .../TradeOpenFailedEventParser.as::get otherUserName()
    get otherUserName(): string
    {
        return this._otherUserName;
    }

    // AS3: .../TradeOpenFailedEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../TradeOpenFailedEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._reason = wrapper.readInt();
        this._otherUserName = wrapper.readString();

        return true;
    }
}
