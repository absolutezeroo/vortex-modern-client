import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * SaveWiredMenuSettingsComposer — persists the wired-menu settings edited in the settings tab (WIN63
 * header 2553): the modify-permission bitmask, the read-permission bitmask, and the room timezone.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3775`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3775.as
 */
export class SaveWiredMenuSettingsComposer extends MessageComposer<(number | string)[]>
{
    private _data: (number | string)[];

    // AS3: _SafeCls_3775.as::_SafeCls_3775()
    constructor(modifyPermissionMask: number, readPermissionMask: number, timezone: string)
    {
        super();
        this._data = [];
        this._data.push(modifyPermissionMask);
        this._data.push(readPermissionMask);
        this._data.push(timezone);
    }

    // AS3: _SafeCls_3775.as::getMessageArray()
    getMessageArray(): (number | string)[]
    {
        return this._data;
    }
}
