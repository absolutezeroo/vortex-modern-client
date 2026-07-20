import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * WiredValidationErrorParameter — one key/value substitution parameter carried by a wired
 * validation-error message, used to fill the localized error text. Constructed inline from the
 * message stream during a WiredValidationErrorParser parse.
 *
 * Name derived: the AS3 class is obfuscated (WIN63 `_SafeCls_3210`) with no counterpart in the
 * older vortex-flash-client (whose validation error carried a single pre-formatted `info` string).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3210.as
 */
export class WiredValidationErrorParameter
{
    // AS3: _SafeCls_3210.as::get key()
    private _key: string;

    // AS3: _SafeCls_3210.as::get value()
    private _value: string;

    // AS3: _SafeCls_3210.as::_SafeCls_3210()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._key = wrapper.readString();
        this._value = wrapper.readString();
    }

    // AS3: _SafeCls_3210.as::get key()
    get key(): string
    {
        return this._key;
    }

    // AS3: _SafeCls_3210.as::get value()
    get value(): string
    {
        return this._value;
    }
}
