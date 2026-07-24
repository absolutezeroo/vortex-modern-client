import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * WiredMenuErrorParser — parses a wired-menu error push (WIN63 header 1230): a single short error
 * code. The inspection tab treats ERROR_OBJECT_GONE (0) as "the inspected object no longer exists" and
 * clears its state.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4262`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/_SafeCls_4262.as
 */
export class WiredMenuErrorParser implements IMessageParser
{
    // AS3: _SafeCls_4262.as::_SafeStr_10452 (name derived: object-gone / no-data error)
    static readonly ERROR_OBJECT_GONE: number = 0;

    // AS3: _SafeCls_4262.as::_SafeStr_11308 (name derived: error code 1)
    static readonly ERROR_CODE_1: number = 1;

    // AS3: _SafeCls_4262.as::_SafeStr_10467 (name derived: error code 2)
    static readonly ERROR_CODE_2: number = 2;

    // AS3: _SafeCls_4262.as::_errorCode
    private _errorCode: number = 0;

    // AS3: _SafeCls_4262.as::flush()
    flush(): boolean
    {
        this._errorCode = 0;
        return true;
    }

    // AS3: _SafeCls_4262.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._errorCode = wrapper.readShort();
        return true;
    }

    // AS3: _SafeCls_4262.as::get errorCode()
    get errorCode(): number
    {
        return this._errorCode;
    }
}
