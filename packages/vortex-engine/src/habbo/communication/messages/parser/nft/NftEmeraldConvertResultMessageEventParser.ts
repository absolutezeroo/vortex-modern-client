import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Outcome of converting an Emerald furni into its NFT.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/nft/NftEmeraldConvertResultMessageEventParser.as
 */
export class NftEmeraldConvertResultMessageEventParser implements IMessageParser
{
    // AS3 declares six public result constants, 0 through 5. Their identifiers are obfuscated in
    // **every** tree (`_SafeStr_8683`…`_SafeStr_10796` in the primary, `name_6`/`const_638`/… in
    // win63_version), so only the two the notification handler actually branches on can be named
    // honestly, and both names below are DERIVED from that branch, not recovered:
    //   0 → handled as success (the handler returns without notifying)
    //   5 → "notification.nft.emerald_convert.not_in_collector"
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/_SafeCls_3524.as
    // — values 1..4 are distinct failure codes with no readable identifier and no branch of their
    // own; AS3 folds all four into the generic "notification.nft.emerald_convert_failed" message,
    // which is what the port does too. Name them if a tree ever turns up that has them.

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/_SafeCls_3524.as::_SafeStr_8683 (name derived, see above)
    static readonly RESULT_OK: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/_SafeCls_3524.as::_SafeStr_10796 (name derived, see above)
    static readonly RESULT_NOT_IN_COLLECTOR: number = 5;

    private _stuffId: number = 0;
    private _result: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/_SafeCls_3524.as::get stuffId()
    get stuffId(): number
    {
        return this._stuffId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/_SafeCls_3524.as::get result()
    get result(): number
    {
        return this._result;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/_SafeCls_3524.as::flush()
    flush(): boolean
    {
        this._stuffId = 0;
        this._result = 0;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/_SafeCls_3524.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffId = wrapper.readInt();
        this._result = wrapper.readShort();

        return true;
    }
}
