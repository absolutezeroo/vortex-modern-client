import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {TradeRequirement} from './requirements/TradeRequirement';

/**
 * The server opening a wired trade (header 3650): the contract, how it should be presented, and
 * how long the player has.
 *
 * Name DERIVED from the only readable handler that consumes it,
 * `inventory/_SafeCls_1951.as::onWiredTradeInitiate()`; the parser class itself is obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/_SafeCls_3617.as
 */
export class WiredTradeInitiateMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3617.as::_SafeStr_4727 (from `get requirement()`)
    private _requirement: TradeRequirement | null = null;

    // AS3: _SafeCls_3617.as::_SafeStr_8080 (from `get showRequirementsImmediate()`)
    private _showRequirementsImmediate: boolean = false;

    // AS3: _SafeCls_3617.as::_SafeStr_7957 (from `get overridePreviousTrade()`)
    private _overridePreviousTrade: boolean = false;

    // AS3: _SafeCls_3617.as::_SafeStr_8329 (from `get timeoutSeconds()`)
    private _timeoutSeconds: number = 0;

    // AS3: _SafeCls_3617.as::get requirement()
    get requirement(): TradeRequirement | null
    {
        return this._requirement;
    }

    /** Whether the requirements panel opens expanded rather than waiting to be asked for. */
    // AS3: _SafeCls_3617.as::get showRequirementsImmediate()
    get showRequirementsImmediate(): boolean
    {
        return this._showRequirementsImmediate;
    }

    /** Set when this trade replaces one already open, which the model closes first. */
    // AS3: _SafeCls_3617.as::get overridePreviousTrade()
    get overridePreviousTrade(): boolean
    {
        return this._overridePreviousTrade;
    }

    // AS3: _SafeCls_3617.as::get timeoutSeconds()
    get timeoutSeconds(): number
    {
        return this._timeoutSeconds;
    }

    // AS3: _SafeCls_3617.as::flush()
    flush(): boolean
    {
        this._requirement = null;
        this._showRequirementsImmediate = false;
        this._overridePreviousTrade = false;
        this._timeoutSeconds = 0;

        return true;
    }

    /**
     * The requirement reads itself off the wrapper first and its length is variable — type 4 pulls
     * a whole rules block, the others nothing — so the three trailing fields can only be read
     * after it has consumed its own bytes.
     */
    // AS3: _SafeCls_3617.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._requirement = new TradeRequirement(wrapper);
        this._showRequirementsImmediate = wrapper.readBoolean();
        this._overridePreviousTrade = wrapper.readBoolean();
        this._timeoutSeconds = wrapper.readInt();

        return true;
    }
}
