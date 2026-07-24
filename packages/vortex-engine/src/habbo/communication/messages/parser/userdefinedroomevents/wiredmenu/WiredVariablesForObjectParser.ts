import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {WiredObjectInspectionData} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredObjectInspectionData';

/**
 * WiredVariablesForObjectParser — parses the inspection tab's per-object variable push (WIN63 header
 * 2179) into a {@link WiredObjectInspectionData}.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4143`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/_SafeCls_4143.as
 */
export class WiredVariablesForObjectParser implements IMessageParser
{
    // AS3: _SafeCls_4143.as::_SafeStr_4556 (name derived: inspection data)
    private _data: WiredObjectInspectionData | null = null;

    // AS3: _SafeCls_4143.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: _SafeCls_4143.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._data = new WiredObjectInspectionData(wrapper);
        return true;
    }

    // AS3: _SafeCls_4143.as::get data()
    get data(): WiredObjectInspectionData
    {
        return this._data!;
    }
}
