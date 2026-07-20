import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the server's acknowledgement of a user-click routed to a "click user" wired:
 * which selection index was handled, and whether the wired menu should open.
 *
 * Name recovered from vortex-flash-client (older revision):
 * parser/userdefinedroomevents/wiredmenu/WiredClickUserResponseEventParser.as. In WIN63 the
 * class lives directly under userdefinedroomevents (registry entry `_SafeStr_4546[309] = _SafeCls_3728`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_3523.as
 */
export class WiredClickUserResponseEventParser implements IMessageParser
{
    private _index: number = 0;

    private _openMenu: boolean = false;

    // AS3: _SafeCls_3523.as::get index()
    get index(): number
    {
        return this._index;
    }

    // AS3: _SafeCls_3523.as::get openMenu()
    get openMenu(): boolean
    {
        return this._openMenu;
    }

    // AS3: _SafeCls_3523.as::flush()
    flush(): boolean
    {
        this._index = 0;
        this._openMenu = false;
        return true;
    }

    // AS3: _SafeCls_3523.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._index = wrapper.readInt();
        this._openMenu = wrapper.readBoolean();

        return true;
    }
}
