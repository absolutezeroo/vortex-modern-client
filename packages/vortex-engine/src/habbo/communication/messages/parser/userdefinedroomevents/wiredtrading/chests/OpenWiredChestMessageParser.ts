import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Header 1174. The server telling the client to open a chest — one integer.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and vortex-emulator has
 * no constant for 1174. Named for the AS3 handler it feeds.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/_SafeCls_2476.as
 */
export class OpenWiredChestMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2476.as::chestId
    private _chestId: number = 0;

    // AS3: _SafeCls_2476.as::get chestId()
    get chestId(): number
    {
        return this._chestId;
    }

    // AS3: _SafeCls_2476.as::flush()
    flush(): boolean
    {
        this._chestId = 0;

        return true;
    }

    // AS3: _SafeCls_2476.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chestId = wrapper.readInt();

        return true;
    }
}
