import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * SetWiredMenuPreferencesComposer — persists the room-events (wired) menu preferences to the server
 * (WIN63 header 3124). Payload order: wiredMenuButton, wiredInspectButton, playTestMode, a reserved
 * int slot (always 0), wiredWhisperDisabled, showAllNotifications, wiredUiStyle. The literal 0 at
 * index 3 is verbatim from AS3 — a legacy/reserved field the ctor hard-codes.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3700`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3700.as
 */
export class SetWiredMenuPreferencesComposer extends MessageComposer<(boolean | number | string)[]>
{
    private _data: (boolean | number | string)[];

    // AS3: _SafeCls_3700.as::_SafeCls_3700()
    constructor(wiredMenuButton: boolean, wiredInspectButton: boolean, playTestMode: boolean, wiredWhisperDisabled: boolean, showAllNotifications: boolean, wiredUiStyle: string)
    {
        super();
        this._data = [];
        this._data.push(wiredMenuButton);
        this._data.push(wiredInspectButton);
        this._data.push(playTestMode);
        this._data.push(0);
        this._data.push(wiredWhisperDisabled);
        this._data.push(showAllNotifications);
        this._data.push(wiredUiStyle);
    }

    // AS3: _SafeCls_3700.as::getMessageArray()
    getMessageArray(): (boolean | number | string)[]
    {
        return this._data;
    }
}
