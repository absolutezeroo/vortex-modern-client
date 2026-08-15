import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Header 2721. How a chest upgrade ended. AS3 declares `SUCCESS = 0` on this parser — the one constant in the
 * chest message layer that survived obfuscation.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and vortex-emulator has
 * no constant for 2721. Named for the AS3 handler it feeds.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/_SafeCls_4358.as
 */
export class WiredChestUpgradeResultMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4358.as::chestId
    private _chestId: number = 0;
    // AS3: _SafeCls_4358.as::resultCode
    private _resultCode: number = 0;

    // AS3: _SafeCls_4358.as::get chestId()
    get chestId(): number
    {
        return this._chestId;
    }

    // AS3: _SafeCls_4358.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }

    // AS3: _SafeCls_4358.as::flush()
    flush(): boolean
    {
        this._chestId = 0;
        this._resultCode = 0;

        return true;
    }

    // AS3: _SafeCls_4358.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chestId = wrapper.readInt();
        this._resultCode = wrapper.readInt();

        return true;
    }
}
