import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading close message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/trading/TradingCloseEventParser.as
 */
export class TradingCloseMessageParser implements IMessageParser
{
    private _userId: number = 0;

    get userId(): number
    {
        return this._userId;
    }

    private _reason: number = 0;

    get reason(): number
    {
        return this._reason;
    }

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._userId = wrapper.readInt();
        this._reason = wrapper.readInt();

        return true;
    }
}
