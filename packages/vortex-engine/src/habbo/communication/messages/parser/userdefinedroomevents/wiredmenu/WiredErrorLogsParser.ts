import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {WiredErrorData} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredErrorData';

/**
 * WiredErrorLogsParser — parses the monitor tab's error-log push: a count-prefixed list of
 * WiredErrorData entries.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4364`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/_SafeCls_4364.as
 */
export class WiredErrorLogsParser implements IMessageParser
{
    // AS3: _SafeCls_4364.as::_SafeStr_6984 (name derived: error list)
    private _errors: WiredErrorData[] | null = null;

    // AS3: _SafeCls_4364.as::flush()
    flush(): boolean
    {
        this._errors = null;
        return true;
    }

    // AS3: _SafeCls_4364.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._errors = [];
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._errors.push(new WiredErrorData(wrapper));
        }

        return true;
    }

    // AS3: _SafeCls_4364.as::get errors()
    get errors(): WiredErrorData[]
    {
        return this._errors!;
    }
}
