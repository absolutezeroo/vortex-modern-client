import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Who is trading with whom, and whether each side is allowed to.
 *
 * The accessor names are AS3's (`userID`/`otherUserID`), not the `userOne`/`userTwo` this port
 * used: the two sides are not symmetric — `_SafeCls_1951.onTradingOpen()` swaps them when the
 * *second* id is ours, so calling them "one" and "two" hid which one the swap is about.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradingOpenEventParser.as
 */
export class TradingOpenMessageParser implements IMessageParser
{
    private _userId: number = -1;

    // AS3: .../TradingOpenEventParser.as::get userID()
    get userId(): number
    {
        return this._userId;
    }

    private _userCanTrade: boolean = false;

    // AS3: .../TradingOpenEventParser.as::get userCanTrade()
    get userCanTrade(): boolean
    {
        return this._userCanTrade;
    }

    private _otherUserId: number = -1;

    // AS3: .../TradingOpenEventParser.as::get otherUserID()
    get otherUserId(): number
    {
        return this._otherUserId;
    }

    private _otherUserCanTrade: boolean = false;

    // AS3: .../TradingOpenEventParser.as::get otherUserCanTrade()
    get otherUserCanTrade(): boolean
    {
        return this._otherUserCanTrade;
    }

    // AS3: .../TradingOpenEventParser.as::flush()
    // AS3 resets the ids to -1, not 0.
    flush(): boolean
    {
        this._userId = -1;
        this._userCanTrade = false;
        this._otherUserId = -1;
        this._otherUserCanTrade = false;

        return true;
    }

    // AS3: .../TradingOpenEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._userId = wrapper.readInt();
        this._userCanTrade = wrapper.readInt() === 1;
        this._otherUserId = wrapper.readInt();
        this._otherUserCanTrade = wrapper.readInt() === 1;

        return true;
    }
}
