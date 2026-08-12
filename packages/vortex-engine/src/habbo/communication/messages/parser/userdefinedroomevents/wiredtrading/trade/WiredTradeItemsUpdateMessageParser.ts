import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {TradingItemListMessageParser} from '@habbo/communication/messages/parser/inventory/trading/TradingItemListMessageParser';

/**
 * What is currently on the table in a wired trade (header 2488).
 *
 * The bulk of it is the ordinary two-sided item list, reused verbatim: AS3 holds a
 * `_SafeCls_3573` — the same parser class the normal trade's item-list message uses — as a field
 * and delegates the first stretch of the read to it, then reads two fields of its own. Composition,
 * not inheritance, and not a copy.
 *
 * Name DERIVED from `inventory/_SafeCls_1951.as::onWiredTradeItemsUpdate()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/_SafeCls_3202.as
 */
export class WiredTradeItemsUpdateMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3202.as::_SafeStr_7617 (from `get tradingItems()`)
    private _tradingItems: TradingItemListMessageParser = new TradingItemListMessageParser();

    // AS3: _SafeCls_3202.as::_canAccept
    private _canAccept: boolean = false;

    // AS3: _SafeCls_3202.as::_SafeStr_7590 (from `get extra()`)
    private _extra: number = 0;

    // AS3: _SafeCls_3202.as::get tradingItems()
    get tradingItems(): TradingItemListMessageParser
    {
        return this._tradingItems;
    }

    /** Whether the accept button is live — the server decides, the client does not compute it. */
    // AS3: _SafeCls_3202.as::get canAccept()
    get canAccept(): boolean
    {
        return this._canAccept;
    }

    /**
     * Name is AS3's own and says nothing; the model stores it and hands it to the view unread. Kept
     * as-is rather than guessed at.
     */
    // AS3: _SafeCls_3202.as::get extra()
    get extra(): number
    {
        return this._extra;
    }

    /**
     * The nested parser is flushed rather than replaced, matching AS3 — the instance is created
     * once at construction and lives for the parser's lifetime.
     */
    // AS3: _SafeCls_3202.as::flush()
    flush(): boolean
    {
        this._tradingItems.flush();
        this._canAccept = false;
        this._extra = 0;

        return true;
    }

    // AS3: _SafeCls_3202.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._tradingItems.parse(wrapper);
        this._canAccept = wrapper.readBoolean();
        this._extra = wrapper.readInt();

        return true;
    }
}
