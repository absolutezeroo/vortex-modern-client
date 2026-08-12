import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * How a mint attempt ended.
 *
 * Name DERIVED: obfuscated in every tree, named for its one handler
 * (`MintInventoryListTab.as::onMintItemResult()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4129.as
 */
export class CollectibleMintableItemResultMessageParser implements IMessageParser
{
    /**
     * **0 is the failure here, not the success** — the opposite of every sibling result parser in
     * this package.
     *
     * Nothing in this file says so; the evidence is that `_SafeStr_10258` and `_SafeStr_8683` are
     * the same two identifiers used by `NftStorePurchaseMessageParser` (the decompiler
     * footers give both as `"_-HE"` and `"_-t1w"` in both files), with the values **swapped**, and
     * `HabboCatalog.as::onNftStorePurchase()` raises its error alert on `_SafeStr_10258`. So
     * `_SafeStr_10258` is the failure constant wherever it appears — which is 0 here and 1 there.
     *
     * The third constant is unique to this file and never compared against anywhere, so it keeps
     * its value as a name.
     */
    // AS3: _SafeCls_4129.as::_SafeStr_10258
    public static readonly RESULT_ERROR: number = 0;

    // AS3: _SafeCls_4129.as::_SafeStr_8683
    public static readonly RESULT_OK: number = 1;

    // AS3: _SafeCls_4129.as::_SafeStr_11089
    public static readonly RESULT_2: number = 2;

    // AS3: _SafeCls_4129.as::_SafeStr_7919 (from `get mintResult()`)
    private _mintResult: number = 0;

    // AS3: _SafeCls_4129.as::flush()
    flush(): boolean
    {
        this._mintResult = 0;

        return true;
    }

    // AS3: _SafeCls_4129.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._mintResult = wrapper.readShort();

        return true;
    }

    // AS3: _SafeCls_4129.as::get mintResult()
    get mintResult(): number
    {
        return this._mintResult;
    }
}
