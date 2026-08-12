import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Whether a transfer of NFTs to an external wallet succeeded.
 *
 * Only `success` is read by the client; the raw code is exposed because AS3 exposes it.
 *
 * Name RECOVERED from sources/win63_version/habbo/communication/messages/parser/collectibles/NftTransferAssetsResultMessageEventParser.as
 * — that tree is obfuscated too, but it is the one where messages keep readable *filenames*.
 * (The port drops AS3's "Event" infix from parser names, as it does throughout.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4411.as
 */
export class NftTransferAssetsResultMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4411.as::_SafeStr_6204 (from `get resultCode()`)
    private _resultCode: number = 0;

    // AS3: _SafeCls_4411.as::flush()
    flush(): boolean
    {
        this._resultCode = 0;

        return true;
    }

    // AS3: _SafeCls_4411.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultCode = wrapper.readShort();

        return true;
    }

    // AS3: _SafeCls_4411.as::get success()
    get success(): boolean
    {
        return this._resultCode === 0;
    }

    // AS3: _SafeCls_4411.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }
}
