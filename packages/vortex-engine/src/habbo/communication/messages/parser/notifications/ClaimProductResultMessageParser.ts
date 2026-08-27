import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The outcome of claiming a product, header 431.
 *
 * `claimId` is a string key, not a number: the handler looks up `claim_product.name.<claimId>` and
 * **falls back to the raw id** when the hotel has no name for it, then drops that into
 * `claim_product.result.<result>`'s `claim_name` parameter. So an unknown product still produces a
 * readable notification, with the id standing in for the name.
 *
 * **Name DERIVED** — no unobfuscated tree carries this message and the emulator has no constant for
 * 431 in this direction (its `= 431` is a client→server `MessageEvent`, a different id space).
 * Named after the handler that reads it (`_SafeCls_1951.as::onClaimProductResult()`) and its two
 * readable getters. Its AS3 package is obfuscated, so the directory here is this port's choice: it
 * follows the only consumer, the notification handler.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2953/_SafeCls_3957.as
 */
export class ClaimProductResultMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3957.as::_SafeStr_8227 (backing field of claimId)
    private _claimId: string = '';

    // AS3: _SafeCls_3957.as::_SafeStr_5699 (backing field of result)
    private _result: number = 0;

    // AS3: _SafeCls_3957.as::get claimId()
    get claimId(): string
    {
        return this._claimId;
    }

    // AS3: _SafeCls_3957.as::get result()
    get result(): number
    {
        return this._result;
    }

    // AS3: _SafeCls_3957.as::flush()
    flush(): boolean
    {
        // AS3 nulls the string here; this port's fields are non-nullable, so it empties it.
        this._claimId = '';
        this._result = 0;

        return true;
    }

    // AS3: _SafeCls_3957.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._claimId = wrapper.readString();
        this._result = wrapper.readInt();

        return true;
    }
}
