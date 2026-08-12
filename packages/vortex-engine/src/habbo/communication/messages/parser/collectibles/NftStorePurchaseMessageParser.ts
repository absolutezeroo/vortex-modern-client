import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Whether an NFT store purchase went through.
 *
 * Name RECOVERED from sources/win63_version/habbo/communication/messages/parser/collectibles/NftStorePurchaseMessageEventParser.as
 * — that tree is obfuscated too, but it is the one where messages keep readable *filenames*.
 * (The port drops AS3's "Event" infix from parser names, as it does throughout.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_2241.as
 */
export class NftStorePurchaseMessageParser implements IMessageParser
{
    /**
     * Names DERIVED FROM BEHAVIOUR, not recovered — but they are not guesses either.
     *
     * `HabboCatalog.as::onNftStorePurchase()` reads `result == _SafeStr_10258` and raises
     * "${notification.nft.purchase.error}"; anything else takes the success branch. So
     * `_SafeStr_10258` is the failure constant and `_SafeStr_8683` is the other one.
     *
     * This matters beyond this file: the *same two obfuscated symbols* appear in
     * `CollectibleMintableItemResultMessageParser` with their values **swapped** (there
     * `_SafeStr_10258` is 0 and `_SafeStr_8683` is 1). The decompiler footers confirm they are the
     * same identifiers in both — `_SafeStr_8683 = "_-t1w"`, `_SafeStr_10258 = "_-HE"` — so the
     * meaning carries across and the mint parser's 0 is a *failure*, not a success. Reading either
     * file alone gives the opposite answer.
     */
    // AS3: _SafeCls_2241.as::_SafeStr_8683
    public static readonly RESULT_OK: number = 0;

    // AS3: _SafeCls_2241.as::_SafeStr_10258
    public static readonly RESULT_ERROR: number = 1;

    // AS3: _SafeCls_2241.as::_SafeStr_5699 (from `get result()`)
    private _result: number = 0;

    // AS3: _SafeCls_2241.as::flush()
    flush(): boolean
    {
        this._result = 0;

        return true;
    }

    // AS3: _SafeCls_2241.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._result = wrapper.readShort();

        return true;
    }

    // AS3: _SafeCls_2241.as::get result()
    get result(): number
    {
        return this._result;
    }
}
