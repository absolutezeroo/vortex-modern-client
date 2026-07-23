import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * WiredMenuSettingsParser — the room's wired-menu settings pushed to the settings tab: the modify- and
 * read-permission bitmasks and the room's configured timezone.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4285`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/_SafeCls_4285.as
 */
export class WiredMenuSettingsParser implements IMessageParser
{
    // AS3: _SafeCls_4285.as::_SafeStr_5370 (name derived: modify-permission bitmask)
    private _modifyPermissionMask: number = 0;

    // AS3: _SafeCls_4285.as::_SafeStr_5475 (name derived: read-permission bitmask)
    private _readPermissionMask: number = 0;

    // AS3: _SafeCls_4285.as::_SafeStr_5395 (name derived: room timezone)
    private _timezone: string = '';

    // AS3: _SafeCls_4285.as::flush()
    flush(): boolean
    {
        this._modifyPermissionMask = 0;
        this._readPermissionMask = 0;
        this._timezone = '';
        return true;
    }

    // AS3: _SafeCls_4285.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._modifyPermissionMask = wrapper.readInt();
        this._readPermissionMask = wrapper.readInt();
        this._timezone = wrapper.readString();
        return true;
    }

    // AS3: _SafeCls_4285.as::get modifyPermissionMask()
    get modifyPermissionMask(): number
    {
        return this._modifyPermissionMask;
    }

    // AS3: _SafeCls_4285.as::get readPermissionMask()
    get readPermissionMask(): number
    {
        return this._readPermissionMask;
    }

    // AS3: _SafeCls_4285.as::get timezone()
    get timezone(): string
    {
        return this._timezone;
    }
}
