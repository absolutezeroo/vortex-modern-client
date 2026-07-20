import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the room's current wired click-behaviour settings: how clicking a user
 * (userOption) and clicking furni (furniOption) is routed — see WiredEnvironment's
 * CLICK_USER_* / CLICK_FURNI_* constants.
 *
 * Name derived: no counterpart in the older vortex-flash-client; derived from behaviour +
 * WIN63 registry entry `_SafeStr_4546[3931] = _SafeCls_3436` (read in onWiredClickSettingsEvent).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_3096.as
 */
export class WiredClickSettingsParser implements IMessageParser
{
    private _userOption: number = 0;

    private _furniOption: number = 0;

    // AS3: _SafeCls_3096.as::get userOption()
    get userOption(): number
    {
        return this._userOption;
    }

    // AS3: _SafeCls_3096.as::get furniOption()
    get furniOption(): number
    {
        return this._furniOption;
    }

    // AS3: _SafeCls_3096.as::flush()
    flush(): boolean
    {
        this._userOption = 0;
        this._furniOption = 0;
        return true;
    }

    // AS3: _SafeCls_3096.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._userOption = wrapper.readInt();
        this._furniOption = wrapper.readInt();

        return true;
    }
}
