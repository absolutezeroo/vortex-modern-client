import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sent when the local user clicks another user while a "click user" wired is active, so the
 * server can evaluate it. Carries the clicked user's id.
 *
 * Name recovered from vortex-flash-client (older revision):
 * outgoing/userdefinedroomevents/wiredmenu/WiredClickUserMessageComposer.as (there id 3049). WIN63
 * moved it directly under userdefinedroomevents and registers it as `_composers[1953] = _SafeCls_2111`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/_SafeCls_2111.as
 */
export class WiredClickUserMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: _SafeCls_2111.as::_SafeCls_2111()
    constructor(userId: number)
    {
        super();
        this._data = [userId];
    }

    // AS3: _SafeCls_2111.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
