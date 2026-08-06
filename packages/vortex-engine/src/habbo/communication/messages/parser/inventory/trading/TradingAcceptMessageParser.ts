import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading accept message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/trading/TradingAcceptEventParser.as
 */
export class TradingAcceptMessageParser implements IMessageParser
{
    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    private _accepted: boolean = false;

    get accepted(): boolean
    {
        return this._accepted;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradingAcceptEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradingAcceptEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._userId = wrapper.readInt();
        this._accepted = wrapper.readInt() === 1;

        return true;
    }
}
